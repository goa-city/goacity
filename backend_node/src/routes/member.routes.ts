import { Router } from 'express';
import { 
    getDashboard, getProfile, updateProfile, 
    createPost, createJob, createResource,
    getNewsFeed, likePost, deletePost, updatePost,
    getJobs, getJob, applyJob, getResources
} from '../controllers/member.controller.js';
import { 
    getStewardshipSummary, getMemberLogs, 
    getVerifiedOrgs, getMemberDirectory, createStewardshipLog 
} from '../controllers/stewardship.controller.js';
import { 
    getUpcomingMeetings, getPastMeetings, getMeeting, rsvpMeeting,
    checkInMeeting, payMeeting
} from '../controllers/meetings.controller.js';
import { 
    requestMentorship, getMyMentorships, 
    getMentorshipById, addMentorshipGoal, updateMentorshipGoal,
    logMentorshipSession, addMentorshipTask, updateMentorshipTask,
    updateMentorshipPhase, updateMentorshipStatus, getMentorProfile,
    updateMentorProfile, getMenteeRecommendations,
    updateMentorshipSession, deleteMentorshipSession, deleteMentorshipGoal,
    addMentorshipMaterial, submitMentorshipMaterialResponse, deleteMentorshipMaterial,
    submitMentorshipSessionPayment, verifyMentorshipSessionPayment
} from '../controllers/mentorship.controller.js';
import { 
    submitIdea, getActiveIdeas, submitFeedback 
} from '../controllers/incubator.controller.js';
import { 
    getMyPeople, getMemberProfile, 
    requestCollaboration, getDashboardCollabs, devAutoTestCollab 
} from '../controllers/collab.controller.js';
import { submitOnboarding, submitForm, getFormProgress } from '../controllers/forms.controller.js';
import { globalSearch } from '../controllers/search.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.post('/profile', updateProfile);
router.get('/search', globalSearch);
router.get('/news/feed', getNewsFeed);
router.post('/news/post', upload.single('media'), createPost);
router.post('/news/post/:id/like', likePost);
router.delete('/news/post/:id', deletePost);
router.put('/news/post/:id', updatePost);

// Meetings
router.get('/meetings/upcoming', getUpcomingMeetings);
router.get('/meetings/past', getPastMeetings);
router.get('/meeting/:id', getMeeting);
router.post('/meeting/:id/rsvp', rsvpMeeting);
router.post('/meeting/:id/checkin', checkInMeeting);
router.post('/meeting/:id/pay', payMeeting);

// Stewardship
router.get('/stewardship/summary', getStewardshipSummary);
router.get('/stewardship/logs', getMemberLogs);
router.get('/verified-orgs', getVerifiedOrgs);
router.get('/directory', getMemberDirectory);
router.post('/stewardship/log', createStewardshipLog);

// Mentorship
router.get('/mentorship/profile', getMentorProfile);
router.post('/mentorship/profile', upload.single('payment_qr_image'), updateMentorProfile);
router.get('/mentorship/recommendations', getMenteeRecommendations);
router.post('/mentorship/request', requestMentorship);
router.get('/mentorship', getMyMentorships);
router.get('/mentorship/:id', getMentorshipById);
router.post('/mentorship/:id/goals', addMentorshipGoal);
router.put('/mentorship/goals/:goalId', updateMentorshipGoal);
router.post('/mentorship/:id/sessions', upload.single('payment_qr_image'), logMentorshipSession);
router.post('/mentorship/:id/tasks', addMentorshipTask);
router.put('/mentorship/tasks/:taskId', updateMentorshipTask);
router.put('/mentorship/:id/phase', updateMentorshipPhase);
router.put('/mentorship/:id/status', updateMentorshipStatus);

router.put('/mentorship/sessions/:sessionId', upload.single('payment_qr_image'), updateMentorshipSession);
router.delete('/mentorship/sessions/:sessionId', deleteMentorshipSession);
router.delete('/mentorship/goals/:goalId', deleteMentorshipGoal);
router.post('/mentorship/:id/materials', upload.single('file'), addMentorshipMaterial);
router.post('/mentorship/materials/:materialId/response', upload.single('response_file'), submitMentorshipMaterialResponse);
router.delete('/mentorship/materials/:materialId', deleteMentorshipMaterial);

router.post('/mentorship/sessions/:sessionId/pay', submitMentorshipSessionPayment);
router.post('/mentorship/sessions/:sessionId/verify', verifyMentorshipSessionPayment);

// Incubator
router.post('/incubator', submitIdea);
router.get('/incubator', getActiveIdeas);
router.post('/incubator/:id/feedback', submitFeedback);

// My People
router.get('/my-people', getMyPeople);
router.get('/profile/:id', getMemberProfile);
router.post('/collaboration/request', requestCollaboration);
router.get('/dashboard/collabs', getDashboardCollabs);
router.post('/dev/collab-test/:id', devAutoTestCollab);

router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.post('/jobs/:id/apply', upload.single('cv'), applyJob);
router.get('/resources', getResources);

// Forms are now in public routes with optional auth
// router.get('/form-progress', getFormProgress);
// router.post('/onboarding', upload.any(), submitOnboarding);
// router.post('/submit-form', upload.any(), submitForm);

export default router;
