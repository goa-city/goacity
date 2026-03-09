import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { created_at: 'desc' }
        });
        return res.json(templates);
    } catch (error: any) {
        console.error('Get Email Templates Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { title, subject, message } = req.body;
        
        if (!title || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const template = await prisma.emailTemplate.create({
            data: { title, subject, message }
        });

        return res.json({ success: true, template });
    } catch (error: any) {
        console.error('Create Email Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, subject, message } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'ID required' });

        const template = await prisma.emailTemplate.update({
            where: { id: parseInt(id as string) },
            data: { title, subject, message, updated_at: new Date() }
        });

        return res.json({ success: true, template });
    } catch (error: any) {
        console.error('Update Email Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID required' });
        
        await prisma.emailTemplate.delete({
            where: { id: parseInt(id as string) }
        });
        return res.json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
        console.error('Delete Email Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID required' });

        const template = await prisma.emailTemplate.findUnique({
            where: { id: parseInt(id as string) }
        });
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
        return res.json(template);
    } catch (error: any) {
        console.error('Get Email Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
