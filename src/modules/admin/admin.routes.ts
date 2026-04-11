import { Router } from 'express';
import adminController from './admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/admin.middleware.js';

const router = Router();

// Global Protection: Must be authenticated AND an admin
router.use(authenticate, isAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system-wide metrics
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    List all users in the system
 */
router.get('/users', adminController.getUsers);

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user details (role, verification status)
 */
router.patch('/users/:id', adminController.updateUser);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed user information and activity
 */
router.get('/users/:id', adminController.getUserDetail);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
