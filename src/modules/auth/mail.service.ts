import { sendEmail } from '../../utils/mail.util.js';
import { welcomeTemplate } from '../../templates/email/welcome.template.js';
import { verificationTemplate } from '../../templates/email/verification.template.js';
import { resetPasswordTemplate } from '../../templates/email/reset.template.js';
import 'dotenv/config';

export class MailService {
  async sendWelcomeEmail(email: string, name: string, otp: string) {
    const html = welcomeTemplate(name, otp);
    await sendEmail({
      to: email,
      subject: 'Welcome to Apna Khata - Verify your account',
      html
    });
  }

  async sendVerificationOTP(email: string, otp: string) {
    const html = verificationTemplate(otp);
    await sendEmail({
      to: email,
      subject: 'Your Verification Code - Apna Khata',
      html
    });
  }

  async sendPasswordResetOTP(email: string, otp: string) {
    const html = verificationTemplate(otp); 
    await sendEmail({
      to: email,
      subject: 'Reset your password code - Apna Khata',
      html
    });
  }
}

export default new MailService();
