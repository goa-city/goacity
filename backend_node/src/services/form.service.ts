import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.js';

export class FormService {
    static async getFormWithFields(code: string) {
        const form = await prisma.forms.findUnique({
            where: { code },
            include: {
                fields: {
                    orderBy: { sort_order: 'asc' }
                }
            }
        });
        if (!form) throw new AppError('Form not found', 404);
        return form;
    }

    static async getFormWithUserProgress(userId: number | null, codeOrId: string | number) {
        const query = typeof codeOrId === 'number' || !isNaN(Number(codeOrId)) 
            ? { id: Number(codeOrId) } 
            : { code: String(codeOrId) };

        const form = await prisma.forms.findUnique({
            where: query,
            include: {
                fields: { orderBy: { sort_order: 'asc' } }
            }
        });

        if (!form) throw new AppError('Form not found', 404);

        const answers: Record<string, any> = {};
        let response = null;
        
        if (userId) {
            response = await prisma.formResponse.findFirst({
                where: { user_id: userId, form_id: form.id },
                orderBy: { id: 'desc' },
                include: { answers: true }
            });

            if (response) {
                response.answers.forEach(a => {
                    try {
                        answers[a.field_key] = JSON.parse(a.answer_value || '');
                    } catch {
                        answers[a.field_key] = a.answer_value;
                    }
                });
            }
        }

        return {
            ...form,
            answers,
            last_step_index: response?.status === 'draft' ? (response?.last_step_index || 0) : 0
        };
    }

