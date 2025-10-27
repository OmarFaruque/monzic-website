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

function replaceEmailVariables(text: string, data: Record<string, any>): string {
  if (!text) return '';
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, variable) => {
    return data[variable] !== undefined ? data[variable] : match;
  });
}

function buildEmailHtml(siteName: string, companyName: string, subject: string, header: string, content: string, footer: string): string {
  const finalHeader = header || subject;
  const finalFooter = footer || `&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  return `
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
        .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${siteName || "Tempnow"}</div>
          <h1>${finalHeader}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          ${finalFooter.replace(/\n/g, '<br>')}
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function createAIDocumentPurchaseEmail(customerName: string, documentType: string, downloadLink: string) {
  const templates = await getEmailTemplates();
  const template = templates?.documentPurchase;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };

  const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
  let siteName = "";
  let companyName = "";
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    siteName = parsedSettings.siteName || "";
    companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
  }

  const data = { customerName, documentType, downloadLink, siteName, companyName };
  const subject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const content = replaceEmailVariables(template.content, data);
  const footer = replaceEmailVariables(template.footer, data);
  const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);



  return { subject, html };
}

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
  coverageType: string = "Temporary Insurance"
) {
  const templates = await getEmailTemplates();
  const template = templates?.policyConfirmation;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };

  const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
  let siteName = "";
  let companyName = "";
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    siteName = parsedSettings.siteName || "";
    companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
  }

  const data = { 
    firstName, 
    lastName, 
    policyNumber, 
    vehicleReg, 
    vehicleMake, 
    vehicleModel, 
    vehicleYear, 
    startDate, 
    endDate, 
    premium: amount.toFixed(2), 
    policyDocumentLink, 
    coverageType, 
    siteName, 
    companyName,
    viewDocument: policyDocumentLink
  };

  const subject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const footer = replaceEmailVariables(template.footer, data);

  let content = replaceEmailVariables(template.content, data);
  if (template.content.includes('{{viewDocument}}')) {
      const buttonHtml = `<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 20px auto;\"><tr><td align=\"center\" style=\"background-color: #0d9488; border-radius: 6px;\"><a href=\"${policyDocumentLink}\" target=\"_blank\" style=\"display: inline-block; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px;\"><span style=\"vertical-align: middle;\">&#128196;</span><span style=\"vertical-align: middle; margin-left: 8px;\">View Document</span></a></td></tr></table>`;
      content = content.replace(policyDocumentLink, buttonHtml);
  }

  const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);

  
  return { subject, html };
}

export async function createAdminNotificationEmail(
  type: "ai_document" | "insurance_policy",
  customerName: string,
  customerEmail: string,
  amount: number,
  details: string,
) {
  const templates = await getEmailTemplates();
  const template = templates?.adminNotification;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };
  
  const typeLabel = type === "ai_document" ? "AI Document" : "Insurance Policy";
  const data = { typeLabel, customerName, customerEmail, amount: amount.toFixed(2), details, time: new Date().toLocaleString() };

  const subject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const content = replaceEmailVariables(template.content, data);
  const footer = replaceEmailVariables(template.footer, data);
  const html = buildEmailHtml("", "", subject, header, content, footer); // No site/company name needed for admin emails

  return { subject, html };
}

export async function sendTicketConfirmationEmail({
    to,
    name,
    ticketId,
    }: {
    to: string
    name: string
    ticketId: string
    }) {
    const templates = await getEmailTemplates();
    const template = templates?.ticketConfirmation;
    if (!template) return;

    const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
    let siteName = "";
    let companyName = "";
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
      companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
    }

    const data = { name, ticketId, siteName, companyName };
    const subject = replaceEmailVariables(template.subject, data);
    const header = replaceEmailVariables(template.header, data);
    const content = replaceEmailVariables(template.content, data);
    const footer = replaceEmailVariables(template.footer, data);
    const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);

    return sendEmail({ to, subject, html, attachments: [] });
}

