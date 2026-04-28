import { baseTemplate } from "./base.template.js";

export const welcomeTemplate = (
  name: string,
  otp: string,
  customTimestamp?: string,
) => {
  const content = `
    <h2 style="color: #0f172a; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 24px;">Welcome to Apna Khata, ${name}.</h2>
    <p>We are pleased to have you with us. You have taken the first step towards better financial management and clarity.</p>
    <p>To finalize your account setup, please verify your email using the secure code below:</p>
    
    <div class="otp-code">${otp}</div>
    
    <p>This secure code will remain active for <strong>15 minutes</strong>. For the safety of your financial data, please do not share this code.</p>
    
    <hr />
    
    <p style="font-size: 13px; color: #94a3b8; font-weight: 600;">If you did not initiate this registration, please ignore this message. Your security is our priority.</p>
  `;

  return baseTemplate(content, customTimestamp);
};
