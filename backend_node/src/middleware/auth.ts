import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requestContext } from '../lib/context.js';

const JWT_SECRET = process.env.JWT_SECRET || 'goa-city-secret-2026';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Ensure ID is a number
        (req as any).userId = Number(decoded.id);
        (req as any).userRole = decoded.role;

        // Sync with context
        const store = requestContext.getStore();
        if (store) {
           store.adminId = decoded.role === 'admin' ? Number(decoded.id) : undefined;
           store.memberId = decoded.role === 'member' ? Number(decoded.id) : undefined;
           // Super Admin logic: specific email or a 'super' flag in JWT
           store.isSuperAdmin = decoded.role === 'admin' && (decoded.email === 'admin@goa.city' || decoded.super === true);
        }

        // Security check: if accessing a /member/ route, ensure role is member
        if (req.path.includes('/member/') && decoded.role !== 'member') {
            console.warn(`[AUTH] Non-member role (${decoded.role}) attempting to access member route: ${req.path}`);
            return res.status(403).json({ message: 'Forbidden: Member access required' });
        }

        // Admin routes check
        if (req.path.includes('/admin/') && decoded.role !== 'admin') {
             return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next();
    } catch (error) {
        console.error('[AUTH] Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
