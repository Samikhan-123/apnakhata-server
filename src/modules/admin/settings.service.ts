import prisma from '../../config/prisma.js';
import auditService from './audit.service.js';

export class SettingsService {
  private singletonId = 'singleton';
  private cache: any = null;
  private lastFetch = 0;
  private readonly CACHE_TTL = 10000; // 10 seconds

  /**
   * Get current system settings, creating them with defaults if they don't exist
   */
  async getSettings() {
    const now = Date.now();
    if (this.cache && (now - this.lastFetch < this.CACHE_TTL)) {
      return this.cache;
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: this.singletonId }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: this.singletonId,
          maintenanceMode: false,
          registrationEnabled: true,
          maxEntriesLimit: 5000
        }
      });
    }

    this.cache = settings;
    this.lastFetch = now;
    return settings;
  }

  /**
   * Update global system settings
   */
  async updateSettings(adminId: string, data: { 
    maintenanceMode?: boolean, 
    registrationEnabled?: boolean, 
    maxEntriesLimit?: number
  }) {
    const settings = await prisma.systemSettings.update({
      where: { id: this.singletonId },
      data
    });

    // Update cache immediately
    this.cache = settings;
    this.lastFetch = Date.now();

    await auditService.log(adminId, 'UPDATE_SYSTEM_SETTINGS', undefined, data);

    return settings;
  }

  /**
   * Check if maintenance mode is active
   */
  async isMaintenanceMode() {
    const settings = await this.getSettings();
    return settings.maintenanceMode;
  }

  /**
   * Check if registration is enabled
   */
  async isRegistrationEnabled() {
    const settings = await this.getSettings();
    return settings.registrationEnabled;
  }
}

export default new SettingsService();
