import { Resend } from "resend"
import nodemailer from "nodemailer"
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export interface EmailTemplate {
  to: string
  subject: string
  html: string,
  attachments?:any
}



// export async function sendEmail({ to, subject, html }: EmailTemplate) {
//   try {
//     const data = await resend.emails.send({
//       from: "Tempnow <noreply@monzic.co.uk>",
//       to: [to],
//       subject,
//       html,
//     })

//     return { success: true, data }
//   } catch (error) {
//     console.error("Email sending failed:", error)
//     return { success: false, error }
//   }
// }


async function getResendSettings() {
  try {
    const resendSettings = await db.query.settings.findFirst({
      where: eq(settings.param, 'resend')
    });
    if (resendSettings && resendSettings.value) {
      return JSON.parse(resendSettings.value);
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch Resend settings:", error);
    return null;
  }
}

// Reusable function
export async function sendEmail({ to, subject, html, attachments = [] }: EmailTemplate) {
  try {
    const resendSettings = await getResendSettings();
    const mailDriver = process.env.MAIL_DRIVER;

    if (mailDriver === "resend" && resendSettings && resendSettings.apiKey) {
      const resend = new Resend(resendSettings.apiKey);
      const fromAddress = resendSettings.fromEmail || "Tempnow <onboarding@resend.dev>";
      
      const data = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        attachments,
      });

      return { success: true, data };
    } else {
      // 👉 Local dev (MailHog via SMTP)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "1025"),
        secure: false,
        auth: false, // MailHog doesn’t need auth
      })

      const info = await transporter.sendMail({
        from: "Tempnow <noreply@local.dev>",
        to,
        subject,
        html,
        attachments,
      })

      return { success: true, data: info }
    }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

