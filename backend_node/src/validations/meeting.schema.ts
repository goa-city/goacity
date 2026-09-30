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
        registration_form_id: z.union([z.string(), z.number()]).optional().nullable(),
        is_public: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
        stream_id: z.union([z.string(), z.number()]).refine(val => val !== undefined && val !== null && val !== '' && val !== 'null', {
            message: 'Meeting Stream is required'
        }),
        archived: z.union([z.string(), z.number(), z.boolean()]).optional().nullable(),
        recap_content: z.string().optional().nullable(),
        upi_link: z.string().optional().nullable(),
        poster_image: z.union([z.string(), z.any()]).optional().nullable(),
    }),
});

export const updateMeetingSchema = createMeetingSchema;

export const registerGuestMeetingSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Valid email address is required'),
        phone: z.string().min(6, 'Valid phone number is required'),
        payment_status: z.string().optional().nullable(),
        paid_amount: z.union([z.string(), z.number()]).optional().nullable(),
        form_answers: z.union([z.string(), z.record(z.string(), z.any())]).optional().nullable()
    })
});

export const notifyMeetingSchema = z.object({
    body: z.object({
        type: z.enum(['email', 'whatsapp']),
        templateId: z.union([z.string(), z.number()]).optional(),
        targetAudience: z.enum(['all', 'going', 'going_unpaid', 'maybe', 'no', 'paid', 'checked_in', 'no_response', 'test_stream']).optional().default('all'),
        isTest: z.boolean().optional()
    })
});
