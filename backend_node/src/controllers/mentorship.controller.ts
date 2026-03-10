import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// ==== Member Routes ====

// POST /api/mentorship/request
export const requestMentorship = async (req: Request, res: Response) => {
    try {
        const { mentor_id, type, focus_area, goals } = req.body;
        const mentee_id = (req as any).user.userId;

        if (!mentor_id || !type) {
            return res.status(400).json({ success: false, message: 'Mentor ID and duration type are required.' });
        }

        const relation = await prisma.mentorshipRelation.create({
            data: {
                mentor_id: parseInt(mentor_id),
                mentee_id: parseInt(mentee_id),
                type,
                focus_area,
                goals_json: goals || [], // Expecting array of objects like {text: "Goal", completed: false}
                status: 'Requested'
            }
        });

        // Normally we might trigger a notification here

        res.json({ success: true, data: relation });
    } catch (error) {
        console.error('requestMentorship error:', error);
        res.status(500).json({ success: false, message: 'Failed to request mentorship.' });
    }
};

// GET /api/mentorship
export const getMyMentorships = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const relations = await prisma.mentorshipRelation.findMany({
            where: {
                OR: [
                    { mentor_id: userId },
                    { mentee_id: userId }
                ]
            },
            include: {
                mentor: { select: { id: true, first_name: true, last_name: true, profile_photo: true } },
                mentee: { select: { id: true, first_name: true, last_name: true, profile_photo: true } }
            }
        });

        res.json({ success: true, data: relations });
    } catch (error) {
        console.error('getMyMentorships error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mentorships.' });
    }
};

// GET /api/mentorship/:id
export const getMentorshipById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const relationId = req.params.id as string;

        const relation = await prisma.mentorshipRelation.findUnique({
            where: { id: relationId },
            include: {
                mentor: { select: { id: true, first_name: true, last_name: true, profile_photo: true, phone: true, email: true } },
                mentee: { select: { id: true, first_name: true, last_name: true, profile_photo: true, phone: true, email: true } }
            }
        });

        if (!relation) {
            return res.status(404).json({ success: false, message: 'Not found.' });
        }

        // Verify access - user must be either mentor or mentee or admin
        if (relation.mentor_id !== userId && relation.mentee_id !== userId && (req as any).user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        res.json({ success: true, data: relation });
    } catch (error) {
        console.error('getMentorshipById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mentorship details.' });
    }
};

// PUT /api/mentorship/:id/goals
export const updateMentorshipGoals = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const relationId = req.params.id as string;
        const { goals_json } = req.body;

        const relation = await prisma.mentorshipRelation.findUnique({ where: { id: relationId } });
        if (!relation || (relation.mentor_id !== userId && relation.mentee_id !== userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        const updated = await prisma.mentorshipRelation.update({
            where: { id: relationId },
            data: { goals_json }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('updateMentorshipGoals error:', error);
        res.status(500).json({ success: false, message: 'Failed to update goals.' });
    }
};

// ==== Admin Routes ====

// GET /api/admin/mentorship
export const getAdminMentorships = async (req: Request, res: Response) => {
    try {
        const relations = await prisma.mentorshipRelation.findMany({
            include: {
                mentor: { select: { id: true, first_name: true, last_name: true } },
                mentee: { select: { id: true, first_name: true, last_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // calculate completion % to send to frontend
        const enriched = relations.map(r => {
            const goals: any[] = Array.isArray(r.goals_json) ? r.goals_json : [];
            const completedCount = goals.filter(g => g.completed).length;
            const pct = goals.length ? Math.round((completedCount / goals.length) * 100) : 0;
            return {
                ...r,
                completion_percentage: pct
            };
        });

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error('getAdminMentorships error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin mentorships.' });
    }
};

// PUT /api/admin/mentorship/:id/status
export const updateMentorshipStatus = async (req: Request, res: Response) => {
    try {
        const relationId = req.params.id as string;
        const { status } = req.body;

        const updated = await prisma.mentorshipRelation.update({
            where: { id: relationId },
            data: { status }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('updateMentorshipStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update mentorship status.' });
    }
};

// GET /api/admin/mentorship/export
export const exportMentorshipReport = async (req: Request, res: Response) => {
    try {
        const relations = await prisma.mentorshipRelation.findMany({
            include: {
                mentor: { select: { first_name: true, last_name: true } },
                mentee: { select: { first_name: true, last_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        const csvRows = ['ID,Mentor,Mentee,Type,Focus Area,Status,Completed Goals,Total Goals,Created At'];
        
        relations.forEach(r => {
            const goals: any[] = Array.isArray(r.goals_json) ? r.goals_json : [];
            const completedCount = goals.filter(g => g.completed).length;
            const totalGoals = goals.length;
            
            const mentorName = `${r.mentor?.first_name || ''} ${r.mentor?.last_name || ''}`;
            const menteeName = `${r.mentee?.first_name || ''} ${r.mentee?.last_name || ''}`;

            csvRows.push([
                r.id,
                `"${mentorName.trim()}"`,
                `"${menteeName.trim()}"`,
                r.type,
                `"${r.focus_area || ''}"`,
                r.status,
                completedCount,
                totalGoals,
                r.created_at
            ].join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="mentorship_report.csv"');
        res.send(csvRows.join('\n'));
    } catch (error) {
        console.error('exportMentorshipReport error:', error);
        res.status(500).json({ success: false, message: 'Failed to export.' });
    }
};
