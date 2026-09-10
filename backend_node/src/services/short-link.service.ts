import prisma from '../lib/prisma.js';
import crypto from 'crypto';
import { generateToken } from '../utils/jwt.js';

const SECRET_KEY = process.env.JWT_SECRET || 'goa-city-secret-key-rsvp-2026';

export class ShortLinkService {
    /**
     * Generates an encrypted/signed short code for a meeting RSVP action
     */
    static generateRsvpCode(meetingId: number, memberId: number, status: string): string {
        const payload = `${meetingId}:${memberId}:${status}`;
        const hash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('base64url').slice(0, 8);
        return `r_${hash}`;
    }

    /**
     * Creates or gets an existing short link for a meeting RSVP option
     */
    static async getOrCreateRsvpLink(
        meetingId: number, 
        memberId: number, 
        status: string,
        meetingSlugOrId: string | number,
        baseUrl: string
    ): Promise<string> {
        const code = this.generateRsvpCode(meetingId, memberId, status);
        const targetUrl = `${baseUrl}/meetings/${meetingSlugOrId}?rsvp_recorded=${status}`;

        try {
            await prisma.shortLink.upsert({
                where: { code },
                update: {
                    target_url: targetUrl,
                    meeting_id: meetingId,
                    member_id: memberId,
                    action_status: status
                },
                create: {
                    code,
                    target_url: targetUrl,
                    link_type: 'rsvp',
                    meeting_id: meetingId,
                    member_id: memberId,
                    action_status: status
                }
            });
        } catch (err) {
            console.error('[ShortLinkService] Error upserting short link:', err);
        }

        return `${baseUrl}/meeting/r/${code}`;
    }

    /**
     * Resolves a short link code, records the click, performs the RSVP, and returns the target URL
     */
    static async resolveAndRecordClick(code: string, baseUrl: string): Promise<string> {
        const shortLink = await prisma.shortLink.findUnique({
            where: { code },
            include: { meeting: true, member: true }
        });

        if (!shortLink) {
            return `${baseUrl}/meetings`;
        }

        // Increment click count
        try {
            await prisma.shortLink.update({
                where: { id: shortLink.id },
                data: {
                    clicks_count: { increment: 1 },
                    last_clicked_at: new Date()
                }
            });
        } catch (clickErr) {
            console.error('[ShortLinkService] Error updating click count:', clickErr);
        }

        // If it's an RSVP action link, auto-record the member's RSVP
        if (shortLink.link_type === 'rsvp' && shortLink.meeting_id && shortLink.member_id && shortLink.action_status) {
            try {
                const existing = await prisma.meeting_responses.findFirst({
                    where: { meeting_id: shortLink.meeting_id, user_id: shortLink.member_id }
                });

                if (existing) {
                    await prisma.meeting_responses.update({
                        where: { id: existing.id },
                        data: { rsvp_status: shortLink.action_status, updated_at: new Date() }
                    });
                } else {
                    await prisma.meeting_responses.create({
                        data: {
                            meeting_id: shortLink.meeting_id,
                            user_id: shortLink.member_id,
                            rsvp_status: shortLink.action_status
                        }
                    });
                }
            } catch (rsvpErr) {
                console.error('[ShortLinkService] Error updating RSVP on click:', rsvpErr);
            }
        }

        // Generate auto-login token for member if available
        let authToken = '';
        if (shortLink.member) {
            try {
                authToken = generateToken({ id: shortLink.member.id, role: shortLink.member.role }, '30d');
            } catch (tokenErr) {
                console.error('[ShortLinkService] Error generating token for auto-login:', tokenErr);
            }
        }

        // Return canonical target URL
        if (shortLink.meeting) {
            const slug = shortLink.meeting.slug || shortLink.meeting.id;
            const queryParts: string[] = [];
            if (shortLink.action_status) {
                queryParts.push(`rsvp_recorded=${shortLink.action_status}`);
            }
            if (authToken) {
                queryParts.push(`auth_token=${authToken}`);
            }
            const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
            return `${baseUrl}/meetings/${slug}${queryString}`;
        }

        return shortLink.target_url || `${baseUrl}/meetings`;
    }
}
