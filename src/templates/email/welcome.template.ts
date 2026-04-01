import { baseTemplate } from './base.template.js';

export const welcomeTemplate = (name: string, otp: string) => {
  const content = `
    <h2 style="color: #2563eb; font-size: 24px; font-weight: 800; tracking-tight: -0.025em; margin-bottom: 24px;">Welcome to the family, ${name}!</h2>
    <p>Thank you for choosing <strong>Apna Khata</strong>. We're here to help you master your financial journey with simplicity and peace of mind.</p>
    <p>To get started, please verify your account using the unique code below:</p>
    
    <div class="otp-code">${otp}</div>
    
    <p>This code will remain active for <strong>15 minutes</strong>. For your security, please do not share this code with anyone.</p>
    
    <hr />
    
    <p style="font-size: 14px; color: #6b7280;">If you didn't create an account, you can safely ignore this email.</p>
  `;
  
  return baseTemplate(content);
};
