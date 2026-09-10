import type { Request, Response } from 'express';
import { whatsapp } from '../services/whatsapp.service.js';
import prisma from '../lib/prisma.js';
import { SYSTEM_TEMPLATES } from '../config/constants.js';
import { processImageToWebp } from '../utils/image.js';
import { getBaseUrl } from '../lib/utils.js';
import { ShortLinkService } from '../services/short-link.service.js';
import fs from 'fs';

export const getWhatsAppStatus = async (req: Request, res: Response) => {
    try {
        const session = await prisma.whatsAppSession.findFirst({
            where: { id: 1 } // Assuming one session
        });
        
        res.json({
            status: session?.status || 'INITIALIZING',
            qr_code: session?.qr_code || null,
            last_active: session?.last_active
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
                const replacements: any = {
                    '{first_name}': member.first_name || '',
                    '{firstname}': member.first_name || '',
                    '{last_name}': member.last_name || '',
                    '{lastname}': member.last_name || ''
                };
                for (const key in replacements) {
                    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    personalizedContent = personalizedContent.replace(regex, replacements[key]);
                }
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
    try {
        let messages = req.body.messages;
        let streamNames = req.body.streamNames;

        if (typeof messages === 'string') {
            try {
                messages = JSON.parse(messages);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid JSON for messages' });
            }
        }

        if (typeof streamNames === 'string') {
            try {
                streamNames = JSON.parse(streamNames);
            } catch (e) {
                streamNames = [streamNames];
            }
        }
        
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages must be a non-empty array' });
        }

        let imagePath: string | undefined;
        let imageUrl: string | undefined;

        if (req.file) {
            try {
                const webpFilename = await processImageToWebp(req.file, 1200);
                imagePath = `uploads/${webpFilename}`;
                imageUrl = `/uploads/${webpFilename}`;
            } catch (imgErr: any) {
                return res.status(400).json({ error: imgErr.message || 'Failed to process attached image' });
            }
        }

        const broadcastName = streamNames ? streamNames.join(', ') : 'Bulk Broadcast';
        
        // Trigger bulk send in background
        whatsapp.sendBulk(messages, broadcastName, undefined, imagePath, imageUrl).catch(err => {
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
        const startTime = meeting.start_time || '';
        const endTime = meeting.end_time || '';
        const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : (startTime || endTime || 'TBD');

        const baseUrl = getBaseUrl(req);
        const meetingUrl = `${baseUrl}/meetings/${meeting.id}`;

        const getReplacements = async (m: any) => {
            const meetingTarget = meeting.slug || meeting.id;
            const [goingUrl, maybeUrl, noUrl] = await Promise.all([
                ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'going', meetingTarget, baseUrl),
                ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'not_sure', meetingTarget, baseUrl),
                ShortLinkService.getOrCreateRsvpLink(meeting.id, m.id, 'cant_go', meetingTarget, baseUrl)
            ]);

            const rsvpOptionsBlock = `*Going:* ${goingUrl}\n\n*Maybe:* ${maybeUrl}\n\n*No:* ${noUrl}`;
            const payUrl = `${baseUrl}/pay/${meetingTarget}?m=${m.id}`;

            return {
                '{first_name}': m.first_name || 'Member',
                '{firstname}': m.first_name || 'Member',
                '{last_name}': m.last_name || '',
                '{lastname}': m.last_name || '',
                '{meeting_title}': meeting.title || '',
                '{meeting_date}': dateStr || '',
                '{meeting_time}': timeStr || '',
                '{location_name}': meeting.location_name || '',
                '{location}': meeting.location_name || '',
                '{map_link}': meeting.map_link || '',
                '{zoom_link}': meeting.zoom_link || '',
                '{rsvp_link}': meetingUrl || '',
                '{rsvp_options_link}': rsvpOptionsBlock,
                '{upi_link}': payUrl,
                '{pay_link}': payUrl,
                '{{rsvp_link}}': meetingUrl || '',
                '{{rsvp_options_link}}': rsvpOptionsBlock,
                '{{upi_link}}': payUrl,
                '{{pay_link}}': payUrl
            };
        };

        const applyReplacements = (text: string, replacements: any) => {
            let result = text;
            for (const key in replacements) {
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                result = result.replace(regex, replacements[key]);
            }
            return result;
        };

        // 4. Send bulk with async short link replacements
        const bulkMessages = await Promise.all(members.map(async m => ({
            to: m.phone!,
            content: applyReplacements(template.content, await getReplacements(m)),
            memberId: m.id
        })));

        const templateImagePath = template.image_url ? `uploads/${template.image_url}` : undefined;
        const templateImageUrl = template.image_url ? `${baseUrl}/uploads/${template.image_url}` : undefined;

        whatsapp.sendBulk(
            bulkMessages, 
            `Meeting Alert: ${meeting.title}`,
            undefined,
            templateImagePath,
            templateImageUrl
        ).catch(console.error);

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
