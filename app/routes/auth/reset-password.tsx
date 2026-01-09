import {
  Form,
  Link,
  useActionData,
  useNavigation,
  redirect,
} from "react-router";
import type { Route } from "./+types/reset-password";
import z from "zod";
import { passwordSchema } from "~/server/validation";
import { db } from "~/db/db.server";
import { users, passwordResetTokens } from "~/db/schema";
import crypto from "crypto";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirectIfLoggedIn } from "~/server/auth.server";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  await redirectIfLoggedIn(request);

  if (!token) {
    return redirect("/auth/login");
  }

  return { token };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof token !== "string") {
    return { error: "Invalid token" };
  }

  const result = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!resetToken) {
    return {
      error: "Invalid or expired reset link. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(result.data.password, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, resetToken.id));

  return redirect("/auth/login?reset=success");
}

export default function ResetPassword({ loaderData }: Route.ComponentProps) {
  const { token } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Set new password
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="token" value={token} />
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6"
              >
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border border-transparent bg-offwhite text-text-main px-3 py-2 shadow-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-accent-blue sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full rounded-md border border-transparent bg-offwhite text-text-main px-3 py-2 shadow-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-accent-blue sm:text-sm"
                />
              </div>
            </div>
            {actionData?.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {actionData.error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium shadow-sm hover:cursor-pointer hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
