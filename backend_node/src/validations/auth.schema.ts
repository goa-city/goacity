import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Phone is required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    rememberMe: z.boolean().optional(),
  }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
