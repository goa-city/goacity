import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.body; // email or phone

        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Email or Phone is required' });
        }

        // 1. Check if member exists (matching strict mode in login.php)
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found. Please contact admin.' });
        }

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
        if (isEmail) {
            console.log(`[AUTH] Attempting to send OTP email to ${identifier}`);
            
            // Try to get template from DB
            let emailSubject = 'Your Goa.City Login Code';
            let emailContent = `<p>Your login code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`;

            try {
                const template = await prisma.emailTemplate.findUnique({
                    where: { title: 'OTP Login' }
                });

                if (template) {
                    emailSubject = template.subject;
                    emailContent = template.message.replace('{{otp_code}}', otpCode);
                    // Add more common elements if needed
                    emailContent = emailContent.replace('{{first_name}}', member.first_name || '');
                    emailContent = emailContent.replace('{{last_name}}', member.last_name || '');
                }
            } catch (err) {
                console.warn('[AUTH] Could not fetch OTP template, using default:', err);
            }

            const emailSent = await sendEmail(
                identifier, 
                emailSubject, 
                emailContent
            );

            if (!emailSent) {
                return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
            }
        } else {
            console.log(`[AUTH] Identifier ${identifier} is not an email. Skipping email send (SMS implementation pending).`);
            // For now, if it's not an email, we might want to return an error or just succeed if we have SMS
            // The existing PHP logic didn't seem to have SMS either, just email.
            return res.status(400).json({ success: false, message: 'OTP can only be sent to email at this time.' });
        }

        return res.json({ 
            success: true, 
            message: 'OTP sent successfully'
        });

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { identifier, otp, rememberMe } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ success: false, message: 'Identifier and OTP are required' });
        }

        // 1. Find OTP in otp_table
        const otpRecord = await prisma.otp.findFirst({
            where: {
                email_or_phone: identifier,
                otp_code: otp,
                expires_at: {
                    gt: new Date()
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
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
            // Create user if they don't exist (matching verify.php logic)
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
            include: {
                stream: true
            },
            orderBy: {
                stream_id: 'desc' // Approximation of latest join
            }
        });

        const streams = streamMembers.map((sm: any) => ({
            id: sm.stream.id,
            name: sm.stream.name,
            color: sm.stream.color
        }));

        // 4. Generate Token
        // Using '30d' if rememberMe, else '7d' (matching original intent)
        const token = generateToken({ id: user.id, role: user.role }, rememberMe ? '30d' : '7d');

        // 5. Delete OTP record after use
        await prisma.otp.delete({ where: { id: otpRecord.id } });

        // 6. Return Response
        return res.json({
            success: true,
            message: 'Login successful',
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
                streams: streams
            }
        });

    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // 1. Find Admin
        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 2. Verify Password
        let hash = admin.password_hash;
        // PHP's password_hash uses $2y$, Node's bcrypt uses $2a$ or $2b$
        if (hash.startsWith('$2y$')) {
            hash = '$2a$' + hash.substring(4);
        }

        const isValid = await bcrypt.compare(password, hash);
        
        if (!isValid) {
            console.log(`[AUTH] Admin login failed for ${email}: Password mismatch`);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // 3. Check Role
        if (admin.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Not an admin.' });
        }

        // 4. Generate Token
        const token = generateToken({ 
            id: admin.id, 
            role: admin.role, 
            isSuperAdmin: (admin as any).is_super_admin,
            email: admin.email 
        });

        return res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: {
                id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                isSuperAdmin: (admin as any).is_super_admin
            }
        });

    } catch (error: any) {
        console.error('Admin Login Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
