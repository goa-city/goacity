import { z } from 'zod';

export const createPageSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        content: z.string().optional().nullable(),
        is_published: z.union([z.boolean(), z.number()]).optional(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
    }),
});

export const updatePageSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }).optional(),
    body: z.object({
        title: z.string().min(1, 'Title is required').optional(),
        slug: z.string().min(1, 'Slug is required').optional(),
        content: z.string().optional().nullable(),
        is_published: z.union([z.boolean(), z.number()]).optional(),
        meta_title: z.string().optional().nullable(),
        meta_description: z.string().optional().nullable(),
    }),
});
