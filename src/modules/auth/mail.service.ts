import { sendEmail } from '../../utils/mail.util.js';
import { welcomeTemplate } from '../../templates/email/welcome.template.js';
import { verificationTemplate } from '../../templates/email/verification.template.js';
import { supportNotificationTemplate } from '../../templates/email/support-notification.template.js';
import 'dotenv/config';
import { resetPasswordTemplate } from '../../templates/email/reset.template.js';

export class MailService {
  async sendWelcomeEmail(email: string, name: string, otp: string, clientTimestamp?: string) {
    const html = welcomeTemplate(name, otp, clientTimestamp);
    await sendEmail({
      to: email,
      subject: 'Welcome to Apna Khata - Verify your account',
      html
    });
  }

  async sendVerificationOTP(email: string, otp: string, clientTimestamp?: string) {
    const html = verificationTemplate(otp, clientTimestamp);
    await sendEmail({
      to: email,
      subject: 'Your Verification Code - Apna Khata',
      html
    });
  }

  async sendPasswordResetOTP(email: string, name: string, otp: string, clientTimestamp?: string) {
    const html = resetPasswordTemplate(name, otp, clientTimestamp); 
    await sendEmail({
      to: email,
      subject: 'Reset your password - Apna Khata',
      html
    });
  }

  async sendSupportNotification(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    userRole: string;
    isAuthenticated: boolean;
    ip: string;
    location?: string;
    device?: string;
    clientTimestamp?: string;
  }) {
    const html = supportNotificationTemplate(data);
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `[SUPPORT REQUEST] ${data.subject} - ${data.name}`,
      html
    });
  }
}

export default new MailService();
