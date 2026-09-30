import type { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

export const trackEvent = async (req: Request, res: Response) => {
    try {
        const { path, sessionId, entityType, entityId, referrer, deviceType, durationSeconds } = req.body;
        const userId = (req as any).userId ? Number((req as any).userId) : null;
        const userRole = (req as any).userRole;

        const memberId = userId && (userRole === 'member' || !userRole) ? userId : null;
        const adminId = userId && (userRole === 'admin' || (req as any).isAdmin || (req as any).isSuperAdmin) ? userId : null;
        const cityId = (req as any).cityId || 1;
        const ipAddress = AnalyticsService.getClientIp(req);

        AnalyticsService.queuePageView({
            memberId,
            adminId,
            cityId,
            sessionId,
            path,
            entityType,
            entityId,
            referrer,
            deviceType,
            durationSeconds,
            ipAddress
        });

        return res.status(200).json({ ok: true });
    } catch (error: any) {
        console.error('[AnalyticsController] Track event error:', error);
        return res.status(500).json({ message: 'Tracking failed' });
    }
};

export const getSuperAdminAnalytics = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
        const days = req.query.days ? Number(req.query.days) : 30;

        const data = await AnalyticsService.getOverview(cityId, days);
        return res.json(data);
    } catch (error: any) {
        console.error('[AnalyticsController] SuperAdmin Analytics error:', error);
        return res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

export const getSuperAdminPageDetails = async (req: Request, res: Response) => {
    try {
        const path = req.query.path as string;
        if (!path) {
            return res.status(400).json({ message: 'Path parameter is required' });
        }

        const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : 50;

        const data = await AnalyticsService.getPageDetails(path, cityId, limit);
        return res.json(data);
    } catch (error: any) {
        console.error('[AnalyticsController] SuperAdmin Page Details error:', error);
        return res.status(500).json({ message: 'Failed to fetch page details' });
    }
};

