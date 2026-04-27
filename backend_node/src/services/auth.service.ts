import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';

export class AuthService {
    static async sendOtp(identifier: string) {
        console.log(`[AUTH] Sending OTP to: ${identifier}`);
        // 1. Check if member exists
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!member) {
            console.log(`[AUTH] Member not found for identifier: ${identifier}`);
            throw new AppError('Member not found. Please contact admin.', 404);
        }

        console.log(`[AUTH] Member found: ${member.first_name} ${member.last_name}. Generating OTP...`);

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Clear existing OTPs and create new one
        await prisma.otp.deleteMany({ where: { email_or_phone: identifier } });
        
        await prisma.otp.create({
            data: {
                email_or_phone: identifier,
                otp_code: otpCode,
                expires_at: expiresAt,
                attempts: 0
            }
        });

        // 4. Send Email (only if identifier is email)
        const isEmail = identifier.includes('@');
        if (!isEmail) {
            throw new AppError('OTP can only be sent to email at this time.', 400);
        }

        let emailSubject = 'Your Goa.City Login Code';
        let emailContent = `<p>Your login code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`;

        try {
            const template = await prisma.emailTemplate.findUnique({
                where: { id: SYSTEM_TEMPLATES.EMAIL.OTP.ID }
            });

            if (template) {
                emailSubject = template.subject;
                emailContent = template.message.replace('{{otp_code}}', otpCode);
                emailContent = emailContent.replace('{{first_name}}', member.first_name || '');
                emailContent = emailContent.replace('{{last_name}}', member.last_name || '');
            }
        } catch (err) {
            console.warn('[AUTH SERVICE] Could not fetch OTP template, using default:', err);
        }

        const emailSent = await sendEmail(identifier, emailSubject, emailContent);
        if (!emailSent) {
            throw new AppError('Failed to send OTP email', 500);
        }

        return { success: true };
    }

    static async verifyOtp(identifier: string, otp: string, rememberMe: boolean = false) {
        // 1. Find OTP
        const otpRecord = await prisma.otp.findFirst({
            where: {
                email_or_phone: identifier,
                otp_code: otp,
                expires_at: { gt: new Date() }
            },
            orderBy: { created_at: 'desc' }
        });

        if (!otpRecord) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        // 2. Find or Create User
        let user = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!user) {
            const isEmail = identifier.includes('@');
            user = await prisma.member.create({
                data: {
                    first_name: identifier.split('@')[0],
                    last_name: '',
                    email: isEmail ? identifier : null,
                    phone: isEmail ? null : identifier,
                    role: 'member',
                    is_onboarded: 0
                }
            });
        }

        // 3. Fetch User's Streams
        const streamMembers = await prisma.streamMember.findMany({
            where: { user_id: user.id },
            include: { stream: true }
        });

        const streams = streamMembers.map((sm: any) => ({
            id: sm.stream.id,
            name: sm.stream.name,
            color: sm.stream.color
        }));

        // 4. Generate Token
        const token = generateToken({ id: user.id, role: user.role }, rememberMe ? '30d' : '7d');

        // 5. Cleanup
        await prisma.otp.delete({ where: { id: otpRecord.id } });

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

        return {
            token,
            user: {
                id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                isSuperAdmin: (admin as any).is_super_admin
            }
        };
    }
}
