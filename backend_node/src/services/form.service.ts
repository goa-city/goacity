import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

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

    static async getFormWithUserProgress(userId: number, codeOrId: string | number) {
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

        const response = await prisma.formResponse.findFirst({
            where: { user_id: userId, form_id: form.id },
            include: { answers: true }
        });

        const answers: Record<string, any> = {};
        if (response) {
            response.answers.forEach(a => {
                try {
                    answers[a.field_key] = JSON.parse(a.answer_value || '');
                } catch {
                    answers[a.field_key] = a.answer_value;
                }
            });
        }

        return {
            ...form,
            answers,
            last_step_index: response?.last_step_index || 0
        };
    }

    static async submitResponse(userId: number | null, formId: number, answers: any, isPartial = false, lastStepIndex = 0) {
        return await prisma.$transaction(async (tx) => {
            let response = await tx.formResponse.findFirst({
                where: { user_id: userId, form_id: formId }
            });

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
                await tx.formAnswer.createMany({
                    data: Object.entries(answers).map(([key, value]) => ({
                        response_id: response.id,
                        field_key: key,
                        answer_value: String(value)
                    }))
                });
            }

            return response;
        });
    }

    static async submitOnboarding(userId: number, body: any) {
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

        const result = await this.submitResponse(userId, onboardingForm.id, answers, isPartial, lastStepIndex);

        if (!isPartial) {
            await prisma.member.update({
                where: { id: userId },
                data: { is_onboarded: 1 }
            });
        }

        return result;
    }
}
