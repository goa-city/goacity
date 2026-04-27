import { z } from 'zod';

export const createFormSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        code: z.string().optional(),
        description: z.string().optional().nullable(),
    }),
});

export const updateFormSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().optional().nullable(),
        fields: z.array(z.object({
            field_key: z.string().optional(),
            label: z.string().optional(),
            subtitle: z.string().optional().nullable(),
            placeholder: z.string().optional().nullable(),
            field_type: z.string(),
            is_required: z.union([z.number(), z.boolean()]).optional(),
            is_optional: z.union([z.number(), z.boolean()]).optional(),
            is_profile: z.union([z.number(), z.boolean()]).optional(),
            options: z.any().optional(),
            conditions: z.any().optional(),
            sort_order: z.number().optional(),
        })).optional(),
    }),
});
