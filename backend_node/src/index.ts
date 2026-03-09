
import 'dotenv/config'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendOtp, verifyOtp, adminLogin } from './controllers/auth.controller.js';
import { getUsers, createUser, updateUser, getAdmins, createAdmin, updateAdmin, getAdminJobs, updateJob, deleteJob, getAdminResources, updateResource, deleteResource, getAdminPosts, deletePost } from './controllers/admin.controller.js';
import { getStreams, createStream, updateStream, deleteStream } from './controllers/streams.controller.js';
import { getForms, createForm, updateForm, getFormWithFields, submitOnboarding, submitForm, archiveForm, deleteForm } from './controllers/forms.controller.js';
import { getMeetings, getMemberMeetings, createMeeting, getStats, getPosts, archiveMeeting, deleteMeeting, getMeeting, getMeetingResponses, getMeetingActions, uploadMeetingResource, deleteMeetingResource, notifyMeetingMembers } from './controllers/meetings.controller.js';
import { getDashboard, getProfile, updateProfile, meetingAction, createPost, createJob, createResource, getJobs, getResources } from './controllers/member.controller.js';
import { getStewardshipSummary, getMemberLogs, getVerifiedOrgs, getMemberDirectory, createStewardshipLog, getAllLogs, getAdminRecipients, updateRecipientStatus, approveLog, addImpactNote, createAdminRecipient } from './controllers/stewardship.controller.js';
import { requestMentorship, getMyMentorships, getMentorshipById, updateMentorshipGoals, getAdminMentorships, updateMentorshipStatus, exportMentorshipReport } from './controllers/mentorship.controller.js';
import { submitIdea, getActiveIdeas, submitFeedback, getAdminIdeas, updateIdeaStatus, getIdeaMatches } from './controllers/incubator.controller.js';
import { getMyPeople, getMemberProfile, requestCollaboration, getAdminCollabs, updateCollabStatus, getDashboardCollabs, devAutoTestCollab } from './controllers/collab.controller.js';
import { getPage, getAdminPages, createPage, updatePage, deletePage, getAdminPageById } from './controllers/pages.controller.js';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateById } from './controllers/email-template.controller.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

