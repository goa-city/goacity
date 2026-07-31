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

    static async getMemberDirectory(filters?: { willing_to_mentor?: boolean; search?: string; area?: string }) {
        const whereClause: any = {};

        if (filters?.willing_to_mentor) {
            whereClause.OR = [
                { willing_to_mentor: true },
                { is_mentor: true }
            ];
            whereClause.mentorProfile = {
                is_approved: true
            };
        }

        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            whereClause.AND = whereClause.AND || [];
            whereClause.AND.push({
                OR: [
                    { first_name: { contains: searchLower, mode: 'insensitive' } },
                    { last_name: { contains: searchLower, mode: 'insensitive' } },
                    { bio: { contains: searchLower, mode: 'insensitive' } }
                ]
            });
        }

        const members = await prisma.member.findMany({
            where: whereClause,
            select: {
                id: true,
                first_name: true,
                last_name: true,
                profile_photo: true,
                location: true,
                role: true,
                bio: true,
                willing_to_mentor: true,
                is_mentor: true,
                mentorProfile: {
                    select: {
                        expertise: true,
                        bio: true,
                        capacity: true
                    }
                },
                mentorshipsAsMentor: {
                    where: { status: 'Active' },
                    select: { id: true }
                }
            },
            orderBy: { first_name: 'asc' }
        });

        let results = members.map(m => {
            const activeCount = m.mentorshipsAsMentor.length;
            const capacity = m.mentorProfile?.capacity ?? 2;
            const expertise = Array.isArray(m.mentorProfile?.expertise) ? (m.mentorProfile.expertise as string[]) : [];
            return {
                id: m.id,
                first_name: m.first_name,
                last_name: m.last_name,
                profile_photo: m.profile_photo,
                location: m.location,
                role: m.role,
                willing_to_mentor: m.willing_to_mentor,
                is_mentor: m.is_mentor,
                bio: m.mentorProfile?.bio || m.bio,
                expertise,
                active_count: activeCount,
                capacity,
                at_capacity: activeCount >= capacity
            };
        });

        if (filters?.area) {
            const areaLower = filters.area.toLowerCase();
            results = results.filter(r => 
                r.expertise.some((e: string) => e.toLowerCase().includes(areaLower))
            );
        }

        return results;
    }
}
