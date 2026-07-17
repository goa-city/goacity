import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.js';

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
                work_arrangement: data.work_arrangement || 'Onsite',
                salary_min: data.salary_min ? Number(data.salary_min) : null,
                salary_max: data.salary_max ? Number(data.salary_max) : null,
                salary_currency: data.salary_currency || 'INR',
                status: 'pending' // Require admin approval
            }
        });
    }

    static async getMyJobPostings(userId: number) {
        return prisma.jobs.findMany({
            where: { posted_by: userId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getJobApplications(userId: number, jobId: number) {
        const job = await prisma.jobs.findUnique({
            where: { id: jobId }
        });
        if (!job || job.posted_by !== userId) {
            throw new AppError('Job not found or access denied', 403);
        }
        return prisma.jobApplication.findMany({
            where: { job_id: jobId },
            orderBy: { created_at: 'desc' }
        });
    }

    static async updateApplicationStatus(userId: number, applicationId: number, status: string, notes?: string) {
        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });
        if (!application || application.job.posted_by !== userId) {
            throw new AppError('Application not found or access denied', 403);
        }
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status, notes }
        });

        // Send status update email notification to the applicant
        try {
            const emailSubject = `Application Status Update: ${application.job.title} at ${application.job.company}`;
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                     <h2 style="color: #4f46e5;">Application Status Update</h2>
                     <p>Dear ${application.full_name},</p>
                     <p>Your application status for the position of <strong>${application.job.title}</strong> at <strong>${application.job.company}</strong> has been updated to:</p>
                     <p style="background: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: bold; color: #111827; text-transform: uppercase;">
                         ${status}
                     </p>
                     ${notes ? `<p><strong>Recruiter Notes:</strong></p><p style="background: #f9fafb; padding: 15px; border-radius: 8px; font-style: italic;">${notes}</p>` : ''}
                     <p>Best regards,</p>
                     <p>The ${application.job.company} Recruitment Team</p>
                </div>
            `;
            await sendEmail(application.email, emailSubject, emailHtml);
        } catch (err) {
            console.error('Failed to send status update email:', err);
        }

        return updated;
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
                file_path: data.file_path,
                file_name: data.file_name,
                image_url: data.image_url,
                status: 'pending'
            }
        });
    }
}
