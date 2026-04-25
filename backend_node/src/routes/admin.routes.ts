import { Router } from 'express';
import { login, getMe } from '../controllers/admin-auth.controller.js';
import { 
    getUsers, createUser, updateUser, 
    getAdmins, createAdmin, updateAdmin, 
    getAdminJobs, updateJob, deleteJob, 
    getAdminResources, updateResource, deleteResource, 
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
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public Admin Routes
router.post('/login', login);

// Protected Admin Routes
router.use(authMiddleware);

router.get('/me', getMe);

// Members
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users', updateUser);

// Admins
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins', updateAdmin);

// Jobs
router.get('/jobs', getAdminJobs);
router.put('/jobs', updateJob);
router.delete('/jobs', deleteJob);

// Resources
router.get('/resources', getAdminResources);
router.put('/resources', updateResource);
router.delete('/resources', deleteResource);

// Posts
router.get('/posts', getAdminPosts);
router.delete('/posts', deletePost);

// Streams
router.get('/streams', getStreams);
router.post('/streams', createStream);
router.put('/streams', updateStream);
router.delete('/streams', deleteStream);

// Forms
router.get('/forms', getForms);
router.post('/forms', createForm);
router.put('/forms', updateForm);

// Email Templates
router.get('/email-templates', getEmailTemplates);
router.post('/email-templates', createEmailTemplate);
router.get('/email-templates/:id', getEmailTemplateById);
router.put('/email-templates/:id', updateEmailTemplate);
router.delete('/email-templates/:id', deleteEmailTemplate);

// WhatsApp Templates
router.get('/whatsapp-templates', getWhatsAppTemplates);
router.post('/whatsapp-templates', createWhatsAppTemplate);
router.get('/whatsapp-templates/:id', getWhatsAppTemplateById);
router.put('/whatsapp-templates/:id', updateWhatsAppTemplate);
router.delete('/whatsapp-templates/:id', deleteWhatsAppTemplate);

// Meetings
router.get('/meetings', getMeetings);
router.post('/meetings', upload.single('payment_qr_image'), createMeeting);
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
router.post('/pages', createPage);
router.get('/pages/:id', getAdminPageById);
router.put('/pages/:id', updatePage);
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
