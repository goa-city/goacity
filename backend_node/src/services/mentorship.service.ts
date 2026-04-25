import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class MentorshipService {
    static async requestMentorship(menteeId: number, data: any) {
        return prisma.mentorshipRelation.create({
            data: {
                mentor_id: Number(data.mentor_id),
                mentee_id: menteeId,
                type: data.type,
                focus_area: data.focus_area,
                status: 'Requested'
            }
        });
    }

    static async getMyMentorships(userId: number) {
        return prisma.mentorshipRelation.findMany({
            where: {
                OR: [
                    { mentor_id: userId },
                    { mentee_id: userId }
                ]
            },
            include: {
                mentor: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true }
                },
                mentee: {
                    select: { id: true, first_name: true, last_name: true, profile_photo: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getById(id: string) {
        const relation = await prisma.mentorshipRelation.findUnique({
            where: { id },
            include: {
                mentor: true,
                mentee: true
            }
        });
        if (!relation) throw new AppError('Mentorship relation not found', 404);
        return relation;
    }

    static async updateGoals(id: string, goals: any) {
        return prisma.mentorshipRelation.update({
            where: { id },
            data: {
                goals_json: goals,
                updated_at: new Date()
            }
        });
    }

    static async getAdminMentorships() {
        return prisma.mentorshipRelation.findMany({
            include: {
                mentor: true,
                mentee: true
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async updateStatus(id: string, status: string) {
        return prisma.mentorshipRelation.update({
            where: { id },
            data: { status }
        });
    }
}
