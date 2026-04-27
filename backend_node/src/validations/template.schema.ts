import { z } from 'zod';

export const createEmailTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    subject: z.string().min(1, 'Subject is required').max(255),
    message: z.string().min(1, 'Message is required'),
  }),
});

export const updateEmailTemplateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255).optional(),
    subject: z.string().min(1, 'Subject is required').max(255).optional(),
    message: z.string().min(1, 'Message is required').optional(),
  }),
});

export const createWhatsAppTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    content: z.string().min(1, 'Content is required'),
  }),
});

export const updateWhatsAppTemplateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255).optional(),
    content: z.string().min(1, 'Content is required').optional(),
  }),
});
