import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/forgot-password";
import { db } from "~/db/db.server";
import { users, passwordResetTokens } from "~/db/schema";
import { emailSchema } from "~/server/validation";
import z from "zod";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "~/server/email.server";
import { redirectIfLoggedIn } from "~/server/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfLoggedIn(request);
  return null;
}

const forgottenPasswordSchema = z.object({
  email: emailSchema,
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  const result = forgottenPasswordSchema.safeParse({ email });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, result.data.email))
    .limit(1);

  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: token,
      expiresAt: expiresAt,
    });

    await sendPasswordResetEmail(user.email, token);
  }

  return { success: true };
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {actionData?.success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Check your inbox
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      If an account exists for that email, we have sent password
                      reset instructions.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/auth/login"
                      className="text-sm font-medium text-green-800 hover:text-green-700"
                    >
                      Back to login &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Form method="post" className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border border-transparent bg-offwhite text-text-main px-3 py-2 shadow-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue sm:text-sm"
                  />
                </div>
                {actionData?.error && (
                  <div className="mt-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {actionData.error}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium shadow-sm hover:cursor-pointer hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="font-medium text-accent-blue hover:underline focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  Back to login
                </Link>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