// Better Multer Configuration
const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
        cb(null, 'uploads/');
    },
    filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (_req: any, file: any, cb: any) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Images, videos, PDF, Word, and PPT are allowed.`), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// ---- Auth Routes (Public) ----
app.post('/api/auth/send-otp', sendOtp);
app.post('/api/auth/verify-otp', verifyOtp);
app.post('/api/auth/admin-login', adminLogin);

// ---- Admin Routes ----
// Users (Members management)
app.get('/api/admin/users', authMiddleware, getUsers);
app.post('/api/admin/users', authMiddleware, createUser);
app.put('/api/admin/users', authMiddleware, updateUser);

// Admin Users (System Admins management)
app.get('/api/admin/admins', authMiddleware, getAdmins);
app.post('/api/admin/admins', authMiddleware, createAdmin);
app.put('/api/admin/admins', authMiddleware, updateAdmin);

// Streams
app.get('/api/admin/streams', authMiddleware, getStreams);
app.post('/api/admin/streams', authMiddleware, createStream);
app.put('/api/admin/streams', authMiddleware, updateStream);
app.delete('/api/admin/streams', authMiddleware, deleteStream);

// Forms
app.get('/api/admin/forms', authMiddleware, getForms);
app.post('/api/admin/forms', authMiddleware, createForm);
app.put('/api/admin/forms', authMiddleware, updateForm);
app.post('/api/admin/forms/archive', authMiddleware, archiveForm);
app.delete('/api/admin/forms', authMiddleware, deleteForm);

app.get('/api/admin/meetings', authMiddleware, getMeetings);
app.post('/api/admin/meetings', authMiddleware, upload.single('payment_qr_image'), createMeeting);
app.post('/api/admin/meetings/archive', authMiddleware, archiveMeeting);
app.delete('/api/admin/meetings', authMiddleware, deleteMeeting);
app.get('/api/admin/meetings/:id/responses', authMiddleware, getMeetingResponses);
app.get('/api/admin/meetings/:id/actions', authMiddleware, getMeetingActions);
app.post('/api/admin/meetings/:id/notify', authMiddleware, notifyMeetingMembers);
app.post('/api/admin/meetings/:id/resources', authMiddleware, upload.single('file'), uploadMeetingResource);
app.delete('/api/admin/meetings/resources/:id', authMiddleware, deleteMeetingResource);

// Stats
app.get('/api/admin/stats', authMiddleware, getStats);

// Jobs (Admin)
app.get('/api/admin/jobs', authMiddleware, getAdminJobs);
app.put('/api/admin/jobs', authMiddleware, updateJob);
app.delete('/api/admin/jobs', authMiddleware, deleteJob);

// Resources (Admin)
app.get('/api/admin/resources', authMiddleware, getAdminResources);
app.put('/api/admin/resources', authMiddleware, updateResource);
app.delete('/api/admin/resources', authMiddleware, deleteResource);

// News / Posts (Admin)
app.get('/api/admin/posts', authMiddleware, getAdminPosts);
app.delete('/api/admin/posts', authMiddleware, deletePost);

// Stewardship (Admin)
app.get('/api/admin/stewardship/pending', authMiddleware, getAllLogs);
app.get('/api/admin/stewardship/recipients', authMiddleware, getAdminRecipients);
app.post('/api/admin/stewardship/recipients', authMiddleware, createAdminRecipient);
app.put('/api/admin/stewardship/recipients/:id', authMiddleware, updateRecipientStatus);
app.put('/api/admin/stewardship/logs/:id/verify', authMiddleware, approveLog);
app.post('/api/admin/stewardship/logs/:id/impact', authMiddleware, addImpactNote);

// Mentorship (Admin)
app.get('/api/admin/mentorship', authMiddleware, getAdminMentorships);
app.put('/api/admin/mentorship/:id/status', authMiddleware, updateMentorshipStatus);
app.get('/api/admin/mentorship/export', authMiddleware, exportMentorshipReport);

// Incubator (Admin)
app.get('/api/admin/incubator', authMiddleware, getAdminIdeas);
app.put('/api/admin/incubator/:id/status', authMiddleware, updateIdeaStatus);
app.get('/api/admin/incubator/:id/matches', authMiddleware, getIdeaMatches);

// Collab (Admin)
app.get('/api/admin/collabs', authMiddleware, getAdminCollabs);
app.put('/api/admin/collabs/:id/status', authMiddleware, updateCollabStatus);

// Pages (Admin)
app.get('/api/admin/pages', authMiddleware, getAdminPages);
app.get('/api/admin/pages/:id', authMiddleware, getAdminPageById);
app.post('/api/admin/pages', authMiddleware, createPage);
app.put('/api/admin/pages/:id', authMiddleware, updatePage);
app.delete('/api/admin/pages/:id', authMiddleware, deletePage);

// Email Templates
app.get('/api/admin/email-templates', authMiddleware, getTemplates);
app.get('/api/admin/email-templates/:id', authMiddleware, getTemplateById);
app.post('/api/admin/email-templates', authMiddleware, createTemplate);
app.put('/api/admin/email-templates/:id', authMiddleware, updateTemplate);
app.delete('/api/admin/email-templates/:id', authMiddleware, deleteTemplate);

// ---- Member Routes (Protected) ----
app.get('/api/member/dashboard', authMiddleware, getDashboard);
app.get('/api/member/profile', authMiddleware, getProfile);
app.post('/api/member/profile', authMiddleware, updateProfile);

// Stewardship (Member)
app.get('/api/members/stewardship_summary', authMiddleware, getStewardshipSummary);
app.get('/api/members/stewardship_logs', authMiddleware, getMemberLogs);
app.get('/api/members/verified_orgs', authMiddleware, getVerifiedOrgs);
app.get('/api/members/directory', authMiddleware, getMemberDirectory);
app.post('/api/members/stewardship_log', authMiddleware, createStewardshipLog);

// Mentorship (Member)
app.post('/api/mentorship/request', authMiddleware, requestMentorship);
app.get('/api/mentorship', authMiddleware, getMyMentorships);
app.get('/api/mentorship/:id', authMiddleware, getMentorshipById);
app.put('/api/mentorship/:id/goals', authMiddleware, updateMentorshipGoals);

// Incubator (Member)
app.post('/api/incubator', authMiddleware, submitIdea);
app.get('/api/incubator', authMiddleware, getActiveIdeas);
app.post('/api/incubator/:id/feedback', authMiddleware, submitFeedback);

// My People & Collaboration (Member)
app.get('/api/my-people', authMiddleware, getMyPeople);
app.get('/api/profile/:id', authMiddleware, getMemberProfile);
app.post('/api/collaboration/request', authMiddleware, requestCollaboration);
app.get('/api/dashboard/collabs', authMiddleware, getDashboardCollabs);
app.post('/api/dev/collab-test/:id', authMiddleware, devAutoTestCollab);

// Onboarding & Form Submissions (Protected)
app.post('/api/member/onboarding', authMiddleware, upload.any(), submitOnboarding);
app.post('/api/member/submit-form', authMiddleware, upload.any(), submitForm);

// ---- Public/Semi-public Routes ----
// Meetings (member-facing)
app.get('/api/meetings', getMemberMeetings);
app.get('/api/meetings/:id', authMiddleware, getMeeting);

// Posts
app.get('/api/posts', getPosts);
app.post('/api/posts', upload.single('file'), createPost);

// Forms (member-facing)
app.get('/api/forms/get', getFormWithFields);

// Meeting Actions
app.post('/api/meeting-actions', meetingAction);

// Jobs — member-facing (approved only by default)
app.get('/api/jobs', getJobs);
app.post('/api/jobs', upload.any(), createJob);

// Resources — member-facing (approved only by default)
app.get('/api/resources', getResources);
app.post('/api/resources', upload.any(), createResource);

// Public Pages
app.get('/api/pages/:slug', getPage);

// Health
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
