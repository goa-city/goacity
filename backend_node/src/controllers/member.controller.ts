import type { Request, Response, NextFunction } from 'express';
import { MemberService } from '../services/member.service.js';
import { PostService } from '../services/post.service.js';
import { ResourceService } from '../services/resource.service.js';
import { sendEmail } from '../utils/email.js';
import path from 'path';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MemberService.getDashboardData(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MemberService.getProfile(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await MemberService.updateProfile(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const postData = req.body;
        
        if (req.file) {
            postData.media_url = `/uploads/${req.file.filename}`;
            const ext = path.extname(req.file.originalname).toLowerCase();
            if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
                postData.media_type = 'video';
            } else {
                postData.media_type = 'image';
            }
        }

        const result = await PostService.createPost(userId, postData);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await ResourceService.createJob(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const createResource = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const files = (req as any).files as Express.Multer.File[] || [];
        const attachmentFile = files.find(f => f.fieldname === 'file');
        const imageFile = files.find(f => f.fieldname === 'image');
        
        const resourceData = {
            ...req.body,
            file_path: attachmentFile ? `uploads/${attachmentFile.filename}` : undefined,
            file_name: attachmentFile ? attachmentFile.originalname : undefined,
            image_url: imageFile ? `/uploads/${imageFile.filename}` : undefined,
        };
        const result = await ResourceService.createResource(userId, resourceData);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ResourceService.getJobs();
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await ResourceService.getJobByIdOrSlug(id as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { full_name, email, phone, message } = req.body;
        
        // Handle CV file
        const file = req.file;
        if (!file) throw new Error('CV is required');
        
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
            throw new Error('Only PDF and Word documents are allowed');
        }
        
        const cv_url = `/uploads/${file.filename}`;
        
        // Resolve Job ID if slug is passed
        const job = await ResourceService.getJobByIdOrSlug(id as string);
        const jobId = job.id;

        await ResourceService.applyForJob(userId, jobId, {
            full_name, email, phone, message, cv_url
        });

        // Send Email Alerts
        const emailSubject = `New Job Application: ${job.title} at ${job.company}`;
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">New Job Application</h2>
                <p><strong>Job Title:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <h3 style="color: #111827;">Applicant Details</h3>
                <p><strong>Name:</strong> ${full_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">${message || 'No message provided'}</p>
                <p><strong>CV:</strong> <a href="https://goa.city${cv_url}" style="color: #4f46e5; font-weight: bold;">Download CV</a></p>
            </div>
        `;

        // 1. Send to Contact Email (if specified)
        if (job.contact_email) {
            await sendEmail(job.contact_email, emailSubject, emailHtml);
        }

        // 2. Send to Job Poster (if different from contact email)
        if (job.poster && job.poster.email && job.poster.email !== job.contact_email) {
            await sendEmail(job.poster.email, emailSubject, emailHtml);
        }

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getResources = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.query;
        const result = await ResourceService.getResources(category as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getNewsFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page } = req.query;
        const result = await PostService.getFeed(Number(page) || 1);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const result = await PostService.likePost(userId, Number(id));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        await PostService.deletePost(Number(id), userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const result = await PostService.updatePost(Number(id), userId, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const registerPublicMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];
        const result = await MemberService.registerPublicMember(req.body, files);
        res.json({ 
            success: true, 
            message: 'Registration successful! Your application is being reviewed.',
            data: result 
        });
    } catch (error) {
        next(error);
    }
};

export const getMyPostings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const result = await ResourceService.getMyJobPostings(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getPostingApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { jobId } = req.params;
        const result = await ResourceService.getJobApplications(userId, Number(jobId));
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updatePostingApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { applicationId } = req.params;
        const { status, notes } = req.body;
        const result = await ResourceService.updateApplicationStatus(userId, Number(applicationId), status, notes);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
