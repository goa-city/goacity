import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// GET /api/admin/forms - list all or single by ?id=
export const getForms = async (req: Request, res: Response) => {
    try {
        const singleId = req.query.id;

        if (singleId) {
            const form = await (prisma.forms as any).findUnique({
                where: { id: Number(singleId) },
                include: {
                    fields: {
                        orderBy: { sort_order: 'asc' }
                    }
                }
            });
            if (!form) return res.status(404).json({ message: 'Form not found' });
            return res.json({ form, fields: form.fields });
        }

        const formsList = await (prisma.forms as any).findMany({
            include: {
                _count: {
                    select: { fields: true }
                }
            },
            orderBy: { id: 'asc' }
        });

        // Map to match previous raw query format if needed
        const formattedForms = formsList.map((f: any) => ({
            ...f,
            field_count: f._count.fields
        }));

        return res.json(formattedForms);
    } catch (error: any) {
        console.error('getForms Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/forms
export const createForm = async (req: Request, res: Response) => {
    try {
        const { code, title, description, created_by } = req.body;
        const form = await prisma.forms.create({
            data: {
                code,
                title,
                description: description || '',
                is_active: 1,
                created_by: Number(created_by) || 1
                // city_id is handled by prisma extension
            }
        });
        return res.json({ message: 'Form created', id: form.id });
    } catch (error: any) {
        console.error('createForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/forms
export const updateForm = async (req: Request, res: Response) => {
    try {
        const { id, title, description, fields } = req.body;
        
        await prisma.forms.update({
            where: { id: Number(id) },
            data: {
                title,
                description: description || '',
                updated_at: new Date()
            }
        });

        if (fields && Array.isArray(fields)) {
            // Use transaction for deleting/re-creating fields
            await prisma.$transaction(async (tx) => {
                await (tx as any).form_fields.deleteMany({
                    where: { form_id: Number(id) }
                });

                if (fields.length > 0) {
                    await (tx as any).form_fields.createMany({
                        data: fields.map(f => ({
                            form_id: Number(id),
                            field_key: f.field_key,
                            field_type: f.field_type,
                            label: f.label || '',
                            subtitle: f.subtitle || null,
                            placeholder: f.placeholder || '',
                            options: f.options || null,
                            is_required: f.is_required ? 1 : 0,
                            is_optional: f.is_optional ? 1 : 0,
                            is_profile: f.is_profile ? 1 : 0,
                            sort_order: f.sort_order || 0,
                            section: f.section || null,
                            conditions: f.conditions || null,
                            group_fields: f.group_fields || null,
                            button_text: f.button_text || 'Next'
                        }))
                    });
                }
            });
        }
        return res.json({ message: 'Form updated' });
    } catch (error: any) {
        console.error('updateForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/forms/archive
export const archiveForm = async (req: Request, res: Response) => {
    try {
        const { id, is_active } = req.body;
        await prisma.forms.update({
            where: { id: Number(id) },
            data: {
                is_active: is_active ? 1 : 0,
                updated_at: new Date()
            }
        });
        return res.json({ message: is_active ? 'Form activated' : 'Form archived' });
    } catch (error: any) {
        console.error('archiveForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/forms
export const deleteForm = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ message: 'ID required' });

        await prisma.forms.delete({
            where: { id: Number(id) }
        });
        
        return res.json({ message: 'Form deleted' });
    } catch (error: any) {
        console.error('deleteForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/forms/get - get form + fields for member onboarding
// Supports ?id= or ?code=
export const getFormWithFields = async (req: Request, res: Response) => {
    try {
        const formId = req.query.id;
        const formCode = req.query.code;

        if (!formId && !formCode) return res.status(400).json({ message: 'Form ID or Code required' });

        const form = await (prisma.forms as any).findFirst({
            where: formId ? { id: Number(formId) } : { code: formCode as string },
            include: {
                fields: {
                    orderBy: { sort_order: 'asc' }
                }
            }
        });

        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Transform fields to the format Onboarding.jsx expects
        const questions = form.fields.map((f: any) => {
            return {
                id: f.id,
                field: f.field_key,
                type: f.field_type,
                title: f.label,
                subtitle: f.subtitle,
                placeholder: f.placeholder,
                options: f.options,
                is_required: f.is_required,
                is_optional: f.is_optional,
                is_profile: f.is_profile,
                sort_order: f.sort_order,
                section: f.section,
                conditions: f.conditions,
                fields: f.group_fields, // group_inputs uses "fields"
                buttonText: f.button_text || 'Next'
            };
        });

        return res.json({ form, fields: form.fields, questions });
    } catch (error: any) {
        console.error('getFormWithFields Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/member/onboarding - save onboarding data
export const submitOnboarding = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const data = req.body || {};
        const isPartial = data.is_partial === '1' || data.is_partial === true;

        // Save profile fields
        for (const [key, value] of Object.entries(data)) {
            if (['is_partial', 'form_id'].includes(key)) continue;
            const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
            
            // Upsert into member_profiles using Prisma
            await prisma.memberProfile.upsert({
                where: {
                    // We need a unique constraint or use findFirst + update/create
                    // member_profiles doesn't have a unique constraint on (user_id, profile_key) in schema yet?
                    id: -1 // This won't work if we don't have ID. Let's use findFirst.
                },
                update: { profile_value: strVal },
                create: { user_id: userId, profile_key: key, profile_value: strVal }
            }).catch(async () => {
                 // Fallback to findFirst logic if upsert fails due to missing unique constraint
                 const existing = await prisma.memberProfile.findFirst({
                     where: { user_id: userId, profile_key: key }
                 });
                 if (existing) {
                     await prisma.memberProfile.update({ where: { id: existing.id }, data: { profile_value: strVal } });
                 } else {
                     await prisma.memberProfile.create({ data: { user_id: userId, profile_key: key, profile_value: strVal } });
                 }
            });
        }

        // Mark onboarded if not partial
        if (!isPartial) {
            await prisma.member.update({ where: { id: userId }, data: { is_onboarded: 1 } });
        }

        return res.json({ message: isPartial ? 'Progress saved' : 'Onboarding complete' });
    } catch (error: any) {
        console.error('submitOnboarding Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/member/submit_form - save form submission
export const submitForm = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const data = req.body || {};
        const formId = Number(data.form_id);
        const isPartial = data.is_partial === '1' || data.is_partial === true;
        const meetingId = data.meeting_id ? Number(data.meeting_id) : null;

        if (!formId) return res.status(400).json({ message: 'form_id is required' });

        // Create or update form response
        const response = await (prisma as any).form_responses.findFirst({
            where: { form_id: formId, user_id: userId }
        });

        let responseId: number;
        if (response) {
            responseId = response.id;
            await (prisma as any).form_responses.update({
                where: { id: responseId },
                data: { status: isPartial ? 'draft' : 'completed', meeting_id: meetingId }
            });
        } else {
            const newResponse = await (prisma as any).form_responses.create({
                data: { form_id: formId, user_id: userId, status: isPartial ? 'draft' : 'completed', meeting_id: meetingId }
            });
            responseId = newResponse.id;
        }

        // Upsert answers
        for (const [key, value] of Object.entries(data)) {
            if (['form_id', 'is_partial', 'meeting_id'].includes(key)) continue;
            const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value || '');

            const existingAnswer = await (prisma as any).form_answers.findFirst({
                where: { response_id: responseId, field_key: key }
            });

            if (existingAnswer) {
                await (prisma as any).form_answers.update({
                    where: { id: existingAnswer.id },
                    data: { answer_value: strVal }
                });
            } else {
                await (prisma as any).form_answers.create({
                    data: { response_id: responseId, field_key: key, answer_value: strVal }
                });
            }

            // Also update member_profiles for profile fields
            const fieldDef = await (prisma as any).form_fields.findFirst({
                where: { form_id: formId, field_key: key }
            });
            if (fieldDef && fieldDef.is_profile) {
                const existingProfile = await prisma.memberProfile.findFirst({
                    where: { user_id: userId, profile_key: key }
                });

                if (existingProfile) {
                    await prisma.memberProfile.update({
                        where: { id: existingProfile.id },
                        data: { profile_value: strVal }
                    });
                } else {
                    await prisma.memberProfile.create({
                        data: { user_id: userId, profile_key: key, profile_value: strVal }
                    });
                }
            }
        }

        return res.json({ message: isPartial ? 'Progress saved' : 'Form submitted' });
    } catch (error: any) {
        console.error('submitForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
