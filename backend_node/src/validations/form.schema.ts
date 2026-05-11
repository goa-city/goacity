import { z } from 'zod';

export const createFormSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        code: z.string().optional(),
        description: z.string().optional().nullable(),
        fields_per_page: z.union([z.number(), z.string(), z.null()]).optional(),
        visibility: z.string().optional(),
        redirect_url: z.string().optional().nullable(),
        notify_admin: z.boolean().optional(),
        notify_admin_ids: z.string().optional().nullable(),
    }),
});

export const updateFormSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().optional().nullable(),
        fields_per_page: z.union([z.number(), z.string(), z.null()]).optional(),
        visibility: z.string().optional(),
        redirect_url: z.string().optional().nullable(),
        notify_admin: z.boolean().optional(),
        notify_admin_ids: z.string().optional().nullable(),
        fields: z.array(z.any()).optional(),
    }),
});
