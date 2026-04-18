import { Router } from 'express';
import adminController from './admin.controller.js';
import settingsController from './settings.controller.js';
import maintenanceController from './maintenance.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { maintenanceGuard } from '@/middlewares/maintenance.middleware.js';

const router = Router();

// --- SYSTEM MAINTENANCE (CRON SECURE) ---
// This endpoint is hit by Vercel Cron. No session required, uses CRON_SECRET.
router.post('/maintenance', maintenanceController.runMaintenance);

// Base Authentication for all other admin routes
router.use(authenticate);
router.use(maintenanceGuard);

// Permission Matrix: ADMIN & MODERATOR (General Management)
const adminModGuard = authorizeRoles('ADMIN', 'MODERATOR');
// Permission Matrix: ADMIN Only (System Critical)
const adminOnlyGuard = authorizeRoles('ADMIN');

/**
 * @route   GET /api/admin/stats
 * @desc    Get system-wide metrics
 */
router.get('/stats', adminModGuard, adminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    List all users in the system
 */
router.get('/users', adminModGuard, adminController.getUsers);

/**
 * @route   PATCH /api/admin/users/batch
 * @desc    Update multiple users at once
 */
router.patch('/users/batch', adminModGuard, adminController.batchUsers);

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user details (role, verification status)
 */
router.patch('/users/:id', adminModGuard, adminController.updateUser);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed user information and activity
 */
router.get('/users/:id', adminModGuard, adminController.getUserDetail);

/**
 * @route   GET /api/admin/financial-stats
 * @desc    Get platform-wide financial insights
 */
router.get('/financial-stats', adminModGuard, adminController.getFinancialStats);

// --- STRICT ADMINISTRATIVE GATES (ADMIN ONLY) ---

router.get('/audit-logs', adminOnlyGuard, adminController.getAuditLogs);
router.get('/settings', adminOnlyGuard, settingsController.getSettings);
router.patch('/settings', adminOnlyGuard, settingsController.updateSettings);

// --- DELETION LIFECYCLE & DIAGNOSTIC (ADMIN ONLY) ---
router.post('/impersonate/stop', adminOnlyGuard, adminController.stopImpersonate);
router.post('/users/:id/impersonate', adminOnlyGuard, adminController.impersonate);
router.patch('/users/:id/schedule-deletion', adminOnlyGuard, adminController.scheduleDeletion);
router.patch('/users/:id/cancel-deletion', adminOnlyGuard, adminController.cancelDeletion);

export default router;
