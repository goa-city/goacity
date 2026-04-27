import { z } from 'zod';

export const updateResourceSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        title: z.string().min(1, 'Title is required').optional(),
        category: z.string().optional(),
        author: z.string().optional(),
        url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
        description: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }),
});

export const createResourceSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        category: z.string().min(1, 'Category is required'),
        author: z.string().min(1, 'Author is required'),
        url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
        description: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }),
});
