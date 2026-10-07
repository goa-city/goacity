import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import memberRoutes from './member.routes.js';
import publicRoutes from './public.routes.js';
import { getCities, createCity, updateCity, getSuperAdminStats } from '../controllers/city.controller.js';
import { getSuperAdminAnalytics, getSuperAdminPageDetails } from '../controllers/analytics.controller.js';
import { getVideoAnalytics, getMeetingsWithVideos } from '../controllers/meetings.controller.js';
import { superAdminLogin } from '../controllers/admin-auth.controller.js';
import { superAdminMiddleware } from '../middleware/auth.js';
import { cityMiddleware } from '../middleware/city.js';

const router = Router();

// Apply city context to all API requests
router.use(cityMiddleware);

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/member', memberRoutes);
router.use('/', publicRoutes);

// Super Admin Authentication
router.post('/superadmin/login', superAdminLogin);

// Super Admin Analytics & Stats
router.get('/superadmin/stats', superAdminMiddleware, getSuperAdminStats);
router.get('/superadmin/analytics/overview', superAdminMiddleware, getSuperAdminAnalytics);
router.get('/superadmin/analytics/page-details', superAdminMiddleware, getSuperAdminPageDetails);
router.get('/superadmin/meetings-with-videos', superAdminMiddleware, getMeetingsWithVideos);
router.get('/superadmin/meetings/:id/video-analytics', superAdminMiddleware, getVideoAnalytics);

// City Management (Super Admin only)
router.get('/superadmin/cities', superAdminMiddleware, getCities);
router.post('/superadmin/cities', superAdminMiddleware, createCity);
router.put('/superadmin/cities', superAdminMiddleware, updateCity);

export default router;

