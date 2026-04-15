import { baseTemplate } from './base.template.js';

export const supportNotificationTemplate = (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userRole: string;
  isAuthenticated: boolean;
  ip: string;
  location?: string;
  device?: string;
  clientTimestamp?: string;
}) => {
  const content = `
    <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; margin-bottom: 30px; border-left: 4px solid #2563eb;">
      <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">New Support Request</h2>
      <p style="margin-bottom: 0; color: #64748b; font-size: 14px;">A message has been submitted via the Apna Khata Support Portal.</p>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.1em;">Sender Identity</p>
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${data.name} (${data.email})</p>
      <p style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">
        Role: <span style="color: #2563eb;">${data.userRole}</span> | 
        Verified: <span style="${data.isAuthenticated ? 'color: #10b981;' : 'color: #f43f5e;'}">${data.isAuthenticated ? 'Yes' : 'No'}</span>
      </p>
    </div>

    <div style="margin-bottom: 30px;">
       <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.1em;">Subject</p>
       <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${data.subject}</p>
    </div>

    <div style="background-color: #f8fafc; padding: 32px; border-radius: 20px; border: 1px solid #e2e8f0;">
      <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; letter-spacing: 0.1em;">Message Details</p>
      <p style="font-size: 15px; color: #334155; white-space: pre-wrap; margin: 0; line-height: 1.6;">${data.message}</p>
    </div>

    <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 40px 0;">
    
    <div style="text-align: right; color: #94a3b8; font-size: 11px; font-weight: 600;">
       Source: ${data.location || 'Unknown'} | Device: ${data.device || 'Unknown'}<br />
       IP: ${data.ip} ${data.clientTimestamp ? `| Time: ${data.clientTimestamp}` : ''}
    </div>
  `;

  return baseTemplate(content, data.clientTimestamp);
};
