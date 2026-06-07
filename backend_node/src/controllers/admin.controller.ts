import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { formatDateDDMMYYYY, formatAnswerValue, slugify, generateUniqueSlug } from '../lib/utils.js';

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
            const member = await (prisma.member as any).findUnique({
                where: { id: Number(singleId) },
                include: { 
                    streams: { include: { stream: true } },
                    profiles: true,
                    responses: {
                        include: {
                            form: true,
                            answers: true 
                        },
                        orderBy: { submitted_at: 'desc' }
                    }
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
            // ── Build Interaction History ──
            // Approach: the FORM DEFINITION is the single source of truth.
            // We walk its fields in sort_order.  For each field we look up the
            // submitted answer by field_key.  Nothing extra is appended.
            // If a question is added/deleted in the admin form editor the display
            // updates automatically.

            const formattedResponses = await Promise.all(
                (member as any).responses
                    // Only show fully completed submissions with a valid form link
                    .filter((fr: any) => fr.status === 'completed' && fr.form_id != null)
                    .map(async (fr: any) => {
                    // 1. Fetch the current form field definitions (always the latest)
                    let formFields: any[] = [];
                    if (fr.form_id) {
                        formFields = await prisma.formField.findMany({
                            where: { form_id: fr.form_id },
                            orderBy: { sort_order: 'asc' }
                        });
                    }

                    // 2. Build a lookup map: field_key → answer_value
                    const answersMap: Record<string, string> = {};
                    (fr.answers || []).forEach((a: any) => {
                        answersMap[a.field_key] = a.answer_value;
                    });

                    // 3. Walk form fields in order and build the display list
                    const displayRows: any[] = [];

                    for (const ff of formFields) {
                        // Skip intro / welcome screens — they have no data
                        if (ff.field_type === 'intro') continue;

                        // group_inputs: expand each sub-field as its own row
                        if (ff.field_type === 'group_inputs' && ff.group_fields) {
                            let subs: any[] = [];
                            try {
                                subs = typeof ff.group_fields === 'string'
                                    ? JSON.parse(ff.group_fields)
                                    : ff.group_fields;
                            } catch (_) {}
                            if (Array.isArray(subs)) {
                                for (const sf of subs) {
                                    displayRows.push({
                                        label: sf.label || sf.name.replace(/_/g, ' '),
                                        value: formatAnswerValue(answersMap[sf.name] ?? '', sf.type || 'text')
                                    });
                                }
                            }
                            continue;
                        }

                        // Every other field type — single row
                        displayRows.push({
                            label: ff.label || ff.field_key.replace(/_/g, ' '),
                            value: formatAnswerValue(answersMap[ff.field_key] ?? '', ff.field_type)
                        });
                    }

                    return {
                        response_id: fr.id,
                        form_id: fr.form_id,
                        submitted_at: formatDateDDMMYYYY(fr.submitted_at),
                        status: fr.status,
                        form_title: fr.form?.title || 'Unknown Form',
                        answers: displayRows
                    };
                })
            );

            const stats = await prisma.meeting_responses.count({
                where: { user_id: Number(singleId), checked_in: 1 }
            });

            // ── Build Member Profile Attributes ──
            // Only show when the member has at least one completed form response
            let profileAttributes: any[] = [];
            const hasCompletedForm = (member as any).responses?.some((r: any) => r.status === 'completed');

            // Find the onboarding form from the member's completed responses
            const onboardingFormId = (member as any).responses?.find((r: any) => r.status === 'completed')?.form_id;
            let profileFormFields: any[] = [];

            if (hasCompletedForm && onboardingFormId) {
                profileFormFields = await prisma.formField.findMany({
                    where: { form_id: onboardingFormId, is_profile: 1 },
                    orderBy: { sort_order: 'asc' }
                });
            }

            if (profileFormFields.length > 0) {
                // Build a combined value lookup from member_profile + latest form answers
                const valueLookup: Record<string, string> = { ...member_profile };

                // Also overlay values from the latest completed form response (if any)
                const latestResponse = (member as any).responses?.find((r: any) => r.status === 'completed')
                    || (member as any).responses?.[0];
                if (latestResponse?.answers) {
                    latestResponse.answers.forEach((a: any) => {
                        // Form answers take precedence (more recent)
                        valueLookup[a.field_key] = a.answer_value;
                    });
                }

                for (const ff of profileFormFields) {
                    // Skip intro fields
                    if (ff.field_type === 'intro') continue;

                    // group_inputs: expand sub-fields
                    if (ff.field_type === 'group_inputs' && ff.group_fields) {
                        let subs: any[] = [];
                        try {
                            subs = typeof ff.group_fields === 'string'
                                ? JSON.parse(ff.group_fields)
                                : ff.group_fields;
                        } catch (_) {}
                        if (Array.isArray(subs)) {
                            for (const sf of subs) {
                                profileAttributes.push({
                                    label: sf.label || sf.name.replace(/_/g, ' '),
                                    value: formatAnswerValue(valueLookup[sf.name] ?? '', sf.type || 'text')
                                });
                            }
                        }
                        continue;
                    }

                    // Single field
                    profileAttributes.push({
                        label: ff.label || ff.field_key.replace(/_/g, ' '),
                        value: formatAnswerValue(valueLookup[ff.field_key] ?? '', ff.field_type)
                    });
                }
            }

            const result = {
                ...member,
                streams: streamsFormatted,
                stream_ids,
                member_profile,
                profile_attributes: profileAttributes,
                has_completed_onboarding: hasCompletedForm,
                form_responses: formattedResponses,
                meeting_count: stats,
                profiles: undefined,
                form_responses_raw: undefined
            };
            return res.json(result);
        }

        const status = req.query.status as string; // 'registrations' or 'members'
        
        let where: any = {};
        if (status === 'registrations') {
            where = { streams: { none: {} } };
        } else if (status === 'members') {
            where = { streams: { some: {} } };
        }

        const members = await prisma.member.findMany({
            where,
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

// GET /api/admin/member-stats - For sidebar badges
export const getMemberStats = async (req: Request, res: Response) => {
    try {
        const registrations = await prisma.member.count({
            where: { streams: { none: {} } }
        });
        const members = await prisma.member.count({
            where: { streams: { some: {} } }
        });
        return res.json({ registrations, members });
    } catch (error: any) {
        console.error('getMemberStats Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/users - Create a member
export const createUser = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, phone, stream_ids, slug } = req.body;
        const cityId = (req as any).cityId || 1;

        let finalSlug = slug ? slugify(slug) : await generateUniqueSlug(prisma.member, `${first_name}-${last_name}`, cityId);

        const member = await prisma.member.create({
            data: { first_name, last_name, email, phone, role: 'member', is_onboarded: 0, slug: finalSlug }
        });
        if (stream_ids && Array.isArray(stream_ids)) {
            await prisma.streamMember.createMany({
                data: stream_ids.map((sid: number) => ({ stream_id: Number(sid), user_id: member.id }))
            });
        }
        return res.json({ message: 'Member created', id: member.id, slug: finalSlug });
    } catch (error: any) {
        console.error('createUser Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users - Update a member
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id, user_id, first_name, last_name, email, phone, stream_ids, slug, is_mentor } = req.body;
        const memberId = Number(id || user_id);
        
        // Only update direct fields if provided
        const updateData: any = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (slug !== undefined) updateData.slug = slugify(slug);
        if (is_mentor !== undefined) updateData.is_mentor = is_mentor;

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

// DELETE /api/admin/users - Delete a member
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'id required' });

        // Handle dependent records that don't have Cascade Delete in schema
        // meeting_responses
        await prisma.meeting_responses.deleteMany({ where: { user_id: id } });
        
        // whatsapp_logs
        await (prisma as any).whatsAppLog.deleteMany({ where: { member_id: id } });

        // attendance
        await (prisma as any).attendance.deleteMany({ where: { user_id: id } });

        // needs, offers, post_likes
        await (prisma as any).needs.deleteMany({ where: { user_id: id } });
        await (prisma as any).offers.deleteMany({ where: { user_id: id } });
        await (prisma as any).post_likes.deleteMany({ where: { user_id: id } });
        
        // job applications are handled by Cascade Delete (schema line 291)

        // resources (set submitted_by to null instead of deleting the resource?)
        // Actually, if we delete a member, maybe we should keep their resources but mark them as anonymous?
        // Or just delete them. Usually, it's safer to delete them if it's a full wipe.
        // But schema shows submitter is optional (Member?).
        await prisma.resources.updateMany({ 
            where: { submitted_by: id },
            data: { submitted_by: null }
        });

        // jobPostings
        await prisma.jobs.updateMany({
            where: { posted_by: id },
            data: { posted_by: null }
        });

        await prisma.member.delete({ where: { id } });
        return res.json({ message: 'Member deleted successfully' });
    } catch (error: any) {
        console.error('deleteUser Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// ---- JOBS ----

// GET /api/admin/jobs
export const getAdminJobs = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (id) {
            const job = await prisma.jobs.findUnique({
                where: { id: Number(id) },
                include: { poster: true }
            });
            if (!job) return res.status(404).json({ message: 'Job not found' });
            
            // Format to match expected output
            const result = {
                ...job,
                first_name: job.poster?.first_name,
                last_name: job.poster?.last_name,
                member_email: job.poster?.email,
                poster: undefined
            };
            return res.json(result);
        }
        const status = req.query.status as string || 'all';
        const jobs = await prisma.jobs.findMany({
            where: status !== 'all' ? { status } : {},
            include: { poster: true },
            orderBy: { created_at: 'desc' }
        });

        const result = jobs.map((j: any) => ({
            ...j,
            first_name: j.poster?.first_name,
            last_name: j.poster?.last_name,
            member_email: j.poster?.email,
            poster: undefined
        }));
        return res.json(result);
    } catch (error: any) {
        console.error('getAdminJobs Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

export const createJob = async (req: Request, res: Response) => {
    try {
        const { title, company, location, category, type, description, company_profile, url, contact_email, status, expires_at, slug } = req.body;
        const cityId = (req as any).cityId || 1;

        let finalSlug = slug ? slugify(slug) : await generateUniqueSlug(prisma.jobs, title, cityId);

        const job = await prisma.jobs.create({
            data: {
                title, company, location, category, type, description, company_profile, url, contact_email,
                status: status || 'pending',
                expires_at: (expires_at && expires_at !== "") ? new Date(expires_at) : null,
                slug: finalSlug
            }
        });
        return res.json({ message: 'Job created', id: job.id, slug: finalSlug });
    } catch (error: any) {
        console.error('createJob Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/jobs
export const updateJob = async (req: Request, res: Response) => {
    try {
        const { id, title, company, location, category, type, description, company_profile, url, contact_email, status, expires_at, slug } = req.body;
        if (!id) return res.status(400).json({ message: 'id required' });
        
        await prisma.jobs.update({
            where: { id: Number(id) },
            data: {
                title, company, location, category, type, description, company_profile, url, contact_email, status,
                expires_at: (expires_at && expires_at !== "") ? new Date(expires_at) : null,
                slug: slug !== undefined ? slugify(slug) : undefined
            }
        });
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
        await prisma.jobs.delete({ where: { id } });
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
            const resource = await prisma.resources.findUnique({
                where: { id: Number(id) },
                include: { submitter: true }
            });
            if (!resource) return res.status(404).json({ message: 'Resource not found' });
            
            // Format to match expected output (m.first_name, etc.)
            const result = {
                ...resource,
                first_name: resource.submitter?.first_name,
                last_name: resource.submitter?.last_name,
                member_email: resource.submitter?.email,
                submitter: undefined
            };
            return res.json(result);
        }
        const status = req.query.status as string || 'all';
        const resources = await prisma.resources.findMany({
            where: status !== 'all' ? { status } : {},
            include: { submitter: true },
            orderBy: { created_at: 'desc' }
        });
        
        const result = resources.map((r: any) => ({
            ...r,
            first_name: r.submitter?.first_name,
            last_name: r.submitter?.last_name,
            member_email: r.submitter?.email,
            submitter: undefined
        }));
        return res.json(result);
    } catch (error: any) {
        console.error('getAdminResources Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

export const createResource = async (req: Request, res: Response) => {
    try {
        const { title, category, author, url, description, status } = req.body;
        const resource = await prisma.resources.create({
            data: {
                title, category, author, url, description,
                status: status || 'pending'
            }
        });
        return res.json({ message: 'Resource created', id: resource.id });
    } catch (error: any) {
        console.error('createResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/resources
export const updateResource = async (req: Request, res: Response) => {
    try {
        const { id, title, category, author, url, description, status } = req.body;
        if (!id) return res.status(400).json({ message: 'id required' });
        
        await prisma.resources.update({
            where: { id: Number(id) },
            data: {
                title: title !== undefined ? title : undefined,
                category: category !== undefined ? category : undefined,
                author: author !== undefined ? author : undefined,
                url: url !== undefined ? url : undefined,
                description: description !== undefined ? description : undefined,
                status: status !== undefined ? status : undefined
            }
        });
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
        await prisma.resources.delete({ where: { id } });
        return res.json({ message: 'Resource deleted' });
    } catch (error: any) {
        console.error('deleteResource Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
// ---- NEWS / POSTS ----

export const getAdminPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include: { user: true },
            orderBy: { created_at: 'desc' }
        });
        
        const result = posts.map((p: any) => ({
            ...p,
            full_name: p.user ? `${p.user.first_name} ${p.user.last_name}` : 'Unknown',
            member_email: p.user?.email,
            user: undefined
        }));
        return res.json(result);
    } catch (error: any) {
        console.error('getAdminPosts Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const id = Number(req.query.id);
        if (!id) return res.status(400).json({ message: 'id required' });
        await prisma.post.delete({ where: { id } });
        return res.json({ message: 'Post deleted' });
    } catch (error: any) {
        console.error('deletePost Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
