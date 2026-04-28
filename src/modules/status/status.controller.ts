import { Request, Response } from "express";
import settingsService from "../admin/settings.service.js";

export const getSystemStatus = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: settings.maintenanceMode,
        registrationEnabled: settings.registrationEnabled,
      },
    });
  } catch (error) {
    // Fail safe: if settings can't be fetched, assume operational
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: false,
        registrationEnabled: true,
      },
    });
  }
};
