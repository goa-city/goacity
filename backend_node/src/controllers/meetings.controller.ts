import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { whatsapp } from '../services/whatsapp.service.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { formatDateDDMMYYYY, formatTime12h, parseTime24h, generateICS, slugify, generateUniqueSlug, getBaseUrl } from '../lib/utils.js';
import { processImageToWebp } from '../utils/image.js';
import { ShortLinkService } from '../services/short-link.service.js';
import { generateToken } from '../utils/jwt.js';

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
                    stream: {
                        include: {
                            _count: {
                                select: { members: true }
                            }
                        }
                    },
                    resources: true,
                    meeting_responses: {
                        include: {
                            user: true
                        },
                        orderBy: {
                            created_at: 'asc'
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
                stream_member_count: meeting.stream?._count?.members || 0,
                payment_qr_image_url: meeting.payment_qr_image ? `${baseUrl}/uploads/${meeting.payment_qr_image}` : null,
                poster_image_url: meeting.poster_image ? `${baseUrl}/uploads/${meeting.poster_image}` : null,
                meeting_date_display: formatDateDDMMYYYY(meeting.meeting_date),
                start_time_display: meeting.start_time || '-',
                end_time_display: meeting.end_time || '-',
                resources: meeting.resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                meeting_responses: meeting.meeting_responses.map((mr: any) => ({
                    ...mr,
                    is_guest: !mr.user_id,
                    first_name: mr.user?.first_name || (mr.guest_name ? mr.guest_name.split(' ')[0] : 'Guest'),
                    last_name: mr.user?.last_name || (mr.guest_name ? mr.guest_name.split(' ').slice(1).join(' ') : ''),
                    full_name: mr.user ? `${mr.user.first_name || ''} ${mr.user.last_name || ''}`.trim() : (mr.guest_name || 'Guest'),
                    email: mr.user?.email || mr.guest_email,
                    phone: mr.user?.phone || mr.guest_phone,
                    payment_proof_url: mr.payment_proof ? `${baseUrl}/uploads/${mr.payment_proof}` : null
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
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount, mr.payment_proof as my_payment_proof
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
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null,
                poster_image_url: m.poster_image ? `${baseUrl}/uploads/${m.poster_image}` : null,
                my_payment_proof_url: m.my_payment_proof ? `${baseUrl}/uploads/${m.my_payment_proof}` : null
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
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount, mr.payment_proof as my_payment_proof
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

            let recapVideos = m.recap_videos;
            if (typeof recapVideos === 'string') {
                try { recapVideos = JSON.parse(recapVideos); } catch (e) { recapVideos = []; }
            }

            let recapGallery = m.recap_gallery;
            if (typeof recapGallery === 'string') {
                try { recapGallery = JSON.parse(recapGallery); } catch (e) { recapGallery = []; }
            }

            return {
                ...m,
                meeting_date_display: formatDateDDMMYYYY(m.meeting_date),
                start_time_display: m.start_time || '-',
                end_time_display: m.end_time || '-',
                resources: resources.map(r => ({
                    ...r,
                    url_display: `${baseUrl}/uploads/${r.url}`
                })),
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null,
                poster_image_url: m.poster_image ? `${baseUrl}/uploads/${m.poster_image}` : null,
                my_payment_proof_url: m.my_payment_proof ? `${baseUrl}/uploads/${m.my_payment_proof}` : null,
                recap_videos: Array.isArray(recapVideos) ? recapVideos : [],
                recap_gallery: Array.isArray(recapGallery) ? recapGallery.map((img: any) => ({
                    ...img,
                    image_url_display: img.image_url?.startsWith('http') ? img.image_url : `${baseUrl}/uploads/${img.image_url}`
                })) : []
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
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount, mr.payment_proof as my_payment_proof
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
                payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null,
                poster_image_url: m.poster_image ? `${baseUrl}/uploads/${m.poster_image}` : null,
                my_payment_proof_url: m.my_payment_proof ? `${baseUrl}/uploads/${m.my_payment_proof}` : null
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
        const idOrSlug = req.params.id as string;
        const userId = Number(req.query.user_id) || (req as any).userId || 0;
        
        const isNumeric = !isNaN(Number(idOrSlug));
        const cityId = (req as any).cityId || 1;

        // Find the meeting by ID or Slug first to get the correct numeric ID
        const basicMeeting = await prisma.meetings.findFirst({
            where: {
                city_id: cityId,
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!basicMeeting) return res.status(404).json({ message: 'Meeting not found' });

        const id = basicMeeting.id;
        
        const rawMeetings: any[] = await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status, mr.paid_amount, mr.payment_proof as my_payment_proof
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
            payment_qr_image_url: m.payment_qr_image ? `${baseUrl}/uploads/${m.payment_qr_image}` : null,
            poster_image_url: m.poster_image ? `${baseUrl}/uploads/${m.poster_image}` : null,
            my_payment_proof_url: m.my_payment_proof ? `${baseUrl}/uploads/${m.my_payment_proof}` : null
        };

        // Get resources
        const resources = await (prisma as any).meetingResource.findMany({
            where: { meeting_id: id }
        });

        formatted.resources = resources.map((r: any) => ({
            ...r,
            url_display: `${baseUrl}/uploads/${r.url}`
        }));

        // Parse recap_videos and recap_gallery
        let recapVideos = m.recap_videos;
        if (typeof recapVideos === 'string') {
            try { recapVideos = JSON.parse(recapVideos); } catch (e) { recapVideos = []; }
        }
        formatted.recap_videos = Array.isArray(recapVideos) ? recapVideos : [];

        let recapGallery = m.recap_gallery;
        if (typeof recapGallery === 'string') {
            try { recapGallery = JSON.parse(recapGallery); } catch (e) { recapGallery = []; }
        }
        if (Array.isArray(recapGallery)) {
            formatted.recap_gallery = recapGallery.map((img: any) => ({
                ...img,
                image_url_display: img.image_url?.startsWith('http') ? img.image_url : `${baseUrl}/uploads/${img.image_url}`
            }));
        } else {
            formatted.recap_gallery = [];
        }

        // Fetch video reactions summary & user's reaction
        const videoReactions = await (prisma as any).meetingVideoReaction.findMany({
            where: { meeting_id: id }
        });

        const reactionsMap: Record<string, { likes: number; loves: number; my_reaction?: string | null }> = {};
        videoReactions.forEach((vr: any) => {
            const entry = reactionsMap[vr.video_id] || { likes: 0, loves: 0, my_reaction: null };
            if (vr.reaction_type === 'like') entry.likes += 1;
            if (vr.reaction_type === 'love') entry.loves += 1;
            if (userId && vr.member_id === userId) {
                entry.my_reaction = vr.reaction_type;
            }
            reactionsMap[vr.video_id] = entry;
        });
        formatted.video_reactions = reactionsMap;

        if (m.registration_form_id) {
            const regForm = await prisma.forms.findUnique({
                where: { id: Number(m.registration_form_id) },
                include: {
                    fields: {
                        orderBy: { sort_order: 'asc' }
                    }
                }
            });
            formatted.registration_form = regForm;
        }

        return res.json(formatted);
    } catch (error: any) {
        console.error('getMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

import { createGoogleCalendarEvent } from '../utils/google-calendar.js';

// POST /api/admin/meetings (Create/Update meeting)
export const saveMeeting = async (req: Request, res: Response) => {
    try {
        let { id, title, slug, description, meeting_date, start_time, end_time, location_name, map_link, is_paid, payment_amount, feedback_form_id, stream_id, archived, recap_content, zoom_link, upi_link, remove_poster_image, remove_payment_qr, is_public, registration_form_id } = req.body;
        
        // Handle files from upload.fields or upload.single
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const singleFile = req.file;

        const qrFile = files?.['payment_qr_image']?.[0] || (singleFile?.fieldname === 'payment_qr_image' ? singleFile : undefined);
        const posterFile = files?.['poster_image']?.[0] || (singleFile?.fieldname === 'poster_image' ? singleFile : undefined);

        const qrFilename = qrFile ? await processImageToWebp(qrFile, 600) : null;
        const posterFilename = posterFile ? await processImageToWebp(posterFile, 1600) : null;

        const meetingData: any = {
            title,
            description: description || null,
            meeting_date: meeting_date ? new Date(meeting_date) : null,
            start_time: start_time || null,
            end_time: end_time || null,
            location_name: location_name || null,
            map_link: map_link || null,
            is_paid: (is_paid === 'true' || is_paid === true || is_paid === '1' || Number(is_paid) === 1) ? 1 : 0,
            is_public: (is_public === 'true' || is_public === true || is_public === '1' || Number(is_public) === 1) ? 1 : 0,
            payment_amount: new Prisma.Decimal(payment_amount && payment_amount !== '' ? payment_amount : 0),
            feedback_form_id: (feedback_form_id && feedback_form_id !== 'null' && feedback_form_id !== '') ? Number(feedback_form_id) : null,
            registration_form_id: (registration_form_id && registration_form_id !== 'null' && registration_form_id !== '') ? Number(registration_form_id) : null,
            stream_id: (stream_id && stream_id !== 'null' && stream_id !== '') ? Number(stream_id) : null,
            archived: (archived === 'true' || archived === true || archived === '1' || Number(archived) === 1) ? 1 : 0,
            recap_content: recap_content || null,
            zoom_link: zoom_link || null,
            upi_link: upi_link || null
        };

        if (req.body.recap_videos !== undefined) {
            let parsed = req.body.recap_videos;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
            }
            meetingData.recap_videos = parsed;
        }

        if (req.body.recap_gallery !== undefined) {
            let parsed = req.body.recap_gallery;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
            }
            meetingData.recap_gallery = parsed;
        }

        const cityId = (req as any).cityId || 1;

        if (id) {
            // Updating: Only update slug if provided manually, otherwise keep existing
            if (slug) {
                meetingData.slug = slugify(slug);
            }
        } else {
            // Creating: Use manual slug or generate a unique one
            if (slug) {
                meetingData.slug = slugify(slug);
            } else {
                meetingData.slug = await generateUniqueSlug(prisma.meetings, title, cityId, meeting_date ? new Date(meeting_date) : undefined);
            }
        }

        if (qrFilename) {
            meetingData.payment_qr_image = qrFilename;
        } else if (remove_payment_qr === 'true' || remove_payment_qr === true || remove_payment_qr === '1') {
            meetingData.payment_qr_image = null;
        }

        if (posterFilename) {
            meetingData.poster_image = posterFilename;
        } else if (remove_poster_image === 'true' || remove_poster_image === true || remove_poster_image === '1') {
            meetingData.poster_image = null;
        }

        let finalId: number;

        if (id) {
            finalId = Number(id);
            await prisma.meetings.update({
                where: { id: finalId },
                data: meetingData
            });
        } else {
            const created = await prisma.meetings.create({
                data: {
                    ...meetingData,
                    city_id: cityId
                }
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

        return res.json({ success: true, id: finalId });
    } catch (error: any) {
        console.error('saveMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createMeeting = saveMeeting;

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
        const actions: any[] = await prisma.$queryRaw`
            SELECT 
                mr.id, 
                mr.rsvp_status, 
                mr.checked_in, 
                mr.payment_status,
                mr.paid_amount,
                mr.payment_proof,
                mr.guest_name,
                mr.guest_email,
                mr.guest_phone,
                mr.form_response_id,
                mr.created_at,
                m.first_name, 
                m.last_name, 
                m.email,
                m.phone
            FROM meeting_responses mr
            LEFT JOIN members m ON m.id = mr.user_id
            WHERE mr.meeting_id = ${id}
            ORDER BY mr.created_at ASC
        `;
        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const formatted = actions.map(a => ({
            ...a,
            is_guest: !a.first_name && Boolean(a.guest_name),
            first_name: a.first_name || (a.guest_name ? a.guest_name.split(' ')[0] : 'Guest'),
            last_name: a.last_name || (a.guest_name ? a.guest_name.split(' ').slice(1).join(' ') : ''),
            full_name: a.first_name ? `${a.first_name} ${a.last_name || ''}`.trim() : (a.guest_name || 'Guest'),
            email: a.email || a.guest_email,
            phone: a.phone || a.guest_phone,
            payment_proof_url: a.payment_proof ? `${baseUrl}/uploads/${a.payment_proof}` : null
        }));

        return res.json({ success: true, data: formatted });
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
        const idOrSlug = req.params.id as string;
        const { status } = req.body;

        if (!status) return res.status(400).json({ message: 'Status required' });

        const isNumeric = !isNaN(Number(idOrSlug));
        const cityId = (req as any).cityId || 1;

        const basicMeeting = await prisma.meetings.findFirst({
            where: {
                city_id: cityId,
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!basicMeeting) return res.status(404).json({ message: 'Meeting not found' });
        const meetingId = basicMeeting.id;

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: meetingId, user_id: userId }
        });

        // If payment is already completed/confirmed, lock RSVP from being changed
        const isPaidLocked = existing && (
            existing.payment_status === 'paid_online' || 
            existing.payment_status === 'paid_cash' || 
            existing.payment_status === 'completed' ||
            existing.payment_status === 'paid' ||
            Boolean(existing.payment_proof)
        );

        if (isPaidLocked) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment completed. RSVP cannot be modified.' 
            });
        }

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

export const rsvpClickMeeting = async (req: Request, res: Response) => {
    try {
        const idOrSlug = req.params.id as string;
        const memberIdStr = req.query.m as string;
        const status = (req.query.status as string)?.toLowerCase();

        const baseUrl = getBaseUrl(req);

        const validStatuses = ['going', 'not_sure', 'cant_go'];
        if (!status || !validStatuses.includes(status)) {
            return res.redirect(`${baseUrl}/meetings/${idOrSlug}`);
        }

        const isNumeric = !isNaN(Number(idOrSlug));
        const basicMeeting = await prisma.meetings.findFirst({
            where: {
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!basicMeeting) {
            return res.redirect(`${baseUrl}/meetings`);
        }

        const meetingTarget = basicMeeting.slug || basicMeeting.id;

        if (!memberIdStr || isNaN(Number(memberIdStr))) {
            return res.redirect(`${baseUrl}/meetings/${meetingTarget}`);
        }

        const memberId = Number(memberIdStr);
        const member = await prisma.member.findUnique({
            where: { id: memberId }
        });

        if (!member) {
            return res.redirect(`${baseUrl}/meetings/${meetingTarget}`);
        }

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: basicMeeting.id, user_id: memberId }
        });

        const isPaidLocked = existing && (
            existing.payment_status === 'paid_online' || 
            existing.payment_status === 'paid_cash' || 
            existing.payment_status === 'completed' ||
            existing.payment_status === 'paid' ||
            Boolean(existing.payment_proof)
        );

        if (!isPaidLocked) {
            if (existing) {
                await prisma.meeting_responses.update({
                    where: { id: existing.id },
                    data: { rsvp_status: status, updated_at: new Date() }
                });
            } else {
                await prisma.meeting_responses.create({
                    data: { meeting_id: basicMeeting.id, user_id: memberId, rsvp_status: status }
                });
            }
        }

        let authToken = '';
        try {
            authToken = generateToken({ id: member.id, role: member.role }, '30d');
        } catch (tokenErr) {
            console.error('rsvpClickMeeting Error generating token:', tokenErr);
        }

        const authParam = authToken ? `&auth_token=${authToken}` : '';
        return res.redirect(`${baseUrl}/meetings/${meetingTarget}?rsvp_recorded=${status}${authParam}`);
    } catch (error: any) {
        console.error('rsvpClickMeeting Error:', error);
        const baseUrl = getBaseUrl(req);
        return res.redirect(`${baseUrl}/meetings`);
    }
};

export const resolveShortLink = async (req: Request, res: Response) => {
    try {
        const code = req.params.code as string;
        const baseUrl = getBaseUrl(req);
        if (!code) {
            return res.redirect(`${baseUrl}/meetings`);
        }
        const targetUrl = await ShortLinkService.resolveAndRecordClick(code, baseUrl);
        return res.redirect(targetUrl);
    } catch (error: any) {
        console.error('resolveShortLink Error:', error);
        const baseUrl = getBaseUrl(req);
        return res.redirect(`${baseUrl}/meetings`);
    }
};

export const checkInMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const idOrSlug = req.params.id as string;

        const isNumeric = !isNaN(Number(idOrSlug));
        const cityId = (req as any).cityId || 1;

        const basicMeeting = await prisma.meetings.findFirst({
            where: {
                city_id: cityId,
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!basicMeeting) return res.status(404).json({ message: 'Meeting not found' });
        const meetingId = basicMeeting.id;

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
        let userId = (req as any).userId;
        const idOrSlug = req.params.id as string;
        const { method, amount, member_id, email, phone } = req.body;

        // If not authenticated via JWT, try resolving member from request body (e.g. from WhatsApp/public payment link)
        if (!userId && member_id) {
            userId = Number(member_id);
        } else if (!userId && (email || phone)) {
            const member = await prisma.member.findFirst({
                where: {
                    OR: [
                        email ? { email: String(email).trim().toLowerCase() } : {},
                        phone ? { phone: String(phone).trim() } : {}
                    ]
                }
            });
            if (member) {
                userId = member.id;
            }
        }

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Member identification required to record payment.' 
            });
        }

        const isNumeric = !isNaN(Number(idOrSlug));
        const cityId = (req as any).cityId || 1;

        const basicMeeting = await prisma.meetings.findFirst({
            where: {
                city_id: cityId,
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!basicMeeting) return res.status(404).json({ message: 'Meeting not found' });
        const meetingId = basicMeeting.id;

        // Process screenshot / proof image if uploaded
        let paymentProofFilename: string | null = null;
        if (req.file) {
            try {
                paymentProofFilename = await processImageToWebp(req.file, 1200);
            } catch (imgErr) {
                console.warn('Could not convert payment proof to webp with sharp, using original filename:', imgErr);
                paymentProofFilename = req.file.filename;
            }
        }

        const existing = await prisma.meeting_responses.findFirst({
            where: { meeting_id: meetingId, user_id: userId }
        });

        const paymentStatus = method || 'paid_online';
        const paymentAmountVal = amount || (basicMeeting.payment_amount ? Number(basicMeeting.payment_amount) : 0);

        const updateData: any = {
            payment_status: paymentStatus,
            paid_amount: new Prisma.Decimal(paymentAmountVal || 0),
            updated_at: new Date()
        };

        if (paymentProofFilename) {
            updateData.payment_proof = paymentProofFilename;
        }

        if (existing) {
            // Also ensure RSVP is confirmed as going if payment is completed
            if (!existing.rsvp_status || existing.rsvp_status !== 'going') {
                updateData.rsvp_status = 'going';
            }
            await prisma.meeting_responses.update({
                where: { id: existing.id },
                data: updateData
            });
        } else {
            await prisma.meeting_responses.create({
                data: { 
                    meeting_id: meetingId, 
                    user_id: userId, 
                    rsvp_status: 'going',
                    ...updateData 
                }
            });
        }

        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        return res.json({ 
            success: true, 
            message: 'Payment recorded successfully',
            payment_status: paymentStatus,
            payment_proof_url: paymentProofFilename ? `${baseUrl}/uploads/${paymentProofFilename}` : null
        });
    } catch (error: any) {
        console.error('payMeeting Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/meetings/:id/register-guest (Public guest registration)
export const registerGuestMeeting = async (req: Request, res: Response) => {
    try {
        const idOrSlug = req.params.id as string;
        const { name, email, phone, payment_status, paid_amount, form_answers } = req.body;
        
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone number are required.' });
        }

        const isNumeric = !isNaN(Number(idOrSlug));
        const meeting = await prisma.meetings.findFirst({
            where: {
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found.' });
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPhone = String(phone).trim();
        const cleanName = String(name).trim();

        // Handle uploaded payment proof
        let proofFilename: string | null = null;
        if (req.file) {
            proofFilename = await processImageToWebp(req.file, 1200);
        }

        // Handle optional custom form answers
        let formResponseId: number | null = null;
        if (meeting.registration_form_id && form_answers) {
            try {
                let parsedAnswers: Record<string, any> = {};
                if (typeof form_answers === 'string') {
                    parsedAnswers = JSON.parse(form_answers);
                } else if (typeof form_answers === 'object') {
                    parsedAnswers = form_answers;
                }

                if (Object.keys(parsedAnswers).length > 0) {
                    const formResponse = await prisma.formResponse.create({
                        data: {
                            form_id: Number(meeting.registration_form_id),
                            meeting_id: meeting.id,
                            status: 'completed',
                            submitted_at: new Date()
                        }
                    });
                    formResponseId = formResponse.id;

                    const answerRecords = Object.entries(parsedAnswers).map(([k, v]) => ({
                        response_id: formResponse.id,
                        field_key: k,
                        answer_value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                        is_answered: true
                    }));
                    if (answerRecords.length > 0) {
                        await prisma.formAnswer.createMany({ data: answerRecords });
                    }
                }
            } catch (err) {
                console.error('[GUEST REGISTRATION] Error parsing form answers:', err);
            }
        }

        // Check if this guest or member is already registered for this meeting
        const existingGuest = await prisma.meeting_responses.findFirst({
            where: {
                meeting_id: meeting.id,
                OR: [
                    { guest_email: cleanEmail },
                    { guest_phone: cleanPhone }
                ]
            }
        });

        const existingMember = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: cleanEmail },
                    { phone: cleanPhone }
                ]
            },
            include: {
                meeting_responses: {
                    where: { meeting_id: meeting.id }
                }
            }
        });

        const existingResponse = existingGuest || (existingMember?.meeting_responses && existingMember.meeting_responses.length > 0 ? existingMember.meeting_responses[0] : null);

        if (existingResponse) {
            const isPaymentComplete = existingResponse.payment_status === 'paid_online' || 
                existingResponse.payment_status === 'paid_cash' || 
                existingResponse.payment_status === 'completed' || 
                existingResponse.payment_status === 'paid' || 
                Boolean(existingResponse.payment_proof);

            const memberName = existingMember ? [existingMember.first_name, existingMember.last_name].filter(Boolean).join(' ') : null;

            return res.status(409).json({
                success: false,
                already_registered: true,
                message: 'You are already registered for this event with this email address or phone number.',
                meeting_title: meeting.title,
                slug: meeting.slug || meeting.id,
                is_paid: Boolean(meeting.is_paid),
                payment_amount: meeting.payment_amount,
                payment_status: existingResponse.payment_status || 'pending',
                is_payment_complete: isPaymentComplete,
                guest_name: existingResponse.guest_name || memberName || cleanName,
                guest_email: cleanEmail,
                guest_phone: cleanPhone
            });
        }

        let targetPaymentStatus = payment_status;
        if (!targetPaymentStatus) {
            if (meeting.is_paid) {
                targetPaymentStatus = proofFilename ? 'paid_online' : 'pending';
            } else {
                targetPaymentStatus = 'none';
            }
        }

        const targetAmount = meeting.is_paid 
            ? new Prisma.Decimal(paid_amount && Number(paid_amount) > 0 ? paid_amount : (meeting.payment_amount || 0)) 
            : new Prisma.Decimal(0);

        const responseRecord = await prisma.meeting_responses.create({
            data: {
                meeting_id: meeting.id,
                user_id: null,
                guest_name: cleanName,
                guest_email: cleanEmail,
                guest_phone: cleanPhone,
                rsvp_status: 'going',
                checked_in: 0,
                payment_status: targetPaymentStatus,
                paid_amount: targetAmount,
                payment_proof: proofFilename,
                form_response_id: formResponseId
            }
        });

        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        return res.json({
            success: true,
            message: 'Registration successful! See you at the meeting.',
            response_id: responseRecord.id,
            guest_name: cleanName,
            guest_email: cleanEmail,
            guest_phone: cleanPhone,
            payment_status: targetPaymentStatus,
            payment_proof_url: proofFilename ? `${baseUrl}/uploads/${proofFilename}` : null
        });
    } catch (error: any) {
        console.error('registerGuestMeeting Error:', error);
        return res.status(500).json({ message: 'Failed to process registration. Please try again.' });
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
        const { type, templateId, targetAudience = 'all', isTest = false } = req.body;

        const meeting: any = await prisma.meetings.findUnique({
            where: { id },
            include: { resources: true }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const isTestingStream = Boolean(isTest || targetAudience === 'test_stream');
        const targetStreamId = isTestingStream ? 16 : meeting.stream_id;

        if (!isTestingStream && !meeting.stream_id) {
            return res.status(400).json({ message: 'Meeting is not linked to any stream. Please link a stream first.' });
        }

        // Get members in stream (strictly stream 16 if testing)
        let members: any[] = await prisma.member.findMany({
            where: {
                streams: {
                    some: { stream_id: targetStreamId }
                }
            }
        });

        if (members.length === 0) {
            return res.status(400).json({ 
                message: isTestingStream 
                    ? 'No members found in the Testing Stream (ID #16)' 
                    : 'No members found in the linked stream' 
            });
        }

        // Apply recipient audience filtering (strictly bypassed for testing stream)
        if (!isTestingStream && targetAudience && targetAudience !== 'all') {
            if (targetAudience === 'no_response') {
                const respondedUsers = await prisma.meeting_responses.findMany({
                    where: {
                        meeting_id: id,
                        rsvp_status: { in: ['going', 'not_sure', 'cant_go'] }
                    },
                    select: { user_id: true }
                });
                const respondedUserIds = new Set(respondedUsers.map(r => r.user_id).filter(Boolean));
                members = members.filter(m => !respondedUserIds.has(m.id));
            } else {
                let whereClause: any = { meeting_id: id };
                if (targetAudience === 'going') {
                    whereClause.rsvp_status = 'going';
                } else if (targetAudience === 'going_unpaid') {
                    whereClause.rsvp_status = 'going';
                    whereClause.AND = [
                        {
                            OR: [
                                { payment_status: null },
                                { payment_status: { notIn: ['paid', 'paid_online', 'paid_cash'] } }
                            ]
                        },
                        {
                            OR: [
                                { paid_amount: null },
                                { paid_amount: { lte: 0 } }
                            ]
                        }
                    ];
                } else if (targetAudience === 'maybe') {
                    whereClause.rsvp_status = 'not_sure';
                } else if (targetAudience === 'no') {
                    whereClause.rsvp_status = 'cant_go';
                } else if (targetAudience === 'paid') {
                    whereClause.OR = [
                        { payment_status: { in: ['paid', 'paid_online', 'paid_cash'] } },
                        { paid_amount: { gt: 0 } }
                    ];
                } else if (targetAudience === 'checked_in') {
                    whereClause.checked_in = 1;
                }

                const matchingResponses = await prisma.meeting_responses.findMany({
                    where: whereClause,
                    select: { user_id: true }
                });

                const targetUserIds = new Set(matchingResponses.map(r => r.user_id).filter(Boolean));
                members = members.filter(m => targetUserIds.has(m.id));

                const guestResponses = await prisma.meeting_responses.findMany({
                    where: {
                        ...whereClause,
                        user_id: null
                    }
                });
                const guestMembers = guestResponses.map(g => ({
                    id: 0,
                    first_name: g.guest_name ? g.guest_name.split(' ')[0] : 'Guest',
                    last_name: g.guest_name ? g.guest_name.split(' ').slice(1).join(' ') : '',
                    email: g.guest_email,
                    phone: g.guest_phone,
                    is_guest: true
                })).filter(g => g.email || g.phone);
                members = [...members, ...guestMembers];
            }

            if (members.length === 0) {
                return res.status(400).json({ message: `No members or guests found matching '${targetAudience}' filter for this meeting` });
            }
        }

        const dateStr = formatDateDDMMYYYY(meeting.meeting_date);
        const startTime = meeting.start_time || '';
        const endTime = meeting.end_time || '';
        const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : (startTime || endTime || 'TBD');

        const baseUrl = getBaseUrl(req);
        const meetingUrl = `${baseUrl}/meetings/${id}`;

        const getReplacements = async (m: any) => {
            const meetingTarget = meeting.slug || meeting.id;
            let goingUrl = meetingUrl;
            let maybeUrl = meetingUrl;
            let noUrl = meetingUrl;
            let payUrl = `${baseUrl}/pay/${meetingTarget}`;

            if (m.id && m.id > 0) {
                [goingUrl, maybeUrl, noUrl] = await Promise.all([
                    ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'going', meetingTarget, baseUrl),
                    ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'not_sure', meetingTarget, baseUrl),
                    ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'cant_go', meetingTarget, baseUrl)
                ]);
                payUrl = `${baseUrl}/pay/${meetingTarget}?m=${m.id}`;
            }

            const rsvpOptionsBlock = `*Going:* ${goingUrl}\n\n*Maybe:* ${maybeUrl}\n\n*No:* ${noUrl}`;

            return {
                '{first_name}': m.first_name || 'Member',
                '{firstname}': m.first_name || 'Member',
                '{last_name}': m.last_name || '',
                '{lastname}': m.last_name || '',
                '{meeting_title}': meeting.title || '',
                '{meeting_date}': dateStr || '',
                '{meeting_time}': timeStr || '',
                '{location_name}': meeting.location_name || '',
                '{location}': meeting.location_name || '',
                '{map_link}': meeting.map_link || '',
                '{zoom_link}': meeting.zoom_link || '',
                '{rsvp_link}': meetingUrl || '',
                '{rsvp_options_link}': rsvpOptionsBlock,
                '{upi_link}': payUrl,
                '{pay_link}': payUrl,
                '{recap_content}': meeting.recap_content || '',
                '{description}': meeting.description || '',
                // Legacy / Double Bracket Support
                '{{first_name}}': m.first_name || 'Member',
                '{{last_name}}': m.last_name || '',
                '{{meeting_title}}': meeting.title || '',
                '{{meeting_date}}': dateStr || '',
                '{{meeting_time}}': timeStr || '',
                '{{location_name}}': meeting.location_name || '',
                '{{map_link}}': meeting.map_link || '',
                '{{zoom_link}}': meeting.zoom_link || '',
                '{{meeting_url}}': meetingUrl || '',
                '{{rsvp_link}}': meetingUrl || '',
                '{{rsvp_options_link}}': rsvpOptionsBlock,
                '{{upi_link}}': payUrl,
                '{{pay_link}}': payUrl,
                '{{recap_content}}': meeting.recap_content || '',
                '{{description}}': meeting.description || ''
            };
        };

        const applyReplacements = (text: string, replacements: any) => {
            let result = text;
            for (const key in replacements) {
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                result = result.replace(regex, replacements[key]);
            }
            return result;
        };

        if (type === 'email') {
            const effectiveTemplateId = templateId ? Number(templateId) : SYSTEM_TEMPLATES.EMAIL.MEETING.ID;
            const template = await prisma.emailTemplate.findUnique({ where: { id: effectiveTemplateId } });
            if (!template) return res.status(404).json({ message: 'Email template not found' });

            const emailMembers = members.filter(m => m.email);
            
            // Generate ICS file
            const icsContent = generateICS(meeting);
            const attachments = [{
                filename: 'invite.ics',
                content: icsContent,
                contentType: 'text/calendar'
            }];
            
            // Send emails (background)
            (async () => {
                for (const m of emailMembers) {
                    try {
                        const replacements = await getReplacements(m);
                        const personalizedHtml = applyReplacements(template.message, replacements);
                        const personalizedSubject = applyReplacements(template.subject, replacements);
                        await sendEmail(m.email, personalizedSubject, personalizedHtml, attachments);
                    } catch (err) {
                        console.error(`Email failed for ${m.email}:`, err);
                    }
                }
            })().catch(err => console.error('Email background send error:', err));

            const targetDesc = isTestingStream ? 'members in Testing Stream (ID #16)' : 'members';
            return res.json({ success: true, message: `Email notifications queued for ${emailMembers.length} ${targetDesc}` });
        } else if (type === 'whatsapp') {
            const effectiveTemplateId = templateId ? Number(templateId) : SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.ID;
            const template = await prisma.whatsAppTemplate.findUnique({ where: { id: effectiveTemplateId } });
            if (!template) return res.status(404).json({ message: 'WhatsApp template not found' });

            const whatsappMembers = members.filter(m => m.phone);

            // Format bulk messages with short links
            const bulkMessages = await Promise.all(whatsappMembers.map(async m => {
                const replacements = await getReplacements(m);
                const personalizedContent = applyReplacements(template.content, replacements);

                return {
                    to: m.phone,
                    content: personalizedContent,
                    memberId: m.id
                };
            }));

            // Start bulk send in background (attach template image if exists)
            const templateImagePath = template.image_url ? `uploads/${template.image_url}` : undefined;
            const templateImageUrl = template.image_url ? `${baseUrl}/uploads/${template.image_url}` : undefined;

            whatsapp.sendBulk(
                bulkMessages, 
                isTestingStream ? `[TEST] Meeting Notify: ${meeting.title}` : `Meeting Notify: ${meeting.title}`,
                undefined,
                templateImagePath,
                templateImageUrl
            ).catch((err: any) => console.error('WhatsApp bulk notify failed:', err));

            const targetDesc = isTestingStream ? 'members in Testing Stream (ID #16)' : 'members';
            return res.json({ success: true, message: `WhatsApp notifications queued for ${whatsappMembers.length} ${targetDesc}` });
        }

        return res.status(400).json({ message: 'Invalid notification type' });
    } catch (error: any) {
        console.error('notifyMeetingMembers Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

let cachedIndexHtml: string | null = null;
let lastIndexHtmlCheck = 0;

const getIndexHtmlTemplate = (): string => {
    const now = Date.now();
    if (cachedIndexHtml && (now - lastIndexHtmlCheck < 30000)) {
        return cachedIndexHtml;
    }

    const candidatePaths = [
        process.env.FRONTEND_DIST_PATH,
        '/home/ubuntu/frontend_dist/index.html',
        path.resolve(process.cwd(), '../frontend/dist/index.html'),
        path.resolve(process.cwd(), '../frontend/index.html'),
        path.resolve(process.cwd(), 'dist/index.html')
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p)) {
                cachedIndexHtml = fs.readFileSync(p, 'utf-8');
                lastIndexHtmlCheck = now;
                return cachedIndexHtml;
            }
        } catch {
            // ignore
        }
    }

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/goa-city-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Goa.City</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
};

/**
 * Serves meeting-related public pages (such as /meetings/:slug and /pay/:slug)
 * with the meeting's poster invite image dynamically injected into <link rel="icon">,
 * <link rel="apple-touch-icon">, and OpenGraph/Twitter meta tags.
 * This ensures that when posting the URL link on WhatsApp, Telegram, or social platforms,
 * the poster image is displayed rather than the default Goa.City logo.
 */
export const serveMeetingHtml = async (req: Request, res: Response) => {
    try {
        const idOrSlug = (req.params.slug || req.params.id) as string;
        const baseUrl = getBaseUrl(req);
        let template = getIndexHtmlTemplate();

        if (!idOrSlug) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(template);
        }

        const isNumeric = !isNaN(Number(idOrSlug));
        const meeting = await prisma.meetings.findFirst({
            where: {
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!meeting) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(template);
        }

        const title = meeting.title ? `${meeting.title} | Goa.City` : 'Goa.City';
        const posterUrl = meeting.poster_image 
            ? (meeting.poster_image.startsWith('http') ? meeting.poster_image : `${baseUrl}/uploads/${meeting.poster_image}`)
            : null;

        const dateStr = meeting.meeting_date ? formatDateDDMMYYYY(meeting.meeting_date) : '';
        const locStr = meeting.location_name || '';
        const rawDesc = meeting.description ? meeting.description.replace(/<[^>]*>/g, '').trim() : '';
        const description = rawDesc
            ? (rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc)
            : `Join us for ${meeting.title}${dateStr ? ` on ${dateStr}` : ''}${locStr ? ` at ${locStr}` : ''}.`;

        const currentUrl = `${baseUrl}${req.originalUrl || req.url}`;
        const userAgent = req.headers['user-agent'] || '';
        const isCrawler = /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot/i.test(userAgent);

        // 1. Update <title>
        if (template.includes('<title>')) {
            template = template.replace(/<title>.*?<\/title>/is, `<title>${title}</title>`);
        } else {
            template = template.replace('</head>', `  <title>${title}</title>\n</head>`);
        }

        // 2. Favicon handling:
        // Strip any poster icon links from raw server-rendered HTML so WhatsApp, WhatsApp Web,
        // and link scrapers NEVER generate a narrow poster preview image.
        // The browser tab icon is set dynamically on the client by React's useMeetingPosterFavicon hook.
        template = template.replace(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi, '');
        template = template.replace('</head>', `  <link rel="icon" type="image/png" href="/goa-city-icon.png" />\n</head>`);

        // 3. Inject text-only OpenGraph & Twitter Card tags (Option 2: Zero preview images in WhatsApp)
        const escapeAttr = (s: string) => s.replace(/"/g, '&quot;');
        const metaTags = [
            `<meta property="og:title" content="${escapeAttr(title)}" />`,
            `<meta property="og:description" content="${escapeAttr(description)}" />`,
            `<meta property="og:url" content="${escapeAttr(currentUrl)}" />`,
            `<meta property="og:type" content="website" />`,
            `<meta property="og:site_name" content="Goa.City" />`,
            `<meta name="twitter:card" content="summary" />`,
            `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
            `<meta name="twitter:description" content="${escapeAttr(description)}" />`
        ].filter(Boolean).join('\n    ');

        template = template.replace('</head>', `  ${metaTags}\n</head>`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(template);
    } catch (error) {
        console.error('serveMeetingHtml Error:', error);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(getIndexHtmlTemplate());
    }
};

/**
 * Serves a 1200x630 center-cropped JPEG image for a meeting poster.
 * Cached to disk in uploads/og_cache/ for maximum performance.
 * This guarantees WhatsApp and social platforms render a full-width preview card.
 */
export const serveMeetingOgImage = async (req: Request, res: Response) => {
    try {
        const idOrSlug = (req.params.slug || req.params.id) as string;
        if (!idOrSlug) {
            return res.status(404).send('Not found');
        }

        const isNumeric = !isNaN(Number(idOrSlug));
        const meeting = await prisma.meetings.findFirst({
            where: {
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug }
                ]
            }
        });

        if (!meeting || !meeting.poster_image) {
            const defaultLogo = path.resolve(process.cwd(), '../frontend/public/goa-city-icon.png');
            if (fs.existsSync(defaultLogo)) {
                return res.sendFile(defaultLogo);
            }
            return res.status(404).send('No poster image');
        }

        const posterFilename = path.basename(meeting.poster_image);
        const posterPath = path.resolve(process.cwd(), 'uploads', posterFilename);

        if (!fs.existsSync(posterPath)) {
            return res.status(404).send('Poster file not found on disk');
        }

        const cacheDir = path.resolve(process.cwd(), 'uploads', 'og_cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        const cachedFilename = `og_crop_${posterFilename}.jpg`;
        const cachedPath = path.join(cacheDir, cachedFilename);

        if (fs.existsSync(cachedPath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(cachedPath);
        }

        // Generate 1200x630 center crop
        await sharp(posterPath)
            .resize(1200, 630, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 85 })
            .toFile(cachedPath);

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(cachedPath);
    } catch (error) {
        console.error('serveMeetingOgImage Error:', error);
        return res.status(500).send('Error generating OG image');
    }
};

// POST /api/member/meetings/:id/videos/:clipId/react
export const toggleVideoReaction = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        const clipId = String(req.params.clipId);
        const memberId = (req as any).userId;
        const { reaction_type } = req.body; // 'like' | 'love'

        if (!memberId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const existing = await (prisma as any).meetingVideoReaction.findFirst({
            where: {
                meeting_id: meetingId,
                video_id: clipId,
                member_id: memberId
            }
        });

        if (existing) {
            if (existing.reaction_type === reaction_type) {
                // Toggle off
                await (prisma as any).meetingVideoReaction.delete({
                    where: { id: existing.id }
                });
            } else {
                // Switch reaction
                await (prisma as any).meetingVideoReaction.update({
                    where: { id: existing.id },
                    data: { reaction_type }
                });
            }
        } else {
            await (prisma as any).meetingVideoReaction.create({
                data: {
                    meeting_id: meetingId,
                    video_id: clipId,
                    member_id: memberId,
                    reaction_type
                }
            });
        }

        // Return updated counts
        const allReactions = await (prisma as any).meetingVideoReaction.findMany({
            where: { meeting_id: meetingId, video_id: clipId }
        });

        const likes = allReactions.filter((r: any) => r.reaction_type === 'like').length;
        const loves = allReactions.filter((r: any) => r.reaction_type === 'love').length;
        const current = allReactions.find((r: any) => r.member_id === memberId);

        return res.json({
            success: true,
            reactions: {
                likes,
                loves,
                my_reaction: current ? current.reaction_type : null
            }
        });
    } catch (error: any) {
        console.error('toggleVideoReaction Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/member/meetings/:id/videos/:clipId/analytics
export const logVideoWatch = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        const clipId = String(req.params.clipId);
        const memberId = (req as any).userId;
        const { action = 'play', duration_seconds = 0 } = req.body;

        if (!memberId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const durSec = Math.max(0, Math.floor(Number(duration_seconds) || 0));

        const existing = await (prisma as any).meetingVideoView.findUnique({
            where: {
                meeting_id_video_id_member_id: {
                    meeting_id: meetingId,
                    video_id: clipId,
                    member_id: memberId
                }
            }
        });

        if (existing) {
            await (prisma as any).meetingVideoView.update({
                where: { id: existing.id },
                data: {
                    play_count: action === 'play' ? { increment: 1 } : undefined,
                    duration_seconds: { increment: durSec },
                    last_watched_at: new Date()
                }
            });
        } else {
            await (prisma as any).meetingVideoView.create({
                data: {
                    meeting_id: meetingId,
                    video_id: clipId,
                    member_id: memberId,
                    play_count: 1,
                    duration_seconds: durSec,
                    last_watched_at: new Date()
                }
            });
        }

        return res.json({ success: true });
    } catch (error: any) {
        console.error('logVideoWatch Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/meetings/:id/video-analytics
export const getVideoAnalytics = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);

        const meeting = await prisma.meetings.findUnique({
            where: { id: meetingId },
            select: { id: true, title: true, recap_videos: true }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const views = await (prisma as any).meetingVideoView.findMany({
            where: { meeting_id: meetingId },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone: true,
                        profile_photo: true
                    }
                }
            },
            orderBy: { last_watched_at: 'desc' }
        });

        const reactions = await (prisma as any).meetingVideoReaction.findMany({
            where: { meeting_id: meetingId }
        });

        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const clips = (Array.isArray(meeting.recap_videos) ? meeting.recap_videos : []) as any[];

        const analyticsPerClip = clips.map((clip: any) => {
            const clipViews = views.filter((v: any) => v.video_id === clip.id || v.video_id === clip.youtube_id);
            const clipReactions = reactions.filter((r: any) => r.video_id === clip.id || r.video_id === clip.youtube_id);

            const totalPlays = clipViews.reduce((sum: number, v: any) => sum + (v.play_count || 1), 0);
            const totalDurationSeconds = clipViews.reduce((sum: number, v: any) => sum + (v.duration_seconds || 0), 0);
            const uniqueViewers = clipViews.length;

            const viewers = clipViews.map((v: any) => {
                const userReactions = clipReactions.filter((r: any) => r.member_id === v.member_id).map((r: any) => r.reaction_type);
                return {
                    member_id: v.member_id,
                    name: v.member ? `${v.member.first_name || ''} ${v.member.last_name || ''}`.trim() : 'Unknown Member',
                    email: v.member?.email,
                    phone: v.member?.phone,
                    profile_photo_url: v.member?.profile_photo ? (v.member.profile_photo.startsWith('http') ? v.member.profile_photo : `${baseUrl}/uploads/${v.member.profile_photo}`) : null,
                    play_count: v.play_count,
                    duration_seconds: v.duration_seconds,
                    last_watched_at: v.last_watched_at,
                    reactions: userReactions
                };
            });

            return {
                clip_id: clip.id,
                youtube_id: clip.youtube_id,
                title: clip.title,
                total_plays: totalPlays,
                unique_viewers: uniqueViewers,
                total_duration_seconds: totalDurationSeconds,
                viewers
            };
        });

        return res.json({
            success: true,
            meeting: { id: meeting.id, title: meeting.title },
            analytics: analyticsPerClip
        });
    } catch (error: any) {
        console.error('getVideoAnalytics Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/meetings/:id/recap-gallery
export const uploadRecapGalleryPhotos = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No photo files uploaded' });
        }

        const meeting = await prisma.meetings.findUnique({
            where: { id: meetingId }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const currentGallery = (Array.isArray(meeting.recap_gallery) ? meeting.recap_gallery : []) as any[];

        const newPhotos: any[] = [];
        for (const file of files) {
            const filename = await processImageToWebp(file, 1920);
            if (filename) {
                newPhotos.push({
                    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    image_url: filename,
                    caption: '',
                    created_at: new Date().toISOString()
                });
            }
        }

        const updatedGallery = [...currentGallery, ...newPhotos];

        await prisma.meetings.update({
            where: { id: meetingId },
            data: { recap_gallery: updatedGallery }
        });

        const apiUrl = process.env.VITE_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        const formattedGallery = updatedGallery.map((p: any) => ({
            ...p,
            image_url_display: `${baseUrl}/uploads/${p.image_url}`
        }));

        return res.json({
            success: true,
            recap_gallery: formattedGallery
        });
    } catch (error: any) {
        console.error('uploadRecapGalleryPhotos Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/meetings/:id/publish-recap-to-news
export const publishRecapToNews = async (req: Request, res: Response) => {
    try {
        const meetingId = Number(req.params.id);
        const adminId = (req as any).adminId || (req as any).userId;
        const { custom_note } = req.body;

        const meeting = await prisma.meetings.findUnique({
            where: { id: meetingId }
        });

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const cleanRecap = meeting.recap_content ? meeting.recap_content.replace(/<[^>]*>?/gm, ' ').slice(0, 300) : '';
        const postContent = custom_note || `🎉 Meeting Recap & Highlights are now live: "${meeting.title}"!\n\n${cleanRecap ? `${cleanRecap}...\n\n` : ''}Watch the video recordings and view the photo gallery on Goa.City.`;

        const newPost = await (prisma as any).post.create({
            data: {
                user_id: adminId || null,
                content: postContent,
                media_url: meeting.poster_image ? (meeting.poster_image.startsWith('http') ? meeting.poster_image : `${process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || ''}/uploads/${meeting.poster_image}`) : null,
                media_type: meeting.poster_image ? 'image' : 'none',
                link_title: `${process.env.VITE_APP_URL || 'https://goa.city'}/meetings/${meeting.slug || meeting.id}`,
                link_desc: `View video recordings, photo gallery and takeaways`,
                city_id: meeting.city_id || 1
            }
        });

        return res.json({ success: true, post: newPost });
    } catch (error: any) {
        console.error('publishRecapToNews Error:', error);
        return res.status(500).json({ message: error.message });
    }
};


