import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class MemberService {
    static async getProfile(userId: number) {
        const member = await prisma.member.findUnique({
            where: { id: userId },
            include: {
                streams: { include: { stream: true } },
                profiles: true,
                businesses: true
            }
        });

        if (!member) throw new AppError('Member not found', 404);

        return member;
    }

    static async updateProfile(userId: number, data: any) {
        // Simple update for now, can be expanded for complex fields
        return prisma.member.update({
            where: { id: userId },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                village: data.village,
                address: data.address,
                bio: data.bio,
                linkedin_url: data.linkedin_url,
                updated_at: new Date()
            }
        });
    }

    static async getDashboardData(userId: number) {
        const member = await this.getProfile(userId);
        
        // Build streams list with member counts
        const streams = await Promise.all(((member as any).streams || []).map(async (sm: any) => {
            const count = await prisma.streamMember.count({
                where: { stream_id: sm.stream_id }
            });
            return {
                ...sm.stream,
                role: sm.role,
                member_count: count
            };
        }));

        // Fetch pending actions (forms in their streams they haven't submitted yet)
        const pending_actions: any[] = [];
        
        // Find forms associated with member's streams
        const streamIds = (member as any).streams?.map((sm: any) => sm.stream_id) || [];
        if (streamIds.length > 0) {
            const streamForms = await prisma.stream.findMany({
                where: { id: { in: streamIds }, form_id: { not: null } },
                select: { id: true, name: true, color: true, form_id: true }
            });

            for (const sf of streamForms) {
                // Check if user has a completed response for this form
                const hasResponse = await prisma.formResponse.findFirst({
                    where: { user_id: userId, form_id: sf.form_id!, status: 'completed' }
                });

                if (!hasResponse) {
                    pending_actions.push({
                        id: `onboarding-${sf.form_id}`,
                        type: 'onboarding',
                        form_id: sf.form_id,
                        message: `Complete ${sf.name} Onboarding`,
                        stream_name: sf.name,
                        stream_color: sf.color
                    });
                }
            }

            // Fetch today's meetings for check-in
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayMeetings = await prisma.meetings.findMany({
                where: {
                    stream_id: { in: streamIds },
                    meeting_date: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                include: {
                    stream: true,
                    meeting_responses: {
                        where: { user_id: userId }
                    }
                }
            });

            for (const meeting of todayMeetings) {
                console.log(`[DASHBOARD_DEBUG] Meeting: ${meeting.id}, is_paid: ${meeting.is_paid}, qr: ${meeting.payment_qr_image}`);
                const myResponse = meeting.meeting_responses[0];
                if (!myResponse || !myResponse.checked_in) {
                    const apiUrl = process.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

                    pending_actions.push({
                        id: `checkin-${meeting.id}`,
                        type: 'checkin',
                        meeting_id: meeting.id,
                        message: `Check-in for ${meeting.title}`,
                        stream_name: (meeting as any).stream?.name,
                        stream_color: (meeting as any).stream?.color,
                        is_paid: meeting.is_paid,
                        payment_amount: meeting.payment_amount,
                        payment_qr_image: meeting.payment_qr_image,
                        payment_qr_image_url: meeting.payment_qr_image ? `${baseUrl}/uploads/${meeting.payment_qr_image}` : null,
                        title: meeting.title // Add title for the modal
                    });
                }
            }
        }
        return {
            user: {
                id: member.id,
                first_name: (member as any).first_name,
                last_name: (member as any).last_name,
                email: (member as any).email,
                profile_photo: (member as any).profile_photo
            },
            streams,
            pending_actions
        };
    }

    static async registerPublicMember(data: any, files: any[] = []) {
        const formId = Number(data.form_id);
        const answers = { ...data };
        delete answers.form_id;

        // Field Mappings (Auto-generated keys provided by User for Form 8)
        const MAPPINGS = {
            FIRST_NAME: 'q_1777535957750',
            LAST_NAME: 'q_1777535965235',
            PHONE: 'q_1777535983051',
            EMAIL: 'q_1777535975718'
        };

        const email = (answers[MAPPINGS.EMAIL] || '').trim().toLowerCase();
        const phone = (answers[MAPPINGS.PHONE] || '').trim();

        if (!email && !phone) {
            throw new AppError('Email or Phone is required for registration', 400);
        }

        // Check for existing member by email or phone
        const existingConditions = [];
        if (email) existingConditions.push({ email });
        if (phone) existingConditions.push({ phone });

        const existing = await prisma.member.findFirst({
            where: {
                OR: existingConditions
            }
        });

        if (existing) {
            const conflictField = existing.email === email ? 'email' : 'phone';
            throw new AppError(`A member with this ${conflictField} already exists`, 400);
        }

        // Process files
        if (files && files.length > 0) {
            files.forEach(file => {
                answers[file.fieldname] = `/uploads/${file.filename}`;
            });
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Create Member
            const member = await tx.member.create({
                data: {
                    first_name: answers[MAPPINGS.FIRST_NAME] || '',
                    last_name: answers[MAPPINGS.LAST_NAME] || '',
                    email: email || null,
                    phone: phone || null,
                    role: 'member',
                    is_onboarded: 0
                }
            });

            // 3. Save Form Response
            const response = await tx.formResponse.create({
                data: {
                    user_id: member.id,
                    form_id: formId,
                    status: 'completed',
                    submitted_at: new Date()
                }
            });

            const answerEntries = Object.entries(answers).map(([key, value]) => ({
                response_id: response.id,
                field_key: key,
                answer_value: typeof value === 'object' ? JSON.stringify(value) : String(value)
            }));

            await tx.formAnswer.createMany({
                data: answerEntries
            });

            // 4. Sync profile fields
            const fields = await tx.formField.findMany({
                where: { form_id: formId, is_profile: 1 }
            });

            for (const field of fields) {
                const answer = answers[field.field_key];
                if (answer !== undefined) {
                    const valStr = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
                    await tx.memberProfile.create({
                        data: {
                            user_id: member.id,
                            profile_key: field.field_key,
                            profile_value: valStr
                        }
                    });
                }
            }

            return member;
        });
    }
}
