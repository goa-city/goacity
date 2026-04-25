import type { Request, Response, NextFunction } from 'express';
import { MeetingService } from '../services/meeting.service.js';

export const getUpcomingMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MeetingService.getUpcomingMeetings();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getPastMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MeetingService.getPastMeetings();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMeetingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MeetingService.getById(Number(id));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const rsvpMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { status } = req.body;
        const result = await MeetingService.rsvp(userId, Number(id), status);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
