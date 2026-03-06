import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// GET /api/admin/forms - list all or single by ?id=
export const getForms = async (req: Request, res: Response) => {
    try {
        const singleId = req.query.id;

        if (singleId) {
            const form = await prisma.$queryRaw`SELECT * FROM forms WHERE id = ${Number(singleId)} LIMIT 1`;
            const fields = await prisma.$queryRaw`SELECT * FROM form_fields WHERE form_id = ${Number(singleId)} ORDER BY sort_order ASC`;
            return res.json({ form: (form as any)[0], fields });
        }

        const forms = await prisma.$queryRaw`
            SELECT f.*, COUNT(ff.id)::int AS field_count 
            FROM forms f 
            LEFT JOIN form_fields ff ON ff.form_id = f.id 
            GROUP BY f.id 
            ORDER BY f.id ASC
        `;
        return res.json(forms);
    } catch (error: any) {
        console.error('getForms Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/forms
export const createForm = async (req: Request, res: Response) => {
    try {
        const { code, title, description, created_by } = req.body;
        const form = await prisma.$queryRaw`
            INSERT INTO forms (code, title, description, is_active, created_by) 
            VALUES (${code}, ${title}, ${description || ''}, 1, ${Number(created_by) || 1}) 
            RETURNING id
        `;
        return res.json({ message: 'Form created', id: (form as any)[0]?.id });
    } catch (error: any) {
        console.error('createForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/forms
export const updateForm = async (req: Request, res: Response) => {
    try {
        const { id, title, description, fields } = req.body;
        await prisma.$queryRaw`UPDATE forms SET title = ${title}, description = ${description || ''}, updated_at = NOW() WHERE id = ${Number(id)}`;

        if (fields && Array.isArray(fields)) {
            await prisma.$queryRaw`DELETE FROM form_fields WHERE form_id = ${Number(id)}`;
            for (const f of fields) {
                await prisma.$queryRaw`
                    INSERT INTO form_fields (form_id, field_key, field_type, label, subtitle, placeholder, options, is_required, is_optional, is_profile, sort_order, section, conditions, group_fields, button_text) 
                    VALUES (${Number(id)}, ${f.field_key}, ${f.field_type}, ${f.label || ''}, ${f.subtitle || null}, ${f.placeholder || ''}, ${f.options ? JSON.stringify(f.options) : null}::jsonb, ${f.is_required ? 1 : 0}, ${f.is_optional ? 1 : 0}, ${f.is_profile ? 1 : 0}, ${f.sort_order || 0}, ${f.section || null}, ${f.conditions ? JSON.stringify(f.conditions) : null}::jsonb, ${f.group_fields ? JSON.stringify(f.group_fields) : null}::jsonb, ${f.button_text || 'Next'})
                `;
            }
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
        await prisma.$queryRaw`UPDATE forms SET is_active = ${is_active ? 1 : 0}, updated_at = NOW() WHERE id = ${Number(id)}`;
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

        // Delete fields first (cascade might be handled by DB, but safe to do here if not)
        await prisma.$queryRaw`DELETE FROM form_fields WHERE form_id = ${Number(id)}`;
        await prisma.$queryRaw`DELETE FROM forms WHERE id = ${Number(id)}`;
        
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

        let form: any[];
        if (formId) {
            form = await prisma.$queryRaw`SELECT * FROM forms WHERE id = ${Number(formId)} LIMIT 1` as any[];
        } else {
            form = await prisma.$queryRaw`SELECT * FROM forms WHERE code = ${formCode as string} LIMIT 1` as any[];
        }

        if (!form || form.length === 0) return res.status(404).json({ message: 'Form not found' });

        const theForm = form[0];
        const fields = await prisma.$queryRaw`SELECT * FROM form_fields WHERE form_id = ${theForm.id} ORDER BY sort_order ASC` as any[];

        // Transform fields to the format Onboarding.jsx expects
        const questions = fields.map((f: any) => {
            let options = f.options;
            if (typeof options === 'string') {
                try { options = JSON.parse(options); } catch { /* keep as-is */ }
            }

            let groupFields = f.group_fields;
            if (typeof groupFields === 'string') {
                try { groupFields = JSON.parse(groupFields); } catch { /* keep as-is */ }
            }

            let conditions = f.conditions;
            if (typeof conditions === 'string') {
                try { conditions = JSON.parse(conditions); } catch { /* keep as-is */ }
            }

            return {
                id: f.id,
                field: f.field_key,
                type: f.field_type,
                title: f.label,
                subtitle: f.subtitle,
                placeholder: f.placeholder,
                options: options,
                is_required: f.is_required,
                is_optional: f.is_optional,
                is_profile: f.is_profile,
                sort_order: f.sort_order,
                section: f.section,
                conditions: conditions,
                fields: groupFields, // group_inputs uses "fields"
                buttonText: f.button_text || 'Next'
            };
        });

        return res.json({ form: theForm, fields, questions });
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
            
            // Upsert into member_profiles
            const existing = await prisma.$queryRaw`
                SELECT id FROM member_profiles WHERE user_id = ${userId} AND profile_key = ${key} LIMIT 1
            ` as any[];

            if (existing.length > 0) {
                await prisma.$queryRaw`UPDATE member_profiles SET profile_value = ${strVal} WHERE id = ${existing[0].id}`;
            } else {
                await prisma.$queryRaw`INSERT INTO member_profiles (user_id, profile_key, profile_value) VALUES (${userId}, ${key}, ${strVal})`;
            }
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
        let responseRow = await prisma.$queryRaw`
            SELECT id FROM form_responses WHERE form_id = ${formId} AND user_id = ${userId} LIMIT 1
        ` as any[];

        let responseId: number;
        if (responseRow.length > 0) {
            responseId = responseRow[0].id;
            await prisma.$queryRaw`UPDATE form_responses SET status = ${isPartial ? 'draft' : 'completed'}, meeting_id = ${meetingId} WHERE id = ${responseId}`;
        } else {
            const inserted = await prisma.$queryRaw`
                INSERT INTO form_responses (form_id, user_id, status, meeting_id) VALUES (${formId}, ${userId}, ${isPartial ? 'draft' : 'completed'}, ${meetingId}) RETURNING id
            ` as any[];
            responseId = inserted[0].id;
        }

        // Upsert answers
        for (const [key, value] of Object.entries(data)) {
            if (['form_id', 'is_partial', 'meeting_id'].includes(key)) continue;
            const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value || '');

            const existingAnswer = await prisma.$queryRaw`
                SELECT id FROM form_answers WHERE response_id = ${responseId} AND field_key = ${key} LIMIT 1
            ` as any[];

            if (existingAnswer.length > 0) {
                await prisma.$queryRaw`UPDATE form_answers SET answer_value = ${strVal} WHERE id = ${existingAnswer[0].id}`;
            } else {
                await prisma.$queryRaw`INSERT INTO form_answers (response_id, field_key, answer_value) VALUES (${responseId}, ${key}, ${strVal})`;
            }

            // Also update member_profiles for profile fields
            const fieldDef = await prisma.$queryRaw`SELECT is_profile FROM form_fields WHERE form_id = ${formId} AND field_key = ${key} LIMIT 1` as any[];
            if (fieldDef.length > 0 && fieldDef[0].is_profile) {
                const existingProfile = await prisma.$queryRaw`
                    SELECT id FROM member_profiles WHERE user_id = ${userId} AND profile_key = ${key} LIMIT 1
                ` as any[];

                if (existingProfile.length > 0) {
                    await prisma.$queryRaw`UPDATE member_profiles SET profile_value = ${strVal} WHERE id = ${existingProfile[0].id}`;
                } else {
                    await prisma.$queryRaw`INSERT INTO member_profiles (user_id, profile_key, profile_value) VALUES (${userId}, ${key}, ${strVal})`;
                }
            }
        }

        return res.json({ message: isPartial ? 'Progress saved' : 'Form submitted' });
    } catch (error: any) {
        console.error('submitForm Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
