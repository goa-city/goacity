import { z } from 'zod';

export const createStreamSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
        form_id: z.union([z.string(), z.number()]).optional().nullable(),
    }),
});

export const updateStreamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }).optional(),
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
        form_id: z.union([z.string(), z.number()]).optional().nullable(),
    }),
});
