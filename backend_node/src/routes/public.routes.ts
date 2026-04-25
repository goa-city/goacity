import { Router } from 'express';
import { getMemberMeetings, getMeeting, getPosts } from '../controllers/meetings.controller.js';
import { rsvpMeeting } from '../controllers/meeting.controller.js';
import { getFormWithFields } from '../controllers/forms.controller.js';
import { getJobs, createJob, createPost, getResources, createResource } from '../controllers/member.controller.js';
import { getPage } from '../controllers/pages.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/meetings', getMemberMeetings);
router.get('/meetings/:id', getMeeting);
router.post('/meeting-actions', rsvpMeeting);

router.get('/posts', getPosts);
router.post('/posts', upload.single('file'), createPost);

router.get('/forms/get', getFormWithFields);

router.get('/jobs', getJobs);
router.post('/jobs', upload.any(), createJob);

router.get('/resources', getResources);
router.post('/resources', upload.any(), createResource);

router.get('/pages/:slug', getPage);

export default router;
