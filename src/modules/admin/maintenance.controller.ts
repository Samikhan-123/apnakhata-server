import { Request, Response, NextFunction } from 'express';
import adminService from './admin.service.js';
import auditService from './audit.service.js';
import recurringService from '../recurring/recurring.service.js';
import logger from '../../utils/logger.js';

/**
 * MaintenanceController
 * Handles system-wide background tasks triggered by external cron jobs (Vercel).
 */
export class MaintenanceController {
  async runMaintenance(req: Request, res: Response, next: NextFunction) {
    // 1. Secret Key Check for Vercel Cron Security
    // This prevents random users from triggering heavy database operations.
    const cronSecret = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== expectedSecret) {
      logger.warn('[MAINTENANCE] Unauthorized maintenance attempt blocked (Invalid Secret).');
      return res.status(401).json({ success: false, message: 'Unauthorized access to system maintenance.' });
    }

    logger.info('[MAINTENANCE] Unified Maintenance Cycle Initiated... ⚙️');

    try {
      const results: any = {
        timestamp: new Date().toISOString(),
      };

      // TASK A: Administrative Cleanup (Accounts & Logs)
      // Permanent erasure of soft-deleted accounts (30d) and pruning of old admin logs (90d).
      results.cleanup = await adminService.runMaintenanceCleanup();
      logger.info(`[MAINTENANCE] Cleanup Sub-task: Purged ${results.cleanup.accountsPurged} accounts and ${results.cleanup.logsPurged} logs.`);

      // TASK B: Recurring Records (System-wide)
      // Process all due recurring patterns for all active users.
      const recurringResults = await recurringService.processDueEntries();
      results.recurring = {
        totalProcessed: recurringResults.length,
        successCount: recurringResults.filter((r: any) => r.success).length,
        failureCount: recurringResults.filter((r: any) => !r.success).length
      };
      logger.info(`[MAINTENANCE] Recurring Sub-task: Processed ${results.recurring.totalProcessed} entry patterns.`);

      // TASK C: Log Maintenance Event to Audit Trail
      await auditService.log(null, 'SYSTEM_MAINTENANCE', undefined, results);

      logger.info('[MAINTENANCE] Unified Maintenance Cycle Completed Successfully. ✅');

      res.status(200).json({
        success: true,
        message: 'Unified system maintenance completed successfully.',
        data: results
      });
    } catch (error) {
      logger.error('[MAINTENANCE] Unified Maintenance Cycle Failed ❌', error);
      next(error);
    }
  }
}

export default new MaintenanceController();
