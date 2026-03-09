import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

// GET /api/admin/meetings
export const getMeetings = async (req: Request, res: Response) => {
    try {
        const singleId = req.query.id;
        const archived = req.query.archived === '1';

        const rawMeetings: any[] = await (singleId 
            ? prisma.$queryRaw`
                SELECT m.*, s.name as stream_name, s.color as stream_color 
                FROM meetings m 
                LEFT JOIN streams s ON s.id = m.stream_id 
                WHERE m.id = ${Number(singleId)}
                LIMIT 1
            `
            : prisma.$queryRaw`
                SELECT m.*, s.name as stream_name, s.color as stream_color 
                FROM meetings m 
                LEFT JOIN streams s ON s.id = m.stream_id 
                WHERE m.archived = ${archived ? 1 : 0}
                ORDER BY m.meeting_date DESC
            `);

        const formatted = rawMeetings.map(m => ({
            ...m,
            meeting_date: m.meeting_date ? new Date(m.meeting_date).toISOString().split('T')[0] : null,
            start_time: m.start_time ? new Date(m.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
            end_time: m.end_time ? new Date(m.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null
        }));

        if (singleId) {
            return res.json(formatted[0] || null);
        }
        return res.json(formatted);
    } catch (error: any) {
        console.error('getMeetings Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/meetings (member-facing)
export const getMemberMeetings = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.user_id) || 0;
        const rawMeetings: any[] = await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount
            FROM meetings m
            LEFT JOIN streams s ON s.id = m.stream_id
            LEFT JOIN meeting_responses mr ON mr.meeting_id = m.id AND mr.user_id = ${userId}
            WHERE m.archived = 0
              AND (m.stream_id IS NULL OR m.stream_id IN (SELECT stream_id FROM stream_members WHERE user_id = ${userId}))
            ORDER BY m.meeting_date ASC
        `;

        const formatted = rawMeetings.map(m => ({
            ...m,
            meeting_date: m.meeting_date ? new Date(m.meeting_date).toISOString().split('T')[0] : null,
            start_time: m.start_time ? new Date(m.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
            end_time: m.end_time ? new Date(m.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('getMemberMeetings Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/meetings/:id (member-facing single meeting)
export const getMeeting = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.query.user_id) || (req as any).userId || 0;
        
        const rawMeetings: any[] = await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount
            FROM meetings m
            LEFT JOIN streams s ON s.id = m.stream_id
            LEFT JOIN meeting_responses mr ON mr.meeting_id = m.id AND mr.user_id = ${userId}
            WHERE m.id = ${id}
            LIMIT 1
        `;

        if (rawMeetings.length === 0) return res.status(404).json({ message: 'Meeting not found' });

        const m = rawMeetings[0];
        const formatted = {
            ...m,
            meeting_date: m.meeting_date ? new Date(m.meeting_date).toISOString().split('T')[0] : null,
            start_time: m.start_time ? new Date(m.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
            end_time: m.end_time ? new Date(m.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null
        };

        // Get resources
        const resources = await (prisma as any).meetingResource.findMany({
            where: { meeting_id: id }
        });

        formatted.resources = resources || [];

        return res.json(formatted);
    } catch (error: any) {
        console.error('getMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/meetings (Handles both Create and Update)
export const createMeeting = async (req: Request, res: Response) => {
    try {
        let { id, title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived, recap_content, zoom_link } = req.body;
        const filename = req.file ? req.file.filename : null;
        
        meeting_date = meeting_date || null;
        start_time = start_time || null;
        end_time = end_time || null;

        if (id) {
            // Update
            const mId = Array.isArray(id) ? Number(id[0]) : Number(id);
            if (filename) {
                await prisma.$queryRaw`
                    UPDATE meetings 
                    SET title = ${title}, description = ${description || null}, meeting_date = ${meeting_date}::date, 
                        start_time = ${start_time}::time, end_time = ${end_time}::time, location_name = ${location_name || null}, 
                        map_link = ${map_link || null}, 
                        is_paid = ${is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1 ? 1 : 0}, 
                        payment_amount = ${Number(payment_amount) || 0}, 
                        feedback_form_id = ${feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '' ? Number(feedback_form_id) : null}, 
                        stream_id = ${stream_id && stream_id !== 'null' && stream_id !== '' ? Number(stream_id) : null}, 
                        archived = ${archived === 'true' || archived === true || archived === '1' || Number(archived) === 1 ? 1 : 0},
                        payment_qr_image = ${filename},
                        recap_content = ${recap_content || null},
                        zoom_link = ${zoom_link || null}
                    WHERE id = ${mId}
                `;
            } else {
                await prisma.$queryRaw`
                    UPDATE meetings 
                    SET title = ${title}, description = ${description || null}, meeting_date = ${meeting_date}::date, 
                        start_time = ${start_time}::time, end_time = ${end_time}::time, location_name = ${location_name || null}, 
                        map_link = ${map_link || null}, 
                        is_paid = ${is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1 ? 1 : 0}, 
                        payment_amount = ${Number(payment_amount) || 0}, 
                        feedback_form_id = ${feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '' ? Number(feedback_form_id) : null}, 
                        stream_id = ${stream_id && stream_id !== 'null' && stream_id !== '' ? Number(stream_id) : null}, 
                        archived = ${archived === 'true' || archived === true || archived === '1' || Number(archived) === 1 ? 1 : 0},
                        recap_content = ${recap_content || null},
                        zoom_link = ${zoom_link || null}
                    WHERE id = ${mId}
                `;
            }
            return res.json({ message: 'Meeting updated', id: mId });
        } else {
            // Create
            const result = await prisma.$queryRaw`
                INSERT INTO meetings (title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived, payment_qr_image, recap_content, zoom_link)
                VALUES (${title}, ${description || null}, ${meeting_date}::date, ${start_time}::time, ${end_time}::time, ${location_name || null}, ${map_link || null}, ${is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1 ? 1 : 0}, ${Number(payment_amount) || 0}, ${feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '' ? Number(feedback_form_id) : null}, ${stream_id && stream_id !== 'null' && stream_id !== '' ? Number(stream_id) : null}, ${archived === 'true' || archived === true || archived === '1' || Number(archived) === 1 ? 1 : 0}, ${filename}, ${recap_content || null}, ${zoom_link || null})
                RETURNING id
            `;
            return res.json({ message: 'Meeting created', id: (result as any)[0]?.id });
        }
    } catch (error: any) {
        console.error('createMeeting Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/meetings/:id/responses
export const getMeetingResponses = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const responses = await prisma.$queryRaw`
            SELECT 
                fr.id, 
                fr.status as submission_status, 
                fr.submitted_at, 
                m.first_name, 
                m.last_name, 
                m.email 
            FROM form_responses fr
            LEFT JOIN members m ON m.id = fr.user_id
            WHERE fr.meeting_id = ${id}
            ORDER BY fr.submitted_at DESC
        `;
        return res.json({ success: true, data: responses });
    } catch (error: any) {
        console.error('getMeetingResponses Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/meetings/:id/actions
export const getMeetingActions = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const actions = await prisma.$queryRaw`
            SELECT 
                mr.id, 
                mr.rsvp_status, 
                mr.checked_in, 
                mr.payment_status,
                mr.paid_amount,
                m.first_name, 
                m.last_name, 
                m.email 
            FROM meeting_responses mr
            LEFT JOIN members m ON m.id = mr.user_id
            WHERE mr.meeting_id = ${id}
            ORDER BY m.first_name ASC
        `;
        return res.json({ success: true, data: actions });
    } catch (error: any) {
        console.error('getMeetingActions Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/stats
export const getStats = async (_req: Request, res: Response) => {
    try {
        const members = await prisma.member.count();
        const streams = await prisma.stream.count();
        const meetings = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM meetings WHERE archived = 0` as any[];
        const forms = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM forms` as any[];

        return res.json({
            members,
            streams,
            meetings: meetings[0]?.count || 0,
            forms: forms[0]?.count || 0
        });
    } catch (error: any) {
        console.error('getStats Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/posts (member-facing)
export const getPosts = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.user_id) || 0;
        const posts = await prisma.$queryRaw`
            SELECT p.*, CONCAT(m.first_name, ' ', m.last_name) as full_name, m.profile_photo,
                (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
                EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${userId}) as liked_by_me
            FROM posts p
            LEFT JOIN members m ON m.id = p.user_id
            ORDER BY p.created_at DESC
        `;
        return res.json(posts);
    } catch (error: any) {
        console.error('getPosts Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
// POST /api/admin/meetings/archive
export const archiveMeeting = async (req: Request, res: Response) => {
    try {
        const { id, archived } = req.body;
        if (!id) return res.status(400).json({ message: 'Meeting ID required' });
        
        await prisma.$queryRaw`
            UPDATE meetings 
            SET archived = ${Number(archived) ? 1 : 0}
            WHERE id = ${Number(id)}
        `;
        
        return res.json({ message: `Meeting ${Number(archived) ? 'archived' : 'unarchived'}` });
    } catch (error: any) {
        console.error('archiveMeeting Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/meetings
export const deleteMeeting = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'Meeting ID required' });

        // First delete meeting responses to avoid foreign key issues
        await prisma.$queryRaw`DELETE FROM meeting_responses WHERE meeting_id = ${id}`;
        // Then delete the meeting
        await prisma.$queryRaw`DELETE FROM meetings WHERE id = ${id}`;

        return res.json({ message: 'Meeting deleted' });
    } catch (error: any) {
        console.error('deleteMeeting Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
// POST /api/admin/meetings/:id/resources
export const uploadMeetingResource = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        const { title } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const resource = await (prisma as any).meetingResource.create({
            data: {
                meeting_id: meetingId,
                title: title || file.originalname,
                url: file.filename,
                type: 'file'
            }
        });

        return res.json({ success: true, resource });
    } catch (error: any) {
        console.error('uploadMeetingResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/meetings/resources/:id
export const deleteMeetingResource = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await (prisma as any).meetingResource.delete({
            where: { id }
        });
        return res.json({ success: true, message: 'Resource deleted' });
    } catch (error: any) {
        console.error('deleteMeetingResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

import { sendEmail } from '../utils/email.js';

// POST /api/admin/meetings/:id/notify
export const notifyMeetingMembers = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const meeting: any = await prisma.meetings.findUnique({
            where: { id },
            include: { resources: true }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (!meeting.stream_id) return res.status(400).json({ message: 'Meeting is not linked to any stream' });

        // Get members in context stream
        const members: any[] = await prisma.$queryRaw`
            SELECT m.email, m.first_name, m.last_name 
            FROM members m
            INNER JOIN stream_members sm ON sm.user_id = m.id
            WHERE sm.stream_id = ${meeting.stream_id} AND m.email IS NOT NULL
        `;

        const defaultSubject = `New Update: ${meeting.title}`;
        const defaultHtml = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6366f1;">${meeting.title}</h2>
                <p>Hello,</p>
                <p>An update has been posted for the meeting <b>${meeting.title}</b> scheduled for ${new Date(meeting.meeting_date).toLocaleDateString()}.</p>
                
                ${meeting.zoom_link ? `<p><b>Zoom Meeting:</b> <a href="${meeting.zoom_link}">${meeting.zoom_link}</a></p>` : ''}
                
                ${meeting.recap_content ? `
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <h3 style="margin-top: 0;">Meeting Recap / Notes:</h3>
                        <div>${meeting.recap_content}</div>
                    </div>
                ` : ''}

                <p style="margin-top: 30px;">
                    <a href="https://goa.city/meetings/${meeting.id}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Meeting Details</a>
                </p>
                <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
                <p style="font-size: 12px; color: #999;">You are receiving this because you are part of the stream linked to this meeting.</p>
            </div>
        `;

        // Attempt to fetch template from DB
        let template: any = null;
        try {
            template = await prisma.emailTemplate.findUnique({
                where: { title: 'Meeting Notification' }
            });
        } catch (err) {
            console.warn('[MEETINGS] Could not fetch Meeting Notification template:', err);
        }

        let successCount = 0;
        for (const m of members) {
            if (m.email) {
                let subject = defaultSubject;
                let html = defaultHtml;

                if (template) {
                    subject = template.subject.replace('{{meeting_title}}', meeting.title);
                    html = template.message;
                    
                    // Replace Placeholders
                    html = html.replace(/{{meeting_title}}/g, meeting.title);
                    html = html.replace(/{{meeting_date}}/g, new Date(meeting.meeting_date).toLocaleDateString());
                    html = html.replace(/{{zoom_link}}/g, meeting.zoom_link || '');
                    html = html.replace(/{{recap_content}}/g, meeting.recap_content || '');
                    html = html.replace(/{{meeting_url}}/g, `https://goa.city/meetings/${meeting.id}`);
                    html = html.replace(/{{first_name}}/g, m.first_name || '');
                    html = html.replace(/{{last_name}}/g, m.last_name || '');
                }

                const sent = await sendEmail(m.email, subject, html);
                if (sent) successCount++;
            }
        }

        return res.json({ success: true, message: `Notification sent to ${successCount} members.` });
    } catch (error: any) {
        console.error('notifyMeetingMembers Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
