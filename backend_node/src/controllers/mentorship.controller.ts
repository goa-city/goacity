import type { Request, Response, NextFunction } from 'express';
import { MentorshipService } from '../services/mentorship.service.js';

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

export const updateMentorshipGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { goals } = req.body;
        const result = await MentorshipService.updateGoals(id as string, goals);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAdminMentorships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MentorshipService.getAdminMentorships();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateMentorshipStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await MentorshipService.updateStatus(id as string, status);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const exportMentorshipReport = async (req: Request, res: Response, next: NextFunction) => {
    // Logic for report export
    res.json({ message: 'Export logic to be implemented' });
};
