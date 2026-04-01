import type { Response } from 'express';
import prisma from '../lib/prisma.js';

export const globalSearch = async (req: any, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query || query.trim().length < 2) {
            return res.json({ data: { members: [], meetings: [], pages: [], jobs: [] } });
        }

        const cityId = req.cityId || 1;
        const searchStr = query.trim();

        // Use Prisma contains insensitive
        const members = await prisma.member.findMany({
            where: {
                city_id: cityId,
                OR: [
                    { first_name: { contains: searchStr, mode: 'insensitive' } },
                    { last_name: { contains: searchStr, mode: 'insensitive' } },
                    { email: { contains: searchStr, mode: 'insensitive' } },
                    { bio: { contains: searchStr, mode: 'insensitive' } },
                    { village: { contains: searchStr, mode: 'insensitive' } },
                    { location: { contains: searchStr, mode: 'insensitive' } }
                ]
            },
            select: { id: true, first_name: true, last_name: true, profile_photo: true, role: true },
            take: 5
        });

        const meetings = await prisma.meetings.findMany({
            where: {
                city_id: cityId,
                archived: 0,
                OR: [
                    { title: { contains: searchStr, mode: 'insensitive' } },
                    { location_name: { contains: searchStr, mode: 'insensitive' } },
                    { description: { contains: searchStr, mode: 'insensitive' } }
                ]
            },
            select: { id: true, title: true, meeting_date: true, location_name: true, start_time: true },
            take: 5
        });

        const pages = await prisma.page.findMany({
            where: {
                city_id: cityId,
                OR: [
                    { title: { contains: searchStr, mode: 'insensitive' } },
                    { content: { contains: searchStr, mode: 'insensitive' } }
                ]
            },
            select: { id: true, slug: true, title: true },
            take: 5
        });

        const jobs = await prisma.jobs.findMany({
            where: {
                city_id: cityId,
                status: 'approved',
                OR: [
                    { title: { contains: searchStr, mode: 'insensitive' } },
                    { company: { contains: searchStr, mode: 'insensitive' } },
                    { description: { contains: searchStr, mode: 'insensitive' } }
                ]
            },
            select: { id: true, title: true, company: true, url: true },
            take: 5
        });

        res.json({
            data: {
                members,
                meetings,
                pages,
                jobs
            }
        });
    } catch (error) {
        console.error("Global search error", error);
        res.status(500).json({ message: "Search failed" });
    }
};
