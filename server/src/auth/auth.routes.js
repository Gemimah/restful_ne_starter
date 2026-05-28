import { Router } from 'express';
import * as authController from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
} from './auth.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/verify-otp', verifyOtpValidation, validate, authController.verifyOtp);
router.post('/resend-otp', resendOtpValidation, validate, authController.resendOtp);
router.get('/me', authenticate, authController.getMe);

export default router;
