import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// GET /api/admin/streams
export const getStreams = async (_req: Request, res: Response) => {
    try {
        const streams = await prisma.stream.findMany({
            include: { members: true },
            orderBy: { id: 'asc' }
        });
        const result = streams.map((s: any) => ({
            ...s,
            member_count: s.members.length,
            members: undefined
        }));
        return res.json(result);
    } catch (error: any) {
        console.error('getStreams Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/streams
export const createStream = async (req: Request, res: Response) => {
    try {
        const { name, description, color, form_id } = req.body;
        const stream = await prisma.stream.create({
            data: { name, description, color: color || '#6366f1', form_id: form_id ? Number(form_id) : null }
        });
        return res.json({ message: 'Stream created', id: stream.id });
    } catch (error: any) {
        console.error('createStream Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/streams
export const updateStream = async (req: Request, res: Response) => {
    try {
        const { id, name, description, color, form_id } = req.body;
        await prisma.stream.update({
            where: { id: Number(id) },
            data: { name, description, color, form_id: form_id ? Number(form_id) : null }
        });
        return res.json({ message: 'Stream updated' });
    } catch (error: any) {
        console.error('updateStream Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/streams
export const deleteStream = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ message: 'Stream ID required' });
        await prisma.streamMember.deleteMany({ where: { stream_id: Number(id) } });
        await prisma.stream.delete({ where: { id: Number(id) } });
        return res.json({ message: 'Stream deleted' });
    } catch (error: any) {
        console.error('deleteStream Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
