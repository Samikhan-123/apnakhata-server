export const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: #2563eb; padding: 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }
    .content { padding: 48px 40px; color: #1f2937; line-height: 1.6; }
    .footer { padding: 32px 40px; text-align: center; background-color: #f3f4f6; color: #6b7280; font-size: 12px; }
    .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; border-radius: 12px; margin: 24px 0; transition: all 0.2s; }
    .otp-code { background-color: #f3f4f6; padding: 24px; border-radius: 16px; font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 0.2em; color: #111827; margin: 32px 0; border: 2px solid #e5e7eb; }
    p { margin-bottom: 16px; font-size: 16px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Apna Khata</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 Apna Khata. Built for human simplicity.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;
//# sourceMappingURL=base.template.js.map