export async function sendTicketReplyEmail({
    to,
    name,
    ticketId,
    message,
    attachments = [],
    ticketUrl
    }: {
    to: string
    name: string
    ticketId: string
    message: string
    attachments?: any[]
    ticketUrl: string
    }) {
    const templates = await getEmailTemplates();
    const template = templates?.ticketReply;
    if (!template) return;

    const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
    let siteName = "";
    let companyName = "";
    if (generalSettings && generalSettings.value) {
      const parsedSettings = JSON.parse(generalSettings.value);
      siteName = parsedSettings.siteName || "";
      companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
    }

    const data = { name, ticketId, message: message.trim().replace(/\n/g, '<br>'), siteName, companyName, ticketUrl };
    const subject = replaceEmailVariables(template.subject, data);
    const header = replaceEmailVariables(template.header, data);
    const footer = replaceEmailVariables(template.footer, data);

    let content = template.content; // Start with raw template content

    // Apply styling to {{message}} placeholder
    content = content.replace(
      /\{\{message\}\}/g,
      `<div style="border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; padding: 16px; margin: 16px 0;">{{message}}</div>`
    );

    // Apply styling to {{ticketUrl}} placeholder
    content = content.replace(
      /\{\{ticketUrl\}\}/g,
      `<div style="text-align: center; margin: 20px 0;"><a href="{{ticketUrl}}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #0d9488; border-radius: 8px; text-decoration: none;">View Ticket</a></div>`
    );

    // Now, replace all variables in the pre-styled content
    content = replaceEmailVariables(content, data);
    
    // Convert newlines in the final content (from template parts that were not variables)
    content = content.replace(/\n/g, '<br>');

    const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);

    return sendEmail({ to, subject, html, attachments });
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
  const template = templates?.policyExpiry;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };

  const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
  let siteName = "";
  let companyName = "";
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    siteName = parsedSettings.siteName || "";
    companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
  }

  const data = { firstName, lastName, policyNumber, vehicleDetails, endDate: new Date(expiresAt).toLocaleString(), renewalLink: policyDocumentLink, siteName, companyName };
  const subject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const footer = replaceEmailVariables(template.footer, data);

  let content = replaceEmailVariables(template.content, data);
  if (template.content.includes('{{renewalLink}}')) {
      const buttonHtml = `<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 20px auto;\"><tr><td align=\"center\" style=\"background-color: #0d9488; border-radius: 6px;\"><a href=\"${policyDocumentLink}\" target=\"_blank\" style=\"display: inline-block; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; font-family: Arial, sans-serif; font-size: 16px;\">Get a New Order</a></td></tr></table>`;
      content = content.replace(policyDocumentLink, buttonHtml);
  }

  const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);

  return { subject, html };
}

export async function createDirectEmail(subject: string, message: string) {
  const templates = await getEmailTemplates();
  const template = templates?.directEmail;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };

  const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, "general") });
  let siteName = "";
  let companyName = "";
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    siteName = parsedSettings.siteName || "";
    companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
  }

  const data = { subject, message, siteName, companyName };
  const finalSubject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const content = replaceEmailVariables(template.content, data);
  const footer = replaceEmailVariables(template.footer, data);
  const html = buildEmailHtml(siteName, companyName, finalSubject, header, content, footer);

  return { subject: finalSubject, html };
}

export async function getAdminEmail() {
  try {
    const adminSettings = await db.query.settings.findFirst({
      where: eq(settings.param, "general"),
    })
    if (adminSettings && adminSettings.value) {
      const parsed = JSON.parse(adminSettings.value)
      return parsed.adminEmail || process.env.ADMIN_EMAIL
    }
    return process.env.ADMIN_EMAIL
  } catch (error) {
    console.error("Failed to fetch admin email:", error)
    return process.env.ADMIN_EMAIL
  }
}

export async function createVerificationCodeEmail(firstName: string, code: string, expiryMinutes: string) {
  const templates = await getEmailTemplates();
  const template = templates?.verificationCode;
  if (!template) return { subject: "Error", html: "<body><p>Email template not found</p></body>" };

  const generalSettings = await db.query.settings.findFirst({ where: eq(settings.param, 'general') });
  let siteName = "";
  let companyName = "";
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    siteName = parsedSettings.siteName || "";
    companyName = parsedSettings.companyName || "Tempnow Solutions Ltd";
  }

  const data = { 
    firstName: firstName || 'Customer', 
    code, 
    expiryMinutes, 
    siteName, 
    companyName 
  };

  const subject = replaceEmailVariables(template.subject, data);
  const header = replaceEmailVariables(template.header, data);
  const footer = replaceEmailVariables(template.footer, data);

  let content = replaceEmailVariables(template.content, data);
  content = content.replace(
      code, 
      `<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 15px auto;\"><tr><td style=\"background-color: #0d9488; color: white; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px;\">${code}</td></tr></table>`
  );

  const html = buildEmailHtml(siteName, companyName, subject, header, content, footer);

  return { subject, html };
}
