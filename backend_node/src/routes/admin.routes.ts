import { Router } from 'express';
import { login, getMe } from '../controllers/admin-auth.controller.js';
import { 
    getUsers, createUser, updateUser, deleteUser, getMemberStats,
    getAdmins, createAdmin, updateAdmin, 
    getAdminJobs, createJob, updateJob, deleteJob, 
    getAdminResources, createResource, updateResource, deleteResource, 
    getAdminPosts, deletePost 
} from '../controllers/admin.controller.js';
import { getStreams, createStream, updateStream, deleteStream } from '../controllers/streams.controller.js';
import { getForms, createForm, updateForm, archiveForm, deleteForm } from '../controllers/forms.controller.js';
import { 
    getMeetings, uploadMeetingResource, createMeeting, 
    archiveMeeting, deleteMeeting, getMeetingResponses, 
    getMeetingActions, notifyMeetingMembers, deleteMeetingResource,
    getStats
} from '../controllers/meetings.controller.js';
import { getAdminPages, createPage, updatePage, getAdminPageById, deletePage } from '../controllers/pages.controller.js';
import { getWhatsAppStatus, sendWhatsAppMessage, getWhatsAppLogs, broadcastWhatsApp, sendMeetingAlert, refreshWhatsApp, restartWhatsApp, getWhatsAppBroadcasts, getWhatsAppBroadcastById, hideWhatsAppBroadcast, retryWhatsAppBroadcast } from '../controllers/whatsapp.controller.js';
import { getTemplates as getEmailTemplates, createTemplate as createEmailTemplate, updateTemplate as updateEmailTemplate, deleteTemplate as deleteEmailTemplate, getTemplateById as getEmailTemplateById } from '../controllers/email-template.controller.js';
import { getTemplates as getWhatsAppTemplates, createTemplate as createWhatsAppTemplate, updateTemplate as updateWhatsAppTemplate, deleteTemplate as deleteWhatsAppTemplate, getTemplateById as getWhatsAppTemplateById } from '../controllers/whatsapp-template.controller.js';
import { validate } from '../middleware/validate.js';
import { 
    createEmailTemplateSchema, updateEmailTemplateSchema,
    createWhatsAppTemplateSchema, updateWhatsAppTemplateSchema 
} from '../validations/template.schema.js';
import { createMemberSchema, updateMemberSchema } from '../validations/member.schema.js';
import { createMeetingSchema, updateMeetingSchema } from '../validations/meeting.schema.js';
import { createStreamSchema, updateStreamSchema } from '../validations/stream.schema.js';
import { createPageSchema, updatePageSchema } from '../validations/page.schema.js';
import { createJobSchema, updateJobSchema } from '../validations/job.schema.js';
import { createResourceSchema, updateResourceSchema } from '../validations/resource.schema.js';
import { createFormSchema, updateFormSchema } from '../validations/form.schema.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + (ext ? '.' + ext : ''));
    }
});
const upload = multer({ storage });

// Public Admin Routes
router.post('/login', login);

// Protected Admin Routes
router.use(authMiddleware);

router.get('/me', getMe);

// Members
router.get('/users', getUsers);
router.get('/member-stats', getMemberStats);
router.post('/users', validate(createMemberSchema), createUser);
router.put('/users', validate(updateMemberSchema), updateUser);
router.delete('/users', deleteUser);

// Admins
router.get('/admins', getAdmins);
router.post('/admins', validate(createMemberSchema), createAdmin);
router.put('/admins', validate(updateMemberSchema), updateAdmin);

// Jobs
router.get('/jobs', getAdminJobs);
router.post('/jobs', validate(createJobSchema), createJob);
router.put('/jobs', validate(updateJobSchema), updateJob);
router.delete('/jobs', deleteJob);

// Resources
router.get('/resources', getAdminResources);
router.post('/resources', validate(createResourceSchema), createResource);
router.put('/resources', validate(updateResourceSchema), updateResource);
router.delete('/resources', deleteResource);

// Posts
router.get('/posts', getAdminPosts);
router.delete('/posts', deletePost);

// Streams
router.get('/streams', getStreams);
router.post('/streams', validate(createStreamSchema), createStream);
router.put('/streams/:id', validate(updateStreamSchema), updateStream);
router.delete('/streams/:id', deleteStream);

// Forms
router.get('/forms', getForms);
router.post('/forms', validate(createFormSchema), createForm);
router.put('/forms', validate(updateFormSchema), updateForm);
router.post('/forms/archive', archiveForm);
router.delete('/forms', deleteForm);

// Email Templates
router.get('/email-templates', getEmailTemplates);
router.post('/email-templates', validate(createEmailTemplateSchema), createEmailTemplate);
router.get('/email-templates/:id', getEmailTemplateById);
router.put('/email-templates/:id', validate(updateEmailTemplateSchema), updateEmailTemplate);
router.delete('/email-templates/:id', deleteEmailTemplate);

// WhatsApp Templates
router.get('/whatsapp-templates', getWhatsAppTemplates);
router.post('/whatsapp-templates', validate(createWhatsAppTemplateSchema), createWhatsAppTemplate);
router.get('/whatsapp-templates/:id', getWhatsAppTemplateById);
router.put('/whatsapp-templates/:id', validate(updateWhatsAppTemplateSchema), updateWhatsAppTemplate);
router.delete('/whatsapp-templates/:id', deleteWhatsAppTemplate);

// Meetings
router.get('/meetings', getMeetings);
router.post('/meetings', upload.single('payment_qr_image'), validate(createMeetingSchema), createMeeting);
router.post('/meetings/archive', archiveMeeting);
router.delete('/meetings', deleteMeeting);
router.get('/meetings/:id/responses', getMeetingResponses);
router.get('/meetings/:id/actions', getMeetingActions);
router.post('/meetings/:id/notify', notifyMeetingMembers);
router.post('/meetings/:id/resources', upload.single('file'), uploadMeetingResource);
router.delete('/meetings/resources/:id', deleteMeetingResource);

// Stats
router.get('/stats', getStats);

// Pages
router.get('/pages', getAdminPages);
router.post('/pages', validate(createPageSchema), createPage);
router.get('/pages/:id', getAdminPageById);
router.put('/pages/:id', validate(updatePageSchema), updatePage);
router.delete('/pages/:id', deletePage);

// WhatsApp
router.get('/whatsapp/status', getWhatsAppStatus);
router.post('/whatsapp/send', sendWhatsAppMessage);
router.get('/whatsapp/logs/:memberId', getWhatsAppLogs);
router.post('/whatsapp/broadcast', broadcastWhatsApp);
router.post('/whatsapp/meeting-alert', sendMeetingAlert);
router.post('/whatsapp/refresh', refreshWhatsApp);
router.post('/whatsapp/restart', restartWhatsApp);
router.get('/whatsapp/broadcasts', getWhatsAppBroadcasts);
router.delete('/whatsapp/broadcasts/:id', hideWhatsAppBroadcast);
router.get('/whatsapp/broadcasts/:id', getWhatsAppBroadcastById);
router.post('/whatsapp/broadcasts/:id/retry', retryWhatsAppBroadcast);

export default router;
