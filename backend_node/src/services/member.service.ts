import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class MemberService {
    static async getProfile(userId: number) {
        const member = await prisma.member.findUnique({
            where: { id: userId },
            include: {
                streams: { include: { stream: true } },
                profiles: true,
                businesses: true
            }
        });

        if (!member) throw new AppError('Member not found', 404);

        return member;
    }

    static async updateProfile(userId: number, data: any) {
        // Simple update for now, can be expanded for complex fields
        return prisma.member.update({
            where: { id: userId },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                village: data.village,
                address: data.address,
                bio: data.bio,
                linkedin_url: data.linkedin_url,
                updated_at: new Date()
            }
        });
    }

    static async getDashboardData(userId: number) {
        const member = await this.getProfile(userId);
        
        // Build streams list with member counts
        const streams = await Promise.all(((member as any).streams || []).map(async (sm: any) => {
            const count = await prisma.streamMember.count({
                where: { stream_id: sm.stream_id }
            });
            return {
                ...sm.stream,
                role: sm.role,
                member_count: count
            };
        }));

        // Fetch pending actions (forms in their streams they haven't submitted yet)
        const pending_actions: any[] = [];
        
        // Find forms associated with member's streams
        const streamIds = (member as any).streams?.map((sm: any) => sm.stream_id) || [];
        if (streamIds.length > 0) {
            const streamForms = await prisma.stream.findMany({
                where: { id: { in: streamIds }, form_id: { not: null } },
                select: { id: true, name: true, color: true, form_id: true }
            });

            for (const sf of streamForms) {
                // Check if user has a completed response for this form
                const hasResponse = await prisma.formResponse.findFirst({
                    where: { user_id: userId, form_id: sf.form_id!, status: 'completed' }
                });

                if (!hasResponse) {
                    pending_actions.push({
                        id: `onboarding-${sf.form_id}`,
                        type: 'onboarding',
                        form_id: sf.form_id,
                        message: `Complete ${sf.name} Onboarding`,
                        stream_name: sf.name,
                        stream_color: sf.color
                    });
                }
            }

            // Fetch today's meetings for check-in
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayMeetings = await prisma.meetings.findMany({
                where: {
                    stream_id: { in: streamIds },
                    meeting_date: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                include: {
                    stream: true,
                    meeting_responses: {
                        where: { user_id: userId }
                    }
                }
            });

            for (const meeting of todayMeetings) {
                console.log(`[DASHBOARD_DEBUG] Meeting: ${meeting.id}, is_paid: ${meeting.is_paid}, qr: ${meeting.payment_qr_image}`);
                const myResponse = meeting.meeting_responses[0];
                if (!myResponse || !myResponse.checked_in) {
                    const apiUrl = process.env.VITE_API_URL || '';
                    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

                    pending_actions.push({
                        id: `checkin-${meeting.id}`,
                        type: 'checkin',
                        meeting_id: meeting.id,
                        message: `Check-in for ${meeting.title}`,
                        stream_name: (meeting as any).stream?.name,
                        stream_color: (meeting as any).stream?.color,
                        is_paid: meeting.is_paid,
                        payment_amount: meeting.payment_amount,
                        payment_qr_image: meeting.payment_qr_image,
                        payment_qr_image_url: meeting.payment_qr_image ? `${baseUrl}/uploads/${meeting.payment_qr_image}` : null,
                        title: meeting.title // Add title for the modal
                    });
                }
            }
        }

        return {
            user: {
                id: member.id,
                first_name: (member as any).first_name,
                last_name: (member as any).last_name,
                email: (member as any).email,
                profile_photo: (member as any).profile_photo
            },
            streams,
            pending_actions
        };
    }
}
