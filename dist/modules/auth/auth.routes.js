import { Router } from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rate-limit.middleware.js';
const router = Router();
// Apply strict rate limiting to all auth routes
router.use(authLimiter);
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
/**
 * @route   POST /api/auth/google
 * @desc    Login/Signup with Google
 */
router.post('/google', authController.googleLogin);
/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email via OTP
 */
router.post('/verify-email', authController.verifyEmail);
/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend verification OTP
 */
router.post('/resend-otp', authController.resendOTP);
/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset link
 */
router.post('/forgot-password', authController.forgotPassword);
/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 */
router.post('/reset-password', authController.resetPassword);
/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 */
router.get('/me', authenticate, authController.getMe);
export default router;
//# sourceMappingURL=auth.routes.js.map