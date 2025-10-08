import { Resend } from "resend"
import nodemailer from "nodemailer"

export interface EmailTemplate {
  to: string
  subject: string
  html: string, 
  attachments?:any
}

// Initialize Resend (only if API key is present)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// export async function sendEmail({ to, subject, html }: EmailTemplate) {
//   try {
//     const data = await resend.emails.send({
//       from: "Monzic <noreply@monzic.co.uk>",
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


// Reusable function
export async function sendEmail({ to, subject, html, attachments = [] }: EmailTemplate) {
  try {
    if (process.env.MAIL_DRIVER === "resend" && resend) {
      // 👉 Production (Resend)
      const data = await resend.emails.send({
        from: "Monzic <noreply@monzic.co.uk>",
        to: [to],
        subject,
        html,
        attachments,
      })

      return { success: true, data }
    } else {
      // 👉 Local dev (MailHog via SMTP)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "localhost",
        port: parseInt(process.env.SMTP_PORT || "1025"),
        secure: false,
        auth: false, // MailHog doesn’t need auth
      })

      const info = await transporter.sendMail({
        from: "Monzic <noreply@local.dev>",
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

// AI Document Purchase Email Template
export function createAIDocumentPurchaseEmail(customerName: string, documentType: string, downloadLink: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI Document is Ready</title>
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
          <div class="logo">Monzic</div>
          <h1>Your AI Document is Ready!</h1>
        </div>
        <div class="content">
          <h2>Hello ${customerName},</h2>
          <p>Thank you for your purchase! Your AI-generated document is now ready for download.</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>Document Details:</h3>
            <ul>
              <li><strong>Document Type:</strong> ${documentType}</li>
              <li><strong>Generated:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Format:</strong> PDF</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${downloadLink}" class="button">Download Your Document</a>
          </div>

          <p><strong>Important:</strong> This download link will expire in 7 days for security reasons.</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Download your document using the link above</li>
            <li>Save it to your preferred location</li>
            <li>Contact us if you need any modifications</li>
          </ul>

          <p>If you have any questions or need support, please don't hesitate to contact us at <a href="mailto:support@monzic.co.uk">support@monzic.co.uk</a>.</p>
          
          <p>Best regards,<br>The Monzic Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Monzic Solutions Ltd. All rights reserved.</p>
          <p>You received this email because you purchased a document from Monzic.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Insurance Policy Email Template
export function createInsurancePolicyEmail(
  customerName: string,
  policyNumber: string,
  vehicleDetails: string,
  startDate: string,
  endDate: string,
  amount: number,
  policyDocumentLink: string,
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Insurance Policy Confirmation</title>
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
          <div class="logo">Monzic</div>
          <h1>Insurance Policy Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${customerName},</h2>
          <p>Your insurance policy has been successfully purchased and is now active!</p>
          
          <div class="policy-box">
            <h3>Policy Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Policy Number:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${policyNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Vehicle:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${vehicleDetails}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Coverage Period:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${startDate} to ${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Premium Paid:</strong></td>
                <td style="padding: 8px 0;">£${amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="alert">
            <strong>Important:</strong> Your policy is now active. Please keep this email and your policy document for your records.
          </div>

          <div style="text-align: center;">
            <a href="${policyDocumentLink}" class="button">Download Policy Document</a>
          </div>

          <h3>What's Covered?</h3>
          <ul>
            <li>Third-party liability coverage</li>
            <li>Temporary driving permissions</li>
            <li>24/7 emergency support</li>
          </ul>

          <h3>Need Help?</h3>
          <p>If you need to make a claim or have questions about your policy:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:support@monzic.co.uk">support@monzic.co.uk</a></li>
            <li><strong>Phone:</strong> +44 20 1234 5678</li>
            <li><strong>Emergency Claims:</strong> +44 20 1234 5679 (24/7)</li>
          </ul>
          
          <p>Best regards,<br>The Monzic Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Monzic Solutions Ltd. All rights reserved.</p>
          <p>This email contains important policy information. Please save it for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `
}



// Admin Notification Email Template
export function createAdminNotificationEmail(
  type: "ai_document" | "insurance_policy",
  customerName: string,
  customerEmail: string,
  amount: number,
  details: string,
) {
  const typeLabel = type === "ai_document" ? "AI Document" : "Insurance Policy"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New ${typeLabel} Purchase</title>
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
          <p>A new ${typeLabel.toLowerCase()} has been purchased on Monzic.</p>
          
          <div class="info-box">
            <h3>Purchase Details</h3>
            <ul>
              <li><strong>Customer:</strong> ${customerName}</li>
              <li><strong>Email:</strong> ${customerEmail}</li>
              <li><strong>Amount:</strong> £${amount.toFixed(2)}</li>
              <li><strong>Type:</strong> ${typeLabel}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p><strong>Details:</strong> ${details}</p>
          </div>

          <p>Please review this purchase in the admin dashboard if needed.</p>
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
    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Support Ticket Confirmation</title>
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
                <div class="logo">Monzic</div>
                <h1>Support Ticket Received</h1>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for contacting us. We have successfully received your support request and a ticket has been created for you.</p>
                
                <div class="ticket-info">
                <h3>Your Ticket Details:</h3>
                <ul>
                    <li><strong>Ticket ID:</strong> ${ticketId}</li>
                    <li><strong>Status:</strong> Open</li>
                    <li><strong>Next Step:</strong> Our team will review your request and get back to you shortly.</li>
                </ul>
                </div>

                <p>You can reference this ticket ID in any future communication with us regarding this matter. We aim to respond to all inquiries within 24 hours.</p>
                
                <p>Best regards,<br>The Monzic Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Monzic Solutions Ltd. All rights reserved.</p>
                <p>You are receiving this email because you submitted a contact form on our website.</p>
            </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to,
        subject,
        html: emailHtml,
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
    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Reply to Your Support Ticket</title>
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
                <div class="logo">Monzic</div>
                <h1>New Reply to Your Ticket</h1>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>A support agent has replied to your ticket with the ID: <strong>${ticketId}</strong>.</p>
                
                <div class="message-box">
                <h3>Reply:</h3>
                <p>${message}</p>
                </div>

                <p>Please contact us if you have further questions. We appreciate your patience.</p>
                
                <p>Best regards,<br>The Monzic Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Monzic Solutions Ltd. All rights reserved.</p>
                <p>You are receiving this email because you have an active support ticket with us.</p>
            </div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to,
        subject,
        html: emailHtml,
        attachments
    })
}

