// src/templates/email/base.template.ts
export const baseTemplate = (content: string, customTimestamp?: string) => {
  const timestamp = customTimestamp || new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: true,
  }) + ' UTC';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030711; margin: 0; padding: 20px 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 20px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
    .header p { color: rgba(255,255,255,0.7); margin-top: 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
    .content { padding: 48px 40px; color: #1f2937; line-height: 1.8; }
    .footer { padding: 40px; text-align: center; background-color: #f8fafc; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; }
    .button { display: inline-block; padding: 16px 36px; background-color: #2563eb; color: #ffffff !important; font-weight: 800; text-decoration: none; border-radius: 16px; margin: 32px 0; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; }
    .otp-code { background-color: #f1f5f9; padding: 20px; border-radius: 24px; font-size: 30px; font-weight: 900; text-align: center; letter-spacing: 0.3em; color: #0f172a; margin: 40px 0; border: 2px solid #e2e8f0; font-family: 'Courier New', monospace; }
    p { margin-bottom: 20px; font-size: 16px; font-weight: 500; }
    .timestamp { margin-top: 20px; font-style: italic; color: #cbd5e1; font-weight: 600; font-size: 10px; }
    hr { border: none; border-top: 1px solid #f1f5f9; margin: 40px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Apna Khata</h1>
      <p>Your Financial Safe Place</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 apnakhata.online | All Rights Reserved.</p>
      <p>This is an automated system notification. Please do not reply to this email.</p>
      <div class="timestamp">Generated on: ${timestamp} (UTC)</div>
    </div>
  </div>
</body>
</html>
`;
};
