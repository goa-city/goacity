import { google } from 'googleapis';

const calendar = google.calendar('v3');

/**
 * Creates or updates an event in Google Calendar.
 * 
 * TODO: Currently set up to use a Service Account from process.env.GOOGLE_SERVICE_ACCOUNT_JSON.
 */
export const createGoogleCalendarEvent = async (meeting: any) => {
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
            });
        } else {
            console.log(`[CALENDAR] Creating new event for ${meeting.title}...`);
            response = await calendar.events.insert({
                auth,
                calendarId,
                requestBody: event,
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
