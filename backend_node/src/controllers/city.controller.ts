import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getCities = async (req: Request, res: Response) => {
    try {
        // If it's a super admin, they can see all cities.
        // For now, we'll just return all cities.
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' }
        });
        return res.json(cities);
    } catch (error: any) {
        console.error('getCities Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCity = async (req: Request, res: Response) => {
    try {
        const { name, slug, domain, timezone } = req.body;
        if (!name || !slug) return res.status(400).json({ message: 'Name and slug are required' });

        const city = await prisma.city.create({
            data: { name, slug, domain, timezone }
        });
        return res.json(city);
    } catch (error: any) {
        console.error('createCity Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

export const updateCity = async (req: Request, res: Response) => {
    try {
        const { id, name, slug, domain, timezone, theme_config, email_from_name, email_from_addr } = req.body;
        if (!id) return res.status(400).json({ message: 'ID is required' });

        const city = await prisma.city.update({
            where: { id: Number(id) },
            data: { 
                name, 
                slug, 
                domain, 
                timezone, 
                theme_config,
                email_from_name,
                email_from_addr
            }
        });
        return res.json(city);
    } catch (error: any) {
        console.error('updateCity Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
