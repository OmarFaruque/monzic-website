import { sendEmail, getEmailTemplates } from '@/lib/email';

export async function sendVerificationEmail(email: string, token: string, firstName: string) {
  const templates = await getEmailTemplates();
  const template = templates?.verificationCode;
  if (!template) {
    throw new Error("Verification email template not found.");
  }

  let subject = template.subject;
  let content = template.content;

  content = content.replace(/{{firstName}}/g, firstName);
  content = content.replace(/{{code}}/g, token);
  content = content.replace(/{{expiryMinutes}}/g, "5");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tempnow</div>
          <h1>Account Verification</h1>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tempnow. All rights reserved.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    to: email,
    subject: subject,
    html: emailHtml,
  };

  try {
    await sendEmail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email.");
  }
}