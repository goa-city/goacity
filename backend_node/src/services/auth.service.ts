import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppError } from '../utils/errors.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { whatsapp } from './whatsapp.service.js';

function normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    return digits;
}

function maskEmail(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return email;
    const name = email.slice(0, atIndex);
    const domain = email.slice(atIndex);
    const masked = name.length <= 2 ? `${name[0] || ''}*` : `${name[0] || ''}${'*'.repeat(Math.max(1, name.length - 2))}${name.slice(-1)}`;
    return `${masked}${domain}`;
}

export class AuthService {
    static async sendOtpViaEmail(email: string, otpCode: string, firstName: string, lastName: string) {
        let emailSubject = 'Your Goa.City Login Code';
        let emailContent = `<p>Your login code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`;

        try {
            const template = await prisma.emailTemplate.findUnique({
                where: { id: SYSTEM_TEMPLATES.EMAIL.OTP.ID }
            });

            if (template) {
                emailSubject = template.subject;
                const replacements: Record<string, string> = {
                    '{otp_code}': otpCode,
                    '{{otp_code}}': otpCode,
                    '{first_name}': firstName || '',
                    '{{first_name}}': firstName || '',
                    '{last_name}': lastName || '',
                    '{{last_name}}': lastName || ''
                };
                
                emailContent = template.message;
                for (const key in replacements) {
                    const val = replacements[key] ?? '';
                    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    emailContent = emailContent.replace(regex, val);
                    emailSubject = emailSubject.replace(regex, val);
                }
            }
        } catch (err) {
            console.warn('[AUTH SERVICE] Could not fetch OTP email template, using default:', err);
        }

        const emailSent = await sendEmail(email, emailSubject, emailContent);
        if (!emailSent) {
            throw new AppError('Failed to send verification code email.', 500);
        }
        return true;
    }

    static async sendOtp(identifier: string) {
        console.log(`[AUTH] Sending OTP to: ${identifier}`);
        const isEmail = identifier.includes('@');
        const cleanIdentifier = isEmail ? identifier.trim().toLowerCase() : normalizePhone(identifier);

        if (!cleanIdentifier) {
            throw new AppError('Please provide a valid phone number or email address.', 400);
        }

        // 1. Check if member exists
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: { equals: cleanIdentifier, mode: 'insensitive' } },
                    { phone: cleanIdentifier },
                    { phone: `+91${cleanIdentifier}` },
                    { phone: `91${cleanIdentifier}` },
                    ...(cleanIdentifier.length >= 10 ? [{ phone: { contains: cleanIdentifier.slice(-10) } }] : [])
                ]
            },
            include: {
                city: true
            }
        });

        if (!member) {
            console.log(`[AUTH] Member not found for identifier: ${identifier} (clean: ${cleanIdentifier})`);
            throw new AppError('No account found with this phone number or email. Please check your input or contact admin.', 404);
        }

        // 2. Check for stream assignment
        const streamCount = await prisma.streamMember.count({
            where: { user_id: member.id }
        });

        if (streamCount === 0) {
            throw new AppError('Your registration is pending approval. You will be notified once you are assigned to a stream.', 403);
        }

        console.log(`[AUTH] Member found: ${member.first_name} ${member.last_name} (ID: ${member.id}). Generating OTP...`);

        // 3. Generate cryptographic 6-digit OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 4. Clear existing OTPs and persist new record
        await prisma.otp.deleteMany({
            where: {
                OR: [
                    { email_or_phone: cleanIdentifier },
                    { email_or_phone: identifier },
                    ...(member.email ? [{ email_or_phone: member.email.toLowerCase() }] : []),
                    ...(member.phone ? [{ email_or_phone: member.phone }] : [])
                ]
            }
        }).catch(() => {});

        await prisma.otp.create({
            data: {
                email_or_phone: cleanIdentifier,
                otp_code: otpCode,
                expires_at: expiresAt,
                attempts: 0
            }
        });

        const firstName = member.first_name || 'Member';
        const lastName = member.last_name || '';

        // 5. Dispatch OTP
        if (isEmail) {
            await AuthService.sendOtpViaEmail(member.email || cleanIdentifier, otpCode, firstName, lastName);
            return {
                success: true,
                channel: 'EMAIL',
                message: `Verification code sent to ${cleanIdentifier}`
            };
        }

        // Phone: Try WhatsApp with automatic Email fallback if WhatsApp is unreachable
        const targetPhone = member.phone || cleanIdentifier;
        try {
            const whatsappMessage = `Hello ${firstName}, your Goa.City login code is: *${otpCode}*. This code will expire in 10 minutes.`;
            await whatsapp.sendMessage(targetPhone, whatsappMessage, member.id);
            return {
                success: true,
                channel: 'WHATSAPP',
                message: `Verification code sent via WhatsApp to ${targetPhone}`
            };
        } catch (whatsappErr: any) {
            console.warn(`[AUTH] WhatsApp send failed for ${targetPhone}:`, whatsappErr?.message || whatsappErr);
            if (member.email) {
                console.log(`[AUTH] Falling back to email OTP for member ${member.id} (${member.email})`);
                await AuthService.sendOtpViaEmail(member.email, otpCode, firstName, lastName);
                return {
                    success: true,
                    channel: 'EMAIL_FALLBACK',
                    message: `WhatsApp service is temporarily unavailable. We sent your login code to your registered email (${maskEmail(member.email)}).`
                };
            }
            throw new AppError(
                whatsappErr?.message && whatsappErr.message.includes('reconnecting')
                    ? whatsappErr.message
                    : 'WhatsApp service is temporarily unavailable. Please try again shortly or sign in with your email address.',
                503
            );
        }
    }

    static async verifyOtp(identifier: string, otp: string, rememberMe: boolean = false) {
        if (!otp || otp.trim().length !== 6) {
            throw new AppError('Please enter a valid 6-digit verification code.', 400);
        }

        const isEmail = identifier.includes('@');
        const cleanIdentifier = isEmail ? identifier.trim().toLowerCase() : normalizePhone(identifier);

        // 1. Verify OTP from database
        const otpRecord = await prisma.otp.findFirst({
            where: {
                OR: [
                    { email_or_phone: cleanIdentifier },
                    { email_or_phone: identifier }
                ],
                otp_code: otp.trim(),
                expires_at: { gt: new Date() }
            },
            orderBy: { created_at: 'desc' }
        });

        if (!otpRecord) {
            throw new AppError('Invalid or expired verification code. Please request a new code.', 400);
        }

        // 2. Find Member
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: { equals: cleanIdentifier, mode: 'insensitive' } },
                    { phone: cleanIdentifier },
                    { phone: `+91${cleanIdentifier}` },
                    { phone: `91${cleanIdentifier}` },
                    ...(cleanIdentifier.length >= 10 ? [{ phone: { contains: cleanIdentifier.slice(-10) } }] : [])
                ]
            },
            include: {
                city: true
            }
        });

        if (!member) {
            throw new AppError('Member account not found. Please contact admin.', 404);
        }

        // 3. Fetch stream membership
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

        // 4. Invalidate used OTPs
        await prisma.otp.deleteMany({
            where: {
                OR: [
                    { email_or_phone: cleanIdentifier },
                    { email_or_phone: identifier },
                    { id: otpRecord.id }
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