export async function getEmailTemplates() {
  try {
    const emailTemplatesSetting = await db.query.settings.findFirst({
      where: eq(settings.param, 'email_templates')
    });
    if (emailTemplatesSetting && emailTemplatesSetting.value) {
      return JSON.parse(emailTemplatesSetting.value);
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    return null;
  }
}

export async function createAIDocumentPurchaseEmail(customerName: string, documentType: string, downloadLink: string) {
  const templates = await getEmailTemplates();
  const template = templates?.documentPurchase;
  if (!template) return "<body><p>Email template not found</p></body>";

  let content = template.content;
  content = content.replace(/{{customerName}}/g, customerName);
  content = content.replace(/{{documentType}}/g, documentType);
  content = content.replace(/{{downloadLink}}/g, downloadLink);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tempnow</div>
          <h1>Your AI Document is Ready!</h1>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>&copy; 2025 Tempnow Solutions Ltd. All rights reserved.</p>
          <p>You received this email because you purchased a document from Tempnow.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Insurance Policy Email Template
export async function createInsurancePolicyEmail(
  firstName: string,
  lastName: string,
  policyNumber: string,
  vehicleReg: string,
  vehicleMake: string,
  vehicleModel: string,
  vehicleYear: string,
  startDate: string,
  endDate: string,
  amount: number,
  policyDocumentLink: string,
  coverageType: string = "Temporary Insurance" // Default value
) {
  const templates = await getEmailTemplates();
  const template = templates?.policyConfirmation;
  
  

  if (!template) return "<body><p>Email template not found</p></body>";

  let content = template.content;
  

  content = content.replace(/{{firstName}}/g, firstName);
  content = content.replace(/{{lastName}}/g, lastName);
  content = content.replace(/{{policyNumber}}/g, policyNumber);
  content = content.replace(/{{coverageType}}/g, coverageType);
  content = content.replace(/{{startDate}}/g, startDate);
  content = content.replace(/{{endDate}}/g, endDate);
  content = content.replace(/{{premium}}/g, amount.toFixed(2));
  content = content.replace(/{{vehicleReg}}/g, vehicleReg);
  content = content.replace(/{{vehicleMake}}/g, vehicleMake);
  content = content.replace(/{{vehicleModel}}/g, vehicleModel);
  content = content.replace(/{{vehicleYear}}/g, vehicleYear);
  content = content.replace(/{{policyDocumentLink}}/g, policyDocumentLink);

  

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject.replace(/{{policyNumber}}/g, policyNumber)}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .policy-box { background: white; border: 2px solid #0d9488; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tempnow</div>
          <h1>Insurance Policy Confirmed</h1>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>&copy; 2025 Tempnow Solutions Ltd. All rights reserved.</p>
          <p>This email contains important policy information. Please save it for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `
}



// Admin Notification Email Template
export async function createAdminNotificationEmail(
  type: "ai_document" | "insurance_policy",
  customerName: string,
  customerEmail: string,
  amount: number,
  details: string,
) {
  const templates = await getEmailTemplates();
  const template = templates?.adminNotification;
  if (!template) return "<body><p>Email template not found</p></body>";

  const typeLabel = type === "ai_document" ? "AI Document" : "Insurance Policy"

  let content = template.content;
  content = content.replace(/{{typeLabel}}/g, typeLabel);
  content = content.replace(/{{customerName}}/g, customerName);
  content = content.replace(/{{customerEmail}}/g, customerEmail);
  content = content.replace(/{{amount}}/g, amount.toFixed(2));
  content = content.replace(/{{details}}/g, details);
  content = content.replace(/{{time}}/g, new Date().toLocaleString());

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject.replace(/{{typeLabel}}/g, typeLabel)}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0d9488; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New ${typeLabel} Purchase</h1>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </div>
    </body>
    </html>
  `
}

export async function sendTicketConfirmationEmail({
    to,
    subject,
    name,
    ticketId,
    }: {
    to: string
    subject: string
    name: string
    ticketId: string
    }) {
    const templates = await getEmailTemplates();
    const template = templates?.ticketConfirmation;
    if (!template) return;

    let emailHtml = template.content;
    emailHtml = emailHtml.replace(/{{name}}/g, name);
    emailHtml = emailHtml.replace(/{{ticketId}}/g, ticketId);

    const emailWrapper = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${template.subject.replace(/{{ticketId}}/g, ticketId)}</title>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0d9488; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <div class="logo">Tempnow</div>
                <h1>Support Ticket Received</h1>
            </div>
            <div class="content">
                ${emailHtml.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
                <p>&copy; 2025 Tempnow Solutions Ltd. All rights reserved.</p>
                <p>You are receiving this email because you submitted a contact form on our website.</p>
            </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: template.subject.replace(/{{ticketId}}/g, ticketId),
        html: emailWrapper,
        attachments: [],
    })
}

export async function sendTicketReplyEmail({
    to,
    subject,
    name,
    ticketId,
    message,
    attachments = []
    }: {
    to: string
    subject: string
    name: string
    ticketId: string
    message: string
    attachments?: any[]
    }) {
    const templates = await getEmailTemplates();
    const template = templates?.ticketReply;
    if (!template) return;

    let emailHtml = template.content;
    emailHtml = emailHtml.replace(/{{name}}/g, name);
    emailHtml = emailHtml.replace(/{{ticketId}}/g, ticketId);
    emailHtml = emailHtml.replace(/{{message}}/g, message);

    const emailWrapper = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${template.subject.replace(/{{ticketId}}/g, ticketId)}</title>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0d9488; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <div class="logo">Tempnow</div>
                <h1>New Reply to Your Ticket</h1>
            </div>
            <div class="content">
                ${emailHtml.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
                <p>&copy; 2025 Tempnow Solutions Ltd. All rights reserved.</p>
                <p>You are receiving this email because you have an active support ticket with us.</p>
            </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: template.subject.replace(/{{ticketId}}/g, ticketId),
        html: emailWrapper,
        attachments
    })
}

export async function createPolicyExpiryEmail(
  firstName: string,
  lastName: string,
  policyNumber: string,
  vehicleDetails: string,
  expiresAt: string,
  policyDocumentLink: string,
) {
  const templates = await getEmailTemplates();
  const template = templates?.policyExpiry; // Assuming 'policyExpiry' is the key for the template
  if (!template) return "<body><p>Policy Expiry email template not found</p></body>";

  let content = template.content;
  content = content.replace(/{{firstName}}/g, firstName);
  content = content.replace(/{{lastName}}/g, lastName);
  content = content.replace(/{{policyNumber}}/g, policyNumber);
  content = content.replace(/{{vehicleDetails}}/g, vehicleDetails);
  content = content.replace(/{{expiresAt}}/g, new Date(expiresAt).toLocaleString());
  content = content.replace(/{{policyDocumentLink}}/g, policyDocumentLink);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject.replace(/{{policyNumber}}/g, policyNumber)}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107, #ff9800); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff8e1; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tempnow</div>
          <h1>Policy Expiry Reminder</h1>
        </div>
        <div class="content">
          ${content.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tempnow Solutions Ltd. All rights reserved.</p>
          <p>This is a reminder that your policy is expiring soon.</p>
        </div>
      </div>
    </body>
    </html>
  `
}