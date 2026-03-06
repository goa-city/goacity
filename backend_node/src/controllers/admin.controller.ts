import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// ---- ADMIN USERS ----

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (id) {
            const admin = await prisma.admin.findUnique({
                where: { id: Number(id) },
                select: { id: true, full_name: true, email: true, role: true, created_at: true }
            });
            if (!admin) return res.status(404).json({ message: 'Admin not found' });
            return res.json(admin);
        }
        const admins = await prisma.admin.findMany({
            select: { id: true, full_name: true, email: true, role: true, created_at: true },
            orderBy: { id: 'desc' }
        });
        return res.json(admins);
    } catch (error: any) {
        console.error('getAdmins Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { full_name, email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await prisma.admin.create({
            data: { 
                full_name, 
                email, 
                password_hash: hashedPassword, 
                role: 'admin' 
            }
        });
        return res.json({ message: 'Admin created', id: admin.id });
    } catch (error: any) {
        console.error('createAdmin Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const { id, full_name, email, password } = req.body;
        if (!id) return res.status(400).json({ message: 'ID is required' });

        const updateData: any = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        await prisma.admin.update({
            where: { id: Number(id) },
            data: updateData
        });
        return res.json({ message: 'Admin updated' });
    } catch (error: any) {
        console.error('updateAdmin Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ---- MEMBERS ----

// GET /api/admin/users - List all members or single member by ?id=
export const getUsers = async (req: Request, res: Response) => {
    try {
        const singleId = req.query.id;
        
        if (singleId) {
            const member = await prisma.member.findUnique({
                where: { id: Number(singleId) },
                include: { 
                    streams: { include: { stream: true } },
                    profiles: true
                }
            });
            if (!member) return res.status(404).json({ message: 'Member not found' });

            // Build stream_ids array for checkbox pre-selection
            const stream_ids = (member as any).streams.map((sm: any) => sm.stream_id);
            const streamsFormatted = (member as any).streams.map((sm: any) => ({
                id: sm.stream.id,
                name: sm.stream.name,
                color: sm.stream.color
            }));

            // Build member_profile as key-value object
            const member_profile: Record<string, any> = {};
            (member as any).profiles.forEach((p: any) => {
                member_profile[p.profile_key] = p.profile_value;
            });

            // Get form responses with answers
            const formResponses = await prisma.$queryRaw`
                SELECT fr.id as response_id, fr.form_id, fr.submitted_at, fr.status,
                    f.title as form_title
                FROM form_responses fr
                JOIN forms f ON f.id = fr.form_id
                WHERE fr.user_id = ${Number(singleId)}
                ORDER BY fr.submitted_at DESC
            ` as any[];

            for (const resp of formResponses) {
                const answers = await prisma.$queryRaw`
                    SELECT fa.field_key, fa.answer_value,
                        ff.label, ff.field_type
                    FROM form_answers fa
                    LEFT JOIN form_fields ff ON ff.field_key = fa.field_key AND ff.form_id = ${resp.form_id}
                    WHERE fa.response_id = ${resp.response_id}
                    ORDER BY ff.sort_order ASC
                ` as any[];
                resp.answers = answers.map((a: any) => ({
                    key: a.field_key,
                    label: a.label || a.field_key.replace(/_/g, ' '),
                    value: a.answer_value,
                    type: a.field_type
                }));
            }

            const stats = await prisma.$queryRaw`
                SELECT COUNT(*)::int as count 
                FROM meeting_responses 
                WHERE user_id = ${Number(singleId)} AND checked_in = 1
            ` as any[];
            const meetingCount = stats[0]?.count || 0;

            const result = {
                ...member,
                streams: streamsFormatted,
                stream_ids,
                member_profile,
                form_responses: formResponses,
                meeting_count: meetingCount,
                profiles: undefined  // remove raw profiles from response
            };
            return res.json(result);
        }

        const members = await prisma.member.findMany({
            include: { streams: { include: { stream: true } } },
            orderBy: { id: 'desc' }
        });
        const result = members.map((m: any) => ({
            ...m,
            streams: m.streams.map((sm: any) => ({
                id: sm.stream.id,
                name: sm.stream.name,
                color: sm.stream.color
            })),
            stream_names: m.streams.map((sm: any) => sm.stream.name)
        }));
        return res.json(result);
    } catch (error: any) {
        console.error('getUsers Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/users - Create a member
export const createUser = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, phone, stream_ids } = req.body;
        const member = await prisma.member.create({
            data: { first_name, last_name, email, phone, role: 'member', is_onboarded: 0 }
        });
        if (stream_ids && Array.isArray(stream_ids)) {
            await prisma.streamMember.createMany({
                data: stream_ids.map((sid: number) => ({ stream_id: Number(sid), user_id: member.id }))
            });
        }
        return res.json({ message: 'Member created', id: member.id });
    } catch (error: any) {
        console.error('createUser Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users - Update a member
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id, user_id, first_name, last_name, email, phone, stream_ids } = req.body;
        const memberId = Number(id || user_id);
        
        // Only update direct fields if provided
        const updateData: any = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        if (Object.keys(updateData).length > 0) {
            await prisma.member.update({ where: { id: memberId }, data: updateData });
        }

        if (stream_ids && Array.isArray(stream_ids)) {
            await prisma.streamMember.deleteMany({ where: { user_id: memberId } });
            if (stream_ids.length > 0) {
                await prisma.streamMember.createMany({
                    data: stream_ids.map((sid: any) => ({ stream_id: Number(sid), user_id: memberId }))
                });
            }
        }
        return res.json({ message: 'Member updated' });
    } catch (error: any) {
        console.error('updateUser Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ---- JOBS ----

// GET /api/admin/jobs
export const getAdminJobs = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (id) {
            const jobs = await prisma.$queryRawUnsafe(
                `SELECT j.*, m.first_name, m.last_name, m.email as member_email
                 FROM jobs j LEFT JOIN members m ON m.id = j.posted_by
                 WHERE j.id = $1`, Number(id)
            ) as any[];
            if (!jobs.length) return res.status(404).json({ message: 'Job not found' });
            return res.json(jobs[0]);
        }
        const status = req.query.status as string || 'all';
        let query = `
            SELECT j.*, m.first_name, m.last_name, m.email as member_email
            FROM jobs j
            LEFT JOIN members m ON m.id = j.posted_by
        `;
        if (status !== 'all') {
            query += ` WHERE j.status = '${status}'`;
        }
        query += ` ORDER BY j.created_at DESC`;
        const jobs = await prisma.$queryRawUnsafe(query);
        return res.json(jobs);
    } catch (error: any) {
        console.error('getAdminJobs Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/jobs
export const updateJob = async (req: Request, res: Response) => {
    try {
        const { id, title, company, location, category, type, description, url, contact_email, status } = req.body;
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.$queryRaw`
            UPDATE jobs SET
                title = COALESCE(${title || null}, title),
                company = COALESCE(${company || null}, company),
                location = COALESCE(${location || null}, location),
                category = COALESCE(${category || null}, category),
                type = COALESCE(${type || null}, type),
                description = COALESCE(${description || null}, description),
                url = COALESCE(${url || null}, url),
                contact_email = COALESCE(${contact_email || null}, contact_email),
                status = COALESCE(${status || null}, status)
            WHERE id = ${Number(id)}
        `;
        return res.json({ message: 'Job updated' });
    } catch (error: any) {
        console.error('updateJob Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/jobs
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.$queryRaw`DELETE FROM jobs WHERE id = ${id}`;
        return res.json({ message: 'Job deleted' });
    } catch (error: any) {
        console.error('deleteJob Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ---- RESOURCES ----

// GET /api/admin/resources
export const getAdminResources = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (id) {
            const resources = await prisma.$queryRawUnsafe(
                `SELECT r.*, m.first_name, m.last_name, m.email as member_email
                 FROM resources r LEFT JOIN members m ON m.id = r.submitted_by
                 WHERE r.id = $1`, Number(id)
            ) as any[];
            if (!resources.length) return res.status(404).json({ message: 'Resource not found' });
            return res.json(resources[0]);
        }
        const status = req.query.status as string || 'all';
        let query = `
            SELECT r.*, m.first_name, m.last_name, m.email as member_email
            FROM resources r
            LEFT JOIN members m ON m.id = r.submitted_by
        `;
        if (status !== 'all') {
            query += ` WHERE r.status = '${status}'`;
        }
        query += ` ORDER BY r.created_at DESC`;
        const resources = await prisma.$queryRawUnsafe(query);
        return res.json(resources);
    } catch (error: any) {
        console.error('getAdminResources Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/resources
export const updateResource = async (req: Request, res: Response) => {
    try {
        const { id, title, category, author, url, description, status } = req.body;
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.$queryRaw`
            UPDATE resources SET
                title = COALESCE(${title || null}, title),
                category = COALESCE(${category || null}, category),
                author = COALESCE(${author || null}, author),
                url = COALESCE(${url || null}, url),
                description = COALESCE(${description || null}, description),
                status = COALESCE(${status || null}, status)
            WHERE id = ${Number(id)}
        `;
        return res.json({ message: 'Resource updated' });
    } catch (error: any) {
        console.error('updateResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/resources
export const deleteResource = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.$queryRaw`DELETE FROM resources WHERE id = ${id}`;
        return res.json({ message: 'Resource deleted' });
    } catch (error: any) {
        console.error('deleteResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
// ---- NEWS / POSTS ----

export const getAdminPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.$queryRaw`
            SELECT p.*, CONCAT(m.first_name, ' ', m.last_name) as full_name, m.email as member_email
            FROM posts p
            LEFT JOIN members m ON m.id = p.user_id
            ORDER BY p.created_at DESC
        `;
        return res.json(posts);
    } catch (error: any) {
        console.error('getAdminPosts Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.$queryRaw`DELETE FROM posts WHERE id = ${id}`;
        return res.json({ message: 'Post deleted' });
    } catch (error: any) {
        console.error('deletePost Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
