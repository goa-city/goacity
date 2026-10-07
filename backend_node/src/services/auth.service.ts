import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { whatsapp } from './whatsapp.service.js';

export class AuthService {
    static async sendOtp(identifier: string) {
        console.log(`[AUTH] Direct Login/OTP requested for: ${identifier}`);
        // 1. Check if member exists
        const isEmail = identifier.includes('@');
        const digits = identifier.replace(/\D/g, '');
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                    ...(isEmail ? [] : [
                        { phone: digits },
                        { phone: `+${digits}` },
                        ...(digits.length >= 10 ? [{ phone: { contains: digits.slice(-10) } }] : [])
                    ])
                ]
            },
            include: {
                city: true
            }
        });

        if (!member) {
            console.log(`[AUTH] Member not found for identifier: ${identifier}`);
            throw new AppError('No account found with this phone number or email. Please contact admin.', 404);
        }

        // Check for stream assignment
        const streamCount = await prisma.streamMember.count({
            where: { user_id: member.id }
        });
 
        if (streamCount === 0) {
            throw new AppError('Your registration is pending approval. You will be notified once you are assigned to a stream.', 403);
        }

        console.log(`[AUTH] Member found: ${member.first_name} ${member.last_name} (ID: ${member.id}). Direct login active.`);

        // Direct instant login without OTP
        const streamMembers = await prisma.streamMember.findMany({
            where: { user_id: member.id },
            include: { stream: true }
        });

        const streams = streamMembers.map((sm: any) => ({
            id: sm.stream.id,
            name: sm.stream.name,
            color: sm.stream.color
        }));

        const token = generateToken({ id: member.id, role: member.role }, '30d');

        const userData = {
            id: member.id,
            first_name: member.first_name,
            last_name: member.last_name,
            full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
            email: member.email,
            phone: member.phone,
            role: member.role,
            is_onboarded: member.is_onboarded,
            profile_photo: member.profile_photo,
            slug: member.slug,
            city_id: member.city_id,
            city: (member as any).city,
            streams
        };

        return {
            success: true,
            instantLogin: true,
            token,
            user: userData
        };
    }

    static async verifyOtp(identifier: string, otp: string, rememberMe: boolean = false) {
        // Direct verification fallback: find member and log in
        const isEmail = identifier.includes('@');
        const digits = identifier.replace(/\D/g, '');
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                    ...(isEmail ? [] : [
                        { phone: digits },
                        { phone: `+${digits}` },
                        ...(digits.length >= 10 ? [{ phone: { contains: digits.slice(-10) } }] : [])
                    ])
                ]
            },
            include: {
                city: true
            }
        });

        if (!member) {
            throw new AppError('Member not found. Please contact admin.', 404);
        }

        const streamMembers = await prisma.streamMember.findMany({
            where: { user_id: member.id },
            include: { stream: true }
        });

        const streams = streamMembers.map((sm: any) => ({
            id: sm.stream.id,
            name: sm.stream.name,
            color: sm.stream.color
        }));

        const token = generateToken({ id: member.id, role: member.role }, rememberMe ? '30d' : '7d');

        // Clean up any remaining OTPs
        await prisma.otp.deleteMany({
            where: {
                OR: [
                    { email_or_phone: identifier },
                    ...(member.email ? [{ email_or_phone: member.email }] : []),
                    ...(member.phone ? [{ email_or_phone: member.phone }] : [])
                ]
            }
        }).catch(() => {});

        return {
            token,
            user: {
                id: member.id,
                first_name: member.first_name,
                last_name: member.last_name,
                full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
                email: member.email,
                phone: member.phone,
                role: member.role,
                is_onboarded: member.is_onboarded,
                profile_photo: member.profile_photo,
                slug: member.slug,
                city_id: member.city_id,
                city: (member as any).city,
                streams
            }
        };
    }

    static async adminLogin(email: string, password: string) {
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            throw new AppError('Invalid email or password', 401);
        }

        let hash = admin.password_hash;
        if (hash.startsWith('$2y$')) {
            hash = '$2a$' + hash.substring(4);
        }

        const isValid = await bcrypt.compare(password, hash);
        if (!isValid) {
            throw new AppError('Invalid email or password', 401);
        }

        if (admin.role !== 'admin') {
            throw new AppError('Access denied. Not an admin.', 403);
        }

        const token = generateToken({ 
            id: admin.id, 
            role: admin.role, 
            isSuperAdmin: (admin as any).is_super_admin,
            email: admin.email 
        });

        // Enrich with member data if exists
        const memberData = await prisma.member.findFirst({
            where: { email: admin.email }
        });

        return {
            token,
            user: {
                id: admin.id,
                first_name: memberData?.first_name || admin.full_name?.split(' ')[0] || '',
                last_name: memberData?.last_name || admin.full_name?.split(' ').slice(1).join(' ') || '',
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                isSuperAdmin: (admin as any).is_super_admin,
                profile_photo: memberData?.profile_photo || null,
                slug: memberData?.slug || null,
                phone: memberData?.phone || null
            }
        };
    }

    static async tokenLogin(token: string) {
        if (!token) {
            throw new AppError('Token is required', 400);
        }

        const { verifyToken } = await import('../utils/jwt.js');
        const decoded: any = verifyToken(token);

        if (!decoded || !decoded.id) {
            throw new AppError('Invalid or expired token', 401);
        }

        const user = await prisma.member.findUnique({
            where: { id: Number(decoded.id) }
        });

        if (!user) {
            throw new AppError('Member not found', 404);
        }

        const streamMembers = await prisma.streamMember.findMany({
            where: { user_id: user.id },
            include: { stream: true }
        });

        const streams = streamMembers.map((sm: any) => ({
            id: sm.stream.id,
            name: sm.stream.name,
            color: sm.stream.color
        }));

        return {
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_onboarded: user.is_onboarded,
                profile_photo: user.profile_photo,
                slug: user.slug,
                streams
            }
        };
    }
}
