import type { Request, Response, NextFunction } from 'express';
import { StewardshipService } from '../services/stewardship.service.js';

export const getStewardshipSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await StewardshipService.getSummary(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMemberLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await StewardshipService.getMemberLogs(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const createStewardshipLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await StewardshipService.createLog(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAllLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StewardshipService.getAllPendingLogs();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const approveLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).userId;
        const result = await StewardshipService.verifyLog(Number(id), adminId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getVerifiedOrgs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StewardshipService.getVerifiedOrgs();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getMemberDirectory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StewardshipService.getMemberDirectory();
        res.json(result);
    } catch (error) {
        next(error);
    }
};
