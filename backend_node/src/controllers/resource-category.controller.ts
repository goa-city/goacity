import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

// --- Member Endpoints ---

export const getResourceCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.resourceCategory.findMany({
            orderBy: { name: 'asc' }
        });
        return res.json(categories);
    } catch (error) {
        next(error);
    }
};

// --- Admin Endpoints ---

export const getAdminResourceCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.resourceCategory.findMany({
            orderBy: { name: 'asc' }
        });
        return res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const createAdminResourceCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const normalized = name.trim();
        const existing = await prisma.resourceCategory.findUnique({
            where: { name: normalized }
        });
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await prisma.resourceCategory.create({
            data: { name: normalized }
        });
        return res.json({ message: 'Category created', id: category.id, category });
    } catch (error) {
        next(error);
    }
};

export const updateAdminResourceCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!id) return res.status(400).json({ message: 'id parameter required' });
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const categoryId = Number(id);
        const normalized = name.trim();

        // Check if name is taken by another category
        const existing = await prisma.resourceCategory.findFirst({
            where: {
                name: normalized,
                id: { not: categoryId }
            }
        });
        if (existing) {
            return res.status(400).json({ message: 'Category name already exists' });
        }

        const category = await prisma.resourceCategory.update({
            where: { id: categoryId },
            data: { name: normalized }
        });
        return res.json({ message: 'Category updated', category });
    } catch (error) {
        next(error);
    }
};

export const deleteAdminResourceCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'id parameter required' });

        const categoryId = Number(id);

        // Fetch category to get its name
        const cat = await prisma.resourceCategory.findUnique({
            where: { id: categoryId }
        });
        if (!cat) return res.status(404).json({ message: 'Category not found' });

        // Check if there are any resources using this category
        const resourcesUsingCategory = await prisma.resources.findFirst({
            where: { category: cat.name }
        });
        if (resourcesUsingCategory) {
            return res.status(400).json({ 
                message: `Cannot delete category because resources exist under "${cat.name}". Please delete or update those resources first.` 
            });
        }

        await prisma.resourceCategory.delete({
            where: { id: categoryId }
        });
        return res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};
