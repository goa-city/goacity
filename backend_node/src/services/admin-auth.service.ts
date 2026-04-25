import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';

export class AdminAuthService {
    static async login(email: string, password_raw: string) {
        console.log(`[AUTH] Admin login attempt for: ${email}`);
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            console.log(`[AUTH] Admin not found: ${email}`);
            throw new AppError('Invalid admin credentials', 401);
        }

        console.log(`[AUTH] Admin found. Role: ${admin.role}. Checking password...`);

        // Handle both legacy (PHP) and modern bcrypt hashes
        let hash = admin.password_hash;
        console.log(`[AUTH] Comparing password for ${email}. Hash starts with: ${hash.substring(0, 10)}...`);
        
        if (hash.startsWith('$2y$')) {
            console.log(`[AUTH] Legacy PHP hash detected for ${email}`);
            hash = '$2a$' + hash.substring(4);
            console.log(`[AUTH] Converted hash starts with: ${hash.substring(0, 10)}...`);
        }

        const isValid = await bcrypt.compare(password_raw, hash);
        if (!isValid) {
            console.log(`[AUTH] Password mismatch for ${email}`);
            throw new AppError('Invalid admin credentials', 401);
        }

        console.log(`[AUTH] Login successful for ${email}`);

        // Return user data (token generation handled by middleware/controller)
        return {
            id: admin.id,
            full_name: admin.full_name,
            email: admin.email,
            role: admin.role,
            is_super_admin: admin.is_super_admin
        };
    }

    static async getAdminById(id: number) {
        const admin = await prisma.admin.findUnique({
            where: { id },
            select: { id: true, full_name: true, email: true, role: true }
        });
        if (!admin) throw new AppError('Admin not found', 404);
        return admin;
    }
}
