import { Router } from 'express';
import supportController from './support.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';
import { maintenanceGuard } from '../../middlewares/maintenance.middleware.js';

const router = Router();

// Rate limiting for support requests to prevent spam
const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

/**
 * @route   POST /api/support/contact
 * @desc    Send support/contact message
 * @access  Public (Optionally Authenticated)
 */
router.post(
  '/contact',
  supportLimiter,
  authenticate,
  maintenanceGuard,
  supportController.contact
);

export default router;
