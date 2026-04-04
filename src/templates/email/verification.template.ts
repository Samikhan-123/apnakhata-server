import { baseTemplate } from './base.template.js';
  
// src/templates/email/verification.template.ts
// for verification template
export const verificationTemplate = (otp: string) => {
  const content = `
    <h2 style="color: #2563eb; font-size: 24px; font-weight: 800; tracking-tight: -0.025em; margin-bottom: 24px;">Your Verification Code</h2>
    <p>Please enter the following code to confirm your request and complete your verification:</p>
    
    <div class="otp-code">${otp}</div>
    
    <p>This code will expire in <strong>15 minutes</strong>. For your security, please do not share this code with anyone.</p>
    
    <hr />
    
    <p style="font-size: 14px; color: #6b7280;">If you didn't request a verification code, please ignore this email.</p>
  `;
  
  return baseTemplate(content);
};
