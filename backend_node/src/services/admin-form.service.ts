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
        const { title, description, fields } = data;

        return await prisma.$transaction(async (tx) => {
            // Update form basic info
            await tx.forms.update({
                where: { id: formId },
                data: { title, description, updated_at: new Date() }
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
        return prisma.forms.create({
            data: {
                title: data.title,
                code: data.code || `form_${Date.now()}`,
                description: data.description,
                is_active: 1
            }
        });
    }

    static async archiveForm(id: number) {
        return prisma.forms.update({
            where: { id },
            data: { is_active: 0 }
        });
    }
}
