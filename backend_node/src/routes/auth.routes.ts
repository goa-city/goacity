import { Router } from 'express';
import { sendOtp, verifyOtp, adminLogin } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { sendOtpSchema, verifyOtpSchema, adminLoginSchema } from '../validations/auth.schema.js';

const router = Router();

router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/admin-login', validate(adminLoginSchema), adminLogin);

export default router;

