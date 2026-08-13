import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export async function sendResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: "YourApp", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: "Reset your password",
      htmlContent: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
      `,
    });
    console.log("Email sent:", result);
  } catch (err) {
    console.error("Brevo send error:", err.message || err);
    throw err;
  }
}
