import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/signup";
import { signup } from "~/server/auth.server";
import { signupSchema } from "~/server/validation";
import { z } from "zod";
import { redirectIfLoggedIn } from "~/server/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfLoggedIn(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const result = signupSchema.safeParse(data);

  if (!result.success) {
    const flattened = z.flattenError(result.error);

    return {
      fieldErrors: flattened.fieldErrors,
      fields: data,
    };
  }

  const { email, password } = result.data;

  try {
    return await signup(email, password);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User already exists") {
        return {
          fieldErrors: {
            email: ["This email is already registered"],
          },
          fields: data,
        };
      }
      return { error: error.message };
    }
    return { error: "Something went wrong" };
  }
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Create your account
          </h2>
        </div>

        <Form method="post" className="space-y-6">
          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {actionData.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={actionData?.fields?.email as string}
                required
                className={`block text-text-main bg-offwhite w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-inverse sm:text-sm ${
                  actionData?.fieldErrors?.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-accent-blue focus:ring-accent-blue"
                }`}
              />
            </div>
            {actionData?.fieldErrors?.email && (
              <div className="mt-2 p-3 text-sm rounded-md bg-red-50 text-red-700">
                {actionData.fieldErrors.email[0]}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`block text-text-main bg-offwhite w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-inverse sm:text-sm ${
                  actionData?.fieldErrors?.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-accent-blue focus:ring-accent-blue"
                }`}
              />
            </div>
            {actionData?.fieldErrors?.password && (
              <div className="mt-2 p-3 text-sm rounded-md bg-red-50 text-red-700">
                {actionData.fieldErrors.password[0]}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium shadow-sm hover:cursor-pointer hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </Form>

        <div className="text-center text-sm">
          <span className="text-inverse">Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-medium text-accent-blue hover:underline focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
