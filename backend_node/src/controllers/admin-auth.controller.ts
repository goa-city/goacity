import type { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../services/admin-auth.service.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminAuthService.login(email, password);
        
        const token = generateToken(
            { id: admin.id, role: admin.role, type: 'admin', isSuperAdmin: admin.is_super_admin },
            '24h'
        );

        res.json({ token, user: admin });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = (req as any).userId;
        const admin = await AdminAuthService.getAdminById(adminId);
        res.json(admin);
    } catch (error) {
        next(error);
    }
};

export const superAdminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminAuthService.login(email, password);
        
        if (!admin.is_super_admin) {
            return res.status(403).json({ message: 'Access denied. Not a super admin.' });
        }

        const token = generateToken(
            { id: admin.id, role: admin.role, type: 'superadmin', isSuperAdmin: true },
            '24h'
        );

        res.json({ token, user: admin });
    } catch (error) {
        next(error);
    }
};
