import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// ----- MEMBER ROUTES -----

export const getStewardshipSummary = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const financialLogs = await prisma.stewardshipLog.aggregate({
            _sum: { amount: true },
            where: { user_id: userId, type: 'Financial', status: 'Verified' }
        });

        const hourLogs = await prisma.stewardshipLog.aggregate({
            _sum: { hours: true },
            where: { user_id: userId, type: 'Skill', status: 'Verified' }
        });

        const impactGallery = await prisma.stewardshipLog.findMany({
            where: { user_id: userId, status: 'Verified', impact_note: { not: null } },
            orderBy: { updated_at: 'desc' }
        });

        // Convert the impact logs into gallery items
        const formattedGallery = impactGallery.map(log => ({
            id: log.id,
            title: `${log.type} Impact`,
            description: log.impact_note,
            image_url: log.impact_image_url || null // Frontend gracefully handles missing image
        }));

        res.json({
            total_financial_given: financialLogs._sum.amount ? parseFloat(financialLogs._sum.amount.toString()) : 0,
            total_hours_gifted: hourLogs._sum.hours ? parseFloat(hourLogs._sum.hours.toString()) : 0,
            impact_count: formattedGallery.length,
            impact_gallery: formattedGallery
        });
    } catch (error) {
        console.error('Error in getStewardshipSummary:', error);
        res.status(500).json({ error: 'Failed to fetch summary data' });
    }
};

export const getMemberLogs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const logs = await prisma.stewardshipLog.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        const formattedLogs = await Promise.all(logs.map(async (log) => {
            let recipientName = 'Unknown';
            if (log.type === 'Financial' && log.recipient_id) {
                const org = await prisma.verificationOrg.findUnique({ where: { id: log.recipient_id } });
                if (org) recipientName = org.name;
            } else if (log.type === 'Skill' && log.recipient_id && log.recipient_id !== -1) {
                const member = await prisma.member.findUnique({ where: { id: log.recipient_id } });
                if (member) recipientName = `${member.first_name} ${member.last_name}`;
            } else if (log.type === 'Skill' && log.recipient_id === -1) {
                 recipientName = 'External / Other';
            }

            return {
                id: log.id,
                type: log.type,
                amount: log.amount ? parseFloat(log.amount.toString()) : null,
                hours: log.hours ? parseFloat(log.hours.toString()) : null,
                skill_category: log.skill_category,
                date: log.date ? log.date.toISOString().split('T')[0] : null,
                recipient_name: recipientName,
                status: log.status
            };
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching member logs:', error);
        res.status(500).json({ error: 'Failed to fetch member logs' });
    }
};


export const getVerifiedOrgs = async (req: Request, res: Response) => {
    try {
        const orgs = await prisma.verificationOrg.findMany({
            where: { status: 'Active' }
        });
        res.json(orgs);
    } catch (error) {
        console.error('Error fetching orgs:', error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};

export const getMemberDirectory = async (req: Request, res: Response) => {
    try {
        const members = await prisma.member.findMany({
            select: { id: true, first_name: true, last_name: true }
        });
        res.json(members);
    } catch (error) {
        console.error('Error fetching directory:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const createStewardshipLog = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { type, recipient_id, amount, hours, date, skill_category } = req.body;

        const log = await prisma.stewardshipLog.create({
            data: {
                user_id: userId,
                type,
                recipient_id: recipient_id ? parseInt(recipient_id) : null,
                amount: amount ? parseFloat(amount) : null,
                hours: hours ? parseFloat(hours) : null,
                date: date ? new Date(date) : null,
                skill_category: skill_category || null,
                status: 'Pending'
            }
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(500).json({ error: 'Failed to create stewardship log' });
    }
};

// ----- ADMIN ROUTES -----

export const getAllLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.stewardshipLog.findMany({
            include: { user: true },
            orderBy: { created_at: 'desc' }
        });

        // We need to fetch recipient names depending on if it's financial (org) or skill (member id)
        const formattedLogs = await Promise.all(logs.map(async (log) => {
            let recipientName = 'Unknown';
            if (log.type === 'Financial' && log.recipient_id) {
                const org = await prisma.verificationOrg.findUnique({ where: { id: log.recipient_id } });
                if (org) recipientName = org.name;
            } else if (log.type === 'Skill' && log.recipient_id && log.recipient_id !== -1) {
                const member = await prisma.member.findUnique({ where: { id: log.recipient_id } });
                if (member) recipientName = `${member.first_name} ${member.last_name}`;
            } else if (log.type === 'Skill' && log.recipient_id === -1) {
                 recipientName = 'External / Other';
            }

            return {
                id: log.id,
                user_name: `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim(),
                type: log.type,
                amount: log.amount ? parseFloat(log.amount.toString()) : null,
                hours: log.hours ? parseFloat(log.hours.toString()) : null,
                skill_category: log.skill_category,
                date: log.date ? log.date.toISOString().split('T')[0] : null,
                recipient_name: recipientName
            };
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching all logs:', error);
        res.status(500).json({ error: 'Failed to fetch all logs' });
    }
};

export const getAdminRecipients = async (req: Request, res: Response) => {
    try {
        const orgs = await prisma.verificationOrg.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const createAdminRecipient = async (req: Request, res: Response) => {
    try {
        const { name, type } = req.body;
        const org = await prisma.verificationOrg.create({
            data: {
                name,
                org_type: type,
                status: 'Active'
            }
        });
        res.status(201).json(org);
    } catch (error) {
        console.error('Error creating recipient:', error);
        res.status(500).json({ error: 'Failed to create recipient' });
    }
};


export const updateRecipientStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;
        
        const org = await prisma.verificationOrg.update({
            where: { id },
            data: { status }
        });
        res.json(org);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update' });
    }
};

export const approveLog = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const log = await prisma.stewardshipLog.update({
            where: { id },
            data: { status: 'Verified' }
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve' });
    }
};

export const addImpactNote = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const { note } = req.body;
        
        const log = await prisma.stewardshipLog.update({
            where: { id },
            data: { impact_note: note }
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update impact note' });
    }
};
