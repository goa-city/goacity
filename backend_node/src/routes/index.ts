import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import memberRoutes from './member.routes.js';
import publicRoutes from './public.routes.js';
import { getCities, createCity, updateCity } from '../controllers/city.controller.js';
import { superAdminMiddleware } from '../middleware/auth.js';
import { cityMiddleware } from '../middleware/city.js';

const router = Router();

// Apply city context to all API requests
router.use(cityMiddleware);

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/member', memberRoutes);
router.use('/', publicRoutes);

// City Management (Super Admin)
router.get('/cities', superAdminMiddleware, getCities);
router.post('/cities', superAdminMiddleware, createCity);
router.put('/cities', superAdminMiddleware, updateCity);

export default router;

