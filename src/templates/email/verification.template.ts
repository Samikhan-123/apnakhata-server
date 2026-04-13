import { baseTemplate } from './base.template.js';

export const verificationTemplate = (otp: string, customTimestamp?: string) => {
  const content = `
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 24px;">Verification Required</h2>
    <p>A verification request was initiated for your <strong>Apna Khata</strong> account. Please use the following one-time code to proceed:</p>
    
    <div class="otp-code">${otp}</div>
    
    <p>This code is valid for <strong>15 minutes</strong>. For your protection, never share your verification codes with anyone, including Apna Khata staff.</p>
    
    <hr />
    
    <p style="font-size: 13px; color: #94a3b8; font-weight: 600;">If you did not request this code, no further action is required. Your account remains secure.</p>
  `;
  
  return baseTemplate(content, customTimestamp);
};
