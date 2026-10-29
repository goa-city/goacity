import { z } from 'zod';

const optionalEmail = z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
    z.string().email('Invalid email address').optional().nullable()
);

const optionalLastName = z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
    z.string().optional().nullable()
);

export const createMemberSchema = z.object({
    body: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: optionalLastName,
        email: optionalEmail,
        phone: z.string().optional().nullable(),
        role: z.enum(['member', 'admin', 'super_admin']).optional(),
        status: z.string().optional(),
        slug: z.string().optional().nullable(),
        profile_photo: z.string().optional().nullable(),
        stream_ids: z.array(z.union([z.number(), z.string()])).optional(),
    }),
});

export const updateMemberSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]),
        first_name: z.string().min(1, 'First name is required').optional(),
        last_name: optionalLastName,
        email: optionalEmail,
        phone: z.string().optional().nullable(),
        role: z.enum(['member', 'admin', 'super_admin']).optional(),
        status: z.string().optional(),
        slug: z.string().optional().nullable(),
        is_mentor: z.boolean().optional().nullable(),
        stream_ids: z.array(z.union([z.number(), z.string()])).optional(),
        profile_photo: z.string().optional().nullable(),
    }),
});
