import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/forgot-password";
import { db } from "~/db/db.server";
import { users } from "~/db/schema";
import { emailSchema } from "~/services/validation";
import z from "zod";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "~/services/email.server";

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
    await sendPasswordResetEmail(user.email, user.id);
  }

  return { success: true };
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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
                  className="block text-sm font-medium leading-6 text-gray-900"
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                  />
                </div>
                {actionData?.error && (
                  <p className="mt-2 text-sm text-red-600">
                    {actionData.error}
                  </p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="text-sm text-gray-500 hover:text-gray-900"
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
