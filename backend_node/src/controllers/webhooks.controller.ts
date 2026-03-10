import type { Request, Response } from 'express';
import { google } from 'googleapis';
import prisma from '../lib/prisma.js';

const calendar = google.calendar('v3');

/**
 * GOOGLE CALENDAR WEBHOOK
 * 
 * Google sends a notification to this endpoint whenever an event on the synced calendar changes.
 */
export const handleGoogleCalendarWebhook = async (req: Request, res: Response) => {
    const resourceState = req.headers['x-goog-resource-state'];
    const resourceId = req.headers['x-goog-resource-id'];

    console.log(`[WEBHOOK] Received notification: ${resourceState} (Resource: ${resourceId})`);

    if (resourceState === 'sync') return res.status(200).send('OK');

    try {
        const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!saJson) return res.status(500).send('No SA JSON');

        // Auth
        const credentials = JSON.parse(saJson);
        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/calendar.readonly']
        });

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        // Fetch events recently updated
        // Note: Google doesn't tell us WHICH event changed in the basic notification body,
        // so we check events updated in the last few minutes.
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

        const response = await calendar.events.list({
            auth,
            calendarId,
            updatedMin: tenMinutesAgo,
            showDeleted: false,
            singleEvents: true
        });

        const events = response.data.items || [];
        console.log(`[WEBHOOK] Checking ${events.length} recently changed Google events...`);

        for (const event of events) {
            const eventId = event.id;
            if (!eventId) continue;

            // 1. Find the meeting in our DB
            const meeting = await prisma.meetings.findFirst({
                where: { google_event_id: eventId }
            });

            if (!meeting) continue;
            console.log(`[WEBHOOK] Syncing RSVPs for Meeting: ${meeting.title}`);

            // 2. Process attendees
            const attendees = event.attendees || [];
            for (const attendee of attendees) {
                if (!attendee.email || !attendee.responseStatus) continue;

                // 3. Find member by email
                const member = await prisma.member.findUnique({
                    where: { email: attendee.email }
                });

                if (!member) continue;

                // 4. Map Status
                // accepted -> going
                // tentative -> not_sure
                // declined -> cant_go
                let localStatus = 'none';
                if (attendee.responseStatus === 'accepted') localStatus = 'going';
                else if (attendee.responseStatus === 'tentative') localStatus = 'not_sure';
                else if (attendee.responseStatus === 'declined') localStatus = 'cant_go';

                // 5. Update or Create response record
                await prisma.meeting_responses.upsert({
                    where: {
                        id: (await prisma.meeting_responses.findFirst({
                            where: { meeting_id: meeting.id, user_id: member.id }
                        }))?.id || -1
                    },
                    update: { rsvp_status: localStatus },
                    create: {
                        meeting_id: meeting.id,
                        user_id: member.id,
                        rsvp_status: localStatus
                    }
                });
            }
        }

        return res.status(200).send('OK');
    } catch (err: any) {
        console.error('[WEBHOOK] Error:', err.message);
        return res.status(500).send('Error');
    }
};
