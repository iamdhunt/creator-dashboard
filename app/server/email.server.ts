import { error } from "console";
import { ServerClient } from "postmark";

const apiKey = process.env.POSTMARK_API_KEY;
const fromEmail = process.env.FROM_EMAIL;

if (!apiKey || !fromEmail) {
  throw new Error("Missing POSTMARK_API_KEY or FROM_EMAIL env variables");
}

const client = new ServerClient(apiKey);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const testRecipient = "dario@dariohunt.com"; // for testing purposes, override the recipient

  try {
    const response = await client.sendEmail({
      From: fromEmail!,
      To: testRecipient,
      Subject: subject,
      HtmlBody: html,
      TextBody: text || html.replace(/<[^>]*>?/gm, ""), // Fallback to plaintext
      MessageStream: "outbound",
    });

    return { success: true, messageId: response.MessageID };
  } catch (e) {
    console.error("Postmark email send error:", e);
    return { success: false, error: e };
  }
}

export async function sendPasswordResetEmail(email: string, tokenHash: string) {
  const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${tokenHash}`;

  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Password Reset</h1>
      <p>Someone requested a password reset for your account. If this was you, click the link below to reset it:</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't ask for this, you can safely ignore this email.</p>
    `,
  });
}
