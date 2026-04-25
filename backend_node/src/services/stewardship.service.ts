import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { NotificationService } from './notification.service.js';

export class StewardshipService {
    static async getSummary(userId: number) {
        const logs = await prisma.stewardshipLog.findMany({
            where: { user_id: userId, status: 'Verified' }
        });

        const totalFinancial = logs
            .filter(l => l.type === 'Financial')
            .reduce((sum, l) => sum + Number(l.amount || 0), 0);

        const totalHours = logs
            .filter(l => l.type === 'Skill')
            .reduce((sum, l) => sum + Number(l.hours || 0), 0);

        return {
            totalFinancial,
            totalHours,
            verifiedCount: logs.length
        };
    }

    static async getMemberLogs(userId: number) {
        return prisma.stewardshipLog.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }

    static async createLog(userId: number, data: any) {
        return prisma.stewardshipLog.create({
            data: {
                user_id: userId,
                type: data.type,
                recipient_id: data.recipient_id ? Number(data.recipient_id) : null,
                amount: data.amount ? Number(data.amount) : null,
                hours: data.hours ? Number(data.hours) : null,
                date: data.date ? new Date(data.date) : new Date(),
                skill_category: data.skill_category,
                impact_note: data.impact_note,
                status: 'Pending'
            }
        });
    }

    static async getAllPendingLogs() {
        return prisma.stewardshipLog.findMany({
            where: { status: 'Pending' },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async verifyLog(logId: number, adminId: number) {
        const updated = await prisma.stewardshipLog.update({
            where: { id: logId },
            data: {
                status: 'Verified',
                updated_at: new Date()
            }
        });

        // Notify User
        await NotificationService.sendToUser(updated.user_id, {
            title: 'Impact Verified! 🌟',
            message: `Your ${updated.type} contribution has been verified by the city team.`,
            type: 'stewardship'
        });

        return updated;
    }

    static async rejectLog(logId: number, reason: string) {
        const updated = await prisma.stewardshipLog.update({
            where: { id: logId },
            data: {
                status: 'Rejected',
                impact_note: `Rejected: ${reason}`,
                updated_at: new Date()
            }
        });

        // Notify User
        await NotificationService.sendToUser(updated.user_id, {
            title: 'Stewardship Update',
            message: 'There was an issue verifying your contribution. Check the impact notes for details.',
            type: 'stewardship'
        });

        return updated;
    }

    static async getCitySummary() {
        const stats = await prisma.stewardshipLog.groupBy({
            by: ['type', 'status'],
            _sum: {
                amount: true,
                hours: true
            },
            _count: true
        });

        return stats;
    }

    static async getVerifiedOrgs() {
        return prisma.verificationOrg.findMany({
            where: { status: 'Active' },
            orderBy: { name: 'asc' }
        });
    }

    static async getMemberDirectory() {
        return prisma.member.findMany({
            // where: { is_onboarded: 1 },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                profile_photo: true,
                location: true,
                role: true
            },
            orderBy: { first_name: 'asc' }
        });
    }
}
