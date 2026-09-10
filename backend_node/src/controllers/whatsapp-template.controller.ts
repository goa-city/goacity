import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { PROTECTED_WHATSAPP_IDS } from '../config/constants.js';
import { AppError } from '../utils/errors.js';
import { processImageToWebp } from '../utils/image.js';

const formatTemplate = (template: any, baseUrl: string) => {
    return {
        ...template,
        image_url_display: template.image_url ? `${baseUrl}/uploads/${template.image_url}` : null
    };
};

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers.host || '';
        const baseUrl = (process.env.VITE_API_URL || `${protocol}://${host}`).replace(/\/api\/?$/, '');

        const templates = await prisma.whatsAppTemplate.findMany({
            orderBy: { created_at: 'desc' }
        });
        return res.json(templates.map(t => formatTemplate(t, baseUrl)));
    } catch (error: any) {
        console.error('Get WhatsApp Templates Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let imageUrl: string | null = null;
        if (req.file) {
            imageUrl = await processImageToWebp(req.file, 1200);
        }

        const template = await prisma.whatsAppTemplate.create({
            data: { 
                title, 
                content,
                image_url: imageUrl
            }
        });

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers.host || '';
        const baseUrl = (process.env.VITE_API_URL || `${protocol}://${host}`).replace(/\/api\/?$/, '');

        return res.json({ success: true, template: formatTemplate(template, baseUrl) });
    } catch (error: any) {
        console.error('Create WhatsApp Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, remove_image } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'ID required' });

        const existing = await prisma.whatsAppTemplate.findUnique({
            where: { id: parseInt(id as string) }
        });
        if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });

        const updateData: any = { updated_at: new Date() };
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;

        if (req.file) {
            updateData.image_url = await processImageToWebp(req.file, 1200);
        } else if (remove_image === 'true' || remove_image === true || remove_image === '1') {
            updateData.image_url = null;
        }

        const template = await prisma.whatsAppTemplate.update({
            where: { id: parseInt(id as string) },
            data: updateData
        });

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers.host || '';
        const baseUrl = (process.env.VITE_API_URL || `${protocol}://${host}`).replace(/\/api\/?$/, '');

        return res.json({ success: true, template: formatTemplate(template, baseUrl) });
    } catch (error: any) {
        console.error('Update WhatsApp Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) throw new AppError('ID required', 400);
        
        const templateId = parseInt(id as string);
        
        if (PROTECTED_WHATSAPP_IDS.includes(templateId)) {
            throw new AppError('Cannot delete system-protected template', 400);
        }

        await prisma.whatsAppTemplate.delete({
            where: { id: templateId }
        });
        return res.json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
        console.error('Delete WhatsApp Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID required' });

        const template = await prisma.whatsAppTemplate.findUnique({
            where: { id: parseInt(id as string) }
        });
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers.host || '';
        const baseUrl = (process.env.VITE_API_URL || `${protocol}://${host}`).replace(/\/api\/?$/, '');

        return res.json(formatTemplate(template, baseUrl));
    } catch (error: any) {
        console.error('Get WhatsApp Template Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
