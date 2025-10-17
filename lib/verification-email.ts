import { sendEmail, getEmailTemplates } from '@/lib/email';

export async function sendVerificationEmail(email: string, token: string) {
  const templates = await getEmailTemplates();
  const template = templates?.verificationCode;
  if (!template) {
    throw new Error("Verification email template not found.");
  }

  let subject = template.subject;
  let content = template.content;

  content = content.replace(/{{code}}/g, token);
  content = content.replace(/{{expiryMinutes}}/g, "5");


  const mailOptions = {
    to: email,
    subject: subject,
    html: content,
  };

  try {
    await sendEmail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email.");
  }
}