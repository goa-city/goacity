import { z } from 'zod';

export const trackEventSchema = z.object({
    body: z.object({
        path: z.string().min(1, 'Path is required').max(255),
        sessionId: z.string().max(64).optional(),
        entityType: z.string().max(50).optional(),
        entityId: z.number().int().positive().optional(),
        referrer: z.string().max(500).optional(),
        deviceType: z.string().max(30).optional(),
        durationSeconds: z.number().int().nonnegative().optional(),
    }),
});
