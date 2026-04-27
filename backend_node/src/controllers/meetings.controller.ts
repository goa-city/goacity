import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { whatsapp } from '../services/whatsapp.service.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { formatDateDDMMYYYY, formatTime12h, parseTime24h } from '../lib/utils.js';

// GET /api/admin/meetings
export const getMeetings = async (req: Request, res: Response) => {
    try {
        const singleId = req.query.id;
        const archived = req.query.archived === '1';

        if (singleId) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            const meetingId = Number(singleId);
            const meeting = await prisma.meetings.findUnique({
                where: { id: meetingId },
                include: { 
                    city: true, 
                    stream: true,
                    resources: true,
                    meeting_responses: {
                        include: {
                            user: true
                        },
                        orderBy: {
                            user: {
                                first_name: 'asc'
                            }
                        }
                    }
                }
            });
            if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
            
            const apiUrl = process.env.VITE_API_URL || '';
            const baseUrl = apiUrl.replace(/\/api\/?$/, ''); // Remove /api if present

            // Format single meeting
            const formatted = {
                ...meeting,
                payment_qr_image_url: meeting.payment_qr_image ? `${baseUrl}/uploads/${meeting.payment_qr_image}` : null,
                meeting_date_display: formatDateDDMMYYYY(meeting.meeting_date),
                start_time_display: meeting.start_time || '-',
                end_time_display: meeting.end_time || '-',
                resources: meeting.resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                meeting_responses: meeting.meeting_responses.map((mr: any) => ({
                    ...mr,
                    first_name: mr.user?.first_name,
                    last_name: mr.user?.last_name,
                    email: mr.user?.email
                }))
            };
            return res.json(formatted);
        }

        const meetings = await prisma.meetings.findMany({
            where: { archived: archived ? 1 : 0 },
            include: { 
                city: true,
                stream: true
            },
            orderBy: { meeting_date: 'desc' }
        });

        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const formatted = meetings.map(m => ({
            ...m,
            stream_name: (m as any).stream?.name,
            stream_color: (m as any).stream?.color,
            meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
            start_time_display: m.start_time || '-',
            end_time_display: m.end_time || '-',
            payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null,
            // Also keep original fields for frontend substring logic if needed, but display fields are preferred
            start_time: m.start_time,
            end_time: m.end_time
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('getMeetings Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const getUpcomingMeetings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId || 0;
        const now = new Date();
        const rawMeetings: any[] = await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount
            FROM meetings m
            LEFT JOIN streams s ON s.id = m.stream_id
            LEFT JOIN meeting_responses mr ON mr.meeting_id = m.id AND mr.user_id = ${userId}
            WHERE m.archived = 0
              AND m.meeting_date >= ${now.toISOString().split('T')[0]}::date
              AND (m.stream_id IS NULL OR m.stream_id IN (SELECT stream_id FROM stream_members WHERE user_id = ${userId}))
            ORDER BY m.meeting_date ASC, m.start_time ASC
        `;

        const formatted = await Promise.all(rawMeetings.map(async m => {
            const resources = await prisma.meetingResource.findMany({
                where: { meeting_id: m.id }
            });
            const apiUrl = process.env.VITE_API_URL || '';
            const baseUrl = apiUrl.replace(/\/api\/?$/, '');
            return {
                ...m,
                meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
                start_time_display: m.start_time || '-',
                end_time_display: m.end_time || '-',
                resources: resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null
            };
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('getUpcomingMeetings Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPastMeetings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId || 0;
        const now = new Date();
        const rawMeetings: any[] = await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount
            FROM meetings m
            LEFT JOIN streams s ON s.id = m.stream_id
            LEFT JOIN meeting_responses mr ON mr.meeting_id = m.id AND mr.user_id = ${userId}
            WHERE m.archived = 0
              AND m.meeting_date < ${now.toISOString().split('T')[0]}::date
              AND (m.stream_id IS NULL OR m.stream_id IN (SELECT stream_id FROM stream_members WHERE user_id = ${userId}))
            ORDER BY m.meeting_date DESC, m.start_time DESC
        `;

        const formatted = await Promise.all(rawMeetings.map(async m => {
            const resources = await prisma.meetingResource.findMany({
                where: { meeting_id: m.id }
            });
            const apiUrl = process.env.VITE_API_URL || '';
            const baseUrl = apiUrl.replace(/\/api\/?$/, '');
            return {
                ...m,
                meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
                start_time_display: m.start_time || '-',
                end_time_display: m.end_time || '-',
                resources: resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null
            };
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('getPastMeetings Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMemberMeetings = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.user_id) || (req as any).userId || 0;
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

        const formatted = await Promise.all(rawMeetings.map(async m => {
            const resources = await prisma.meetingResource.findMany({
                where: { meeting_id: m.id }
            });
            const apiUrl = process.env.VITE_API_URL || '';
            const baseUrl = apiUrl.replace(/\/api\/?$/, '');
            return {
                ...m,
                meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
                start_time_display: m.start_time || '-',
                end_time_display: m.end_time || '-',
                resources: resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null
            };
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
        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const formatted: any = {
            ...m,
            meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
            start_time_display: m.start_time || '-',
            end_time_display: m.end_time || '-',
            payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null
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

import { createGoogleCalendarEvent } from '../utils/google-calendar.js';

// POST /api/admin/meetings (Handles both Create and Update)
export const createMeeting = async (req: Request, res: Response) => {
    try {
        let { id, title, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived, recap_content, zoom_link } = req.body;
        const filename = req.file ? req.file.filename : null;

        const meetingData: any = {
            title,
            description: description || null,
            meeting_date: meeting_date ? new Date(meeting_date) : null,
            start_time: start_time || null,
            end_time: end_time || null,
            location_name: location_name || null,
            map_link: map_link || null,
            is_paid: (is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1) ? 1 : 0,
            payment_amount: new Prisma.Decimal(payment_amount && payment_amount !== '' ? payment_amount : 0),
            feedback_form_id: (feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '') ? Number(feedback_form_id) : null,
            stream_id: (stream_id && stream_id !== 'null' && stream_id !== '') ? Number(stream_id) : null,
            archived: (archived === 'true' || archived === true || archived === '1' || Number(archived) === 1) ? 1 : 0,
            recap_content: recap_content || null,
            zoom_link: zoom_link || null
        };

        if (filename) {
            meetingData.payment_qr_image = filename;
        }

        let finalId: number;

        if (id) {
            const mId = Array.isArray(id) ? Number(id[0]) : Number(id);
            await prisma.meetings.update({
                where: { id: mId },
                data: meetingData
            });
            finalId = mId;
        } else {
            const created = await prisma.meetings.create({
                data: meetingData
            });
            finalId = created.id;
        }

        // --- ASYNC Google Calendar Update ---
        try {
            const meeting = await prisma.meetings.findUnique({
                where: { id: finalId }
            });
            if (meeting) {
                createGoogleCalendarEvent(meeting).catch(err => {
                    console.error('[CALENDAR] Background error:', err);
                });
            }
        } catch (calErr) {
            console.warn('[CALENDAR] Failed to trigger background update:', calErr);
        }

        return res.json({ message: id ? 'Meeting updated' : 'Meeting created', id: finalId });
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

export const rsvpMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const meetingId = Number(req.params.id);
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: 'Status required' });

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: meetingId, user_id: userId }
        });

        if (existing) {
            await prisma.meeting_responses.update({
                where: { id: existing.id },
                data: { rsvp_status: status, updated_at: new Date() }
            });
        } else {
            await prisma.meeting_responses.create({
                data: { meeting_id: meetingId, user_id: userId, rsvp_status: status }
            });
        }

        return res.json({ success: true, message: 'RSVP updated' });
    } catch (error: any) {
        console.error('rsvpMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkInMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const meetingId = Number(req.params.id);

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: meetingId, user_id: userId }
        });

        if (existing) {
            await prisma.meeting_responses.update({
                where: { id: existing.id },
                data: { checked_in: 1, updated_at: new Date() }
            });
        } else {
            await prisma.meeting_responses.create({
                data: { meeting_id: meetingId, user_id: userId, checked_in: 1 }
            });
        }

        return res.json({ success: true, message: 'Checked in successfully' });
    } catch (error: any) {
        console.error('checkInMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const payMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const meetingId = Number(req.params.id);
        const { method, amount } = req.body;

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: meetingId, user_id: userId }
        });

        const updateData = {
            payment_status: method,
            paid_amount: new Prisma.Decimal(amount || 0),
            updated_at: new Date()
        };

        if (existing) {
            await prisma.meeting_responses.update({
                where: { id: existing.id },
                data: updateData
            });
        } else {
            await prisma.meeting_responses.create({
                data: { 
                    meeting_id: meetingId, 
                    user_id: userId, 
                    ...updateData 
                }
            });
        }

        return res.json({ success: true, message: 'Payment recorded' });
    } catch (error: any) {
        console.error('payMeeting Error:', error);
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
        const { type, templateId } = req.body;

        const meeting: any = await prisma.meetings.findUnique({
            where: { id },
            include: { resources: true }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        if (!meeting.stream_id) return res.status(400).json({ message: 'Meeting is not linked to any stream' });

        // Get members in stream
        const members: any[] = await prisma.member.findMany({
            where: {
                streams: {
                    some: { stream_id: meeting.stream_id }
                }
            }
        });

        if (members.length === 0) {
            return res.status(400).json({ message: 'No members found in the linked stream' });
        }

        const dateStr = formatDateDDMMYYYY(meeting.meeting_date);
        const timeStr = meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD';

        if (type === 'email') {
            const effectiveTemplateId = templateId ? Number(templateId) : SYSTEM_TEMPLATES.EMAIL.MEETING.ID;
            const template = await prisma.emailTemplate.findUnique({ where: { id: effectiveTemplateId } });
            if (!template) return res.status(404).json({ message: 'Email template not found' });

            const emailMembers = members.filter(m => m.email);
            
            // Send emails (background)
            Promise.all(emailMembers.map(m => {
                let personalizedHtml = template.message
                    .replace(/{firstname}|{{first_name}}/gi, m.first_name || 'Member')
                    .replace(/{lastname}|{{last_name}}/gi, m.last_name || '')
                    .replace(/{meeting_title}|{{meeting_title}}/gi, meeting.title)
                    .replace(/{meeting_date}|{{meeting_date}}/gi, dateStr)
                    .replace(/{meeting_time}|{{meeting_time}}/gi, timeStr)
                    .replace(/{location}|{{location_name}}/gi, meeting.location_name || 'TBD');

                return sendEmail(
                    m.email,
                    template.subject.replace(/{meeting_title}|{{meeting_title}}/gi, meeting.title),
                    personalizedHtml
                ).catch(err => console.error(`Email failed for ${m.email}:`, err));
            }));

            return res.json({ success: true, message: `Email notifications queued for ${emailMembers.length} members` });
        } else if (type === 'whatsapp') {
            const effectiveTemplateId = templateId ? Number(templateId) : SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.ID;
            const template = await prisma.whatsAppTemplate.findUnique({ where: { id: effectiveTemplateId } });
            if (!template) return res.status(404).json({ message: 'WhatsApp template not found' });

            const whatsappMembers = members.filter(m => m.phone);

            // Format bulk messages
            const bulkMessages = whatsappMembers.map(m => {
                let personalizedContent = template.content
                    .replace(/{firstname}|{{first_name}}/gi, m.first_name || 'Member')
                    .replace(/{lastname}|{{last_name}}/gi, m.last_name || '')
                    .replace(/{meeting_title}|{{meeting_title}}/gi, meeting.title)
                    .replace(/{meeting_date}|{{meeting_date}}/gi, dateStr)
                    .replace(/{meeting_time}|{{meeting_time}}/gi, timeStr)
                    .replace(/{location}|{{location_name}}/gi, meeting.location_name || 'TBD');

                return {
                    to: m.phone,
                    content: personalizedContent,
                    memberId: m.id
                };
            });

            // Start bulk send in background
            whatsapp.sendBulk(bulkMessages, `Meeting Notify: ${meeting.title}`).catch((err: any) => console.error('WhatsApp bulk notify failed:', err));

            return res.json({ success: true, message: `WhatsApp notifications queued for ${whatsappMembers.length} members` });
        }

        return res.status(400).json({ message: 'Invalid notification type' });
    } catch (error: any) {
        console.error('notifyMeetingMembers Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
