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
        let { id, title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived } = req.body;
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
                        payment_qr_image = ${filename}
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
                        archived = ${archived === 'true' || archived === true || archived === '1' || Number(archived) === 1 ? 1 : 0}
                    WHERE id = ${mId}
                `;
            }
            return res.json({ message: 'Meeting updated', id: mId });
        } else {
            // Create
            const result = await prisma.$queryRaw`
                INSERT INTO meetings (title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived, payment_qr_image)
                VALUES (${title}, ${description || null}, ${meeting_date}::date, ${start_time}::time, ${end_time}::time, ${location_name || null}, ${map_link || null}, ${is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1 ? 1 : 0}, ${Number(payment_amount) || 0}, ${feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '' ? Number(feedback_form_id) : null}, ${stream_id && stream_id !== 'null' && stream_id !== '' ? Number(stream_id) : null}, ${archived === 'true' || archived === true || archived === '1' || Number(archived) === 1 ? 1 : 0}, ${filename})
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
