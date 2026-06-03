import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateRoleValidation,
} from '../validations/auth.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/verify-otp', verifyOtpValidation, validate, authController.verifyOtp);
router.post('/resend-otp', resendOtpValidation, validate, authController.resendOtp);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);
router.post('/verify-token', authController.verifyToken);

router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, updateProfileValidation, validate, authController.updateProfile);
router.post('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

router.get('/users', authenticate, authorize('ADMIN'), authController.listUsers);
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), updateRoleValidation, validate, authController.updateUserRole);

export default router;
