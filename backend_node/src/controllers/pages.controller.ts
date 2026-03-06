import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// GET /api/pages/:slug - get a single page by slug
export const getPage = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        if (typeof slug !== 'string') return res.status(400).json({ message: 'Invalid slug' });

        const page = await prisma.page.findUnique({
            where: { slug }
        });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        return res.json(page);
    } catch (error: any) {
        console.error('getPage Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/pages - list all pages (admin only)
export const getAdminPages = async (req: Request, res: Response) => {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { created_at: 'desc' }
        });
        return res.json(pages);
    } catch (error: any) {
        console.error('getAdminPages Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/pages - create a new page
export const createPage = async (req: Request, res: Response) => {
    try {
        const { title, slug, content } = req.body;
        const page = await prisma.page.create({
            data: { title, slug, content }
        });
        return res.json({ message: 'Page created', page });
    } catch (error: any) {
        console.error('createPage Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/pages/:id - update a page
export const updatePage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, slug, content } = req.body;
        const page = await prisma.page.update({
            where: { id: Number(id) },
            data: { title, slug, content, updated_at: new Date() }
        });
        return res.json({ message: 'Page updated', page });
    } catch (error: any) {
        console.error('updatePage Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/pages/:id - delete a page
export const deletePage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.page.delete({
            where: { id: Number(id) }
        });
        return res.json({ message: 'Page deleted' });
    } catch (error: any) {
        console.error('deletePage Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
