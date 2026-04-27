import { z } from 'zod';

export const createMeetingSchema = z.object({
    body: z.object({
        id: z.union([z.string(), z.number()]).optional().nullable(),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional().nullable(),
        meeting_date: z.string().min(1, 'Meeting date is required'),
        start_time: z.string().optional().nullable(),
        end_time: z.string().optional().nullable(),
        location_name: z.string().optional().nullable(),
        map_link: z.string().optional().nullable(),
        zoom_link: z.string().optional().nullable(),
        is_paid: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
        payment_amount: z.union([z.string(), z.number()]).optional().nullable(),
        feedback_form_id: z.union([z.string(), z.number()]).optional().nullable(),
        stream_id: z.union([z.string(), z.number()]).optional().nullable(),
        archived: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
        recap_content: z.string().optional().nullable(),
    }),
});

export const updateMeetingSchema = createMeetingSchema;
