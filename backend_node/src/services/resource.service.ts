import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export class ResourceService {
    // Jobs
    static async getJobs() {
        const now = new Date();
        return prisma.jobs.findMany({
            where: { 
                status: 'approved',
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: now } }
                ]
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getJobByIdOrSlug(idOrSlug: string | number) {
        const isNumeric = !isNaN(Number(idOrSlug));
        const job = await prisma.jobs.findFirst({
            where: {
                OR: [
                    { id: isNumeric ? Number(idOrSlug) : -1 },
                    { slug: idOrSlug as string }
                ]
            },
            include: {
                city: true
            }
        });

        if (!job) throw new AppError('Job not found', 404);
        
        // Find the member who posted it
        const poster = job.posted_by ? await prisma.member.findUnique({
            where: { id: job.posted_by },
            select: { id: true, first_name: true, last_name: true, email: true }
        }) : null;

        return { ...job, poster };
    }

    static async applyForJob(userId: number, jobId: number, data: any) {
        return prisma.jobApplication.create({
            data: {
                job_id: jobId,
                user_id: userId,
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                cv_url: data.cv_url
            }
        });
    }

    static async createJob(userId: number, data: any) {
        return prisma.jobs.create({
            data: {
                title: data.title,
                company: data.company,
                location: data.location,
                category: data.category,
                type: data.type,
                description: data.description,
                company_profile: data.company_profile,
                url: data.url,
                contact_email: data.contact_email,
                posted_by: userId,
                expires_at: data.expires_at ? new Date(data.expires_at) : null,
                status: 'pending' // Require admin approval
            }
        });
    }

    // Resources
    static async getResources(category?: string) {
        return prisma.resources.findMany({
            where: { 
                status: 'approved',
                ...(category && { category })
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async createResource(userId: number, data: any) {
        return prisma.resources.create({
            data: {
                title: data.title,
                category: data.category,
                author: data.author,
                url: data.url,
                description: data.description,
                content: data.content,
                submitted_by: userId,
                status: 'pending'
            }
        });
    }
}
