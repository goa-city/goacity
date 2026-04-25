import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class IncubatorService {
    static async submitIdea(founderId: number, data: any) {
        return prisma.incubatorIdea.create({
            data: {
                founder_id: founderId,
                title: data.title,
                problem_statement: data.problem_statement,
                vision_purpose: data.vision_purpose,
                needs_json: data.needs || {},
                status: 'Submitted'
            }
        });
    }

    static async getActiveIdeas() {
        return prisma.incubatorIdea.findMany({
            where: { status: { in: ['Submitted', 'Under_Review', 'Validated', 'Launched'] } },
            include: {
                founder: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_photo: true
                    }
                },
                feedbacks: true
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getAdminIdeas() {
        return prisma.incubatorIdea.findMany({
            include: {
                founder: true,
                feedbacks: true
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async submitFeedback(contributorId: number, ideaId: string, data: any) {
        return prisma.ideaFeedback.create({
            data: {
                idea_id: ideaId,
                contributor_id: contributorId,
                comment: data.comment,
                type: data.type
            }
        });
    }

    static async updateStatus(ideaId: string, status: string) {
        return prisma.incubatorIdea.update({
            where: { id: ideaId },
            data: { status }
        });
    }
}
