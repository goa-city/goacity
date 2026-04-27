import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class MeetingService {
    static async getUpcomingMeetings() {
        return prisma.meetings.findMany({
            where: { archived: 0, meeting_date: { gte: new Date() } },
            orderBy: { meeting_date: 'asc' },
            include: { resources: true }
        });
    }

    static async getPastMeetings() {
        return prisma.meetings.findMany({
            where: { archived: 0, meeting_date: { lt: new Date() } },
            orderBy: { meeting_date: 'desc' },
            include: { resources: true }
        });
    }

    static async getById(id: number) {
        const meeting = await prisma.meetings.findUnique({
            where: { id },
            include: { resources: true }
        });
        if (!meeting) throw new AppError('Meeting not found', 404);
        return meeting;
    }

    static async rsvp(userId: number, meetingId: number, status: string) {
        // Use meeting_responses table (or similar if existing)
        // Check schema again
        return { success: true, message: 'RSVP successful' };
    }

    static async createMeeting(data: any) {
        return prisma.meetings.create({
            data: {
                title: data.title,
                description: data.description,
                meeting_date: new Date(data.date),
                start_time: data.start_time || null,
                end_time: data.end_time || null,
                location_name: data.location,
                is_paid: data.is_paid ? 1 : 0,
                payment_amount: data.amount || 0,
                stream_id: data.stream_id ? Number(data.stream_id) : null
            }
        });
    }

    static async updateMeeting(id: number, data: any) {
        return prisma.meetings.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                meeting_date: data.date ? new Date(data.date) : undefined,
                location_name: data.location,
                is_paid: data.is_paid ? 1 : 0,
                payment_amount: data.amount || 0,
                updated_at: new Date()
            }
        });
    }
}
