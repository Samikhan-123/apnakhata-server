import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import settingsService from "./settings.service.js";

export class SettingsController {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { maintenanceMode, registrationEnabled, maxEntriesLimit } =
        req.body;
      const adminId = req.user.id;

      const settings = await settingsService.updateSettings(adminId, {
        maintenanceMode,
        registrationEnabled,
        maxEntriesLimit,
      });

      res.status(200).json({
        success: true,
        data: settings,
        message: "System settings updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
