import { baseTemplate } from './base.template.js';

export const resetPasswordTemplate = (resetLink: string) => {
  const content = `
    <h2 style="color: #2563eb; font-size: 24px; font-weight: 800; tracking-tight: -0.025em; margin-bottom: 24px;">Reset your password</h2>
    <p>We received a request to reset your password. No problem! Click the button below to set a new password for your account:</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #2563eb; font-size: 14px;">${resetLink}</p>
    
    <p>This link will remain active for <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  
  return baseTemplate(content);
};
