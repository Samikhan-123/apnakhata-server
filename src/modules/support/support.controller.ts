import { Request, Response, NextFunction } from 'express';
import { contactSchema } from './support.validation.js';
import mailService from '../auth/mail.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { parseUserAgent, getLocationFromIp, getClientIp } from '../../utils/location.util.js';

export class SupportController {
  /**
   * Send a support/contact message to the administrator
   */
  async contact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = contactSchema.parse(req.body);
      const { name, email, subject, message, clientTimestamp } = validatedData;

      // Identify if the sender is an authenticated user
      const isAuthenticated = !!req.user;
      const userRole = req.user?.role || 'GUEST';
      
      // Parse technical info
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ip = getClientIp(req);
      const device = parseUserAgent(userAgent);
      const location = await getLocationFromIp(ip);
      
      // Send email to Admin
      await mailService.sendSupportNotification({
        name,
        email,
        subject,
        message,
        userRole,
        isAuthenticated,
        ip: ip,
        location: location ? `${location.city}, ${location.country}` : 'Unknown',
        device: `${device.browser} on ${device.os} (${device.device})`,
        clientTimestamp
      });

      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. Our team will get back to you soon.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SupportController();
