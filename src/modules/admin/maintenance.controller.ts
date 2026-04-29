import { Request, Response, NextFunction } from "express";
import adminService from "./admin.service.js";
import auditService from "./audit.service.js";
import recurringService from "../recurring/recurring.service.js";
import logger from "../../utils/logger.js";

/**
 * MaintenanceController
 * Handles system-wide background tasks triggered by external cron jobs (Vercel).
 */
export class MaintenanceController {
  async runMaintenance(req: Request, res: Response, next: NextFunction) {
    // 1. Dual-Auth Strategy: Check for Cron Secret OR Admin Session
    // Supports standard Vercel 'Authorization: Bearer' header and custom 'x-cron-secret'
    const authHeader = req.headers["authorization"];
    const cronSecretHeader = req.headers["x-cron-secret"];
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const providedSecret = bearerToken || cronSecretHeader;
    const expectedSecret = process.env.CRON_SECRET;

    // Check if it's a valid Cron request
    const isCronAuthorized =
      expectedSecret && providedSecret === expectedSecret;

    // Check if it's a manual Admin trigger (via session/cookie)
    const isAdminAuthorized = (req as any).user?.role === "ADMIN";

    if (!isCronAuthorized && !isAdminAuthorized) {
      logger.warn(
        "[MAINTENANCE] Unauthorized attempt blocked. (Missing Secret or Admin Session)",
      );
      return res.status(401).json({
        success: false,
        message:
          "Forbidden: Automated maintenance requires a valid system secret or administrative session.",
      });
    }

    const triggerSource = isCronAuthorized
      ? "AUTOMATED_CRON"
      : `MANUAL_ADMIN (${(req as any).user?.name})`;
    logger.info(
      `[MAINTENANCE] Unified Cycle Initiated... ⚙️ (Source: ${triggerSource})`,
    );

    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        triggeredBy: triggerSource,
      };

      // TASK A: Administrative Cleanup (Accounts & Logs)
      // Permanent erasure of soft-deleted accounts (30d) and pruning of old admin logs (90d).
      results.cleanup = await adminService.runMaintenanceCleanup();
      logger.info(
        `[MAINTENANCE] Cleanup Sub-task (System): Purged ${results.cleanup.accountsPurged} accounts and ${results.cleanup.logsPurged} logs.`,
      );

      // TASK C: Log Maintenance Event to Audit Trail
      await auditService.log(
        (req as any).user?.id || null,
        "SYSTEM_MAINTENANCE",
        undefined,
        results,
      );

      logger.info(
        "[MAINTENANCE] Unified Maintenance Cycle Completed Successfully. ✅",
      );

      res.status(200).json({
        success: true,
        message: "Unified system maintenance completed successfully.",
        data: results,
      });
    } catch (error) {
      logger.error("[MAINTENANCE] Unified Maintenance Cycle Failed ❌", error);
      next(error);
    }
  }
}

export default new MaintenanceController();
