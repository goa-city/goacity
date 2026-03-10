import type { Request, Response, NextFunction } from 'express';
import { requestContext } from '../lib/context.js';
import prisma from '../lib/prisma.js';

export interface CityRequest extends Request {
    cityId?: number;
    citySlug?: string;
    city?: any;
}

export const cityMiddleware = async (req: CityRequest, res: Response, next: NextFunction) => {
    try {
        const host = req.headers.host || '';
        const citySlugHeader = req.headers['x-city-slug'] as string;

        let city;

        // 1. Identify by Slug Header (Highest Priority - used by Admin switcher)
        if (citySlugHeader) {
            city = await (prisma as any).city.findUnique({
                where: { slug: citySlugHeader }
            });
        }

        // 2. Identify by Domain (Standard Priority - used by Public site)
        if (!city && host) {
            // Check if it matches a registered domain
            city = await (prisma as any).city.findUnique({
                where: { domain: host }
            });

            // Fallback for subdomains: e.g., pune.dashboard.city
            if (!city && host.includes('dashboard.city')) {
                const parts = host.split('.');
                if (parts.length > 2) {
                    const slug = parts[0];
                    city = await (prisma as any).city.findUnique({
                        where: { slug }
                    });
                }
            }
        }

        if (!city) {
            city = await (prisma as any).city.findUnique({
                where: { slug: 'goa' }
            });
        }

        if (city) {
            req.cityId = city.id;
            req.citySlug = city.slug;
            req.city = city;
        }

        // Run the rest of the request within the context
        requestContext.run({ 
            cityId: city?.id,
            adminId: undefined,
            memberId: undefined,
            isSuperAdmin: undefined
        }, () => {
            next();
        });
        
    } catch (error) {
        console.error('Error in cityMiddleware:', error);
        next();
    }
};