    static async submitResponse(userId: number | null, formId: number, answers: any, isPartial = false, lastStepIndex = 0, files: any[] = []) {
        // Merge files into answers
        if (files && files.length > 0) {
            files.forEach(file => {
                answers[file.fieldname] = `/uploads/${file.filename}`;
            });
        }

        return await prisma.$transaction(async (tx) => {
            let response = null;
            if (userId) {
                // Find standard form responses for this user and form
                const responses = await tx.formResponse.findMany({
                    where: { user_id: userId, form_id: formId },
                    orderBy: { id: 'desc' }
                });

                if (responses && responses.length > 0) {
                    const mostRecent = responses[0];
                    
                    // Fetch form code to check if it's the onboarding form
                    const formObj = await tx.forms.findUnique({ where: { id: formId } });
                    const isOnboarding = formObj?.code === 'mp-onboarding';
                    
                    // If the latest response is completed, we treat a new submission attempt as a brand new response
                    // EXCEPT for the onboarding form, which we always update/overwrite in place
                    if (mostRecent && mostRecent.status === 'completed' && !isOnboarding) {
                        response = null; // Forces creation of a new response record below
                    } else {
                        response = mostRecent;
                    }
                }
            }

            if (response) {
                response = await tx.formResponse.update({
                    where: { id: response.id },
                    data: {
                        status: isPartial ? 'draft' : 'completed',
                        submitted_at: isPartial ? response.submitted_at : new Date(),
                        last_step_index: lastStepIndex
                    }
                });
                await tx.formAnswer.deleteMany({
                    where: { response_id: response.id }
                });
            } else {
                response = await tx.formResponse.create({
                    data: {
                        user_id: userId,
                        form_id: formId,
                        status: isPartial ? 'draft' : 'completed',
                        submitted_at: isPartial ? null : new Date(),
                        last_step_index: lastStepIndex
                    }
                });
            }

            if (answers && typeof answers === 'object') {
                const entries = Object.entries(answers);
                await tx.formAnswer.createMany({
                    data: entries.map(([key, value]) => ({
                        response_id: response.id,
                        field_key: key,
                        answer_value: typeof value === 'object' ? JSON.stringify(value) : String(value)
                    }))
                });

                // Sync to Profile Logic
                if (userId && !isPartial) {
                    const fields = await tx.formField.findMany({
                        where: { form_id: formId, is_profile: 1 }
                    });

                    for (const field of fields) {
                        const answer = answers[field.field_key];
                        if (answer !== undefined) {
                            // Update MemberProfile (KV table)
                            const existing = await tx.memberProfile.findFirst({
                                where: { user_id: userId, profile_key: field.field_key }
                            });

                            const valStr = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);

                            if (existing) {
                                await tx.memberProfile.update({
                                    where: { id: existing.id },
                                    data: { profile_value: valStr, updated_at: new Date() }
                                });
                            } else {
                                await tx.memberProfile.create({
                                    data: { user_id: userId, profile_key: field.field_key, profile_value: valStr }
                                });
                            }

                            // Update Member table directly for core fields
                            if (field.field_key === 'profile_photo') {
                                await tx.member.update({
                                    where: { id: userId },
                                    data: { profile_photo: valStr }
                                });
                            }
                            if (field.field_key === 'bio') {
                                await tx.member.update({
                                    where: { id: userId },
                                    data: { bio: valStr }
                                });
                            }
                        }
                    }
                }
            }

            // Admin Notification Logic
            if (!isPartial) {
                const form = await tx.forms.findUnique({ 
                    where: { id: formId },
                    include: { fields: true }
                });
                if (form?.notify_admin && form.notify_admin_ids) {
                    const adminIds = form.notify_admin_ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
                    const admins = await tx.admin.findMany({
                        where: { id: { in: adminIds } },
                        select: { email: true, full_name: true }
                    });

                    const fieldLabels: Record<string, string> = {};
                    form.fields.forEach(f => { 
                        if (f.field_key) {
                            fieldLabels[f.field_key] = f.label || f.field_key; 
                        }
                    });

                    for (const admin of admins) {
                        if (admin.email) {
                            const summary = Object.entries(answers)
                                .map(([k, v]) => `<li><strong>${fieldLabels[k] || k}</strong>: ${v}</li>`)
                                .join('');
                            
                            await sendEmail(
                                admin.email,
                                `New Submission: ${form.title}`,
                                `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                                    <div style="background: #6366f1; padding: 24px; color: white;">
                                        <h2 style="margin: 0; font-size: 20px;">New form submission received</h2>
                                        <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 14px;">${form.title}</p>
                                    </div>
                                    <div style="padding: 24px; color: #444;">
                                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                                        <p><strong>User:</strong> ${userId ? `User ID ${userId}` : 'Anonymous'}</p>
                                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                                        <ul style="list-style: none; padding: 0;">
                                            ${summary}
                                        </ul>
                                    </div>
                                </div>
                                `
                            );
                        }
                    }
                }
            }

            // If submitting the Mentor Reflection Form (form 20 or code 'mentor-reflection-form') and NOT partial/draft,
            // we create/upsert a MentorProfile candidate for this user so it appears in Admin Mentorship Hub.
            if (!isPartial && userId) {
                const isReflectionForm = await tx.forms.findFirst({
                    where: {
                        id: formId,
                        OR: [
                            { id: 20 },
                            { code: 'mentor-reflection-form' }
                        ]
                    }
                });

                if (isReflectionForm) {
                    const existingProfile = await tx.mentorProfile.findUnique({
                        where: { member_id: userId }
                    });

                    // Fetch all fields for this form dynamically to resolve dynamic keys
                    const formFields = await tx.formField.findMany({
                        where: { form_id: formId }
                    });

                    // 1. Resolve Bio: Look for labels containing "why do you" or keys containing "why" or "bio"
                    let bioVal = answers['mentor_bio'] || answers['bio'] || null;
                    if (!bioVal) {
                        const bioField = formFields.find(f => 
                            f.field_key.includes('bio') || 
                            f.field_key.includes('why') || 
                            f.label?.toLowerCase().includes('why do you')
                        );
                        if (bioField && answers[bioField.field_key]) {
                            bioVal = answers[bioField.field_key];
                        }
                    }

                    // 2. Resolve Expertise: Look for keys or labels containing "skills", "expertise", or "areas"
                    let expertiseVal: any[] = [];
                    const expFields = formFields.filter(f => 
                        f.field_key.includes('expertise') || 
                        f.field_key.includes('skills') || 
                        f.field_key.includes('areas') ||
                        f.label?.toLowerCase().includes('skills') || 
                        f.label?.toLowerCase().includes('expertise') || 
                        f.label?.toLowerCase().includes('areas do you feel')
                    );

                    for (const f of expFields) {
                        const val = answers[f.field_key];
                        if (val) {
                            try {
                                const parsed = typeof val === 'string' ? JSON.parse(val) : val;
                                if (Array.isArray(parsed)) {
                                    expertiseVal.push(...parsed);
                                } else {
                                    expertiseVal.push(parsed);
                                }
                            } catch (_) {
                                if (typeof val === 'string') {
                                    expertiseVal.push(...val.split(',').map(s => s.trim()).filter(Boolean));
                                } else {
                                    expertiseVal.push(val);
                                }
                            }
                        }
                    }

                    // Fallback to static keys if still empty
                    if (expertiseVal.length === 0) {
                        const expAnswer = answers['mentor_expertise'] || answers['expertise'];
                        if (expAnswer) {
                            try {
                                expertiseVal = typeof expAnswer === 'string' ? JSON.parse(expAnswer) : expAnswer;
                            } catch (e) {
                                expertiseVal = String(expAnswer).split(',').map(s => s.trim()).filter(Boolean);
                            }
                        }
                    }
                    expertiseVal = Array.from(new Set(expertiseVal.map(String).filter(Boolean)));

                    // 3. Resolve Cost: Look for label containing "cost" or "price" or keys containing "price" / "cost"
                    let costVal = answers['q_1784533377205'] !== undefined && answers['q_1784533377205'] !== null && answers['q_1784533377205'] !== '' 
                        ? Number(answers['q_1784533377205']) 
                        : null;
                    if (costVal === null) {
                        const costField = formFields.find(f => 
                            f.field_key.includes('price') || 
                            f.field_key.includes('cost') || 
                            f.label?.toLowerCase().includes('cost') || 
                            f.label?.toLowerCase().includes('price')
                        );
                        if (costField && answers[costField.field_key] !== undefined && answers[costField.field_key] !== null && answers[costField.field_key] !== '') {
                            costVal = Number(answers[costField.field_key]);
                        }
                    }

                    if (!existingProfile) {
                        await tx.mentorProfile.create({
                            data: {
                                member_id: userId,
                                bio: bioVal,
                                expertise: expertiseVal as any,
                                default_session_price: costVal,
                                is_approved: false
                            }
                        });
                        console.log(`[FORM SERVICE] Created MentorProfile for user ${userId} on Form 20 submission.`);
                    } else {
                        await tx.mentorProfile.update({
                            where: { member_id: userId },
                            data: {
                                bio: bioVal || existingProfile.bio,
                                expertise: (expertiseVal.length > 0 ? expertiseVal : existingProfile.expertise) as any,
                                default_session_price: costVal !== null ? costVal : existingProfile.default_session_price
                            }
                        });
                        console.log(`[FORM SERVICE] Updated MentorProfile for user ${userId} on Form 20 submission.`);
                    }
                }
            }

            return response;
        });
    }

    static async submitOnboarding(userId: number | null, body: any, files: any[] = []) {
        const onboardingForm = await prisma.forms.findFirst({
            where: { code: 'mp-onboarding' }
        });

        if (!onboardingForm) throw new AppError('Onboarding form not found', 404);

        const isPartial = body.is_partial === '1' || body.is_partial === true;
        const lastStepIndex = parseInt(body.last_step_index || '0');
        
        const answers = { ...body };
        delete answers.is_partial;
        delete answers.last_step_index;
        delete answers.form_id;

        const result = await this.submitResponse(userId, onboardingForm.id, answers, isPartial, lastStepIndex, files);

        if (!isPartial && userId) {
            await prisma.member.update({
                where: { id: userId },
                data: { is_onboarded: 1 }
            });
        }

        return result;
    }
}
