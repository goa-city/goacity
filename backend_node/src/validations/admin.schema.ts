import { z } from 'zod';

export const createAdminSchema = z.object({
    body: z.object({
        full_name: z.string().min(1, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

export const updateAdminSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        full_name: z.string().min(1, 'Full name is required').optional(),
        email: z.string().email('Invalid email address').optional(),
        password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
    }),
});
