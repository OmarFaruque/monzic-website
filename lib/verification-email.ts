import nodemailer from 'nodemailer';


// Conditionally create the auth object
const auth =
  process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined;
// Configure the SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: auth,
});

/**
 * Sends a verification email to a user.
 * @param email The recipient's email address.
 * @param token The verification code or token.
 */
export async function sendVerificationEmail(email: string, token: string) {
  // In your original request, you used a token, but the code generates a 6-digit code.
  // This function is adapted for the 6-digit code.
  // If you switch to a token, you can build the link as originally requested.

  const mailOptions = {
    from: `"Monzic" <no-reply@monzic.com>`, // Sender address
    to: email, // Recipient
    subject: "Verify your account", // Subject line
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Account Verification</h2>
        <p>Thank you for registering. Your 6-digit verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${token}</p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `, // HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    // In a production app, you'd want to handle this error more gracefully
    throw new Error("Could not send verification email.");
  }
}