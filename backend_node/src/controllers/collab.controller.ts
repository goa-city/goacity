import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/my-people
export const getMyPeople = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        // Find user's streams
        const user = await prisma.member.findUnique({
            where: { id: parseInt(userId) },
            include: { streams: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const streamIds = user.streams.map(s => s.stream_id);

        if (streamIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const streamParam = req.query.stream as string;
        let queryStreamIds = streamIds;

        if (streamParam) {
            const requestedStreamId = parseInt(streamParam);
            if (streamIds.includes(requestedStreamId)) {
                queryStreamIds = [requestedStreamId];
            } else {
                return res.json({ success: true, data: [] });
            }
        }

        // Find other members who share at least one stream
        const peers = await (prisma as any).member.findMany({
            where: {
                id: { not: parseInt(userId) },
                streams: {
                    some: {
                        stream_id: { in: queryStreamIds }
                    }
                }
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
                profile_photo: true,
                services: {
                    where: { status: 'Active' },
                    select: { id: true }
                }
            }
        });

        res.json({ success: true, data: peers });
    } catch (error) {
        console.error('getMyPeople error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch my people.' });
    }
};

// GET /api/profile/:id
export const getMemberProfile = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        const member = await (prisma as any).member.findUnique({
            where: { id },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                bio: true,
                role: true,
                profile_photo: true,
                businesses: {
                    select: { business_name: true }
                },
                services: {
                    where: { status: 'Active' }
                }
            }
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        res.json({ success: true, data: member });
    } catch (error) {
        console.error('getMemberProfile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch member profile.' });
    }
};

// POST /api/collaboration/request
export const requestCollaboration = async (req: Request, res: Response) => {
    try {
        const { provider_id, type, description } = req.body;
        const requester_id = (req as any).userId;

        if (!provider_id || !type) {
            return res.status(400).json({ success: false, message: 'Provider ID and type are required.' });
        }

        const request = await (prisma as any).collaborationRequest.create({
            data: {
                requester_id: parseInt(requester_id),
                provider_id: parseInt(provider_id),
                type,
                description,
                status: 'Pending_Admin'
            }
        });

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('requestCollaboration error:', error);
        res.status(500).json({ success: false, message: 'Failed to request collaboration.' });
    }
};

// GET /api/admin/collabs
export const getAdminCollabs = async (req: Request, res: Response) => {
    try {
        const collabs = await (prisma as any).collaborationRequest.findMany({
            include: {
                requester: { select: { id: true, first_name: true, last_name: true } },
                provider: { select: { id: true, first_name: true, last_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: collabs });
    } catch (error) {
        console.error('getAdminCollabs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin collabs.' });
    }
};

// PUT /api/admin/collabs/:id/status
export const updateCollabStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const id = req.params.id as string;

        const updated = await (prisma as any).collaborationRequest.update({
            where: { id },
            data: { status }
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('updateCollabStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update collab status.' });
    }
};

// GET /api/dashboard/collabs
export const getDashboardCollabs = async (req: Request, res: Response) => {
    try {
        const collabs = await (prisma as any).collaborationRequest.findMany({
            where: { status: 'Approved' },
            include: {
                requester: { select: { first_name: true, last_name: true } },
                provider: { select: { first_name: true, last_name: true } }
            },
            take: 10,
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: collabs });
    } catch (error) {
        console.error('getDashboardCollabs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard collabs.' });
    }
};

// POST /api/dev/collab-test/:id
export const devAutoTestCollab = async (req: Request, res: Response) => {
    try {
        const memberId = parseInt(req.params.id as string);
        const requesterId = (req as any).userId;

        const count = await (prisma as any).memberService.count({ where: { member_id: memberId } });
        if (count === 0) {
            await (prisma as any).memberService.createMany({
                data: [
                    { member_id: memberId, title: 'Strategic Consulting', type: 'Paid', status: 'Active' },
                    { member_id: memberId, title: 'Leadership Mentorship', type: 'Gifted', status: 'Active' },
                    { member_id: memberId, title: 'Web Development', type: 'Paid', status: 'Active' }
                ]
            });
            console.log(`SERVICES INITIALIZED — 3 items added to profile`);
        }

        const collab = await (prisma as any).collaborationRequest.create({
            data: {
                requester_id: parseInt(requesterId),
                provider_id: memberId,
                type: Math.random() > 0.5 ? 'Paid' : 'Gifted',
                description: 'Automated test collaboration request from Sandbox.',
                status: 'Pending_Admin'
            }
        });
        console.log(`COLLAB SUCCESS — Request created for Member ID ${memberId}`);

        const total = await (prisma as any).collaborationRequest.count();
        console.log(`Total community requests: ${total}`);

        res.json({ success: true, data: collab });
    } catch (error) {
        console.error('devAutoTestCollab error:', error);
        res.status(500).json({ success: false, message: 'Failed auto test.' });
    }
};
