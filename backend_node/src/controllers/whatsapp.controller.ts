import type { Request, Response } from 'express';
import { whatsapp } from '../services/whatsapp.service.js';
import prisma from '../lib/prisma.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';

export const getWhatsAppStatus = async (req: Request, res: Response) => {
    try {
        const session = await prisma.whatsAppSession.findFirst({
            where: { id: 1 } // Assuming one session
        });
        
        res.json({
            status: session?.status || 'INITIALIZING',
            qr: session?.qr_code || null,
            lastActive: session?.last_active
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch WhatsApp status' });
    }
};

export const sendWhatsAppMessage = async (req: Request, res: Response) => {
    const { to, content, memberId } = req.body;
    
    if (!to || !content) {
        return res.status(400).json({ error: 'Missing to or content' });
    }

    try {
        let personalizedContent = content;
        if (memberId) {
            const member = await prisma.member.findUnique({
                where: { id: Number(memberId) }
            });
            if (member) {
                personalizedContent = personalizedContent
                    .replace(/{firstname}/gi, member.first_name || '')
                    .replace(/{lastname}/gi, member.last_name || '');
            }
        }
        await whatsapp.sendMessage(to, personalizedContent, memberId ? Number(memberId) : undefined);
        res.json({ success: true });
    } catch (error: any) {
        console.error('WhatsApp Controller Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send message' });
    }
};

export const restartWhatsApp = async (req: Request, res: Response) => {
    try {
        await whatsapp.restart();
        res.json({ success: true, message: 'WhatsApp client restarting' });
    } catch (error) {
        res.status(500).json({ error: 'Restart failed' });
    }
};

export const refreshWhatsApp = async (req: Request, res: Response) => {
    try {
        const success = await whatsapp.refresh();
        if (success) {
            res.json({ success: true, message: 'WhatsApp session refreshed' });
        } else {
            res.status(500).json({ error: 'Failed to refresh WhatsApp session' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Refresh failed' });
    }
};

export const getWhatsAppLogs = async (req: Request, res: Response) => {
    const { memberId } = req.params;
    
    try {
        const logs = await prisma.whatsAppLog.findMany({
            where: { member_id: Number(memberId) },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

export const broadcastWhatsApp = async (req: Request, res: Response) => {
    const { messages, streamNames } = req.body; // Array of { to, content, memberId }
    
    if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages must be an array' });
    }

    try {
        const broadcastName = streamNames ? streamNames.join(', ') : 'Bulk Broadcast';
        
        // Trigger bulk send in background
        whatsapp.sendBulk(messages, broadcastName).catch(err => {
            console.error('Background bulk send failed:', err);
        });

        res.json({ success: true, message: 'Bulk send initiated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate bulk send' });
    }
};
export const sendMeetingAlert = async (req: Request, res: Response) => {
    try {
        const { meetingId } = req.body;
        
        // 1. Get meeting details
        const meeting = await (prisma as any).meetings.findUnique({
            where: { id: Number(meetingId) }
        });

        if (!meeting || !meeting.stream_id) {
            return res.status(404).json({ error: 'Meeting or associated stream not found' });
        }

        // 2. Get all members in that stream
        const members = await prisma.member.findMany({
            where: {
                AND: [
                    { phone: { not: null } },
                    { phone: { not: '' } }
                ],
                streams: {
                    some: { stream_id: meeting.stream_id }
                }
            }
        });

        if (members.length === 0) {
            return res.status(400).json({ error: 'No members with phone numbers found in this stream' });
        }

        // 3. Format message using template
        const template = await prisma.whatsAppTemplate.findUnique({
            where: { id: SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.ID }
        });

        if (!template) {
            return res.status(404).json({ error: 'WhatsApp Default Template not found' });
        }

        const dateStr = meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'TBD';
        const timeStr = meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD';

        let messageTemplate = template.content
            .replace(/{meeting_title}|{{meeting_title}}/gi, meeting.title)
            .replace(/{meeting_date}|{{meeting_date}}/gi, dateStr)
            .replace(/{meeting_time}|{{meeting_time}}/gi, timeStr)
            .replace(/{location}|{{location_name}}/gi, meeting.location_name || 'TBD');

        // 4. Send bulk
        const bulkMessages = members.map(m => ({
            to: m.phone!,
            content: messageTemplate,
            memberId: m.id
        }));

        whatsapp.sendBulk(bulkMessages, `Meeting Alert: ${meeting.title}`).catch(console.error);

        res.json({ success: true, message: `Alert queued for ${members.length} members` });
    } catch (error) {
        console.error('Meeting alert error:', error);
        res.status(500).json({ error: 'Failed to send alerts' });
    }
};

export const getWhatsAppBroadcasts = async (req: Request, res: Response) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const broadcasts = await prisma.whatsAppBroadcast.findMany({
            where: { 
                city_id: 1,
                is_hidden: false,
                created_at: {
                    gte: sevenDaysAgo
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
};

export const getWhatsAppBroadcastById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const broadcast = await prisma.whatsAppBroadcast.findUnique({
            where: { id: Number(id) }
        });

        if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });

        // Fetch latest log for each member in this broadcast
        const logs = await prisma.$queryRaw`
            SELECT DISTINCT ON (member_id) *
            FROM whatsapp_logs
            WHERE broadcast_id = ${Number(id)}
            ORDER BY member_id, timestamp DESC
        `;

        // Manually include member details (Prisma raw query doesn't do includes)
        const memberIds = (logs as any[]).map(l => l.member_id).filter(id => id !== null);
        const members = await prisma.member.findMany({
            where: { id: { in: memberIds } }
        });

        const logsWithMembers = (logs as any[]).map(log => ({
            ...log,
            member: members.find(m => m.id === log.member_id)
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json({
            ...broadcast,
            logs: logsWithMembers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch broadcast details' });
    }
};

export const hideWhatsAppBroadcast = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.whatsAppBroadcast.update({
            where: { id: Number(id) },
            data: { is_hidden: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to hide broadcast' });
    }
};

export const retryWhatsAppBroadcast = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const broadcast = await prisma.whatsAppBroadcast.findUnique({
            where: { id: Number(id) },
            include: {
                logs: {
                    where: { 
                        direction: 'out',
                        status: { startsWith: 'failed' } 
                    },
                    include: { member: true }
                }
            }
        });

        if (!broadcast || broadcast.logs.length === 0) {
            return res.status(404).json({ error: 'No failed messages found for this broadcast' });
        }

        // Deduplicate members (in case of multiple failed attempts)
        const uniqueMembers = new Map();
        for (const log of broadcast.logs) {
            if (log.member?.phone) {
                uniqueMembers.set(log.member_id, {
                    to: log.member.phone,
                    content: broadcast.content,
                    memberId: log.member_id || undefined
                });
            }
        }

        const retryMessages = Array.from(uniqueMembers.values());

        if (retryMessages.length === 0) {
            return res.status(400).json({ error: 'Failed messages do not have valid phone numbers' });
        }

        // Trigger bulk send with existing broadcast ID
        whatsapp.sendBulk(retryMessages, broadcast.name || 'Retry Broadcast', broadcast.id).catch(console.error);

        res.json({ success: true, count: retryMessages.length });
    } catch (error) {
        console.error('Retry error:', error);
        res.status(500).json({ error: 'Failed to initiate retry' });
    }
};
