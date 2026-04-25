import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class AdminMemberService {
    static async getAllMembers() {
        const members = await prisma.member.findMany({
            include: { streams: { include: { stream: true } } },
            orderBy: { id: 'desc' }
        });

        return members.map((m: any) => ({
            ...m,
            streams: m.streams.map((sm: any) => ({
                id: sm.stream.id,
                name: sm.stream.name,
                color: sm.stream.color
            })),
            stream_names: m.streams.map((sm: any) => sm.stream.name)
        }));
    }

    static async getMemberDetail(id: number) {
        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                streams: { include: { stream: true } },
                profiles: true,
                responses: {
                    include: { form: true, answers: true },
                    orderBy: { submitted_at: 'desc' }
                }
            }
        });

        if (!member) throw new AppError('Member not found', 404);

        // Transform profiles to key-value
        const profileMap: Record<string, any> = {};
        member.profiles.forEach(p => {
            profileMap[p.profile_key] = p.profile_value;
        });

        return {
            ...member,
            profileMap,
            stream_ids: member.streams.map(sm => sm.stream_id)
        };
    }

    static async updateMember(id: number, data: any) {
        const { stream_ids, ...directData } = data;

        return await prisma.$transaction(async (tx) => {
            // Update basic info
            await tx.member.update({
                where: { id },
                data: directData
            });

            // Update streams if provided
            if (stream_ids && Array.isArray(stream_ids)) {
                await tx.streamMember.deleteMany({ where: { user_id: id } });
                await tx.streamMember.createMany({
                    data: stream_ids.map(sid => ({
                        stream_id: Number(sid),
                        user_id: id
                    }))
                });
            }
        });
    }

    static async deleteMember(id: number) {
        // Full cleanup: streams, profiles, responses, member
        return await prisma.$transaction(async (tx) => {
            await tx.streamMember.deleteMany({ where: { user_id: id } });
            await tx.memberProfile.deleteMany({ where: { user_id: id } });
            await tx.formResponse.deleteMany({ where: { user_id: id } });
            await tx.member.delete({ where: { id } });
        });
    }
}
