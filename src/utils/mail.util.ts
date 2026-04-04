import { Resend } from 'resend';
import 'dotenv/config';
// src/utils/mail.util.ts
//  resend api used for mail utility
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const from = process.env.MAIL_FROM || 'Apna Khata <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    return { success: false, error };
  }
};
