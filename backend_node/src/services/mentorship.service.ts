import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class MentorshipService {
    // --- MENTOR PROFILE ---
    static async getMentorProfile(userId: number) {
        const profile = await prisma.mentorProfile.findUnique({
            where: { member_id: userId },
            include: { member: { select: { first_name: true, last_name: true, profile_photo: true, is_mentor: true } } }
        });

        if (!profile) {
            const member = await prisma.member.findUnique({
                where: { id: userId },
                select: { is_mentor: true }
            });
            return {
                is_mentor: member?.is_mentor || false,
                noProfile: true
            };
        }

        return {
            ...profile,
            is_mentor: (profile.member as any).is_mentor || false
        };
    }

    static async updateMentorProfile(userId: number, data: any, paymentQrImage?: string) {
        const defaultSessionPrice = data.default_session_price ? Number(data.default_session_price) : null;
        let expertise = [];
        if (data.expertise) {
            try {
                expertise = typeof data.expertise === 'string' ? JSON.parse(data.expertise) : data.expertise;
            } catch (e) {
                expertise = typeof data.expertise === 'string' ? data.expertise.split(',').map((s: string) => s.trim()) : [];
            }
        }
        const capacity = data.capacity ? Number(data.capacity) : 1;

        const updateData: any = {
            bio: data.bio,
            capacity: capacity,
            expertise: expertise,
            default_session_price: defaultSessionPrice
        };
        if (paymentQrImage) {
            updateData.payment_qr_image = paymentQrImage;
        }

        const createData: any = {
            member_id: userId,
            bio: data.bio,
            capacity: capacity,
            expertise: expertise,
            default_session_price: defaultSessionPrice,
            is_approved: false
        };
        if (paymentQrImage) {
            createData.payment_qr_image = paymentQrImage;
        }

        return prisma.mentorProfile.upsert({
            where: { member_id: userId },
            update: updateData,
            create: createData
        });
    }

    // --- RELATIONSHIPS ---
    static async requestMentorship(menteeId: number, data: any) {
        return prisma.mentorshipRelation.create({
            data: {
                mentor_id: Number(data.mentor_id),
                mentee_id: menteeId,
                type: data.type,
                focus_area: data.focus_area,
                status: 'Requested',
                current_phase: 'Foundations'
            }
        });
    }

    static async getMyMentorships(userId: number) {
        return prisma.mentorshipRelation.findMany({
            where: {
                OR: [
                    { mentor_id: userId },
                    { mentee_id: userId }
                ]
            },
            include: {
                mentor: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true }
                },
                mentee: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getById(id: string) {
        const relation = await prisma.mentorshipRelation.findUnique({
            where: { id },
            include: {
                mentor: { 
                    select: { 
                        id: true, 
                        first_name: true, 
                        last_name: true, 
                        profile_photo: true,
                        mentorProfile: true
                    } 
                },
                mentee: { select: { id: true, first_name: true, last_name: true, profile_photo: true } },
                goals: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        completed_by: {
                            select: { id: true, first_name: true, last_name: true }
                        }
                    }
                },
                sessions: { orderBy: { session_date: 'desc' } },
                tasks: { orderBy: { created_at: 'desc' } },
                materials: { orderBy: { created_at: 'desc' } }
            }
        });
        if (!relation) throw new AppError('Mentorship relation not found', 404);
        return relation;
    }

    // --- WORKSPACE: GOALS ---
    static async addGoal(relationId: string, data: any) {
        return prisma.mentorshipGoal.create({
            data: {
                relation_id: relationId,
                title: data.title,
                description: data.description,
                status: 'Pending',
                target_date: data.target_date ? new Date(data.target_date) : null
            }
        });
    }

    static async updateGoal(goalId: string, data: any, updaterId: number) {
        const existing = await prisma.mentorshipGoal.findUnique({
            where: { id: goalId }
        });

        let completed_at = existing?.completed_at;
        let completed_by_id = existing?.completed_by_id;

        if (data.status !== undefined) {
            if (data.status === 'Completed') {
                if (existing?.status !== 'Completed') {
                    completed_at = new Date();
                    completed_by_id = updaterId;
                }
            } else {
                completed_at = null;
                completed_by_id = null;
            }
        }

        return prisma.mentorshipGoal.update({
            where: { id: goalId },
            data: {
                title: data.title,
                description: data.description,
                status: data.status,
                target_date: data.target_date ? new Date(data.target_date) : undefined,
                completed_at,
                completed_by_id
            },
            include: {
                completed_by: {
                    select: { id: true, first_name: true, last_name: true }
                }
            }
        });
    }

    // --- WORKSPACE: SESSIONS ---
    static async logSession(relationId: string, data: any) {
        const isPaid = data.is_paid === true || data.is_paid === 'true';
        return prisma.mentorshipSession.create({
            data: {
                relation_id: relationId,
                session_date: data.session_date ? new Date(data.session_date) : new Date(),
                mentor_notes: data.mentor_notes,
                shared_notes: data.shared_notes,
                next_steps: data.next_steps,
                is_paid: isPaid,
                price: data.price ? Number(data.price) : null,
                payment_status: isPaid ? 'Unpaid' : 'Free',
                payment_qr_image: data.payment_qr_image || null
            }
        });
    }

    // --- WORKSPACE: TASKS ---
    static async addTask(relationId: string, data: any) {
        return prisma.mentorshipTask.create({
            data: {
                relation_id: relationId,
                goal_id: data.goal_id,
                title: data.title,
                assigned_to: data.assigned_to,
                status: 'To_Do',
                due_date: data.due_date ? new Date(data.due_date) : null
            }
        });
    }

    static async updateTask(taskId: string, data: any) {
        return prisma.mentorshipTask.update({
            where: { id: taskId },
            data: {
                title: data.title,
                status: data.status,
                due_date: data.due_date ? new Date(data.due_date) : undefined
            }
        });
    }

    // --- STATUS & PHASES ---
    static async updatePhase(id: string, phase: string) {
        return prisma.mentorshipRelation.update({
            where: { id },
            data: { current_phase: phase }
        });
    }

    static async updateStatus(id: string, status: string) {
        const data: any = { status };
        if (status === 'Active') data.started_at = new Date();
        if (status === 'Completed') data.ended_at = new Date();

        return prisma.mentorshipRelation.update({
            where: { id },
            data
        });
    }

    // --- ADMIN ---
    static async getAdminMentorships() {
        return prisma.mentorshipRelation.findMany({
            include: {
                mentor: true,
                mentee: true,
                _count: {
                    select: { sessions: true, goals: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getAdminMentorProfiles() {
        return prisma.mentorProfile.findMany({
            include: {
                member: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true, email: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async toggleMentorApproval(userId: number, isApproved: boolean) {
        return prisma.mentorProfile.update({
            where: { member_id: userId },
            data: { is_approved: isApproved }
        });
    }

    static async getMentorshipRequests() {
        // Find form responses for 'mentorship-mentee-assessment'
        const form = await prisma.forms.findUnique({ 
            where: { code: 'mentorship-mentee-assessment' },
            include: { fields: true }
        });

        if (!form) {
            console.log("[MENTORSHIP] Form not found: mentorship-mentee-assessment");
            return [];
        }

        const responses = await prisma.formResponse.findMany({
            where: { 
                form_id: form.id,
                status: { in: ['completed', 'draft'] }
            },
            include: {
                user: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true, email: true }
                },
                answers: true
            },
            orderBy: { submitted_at: 'desc' }
        });

        // Map field labels to answers for easier display
        const fieldMap = new Map(form.fields.map(f => [f.field_key, f.label]));
        
        const responsesWithLabels = responses.map(r => ({
            ...r,
            answers: r.answers.map(a => ({
                ...a,
                field_label: fieldMap.get(a.field_key) || a.field_key
            }))
        }));

        console.log(`[MENTORSHIP] Found ${responses.length} responses for form ${form.id}`);

        // Filter out those that already have an active mentorship relation
        const activeMenteeIds = (await prisma.mentorshipRelation.findMany({
            where: { status: { in: ['Requested', 'Active'] } },
            select: { mentee_id: true }
        })).map(r => r.mentee_id);

        const filtered = responses.filter(r => r.user_id && !activeMenteeIds.includes(r.user_id));
        
        // Final mapping to include form fields for each request
        const finalResults = filtered.map(r => ({
            ...r,
            form_fields: form.fields, // Include current form fields definition
            answers: r.answers.map(a => {
                const field = form.fields.find(f => f.field_key === a.field_key);
                return {
                    ...a,
                    field_label: field?.label || a.field_key
                };
            })
        }));

        console.log(`[MENTORSHIP] Final filtered requests: ${finalResults.length}`);
        return finalResults;
    }

    static async getApprovedMentors() {
        return prisma.member.findMany({
            where: {
                mentorProfile: {
                    is_approved: true
                }
            },
            include: {
                mentorProfile: true
            }
        });
    }

    static async adminMatchMentorMentee(data: { mentee_id: number, mentor_id: number, focus_area: string, type: string }) {
        return prisma.mentorshipRelation.create({
            data: {
                mentee_id: data.mentee_id,
                mentor_id: data.mentor_id,
                focus_area: data.focus_area,
                type: data.type,
                status: 'Active',
                started_at: new Date(),
                current_phase: 'Foundations'
            }
        });
    }

    // --- WORKSPACE: SESSIONS (UPDATES & DELETES) ---
    static async updateSession(sessionId: string, data: any, userId: number) {
        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: { relation: true }
        });
        if (!session) throw new AppError('Session not found', 404);

        const isMentor = session.relation.mentor_id === userId;
        const isMentee = session.relation.mentee_id === userId;

        if (!isMentor && !isMentee) {
            throw new AppError('Unauthorized to update this session', 403);
        }

        // Toggling status can be done by both mentor and mentee
        if (data.status !== undefined && Object.keys(data).length === 1) {
            return prisma.mentorshipSession.update({
                where: { id: sessionId },
                data: { status: data.status }
            });
        }

        // Other updates can only be done by the mentor
        if (!isMentor) {
            throw new AppError('Only the mentor can edit session details', 403);
        }

        // Cannot edit if already completed
        if (session.status === 'Completed') {
            throw new AppError('Cannot edit a completed session', 400);
        }

        // Determine updated payment status
        let paymentStatus = data.payment_status;
        if (data.is_paid !== undefined) {
            const isPaid = data.is_paid === true || data.is_paid === 'true';
            if (isPaid) {
                if (session.payment_status === 'Free' || !paymentStatus) {
                    paymentStatus = 'Unpaid';
                }
            } else {
                paymentStatus = 'Free';
            }
        }

        return prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                session_date: data.session_date ? new Date(data.session_date) : undefined,
                shared_notes: data.shared_notes,
                next_steps: data.next_steps,
                is_paid: data.is_paid !== undefined ? (data.is_paid === true || data.is_paid === 'true') : undefined,
                price: data.price !== undefined ? (data.price !== null && data.price !== '' ? Number(data.price) : null) : undefined,
                payment_status: paymentStatus,
                status: data.status,
                payment_qr_image: data.payment_qr_image !== undefined ? data.payment_qr_image : undefined
            }
        });
    }

    static async deleteSession(sessionId: string, userId: number) {
        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: { relation: true }
        });
        if (!session) throw new AppError('Session not found', 404);

        if (session.relation.mentor_id !== userId) {
            throw new AppError('Only the mentor can delete sessions', 403);
        }

        if (session.status === 'Completed') {
            throw new AppError('Cannot delete a completed session', 400);
        }

        return prisma.mentorshipSession.delete({
            where: { id: sessionId }
        });
    }

    // --- WORKSPACE: GOALS (DELETES) ---
    static async deleteGoal(goalId: string, userId: number) {
        const goal = await prisma.mentorshipGoal.findUnique({
            where: { id: goalId },
            include: { relation: true }
        });
        if (!goal) throw new AppError('Goal not found', 404);

        if (goal.relation.mentor_id !== userId) {
            throw new AppError('Only the mentor can delete goals', 403);
        }

        if (goal.status === 'Completed') {
            throw new AppError('Cannot delete a completed goal', 400);
        }

        return prisma.mentorshipGoal.delete({
            where: { id: goalId }
        });
    }

    // --- WORKSPACE: MATERIALS (ADD, RESPONSE, DELETE) ---
    static async addMaterial(relationId: string, data: any, fileUrl?: string) {
        return prisma.mentorshipMaterial.create({
            data: {
                relation_id: relationId,
                title: data.title,
                description: data.description,
                link_url: data.link_url || null,
                file_url: fileUrl || null,
                status: 'Shared'
            }
        });
    }

    static async submitMaterialResponse(materialId: string, responseText: string, responseFileUrl?: string) {
        return prisma.mentorshipMaterial.update({
            where: { id: materialId },
            data: {
                response_text: responseText,
                response_file: responseFileUrl || null,
                status: 'Responded'
            }
        });
    }

    static async deleteMaterial(materialId: string, userId: number) {
        const material = await prisma.mentorshipMaterial.findUnique({
            where: { id: materialId },
            include: { relation: true }
        });
        if (!material) throw new AppError('Material not found', 404);

        if (material.relation.mentor_id !== userId) {
            throw new AppError('Only the mentor can delete materials', 403);
        }

        return prisma.mentorshipMaterial.delete({
            where: { id: materialId }
        });
    }

    // --- WORKSPACE: SESSION PAYMENTS ---
    static async submitSessionPayment(sessionId: string, paymentNote: string, userId: number) {
        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: { relation: true }
        });
        if (!session) throw new AppError('Session not found', 404);

        if (session.relation.mentee_id !== userId) {
            throw new AppError('Only the mentee can submit payment proof', 403);
        }

        if (session.payment_status === 'Paid') {
            throw new AppError('Session is already paid', 400);
        }

        return prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                payment_status: 'Verifying',
                payment_note: paymentNote
            }
        });
    }

    static async verifySessionPayment(sessionId: string, userId: number) {
        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: { relation: true }
        });
        if (!session) throw new AppError('Session not found', 404);

        if (session.relation.mentor_id !== userId) {
            throw new AppError('Only the mentor can verify payment', 403);
        }

        return prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                payment_status: 'Paid'
            }
        });
    }
}

