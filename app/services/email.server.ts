import { db } from "~/db/db.server";
import { passwordResetTokens } from "~/db/schema";
import crypto from "crypto";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

export async function sendPasswordResetEmail(email: string, userId: string) {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const resetLink = `${BASE_URL}/auth/reset-password?token=${token}`;

  console.log("==================================================");
  console.log(`📧 MOCK EMAIL TO: ${email}`);
  console.log(`Subject: Reset Your Password`);
  console.log(`Body: Click here to reset your password:`);
  console.log(resetLink);
  console.log("==================================================");
}
