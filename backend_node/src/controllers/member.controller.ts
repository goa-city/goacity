import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// GET /api/member/dashboard
export const getDashboard = async (req: Request, res: Response) => {
    try {
        const userId = Number((req as any).userId); // Ensure it's a number
        if (!userId) {
            console.error('[DASHBOARD] Invalid or missing userId in token');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`[DASHBOARD] Fetching data for user ID: ${userId}`);

        const member = await prisma.member.findUnique({
            where: { id: userId },
            include: {
                streams: { include: { stream: true } },
                profiles: true
            }
        });

        if (!member) return res.status(404).json({ message: 'Member not found' });

        // Build streams with form info for dashboard cards
        const streams = [];
        const pendingActions = [];

        for (const sm of member.streams) {
            const stream = (sm as any).stream;
            if (!stream) continue; // Safety check
            const hasForm = !!stream.form_id;
            let formCompleted = false;
            let formDetails = null;

            if (hasForm && stream.form_id) {
                // Check if user has completed this form
                const completedResponse = await prisma.$queryRaw`
                    SELECT id FROM form_responses 
                    WHERE form_id = ${stream.form_id} AND user_id = ${userId} AND status = 'completed'
                    LIMIT 1
                ` as any[];
                formCompleted = completedResponse.length > 0;

                // Get form details
                const formRow = await prisma.$queryRaw`
                    SELECT id, title, code FROM forms WHERE id = ${stream.form_id} LIMIT 1
                ` as any[];
                formDetails = formRow.length > 0 ? formRow[0] : null;

                // If form not completed, add to pending actions
                if (!formCompleted && formDetails) {
                    pendingActions.push({
                        type: 'stream_onboarding',
                        message: `Complete ${formDetails.title} for ${stream.name}`,
                        stream_name: stream.name,
                        stream_color: stream.color,
                        form_id: stream.form_id
                    });
                }
            }

            // Get member count for this stream
            const countResult = await prisma.$queryRaw`
                SELECT COUNT(*)::int as count FROM stream_members WHERE stream_id = ${stream.id}
            ` as any[];
            const memberCount = countResult.length > 0 ? countResult[0].count : 0;

            streams.push({
                id: stream.id,
                name: stream.name,
                color: stream.color,
                description: stream.description,
                form_id: stream.form_id,
                has_form: hasForm,
                form_completed: formCompleted,
                form_details: formDetails,
                member_count: memberCount
            });
        }

        // Get upcoming meetings for the member's streams
        const streamIds = member.streams.map((sm: any) => sm.stream_id);
        const meetings = streamIds.length > 0 ? await prisma.$queryRaw`
            SELECT m.*, s.name as stream_name, s.color as stream_color,
                mr.rsvp_status as my_rsvp, mr.checked_in as my_checkin, mr.payment_status as my_payment_status
            FROM meetings m
            LEFT JOIN streams s ON s.id = m.stream_id
            LEFT JOIN meeting_responses mr ON mr.meeting_id = m.id AND mr.user_id = ${userId}
            WHERE m.stream_id = ANY(${streamIds}::int[]) AND m.archived = 0
            ORDER BY m.meeting_date ASC
        ` : [];

        return res.json({
            user: {
                id: member.id,
                first_name: member.first_name,
                last_name: member.last_name,
                email: member.email,
                phone: member.phone,
                role: member.role,
                is_onboarded: member.is_onboarded,
                profile_photo: member.profile_photo
            },
            streams,
            meetings,
            pending_actions: pendingActions
        });
    } catch (error: any) {
        console.error('getDashboard Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/member/profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const member = await prisma.member.findUnique({ where: { id: userId } });
        const profiles = await prisma.$queryRaw`SELECT * FROM member_profiles WHERE user_id = ${userId}`;

        return res.json({ user: member, profiles });
    } catch (error: any) {
        console.error('getProfile Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/member/profile - update profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const updates = req.body;
        
        // Update direct member fields
        const directFields: any = {};
        if (updates.first_name !== undefined) directFields.first_name = updates.first_name;
        if (updates.last_name !== undefined) directFields.last_name = updates.last_name;
        if (updates.bio !== undefined) directFields.bio = updates.bio;
        if (updates.profile_photo !== undefined) directFields.profile_photo = updates.profile_photo;
        
        if (Object.keys(directFields).length > 0) {
            await prisma.member.update({ where: { id: userId }, data: directFields });
        }

        return res.json({ message: 'Profile updated' });
    } catch (error: any) {
        console.error('updateProfile Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/meeting_actions
export const meetingAction = async (req: Request, res: Response) => {
    try {
        const { meeting_id, user_id, action, value } = req.body;
        if (!meeting_id || !user_id) return res.status(400).json({ message: 'Missing meeting_id or user_id' });

        const existing = await prisma.$queryRaw`SELECT id, payment_status, rsvp_status, checked_in FROM meeting_responses WHERE meeting_id = ${Number(meeting_id)} AND user_id = ${Number(user_id)} LIMIT 1` as any[];

        if (existing.length > 0) {
            if (action === 'rsvp') {
                await prisma.$queryRaw`UPDATE meeting_responses SET rsvp_status = ${value} WHERE id = ${existing[0].id}`;
            } else if (action === 'checkin') {
                await prisma.$queryRaw`UPDATE meeting_responses SET checked_in = ${Number(value) || 1} WHERE id = ${existing[0].id}`;
            } else if (action === 'pay') {
                // To fetch exact meeting amount, we could do it here, but for now just update status
                const m = await prisma.$queryRaw`SELECT payment_amount FROM meetings WHERE id = ${Number(meeting_id)} LIMIT 1` as any[];
                const amt = m.length > 0 ? m[0].payment_amount : 0;
                await prisma.$queryRaw`UPDATE meeting_responses SET payment_status = ${value}, paid_amount = ${amt} WHERE id = ${existing[0].id}`;
            }
        } else {
            let rsvp = 'none', checkedIn = 0, payStatus = 'pending';
            let amt = 0;
            if (action === 'rsvp') rsvp = value;
            if (action === 'checkin') checkedIn = Number(value) || 1;
            if (action === 'pay') {
                payStatus = value;
                const m = await prisma.$queryRaw`SELECT payment_amount FROM meetings WHERE id = ${Number(meeting_id)} LIMIT 1` as any[];
                if (m.length > 0) amt = m[0].payment_amount;
            }

            await prisma.$queryRaw`
                INSERT INTO meeting_responses (meeting_id, user_id, rsvp_status, checked_in, payment_status, paid_amount)
                VALUES (${Number(meeting_id)}, ${Number(user_id)}, ${rsvp}, ${checkedIn}, ${payStatus}, ${amt})
            `;
        }

        return res.json({ message: 'Action recorded' });
    } catch (error: any) {
        console.error('meetingAction Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/posts
export const createPost = async (req: Request, res: Response) => {
    try {
        const { action, post_id, user_id, content, media_type, link_title } = req.body;
        
        if (action === 'toggle_like') {
            const existing = await prisma.$queryRaw`SELECT 1 FROM post_likes WHERE post_id=${Number(post_id)} AND user_id=${Number(user_id)}` as any[];
            if (existing.length > 0) {
                await prisma.$queryRaw`DELETE FROM post_likes WHERE post_id=${Number(post_id)} AND user_id=${Number(user_id)}`;
            } else {
                await prisma.$queryRaw`INSERT INTO post_likes (post_id, user_id) VALUES (${Number(post_id)}, ${Number(user_id)})`;
            }
            return res.json({ message: 'Toggled like' });
        }

        const file = (req as any).file;
        let media_url = req.body.media_url || null;
        
        if (file) {
            media_url = file.path; // Multer saves the file and provides the path
        }

        const result = await prisma.$queryRaw`
            INSERT INTO posts (user_id, content, media_url, media_type, link_title)
            VALUES (${Number(user_id)}, ${content || ''}, ${media_url || null}, ${media_type || 'none'}, ${link_title || null})
            RETURNING id
        `;
        return res.json({ message: 'Post created', id: (result as any)[0]?.id });
    } catch (error: any) {
        console.error('createPost Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/jobs
export const createJob = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const { title, company, location, category, type, description, url, contact_email, posted_by } = body;
        const result = await prisma.$queryRaw`
            INSERT INTO jobs (title, company, location, category, type, description, url, contact_email, posted_by)
            VALUES (${title}, ${company}, ${location}, ${category || null}, ${type || 'Full Time'}, ${description || null}, ${url || null}, ${contact_email || null}, ${Number(posted_by) || null})
            RETURNING id
        `;
        return res.json({ message: 'Job created', id: (result as any)[0]?.id });
    } catch (error: any) {
        console.error('createJob Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// POST /api/resources
export const createResource = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const { title, category, author, url, description, submitted_by } = body;
        const result = await prisma.$queryRaw`
            INSERT INTO resources (title, category, author, url, description, submitted_by)
            VALUES (${title}, ${category}, ${author}, ${url || null}, ${description || null}, ${Number(submitted_by) || null})
            RETURNING id
        `;
        return res.json({ message: 'Resource created', id: (result as any)[0]?.id });
    } catch (error: any) {
        console.error('createResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/jobs
export const getJobs = async (req: Request, res: Response) => {
    try {
        // Default to approved-only for member-facing endpoint
        const statusStr = (req.query.status as string) || 'approved';
        let query = `SELECT * FROM jobs WHERE status = '${statusStr}'`;
        query += ` ORDER BY created_at DESC`;
        const jobs = await prisma.$queryRawUnsafe(query);
        return res.json(jobs);
    } catch (error: any) {
        console.error('getJobs Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/resources
export const getResources = async (req: Request, res: Response) => {
    try {
        // Default to approved-only for member-facing endpoint
        const statusStr = (req.query.status as string) || 'approved';
        let query = `SELECT * FROM resources WHERE status = '${statusStr}'`;
        query += ` ORDER BY created_at DESC`;
        const resources = await prisma.$queryRawUnsafe(query);
        return res.json(resources);
    } catch (error: any) {
        console.error('getResources Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
