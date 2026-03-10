import { google } from 'googleapis';

const calendar = google.calendar('v3');

// backend_node/src/utils/google-calendar.ts
export const createGoogleCalendarEvent = async (meeting: any, attendeeEmails: string[] = []) => {
    try {
        const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!saJson) {
            console.warn('[CALENDAR] No Google Service Account JSON provided in .env');
            return null;
        }

        const credentials = JSON.parse(saJson);
        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/calendar.events']
        });

        const start = new Date(meeting.meeting_date);
        if (meeting.start_time) {
            const st = new Date(meeting.start_time);
            start.setHours(st.getHours(), st.getMinutes(), 0);
        }
        
        const end = new Date(meeting.meeting_date);
        if (meeting.end_time) {
            const et = new Date(meeting.end_time);
            end.setHours(et.getHours(), et.getMinutes(), 0);
        } else {
            end.setHours(start.getHours() + 1);
        }

        // Utility to format date for IST (UTC+5:30)
        const formatIST = (date: Date) => {
            // We want to return a string like "2026-03-09T15:30:00+05:30"
            const pad = (n: number) => n.toString().padStart(2, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
        };

        const event = {
            summary: meeting.title,
            location: meeting.location_name || '',
            description: (meeting.description || '').replace(/<[^>]*>?/gm, ''),
            start: {
                dateTime: formatIST(start),
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: formatIST(end),
                timeZone: 'Asia/Kolkata',
            },
            organizer: {
                displayName: 'Goa.City',
                email: 'goacity26@gmail.com',
            },
            attendees: attendeeEmails.map(email => ({ email })),
        };

        console.log(`[CALENDAR] Syncing ${meeting.title} to goacity26@gmail.com...`);
        
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        
        let response;
        if (meeting.google_event_id) {
            console.log(`[CALENDAR] Updating existing event ${meeting.google_event_id} for ${meeting.title}...`);
            response = await calendar.events.patch({
                auth,
                calendarId,
                eventId: meeting.google_event_id,
                requestBody: event,
                sendUpdates: 'all',
            });
        } else {
            console.log(`[CALENDAR] Creating new event for ${meeting.title}...`);
            response = await calendar.events.insert({
                auth,
                calendarId,
                requestBody: event,
                sendUpdates: 'all',
            });

            // Save the newly created event ID to our database
            const eventId = response.data.id;
            if (eventId) {
                try {
                    const prismaImport = await import('../lib/prisma.js');
                    const prisma = prismaImport.default;
                    await prisma.meetings.update({
                        where: { id: meeting.id },
                        data: { google_event_id: eventId }
                    });
                    console.log(`[CALENDAR] Saved new event ID ${eventId} to database.`);
                } catch (dbErr) {
                    console.error('[CALENDAR] Failed to save event ID to database:', dbErr);
                }
            }
        }

        console.log(`[CALENDAR] Success: ${response.data.id}`);
        return response.data;
    } catch (error: any) {
        console.error('[CALENDAR] Sync Error:', error.message);
        return null;
    }
};

/**
 * Sets up a watch (webhook) on the Google Calendar.
 * Google will notify our webhook URL whenever a change occurs.
 */
export const watchCalendar = async () => {
    try {
        const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!saJson) return null;

        const credentials = JSON.parse(saJson);
        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: [
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/calendar.readonly'
            ]
        });

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        const webhookUrl = 'https://goa.city/api/webhooks/google-calendar';

        console.log(`[CALENDAR] Setting up watch for ${calendarId} -> ${webhookUrl}`);

        const response = await calendar.events.watch({
            auth,
            calendarId,
            requestBody: {
                id: `watch-${Date.now()}`, // Unique ID for this channel
                type: 'web_hook',
                address: webhookUrl,
            },
        });

        console.log('[CALENDAR] Watch session created:', response.data);
        return response.data;
    } catch (err: any) {
        console.error('[CALENDAR] Watch Error:', err.message);
        return null;
    }
};
