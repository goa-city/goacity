import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AnalyticsService } from '../services/analytics.service.js';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identifier } = req.body;
        const result = await AuthService.sendOtp(identifier);
        
        AnalyticsService.logAuthEvent({
            identifier,
            event: 'OTP_SENT',
            channel: identifier.includes('@') ? 'EMAIL' : 'WHATSAPP',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });

        return res.json(result);
    } catch (error: any) {
        AnalyticsService.logAuthEvent({
            identifier: req.body?.identifier,
            event: 'LOGIN_FAILED',
            channel: req.body?.identifier?.includes('@') ? 'EMAIL' : 'WHATSAPP',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });
        next(error);
    }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identifier, otp, rememberMe } = req.body;
        const result = await AuthService.verifyOtp(identifier, otp, rememberMe);

        AnalyticsService.logAuthEvent({
            memberId: result.user?.id,
            identifier,
            event: 'LOGIN_SUCCESS',
            channel: identifier.includes('@') ? 'EMAIL' : 'WHATSAPP',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });

        return res.json({
            success: true,
            message: 'Login successful',
            ...result
        });
    } catch (error: any) {
        AnalyticsService.logAuthEvent({
            identifier: req.body?.identifier,
            event: 'LOGIN_FAILED',
            channel: req.body?.identifier?.includes('@') ? 'EMAIL' : 'WHATSAPP',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });
        next(error);
    }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.adminLogin(email, password);

        AnalyticsService.logAuthEvent({
            adminId: result.user?.id,
            identifier: email,
            event: 'LOGIN_SUCCESS',
            channel: 'PASSWORD',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });

        return res.json({
            success: true,
            message: 'Admin login successful',
            ...result
        });
    } catch (error: any) {
        AnalyticsService.logAuthEvent({
            identifier: req.body?.email,
            event: 'LOGIN_FAILED',
            channel: 'PASSWORD',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });
        next(error);
    }
};

export const tokenLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = (req.body && req.body.token) || (req.query && req.query.token as string);
        const result = await AuthService.tokenLogin(token);

        AnalyticsService.logAuthEvent({
            memberId: result.user?.id,
            identifier: result.user?.email || result.user?.phone,
            event: 'TOKEN_LOGIN',
            channel: 'TOKEN',
            ipAddress: AnalyticsService.getClientIp(req),
            userAgent: req.headers['user-agent'],
            cityId: (req as any).cityId || 1
        });

        return res.json({
            success: true,
            message: 'Auto-login successful',
            ...result
        });
    } catch (error: any) {
        next(error);
    }
};
