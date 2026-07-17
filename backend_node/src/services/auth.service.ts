import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { whatsapp } from './whatsapp.service.js';

export class AuthService {
    static async sendOtp(identifier: string) {
        console.log(`[AUTH] Sending OTP to: ${identifier}`);
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
            }
        });

        if (!member) {
            console.log(`[AUTH] Member not found for identifier: ${identifier}`);
            throw new AppError('Member not found. Please contact admin.', 404);
        }

        // Check for stream assignment
        const streamCount = await prisma.streamMember.count({
            where: { user_id: member.id }
        });
 
        if (streamCount === 0) {
            throw new AppError('Your registration is pending approval. You will be notified once you are assigned to a stream.', 403);
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

        // 4. Send OTP
        if (!isEmail) {
            const firstName = member.first_name || 'Member';
            const whatsappMessage = `Hello ${firstName}, your Goa.City login code is: *${otpCode}*. This code will expire in 10 minutes.`;
            await whatsapp.sendMessage(member.phone || identifier, whatsappMessage, member.id);
            return { success: true };
        }

        let emailSubject = 'Your Goa.City Login Code';
        let emailContent = `<p>Your login code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`;

        try {
            const template = await prisma.emailTemplate.findUnique({
                where: { id: SYSTEM_TEMPLATES.EMAIL.OTP.ID }
            });

            if (template) {
                emailSubject = template.subject;
                const replacements: any = {
                    '{otp_code}': otpCode,
                    '{{otp_code}}': otpCode,
                    '{first_name}': member.first_name || '',
                    '{{first_name}}': member.first_name || '',
                    '{last_name}': member.last_name || '',
                    '{{last_name}}': member.last_name || ''
                };
                
                emailContent = template.message;
                for (const key in replacements) {
                    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    emailContent = emailContent.replace(regex, replacements[key]);
                    emailSubject = emailSubject.replace(regex, replacements[key]);
                }
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
        const isEmail = identifier.includes('@');
        const digits = identifier.replace(/\D/g, '');
        let user = await prisma.member.findFirst({
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
            }
        });

        if (!user) {
            user = await prisma.member.create({
                data: {
                    first_name: isEmail ? identifier.split('@')[0] : 'Member',
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
                slug: user.slug,
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
}
