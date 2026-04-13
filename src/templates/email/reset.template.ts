import { baseTemplate } from './base.template.js';

export const resetPasswordTemplate = (name: string, otp: string, customTimestamp?: string) => {
  const content = `
    <h2 style="color: #3f4ef4; font-size: 24px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 24px;">Password Reset Request</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your <strong>Apna Khata</strong> account. If you initiated this, please use the otp code below:</p>
    
    <div class="otp-code" style="border-color: #fca5a1; color: #e11d48;">${otp}</div>
    
    <p>This request was received at: <strong>${customTimestamp || 'just now'}</strong></p>
    
    <p>This security code is active for <strong>15 minutes</strong>. If you did not authorize this change, please log in immediately and update your security settings.</p>
    
    <hr />
    
    <p style="font-size: 13px; color: #94a3b8; font-weight: 600;">Security notice: Our support team will never ask you for this code over the phone or email.</p>
  `;
  
  return baseTemplate(content, customTimestamp);
};
