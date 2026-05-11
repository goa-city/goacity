import { Router } from 'express';
import { getMemberMeetings, getMeeting, getPosts } from '../controllers/meetings.controller.js';
import { rsvpMeeting } from '../controllers/meeting.controller.js';
import { getFormWithFields, getFormProgress, submitForm, submitOnboarding } from '../controllers/forms.controller.js';
import { getJobs, createJob, createPost, getResources, createResource, registerPublicMember } from '../controllers/member.controller.js';
import { getPage } from '../controllers/pages.controller.js';
import { validate } from '../middleware/validate.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { createJobSchema } from '../validations/job.schema.js';
import { createResourceSchema } from '../validations/resource.schema.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/meetings', getMemberMeetings);
router.get('/meetings/:id', getMeeting);
router.post('/meeting-actions', rsvpMeeting);

router.get('/posts', getPosts);
router.post('/posts', upload.single('file'), createPost);

router.get('/forms/get', getFormWithFields);
router.get('/form-progress', optionalAuthMiddleware, getFormProgress);
router.post('/onboarding', optionalAuthMiddleware, upload.any(), submitOnboarding);
router.post('/submit-form', optionalAuthMiddleware, upload.any(), submitForm);

router.get('/jobs', getJobs);
router.post('/jobs', upload.any(), validate(createJobSchema), createJob);

router.get('/resources', getResources);
router.post('/resources', upload.any(), validate(createResourceSchema), createResource);

router.get('/pages/:slug', getPage);
router.post('/register', upload.any(), registerPublicMember);

export default router;
