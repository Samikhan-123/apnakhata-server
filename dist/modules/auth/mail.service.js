import { sendEmail } from '../../utils/mail.util.js';
import { welcomeTemplate } from '../../templates/email/welcome.template.js';
import { verificationTemplate } from '../../templates/email/verification.template.js';
import 'dotenv/config';
export class MailService {
    async sendWelcomeEmail(email, name, otp) {
        const html = welcomeTemplate(name, otp);
        await sendEmail({
            to: email,
            subject: 'Welcome to Apna Khata - Verify your account',
            html
        });
    }
    async sendVerificationOTP(email, otp) {
        const html = verificationTemplate(otp);
        await sendEmail({
            to: email,
            subject: 'Your Verification Code - Apna Khata',
            html
        });
    }
    async sendPasswordResetOTP(email, otp) {
        const html = verificationTemplate(otp); // Reuse verification template for OTP display
        await sendEmail({
            to: email,
            subject: 'Reset your password code - Apna Khata',
            html
        });
    }
}
export default new MailService();
//# sourceMappingURL=mail.service.js.map