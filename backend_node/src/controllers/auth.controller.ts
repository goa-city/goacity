import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identifier } = req.body;
        const result = await AuthService.sendOtp(identifier);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identifier, otp, rememberMe } = req.body;
        const result = await AuthService.verifyOtp(identifier, otp, rememberMe);
        return res.json({
            success: true,
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.adminLogin(email, password);
        return res.json({
            success: true,
            message: 'Admin login successful',
            ...result
        });
    } catch (error) {
        next(error);
    }
};
