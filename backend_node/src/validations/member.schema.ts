import { z } from 'zod';

export const createMemberSchema = z.object({
    body: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address').optional().nullable(),
        phone: z.string().optional().nullable(),
        role: z.enum(['member', 'admin', 'super_admin']).optional(),
        status: z.string().optional(),
    }),
});

export const updateMemberSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        first_name: z.string().min(1, 'First name is required').optional(),
        last_name: z.string().min(1, 'Last name is required').optional(),
        email: z.string().email('Invalid email address').optional().nullable(),
        phone: z.string().optional().nullable(),
        role: z.enum(['member', 'admin', 'super_admin']).optional(),
        status: z.string().optional(),
    }),
});
