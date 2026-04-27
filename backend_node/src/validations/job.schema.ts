import { z } from 'zod';

export const updateJobSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        title: z.string().min(1, 'Title is required').optional(),
        company: z.string().min(1, 'Company is required').optional(),
        location: z.string().optional(),
        category: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        company_profile: z.string().optional(),
        url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
        contact_email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        expires_at: z.string().optional().nullable(),
    }),
});

export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        company: z.string().min(1, 'Company is required'),
        location: z.string().min(1, 'Location is required'),
        category: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        company_profile: z.string().optional(),
        url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
        contact_email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        expires_at: z.string().optional().nullable(),
    }),
});
