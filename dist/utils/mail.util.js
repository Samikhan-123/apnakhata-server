import { Resend } from 'resend';
import 'dotenv/config';
import logger from './logger.js';
// src/utils/mail.util.ts
//  resend api used for mail utility
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
export const sendEmail = async (options) => {
    const from = process.env.MAIL_FROM || 'Apna Khata <onboarding@resend.dev>';
    try {
        const { data, error } = await resend.emails.send({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        if (error) {
            logger.error('Email sending failed', { error, to: options.to });
            return { success: false, error };
        }
        logger.info('Email sent successfully', { to: options.to });
        return { success: true, data };
    }
    catch (error) {
        logger.error('Email Dispatch Error', { error });
        return { success: false, error };
    }
};
//# sourceMappingURL=mail.util.js.map