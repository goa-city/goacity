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
    getMeetingActions, notifyMeetingMembers, deleteMeetingResource 
} from '../controllers/meetings.controller.js';
import { getStats } from '../controllers/meetings.controller.js';
import { getAdminPages, createPage, updatePage, getAdminPageById, deletePage } from '../controllers/pages.controller.js';
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

// Meetings
router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.post('/meetings/archive', archiveMeeting);
router.delete('/meetings', deleteMeeting);

// Stats
router.get('/stats', getStats);

// Pages
router.get('/pages', getAdminPages);
router.post('/pages', createPage);
router.get('/pages/:id', getAdminPageById);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

export default router;
