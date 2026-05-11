import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class AdminFormService {
    static async getAllForms() {
        return prisma.forms.findMany({
            where: { is_active: 1 },
            orderBy: { id: 'desc' }
        });
    }

    static async getFormDetail(id: number) {
        const form = await prisma.forms.findUnique({
            where: { id },
            include: {
                fields: {
                    orderBy: { sort_order: 'asc' }
                }
            }
        });
        if (!form) throw new AppError('Form not found', 404);
        return form;
    }

    static async saveFormStructure(formId: number, data: any) {
        const { title, description, fields, fields_per_page, visibility, redirect_url, notify_admin, notify_admin_ids } = data;

        return await prisma.$transaction(async (tx) => {
            // Update form basic info
            await tx.forms.update({
                where: { id: formId },
                data: { 
                    title, 
                    description, 
                    fields_per_page: fields_per_page !== undefined ? Number(fields_per_page) : undefined,
                    visibility,
                    redirect_url,
                    notify_admin: notify_admin !== undefined ? !!notify_admin : undefined,
                    notify_admin_ids,
                    updated_at: new Date() 
                }
            });

            if (fields && Array.isArray(fields)) {
                // Delete existing fields to rebuild (standard pattern for dynamic forms)
                await tx.formField.deleteMany({ where: { form_id: formId } });

                // Create new fields
                await tx.formField.createMany({
                    data: fields.map((f: any, index: number) => ({
                        form_id: formId,
                        field_key: f.field_key || `field_${index}`,
                        label: f.label || '',
                        subtitle: f.subtitle || null,
                        placeholder: f.placeholder || null,
                        field_type: f.field_type,
                        is_required: f.is_required ?? (f.required ? 1 : 0),
                        is_optional: f.is_optional ? 1 : 0,
                        is_profile: f.is_profile ? 1 : 0,
                        options: Array.isArray(f.options) ? f.options : (f.options || {}),
                        conditions: f.conditions || f.conditional_logic || {},
                        sort_order: f.sort_order ?? index
                    }))
                });
            }
        });
    }

    static async createForm(data: any) {
        let code = data.code || `form_${Date.now()}`;
        
        // Check if code already exists
        const existing = await prisma.forms.findUnique({ where: { code } });
        if (existing) {
            code = `${code}_${Math.floor(Math.random() * 1000)}`;
        }

        const sourceId = data.source_id ? Number(data.source_id) : null;

        return await prisma.$transaction(async (tx) => {
            let sourceForm = null;
            if (sourceId) {
                sourceForm = await tx.forms.findUnique({ where: { id: sourceId } });
            }

            const newForm = await tx.forms.create({
                data: {
                    title: data.title,
                    code: code,
                    description: data.description,
                    is_active: 1,
                    fields_per_page: sourceForm ? sourceForm.fields_per_page : (data.fields_per_page || 1),
                    visibility: sourceForm ? sourceForm.visibility : (data.visibility || 'members'),
                    redirect_url: sourceForm ? sourceForm.redirect_url : (data.redirect_url || null),
                    notify_admin: sourceForm ? sourceForm.notify_admin : (!!data.notify_admin),
                    notify_admin_ids: sourceForm ? sourceForm.notify_admin_ids : (data.notify_admin_ids || null)
                }
            });

            if (sourceId) {
                const sourceFields = await tx.formField.findMany({
                    where: { form_id: sourceId },
                    orderBy: { sort_order: 'asc' }
                });

                if (sourceFields.length > 0) {
                    await tx.formField.createMany({
                        data: sourceFields.map(f => ({
                            form_id: newForm.id,
                            field_key: f.field_key,
                            field_type: f.field_type,
                            label: f.label,
                            subtitle: f.subtitle,
                            placeholder: f.placeholder,
                            options: f.options || {},
                            is_required: f.is_required,
                            is_optional: f.is_optional,
                            is_profile: f.is_profile,
                            sort_order: f.sort_order,
                            section: f.section,
                            conditions: f.conditions || {},
                            group_fields: f.group_fields || {},
                            button_text: f.button_text
                        }))
                    });
                }
            }

            return newForm;
        });
    }

    static async archiveForm(id: number, isActive: number = 0) {
        return prisma.forms.update({
            where: { id },
            data: { is_active: isActive }
        });
    }

    static async deleteForm(id: number) {
        return prisma.forms.delete({
            where: { id }
        });
    }
}
