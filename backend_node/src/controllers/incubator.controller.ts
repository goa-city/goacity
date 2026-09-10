import type { Request, Response, NextFunction } from 'express';
import { IncubatorService } from '../services/incubator.service.js';

export const submitIdea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await IncubatorService.submitIdea(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getActiveIdeas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await IncubatorService.getActiveIdeas();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const result = await IncubatorService.submitFeedback(userId, id as string, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAdminIdeas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await IncubatorService.getAdminIdeas();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getIdeaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await IncubatorService.getIdeaById(id as string);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Venture idea not found.' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateIdeaStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await IncubatorService.updateStatus(id as string, status);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getIdeaMatches = async (req: Request, res: Response, next: NextFunction) => {
    // Logic for matching skills/needs - to be refactored into service
    res.json([]);
};

export const deleteIdea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await IncubatorService.deleteIdea(id as string);
        res.json({ success: true, message: 'Venture idea deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
