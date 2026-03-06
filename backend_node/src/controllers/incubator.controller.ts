import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==== Member Routes ====

// POST /api/incubator
export const submitIdea = async (req: Request, res: Response) => {
    try {
        const { title, problem_statement, vision_purpose, needs_json, is_aligned } = req.body;
        const founder_id = (req as any).userId;

        if (!title || !problem_statement || !vision_purpose || !is_aligned) {
            return res.status(400).json({ success: false, message: 'All required fields missing.' });
        }

        const idea = await (prisma as any).incubatorIdea.create({
            data: {
                founder_id: parseInt(founder_id),
                title,
                problem_statement,
                vision_purpose,
                needs_json: needs_json || [], 
                status: 'Submitted'
            }
        });

        res.json({ success: true, data: idea });
    } catch (error) {
        console.error('submitIdea error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit idea.' });
    }
};

// GET /api/incubator (Idea Lab Feed)
export const getActiveIdeas = async (req: Request, res: Response) => {
    try {
        const ideas = await (prisma as any).incubatorIdea.findMany({
            where: {
                status: {
                    in: ['Submitted', 'Validated', 'Under_Review']
                }
            },
            include: {
                founder: { select: { id: true, first_name: true, last_name: true, profile_photo: true } },
                feedbacks: {
                    include: {
                        contributor: { select: { id: true, first_name: true, last_name: true } }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, data: ideas });
    } catch (error) {
        console.error('getActiveIdeas error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch ideas.' });
    }
};

// POST /api/incubator/:id/feedback
export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { comment, type } = req.body;
        const idea_id = req.params.id as string;
        const contributor_id = (req as any).userId;

        if (!comment || !type) {
             return res.status(400).json({ success: false, message: 'Comment and type required.' });
        }

        const feedback = await (prisma as any).ideaFeedback.create({
            data: {
                idea_id,
                contributor_id: parseInt(contributor_id),
                comment,
                type
            }
        });

        res.json({ success: true, data: feedback });
    } catch (error) {
        console.error('submitFeedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
    }
};

// ==== Admin Routes ====

// GET /api/admin/incubator
export const getAdminIdeas = async (req: Request, res: Response) => {
    try {
        const ideas = await (prisma as any).incubatorIdea.findMany({
            include: {
                founder: { select: { id: true, first_name: true, last_name: true, email: true } },
                _count: {
                    select: { feedbacks: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, data: ideas });
    } catch (error) {
        console.error('getAdminIdeas error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin ideas.' });
    }
};

// PUT /api/admin/incubator/:id/status
export const updateIdeaStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const idea_id = req.params.id as string;

        const updated = await (prisma as any).incubatorIdea.update({
            where: { id: idea_id },
            data: { status }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('updateIdeaStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update idea status.' });
    }
};

// GET /api/admin/incubator/:id/matches
export const getIdeaMatches = async (req: Request, res: Response) => {
    try {
        const idea_id = req.params.id as string;
        const idea = await (prisma as any).incubatorIdea.findUnique({
             where: { id: idea_id }
        });

        if (!idea) {
             return res.status(404).json({ success: false, message: 'Idea not found.' });
        }

        // Extremely simplified "Smart Match" — realistically, we'd query member profiles where mentoring areas match the idea's needs_json.
        // For demonstration purposes or quick v1, we just return willing Mentors.
        const mentors = await prisma.member.findMany({
             where: {
                  // If you had a DB-level willing_to_mentor field: willing_to_mentor: true.
                  // Default mock logic if it doesn't exist explicitly in Prisma Members yet:
                  role: { in: ['mentor', 'admin', 'member'] } // Change matching criteria here based on member model
             },
             select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  role: true
             },
             take: 5
        });

        res.json({ success: true, data: mentors });
    } catch (error) {
        console.error('getIdeaMatches error:', error);
        res.status(500).json({ success: false, message: 'Failed to find matches.' });
    }
};
