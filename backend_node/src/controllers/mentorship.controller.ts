import type { Request, Response, NextFunction } from 'express';
import { MentorshipService } from '../services/mentorship.service.js';
import { AssessmentService } from '../services/assessment.service.js';
import { processImageToWebp } from '../utils/image.js';
import prisma from '../lib/prisma.js';
import { whatsapp } from '../services/whatsapp.service.js';
import { sendEmail } from '../utils/email.js';

// --- MENTOR PROFILE ---
export const getMentorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MentorshipService.getMentorProfile(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateMentorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const file = req.file;
        const fileUrl = file ? await processImageToWebp(file) : undefined;
        const result = await MentorshipService.updateMentorProfile(userId, req.body, fileUrl);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- RECOMMENDATIONS ---
export const getMenteeRecommendations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { response_id } = req.query;
        const result = await AssessmentService.processMenteeAssessment(userId, Number(response_id));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// --- RELATIONSHIPS ---
export const requestMentorship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MentorshipService.requestMentorship(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getMyMentorships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MentorshipService.getMyMentorships(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMentorshipById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MentorshipService.getById(id as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// --- WORKSPACE: GOALS ---
export const addMentorshipGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MentorshipService.addGoal(id as string, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { goalId } = req.params;
        const userId = (req as any).userId;
        const result = await MentorshipService.updateGoal(goalId as string, req.body, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- WORKSPACE: SESSIONS ---
export const logMentorshipSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const fileUrl = file ? await processImageToWebp(file) : undefined;
        const sessionData = {
            ...req.body,
            payment_qr_image: fileUrl !== undefined ? fileUrl : req.body.payment_qr_image
        };
        const result = await MentorshipService.logSession(id as string, sessionData);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- WORKSPACE: TASKS ---
export const addMentorshipTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MentorshipService.addTask(id as string, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;
        const result = await MentorshipService.updateTask(taskId as string, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- STATUS & PHASES ---
export const updateMentorshipPhase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { phase } = req.body;
        const result = await MentorshipService.updatePhase(id as string, phase);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, meeting_schedule, session_price, started_at, ended_at } = req.body;
        const file = req.file;
        const payment_qr_image = file ? file.filename : undefined;

        const details = {
            meeting_schedule,
            session_price: session_price !== undefined && session_price !== '' && session_price !== null ? Number(session_price) : undefined,
            payment_qr_image,
            started_at,
            ended_at
        };

        const result = await MentorshipService.updateStatus(id as string, status, details);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipMentor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { mentor_id } = req.body;
        const result = await MentorshipService.updateMentor(id as string, Number(mentor_id));
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const deleteMentorshipRelation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await MentorshipService.deleteRelation(id as string);
        res.json({ success: true, message: 'Mentorship relation deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { type, focus_area } = req.body;
        const result = await MentorshipService.updateDetails(id as string, { type, focus_area });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- ADMIN ---
export const getAdminMentorships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MentorshipService.getAdminMentorships();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAdminMentorProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MentorshipService.getAdminMentorProfiles();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const toggleMentorApproval = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { is_approved } = req.body;
        const result = await MentorshipService.toggleMentorApproval(Number(userId), is_approved);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const exportMentorshipReport = async (req: Request, res: Response, next: NextFunction) => {
    // Logic for report export
    res.json({ message: 'Export logic to be implemented' });
};

export const getAdminMentorshipRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query;
        const result = await MentorshipService.getMentorshipRequests(userId ? Number(userId) : undefined);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAdminMentorshipRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MentorshipService.getMentorshipRequestById(Number(id));
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAdminMentors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MentorshipService.getApprovedMentors();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const adminMatchMentorship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MentorshipService.adminMatchMentorMentee(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- SESSIONS: UPDATES & DELETES ---
export const updateMentorshipSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        const userId = (req as any).userId;
        const file = req.file;
        const fileUrl = file ? await processImageToWebp(file) : undefined;
        const sessionData = {
            ...req.body,
            payment_qr_image: fileUrl !== undefined ? fileUrl : req.body.payment_qr_image
        };
        const result = await MentorshipService.updateSession(sessionId as string, sessionData, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const deleteMentorshipSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        const userId = (req as any).userId;
        const result = await MentorshipService.deleteSession(sessionId as string, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- GOALS: DELETES ---
export const deleteMentorshipGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { goalId } = req.params;
        const userId = (req as any).userId;
        const result = await MentorshipService.deleteGoal(goalId as string, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// --- MATERIALS: OPERATIONS ---
export const addMentorshipMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Mentorship Relation ID
        const file = req.file;
        const fileUrl = file ? `/uploads/${file.filename}` : undefined;
        const result = await MentorshipService.addMaterial(id as string, req.body, fileUrl);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const submitMentorshipMaterialResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materialId } = req.params;
        const { response_text } = req.body;
        const file = req.file;
        const responseFileUrl = file ? `/uploads/${file.filename}` : undefined;
        const result = await MentorshipService.submitMaterialResponse(materialId as string, response_text, responseFileUrl);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const deleteMentorshipMaterial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { materialId } = req.params;
        const userId = (req as any).userId;
        const result = await MentorshipService.deleteMaterial(materialId as string, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const submitMentorshipSessionPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        const { payment_note } = req.body;
        const userId = (req as any).userId;
        const result = await MentorshipService.submitSessionPayment(sessionId as string, payment_note, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const verifyMentorshipSessionPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        const userId = (req as any).userId;
        const result = await MentorshipService.verifySessionPayment(sessionId as string, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const notifyMentorshipRelation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { type, templateId, recipients } = req.body;

        const relation: any = await prisma.mentorshipRelation.findUnique({
            where: { id: id as string },
            include: {
                mentor: true,
                mentee: true
            }
        });

        if (!relation) return res.status(404).json({ message: 'Mentorship relation not found' });

        const getReplacements = (recipient: any, mentor: any, mentee: any) => ({
            '{first_name}': recipient.first_name || 'Member',
            '{firstname}': recipient.first_name || 'Member',
            '{last_name}': recipient.last_name || '',
            '{lastname}': recipient.last_name || '',
            '{mentor_name}': `${mentor.first_name} ${mentor.last_name}`,
            '{mentor_first_name}': mentor.first_name || '',
            '{mentor_last_name}': mentor.last_name || '',
            '{mentee_name}': `${mentee.first_name} ${mentee.last_name}`,
            '{mentee_first_name}': mentee.first_name || '',
            '{mentee_last_name}': mentee.last_name || '',
            '{focus_area}': relation.focus_area || '',
            '{covenant_type}': relation.type || '',
            '{{first_name}}': recipient.first_name || 'Member',
            '{{last_name}}': recipient.last_name || '',
            '{{mentor_name}}': `${mentor.first_name} ${mentor.last_name}`,
            '{{mentee_name}}': `${mentee.first_name} ${mentee.last_name}`,
            '{{focus_area}}': relation.focus_area || '',
            '{{covenant_type}}': relation.type || ''
        });

        const applyReplacements = (text: string, replacements: any) => {
            let result = text;
            for (const key in replacements) {
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                result = result.replace(regex, replacements[key]);
            }
            return result;
        };

        if (type === 'email') {
            const template = await prisma.emailTemplate.findUnique({ where: { id: Number(templateId) } });
            if (!template) return res.status(404).json({ message: 'Email template not found' });

            const emailRecipients: any[] = [];
            if (recipients.includes('mentor') && relation.mentor?.email) {
                emailRecipients.push({ role: 'mentor', member: relation.mentor });
            }
            if (recipients.includes('mentee') && relation.mentee?.email) {
                emailRecipients.push({ role: 'mentee', member: relation.mentee });
            }

            Promise.all(emailRecipients.map(item => {
                const replacements = getReplacements(item.member, relation.mentor, relation.mentee);
                const personalizedHtml = applyReplacements(template.message, replacements);
                const personalizedSubject = applyReplacements(template.subject, replacements);

                return sendEmail(
                    item.member.email,
                    personalizedSubject,
                    personalizedHtml
                ).catch(err => console.error(`Email failed for ${item.member.email}:`, err));
            }));

            return res.json({ success: true, message: `Email notifications queued for ${emailRecipients.length} recipients` });
        } else if (type === 'whatsapp') {
            const template = await prisma.whatsAppTemplate.findUnique({ where: { id: Number(templateId) } });
            if (!template) return res.status(404).json({ message: 'WhatsApp template not found' });

            const whatsappRecipients: any[] = [];
            if (recipients.includes('mentor') && relation.mentor?.phone) {
                whatsappRecipients.push({ role: 'mentor', member: relation.mentor });
            }
            if (recipients.includes('mentee') && relation.mentee?.phone) {
                whatsappRecipients.push({ role: 'mentee', member: relation.mentee });
            }

            const bulkMessages = whatsappRecipients.map(item => {
                const replacements = getReplacements(item.member, relation.mentor, relation.mentee);
                const personalizedContent = applyReplacements(template.content, replacements);

                return {
                    to: item.member.phone,
                    content: personalizedContent,
                    memberId: item.member.id
                };
            });

            whatsapp.sendBulk(bulkMessages, `Mentorship Notify: ${relation.id}`).catch((err: any) => console.error('WhatsApp bulk notify failed:', err));

            return res.json({ success: true, message: `WhatsApp notifications queued for ${whatsappRecipients.length} recipients` });
        }

        return res.status(400).json({ message: 'Invalid notification type' });
    } catch (error) {
        next(error);
    }
};

export const getMemberMentorshipRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const response = await prisma.formResponse.findUnique({
            where: { id: Number(id) }
        });

        if (!response) {
            return res.status(404).json({ error: 'Mentorship request not found' });
        }

        let isAuthorized = response.user_id === userId;

        if (!isAuthorized) {
            const relation = await prisma.mentorshipRelation.findFirst({
                where: {
                    response_id: Number(id),
                    OR: [
                        { mentor_id: userId },
                        { mentee_id: userId }
                    ]
                }
            });
            if (relation) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Unauthorized to view this mentorship request' });
        }

        const result = await MentorshipService.getMentorshipRequestById(Number(id));
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

