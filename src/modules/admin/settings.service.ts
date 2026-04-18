import prisma from '../../config/prisma.js';
import auditService from './audit.service.js';

export class SettingsService {
  private singletonId = 'singleton';
  private cache: any = null;
  private lastRefreshed = 0;
  private readonly CACHE_TTL = 60000; // 60 seconds

  /**
   * Get current system settings, using a resilient in-memory cache with TTL
   */
  async getSettings() {
    const now = Date.now();
    const isStale = now - this.lastRefreshed > this.CACHE_TTL;

    // If cache is empty or stale, load from DB
    if (!this.cache || isStale) {
      this.cache = await this.refreshCache();
      this.lastRefreshed = now;
    }
    return this.cache;
  }

  /**
   * Internal method to fetch from DB and populate cache
   */
  private async refreshCache() {
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
    return settings;
  }

  /**
   * Update global system settings and sync memory cache
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

    // Event-Driven Sync: Update memory immediately so pollers see change instantly without DB hit
    this.cache = settings;

    await auditService.log(adminId, 'UPDATE_SYSTEM_SETTINGS', undefined, data);

    return settings;
  }

  /**
   * Check if maintenance mode is active (Zero DB Pressure)
   */
  async isMaintenanceMode() {
    const settings = await this.getSettings();
    return settings.maintenanceMode;
  }

  /**
   * Check if registration is enabled (Zero DB Pressure)
   */
  async isRegistrationEnabled() {
    const settings = await this.getSettings();
    return settings.registrationEnabled;
  }
}

export default new SettingsService();
