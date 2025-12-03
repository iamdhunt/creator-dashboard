import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/signup";
import { signup } from "~/services/auth.server";
import { signupSchema } from "~/services/validation";
import { z } from "zod";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
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
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
                className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
                  actionData?.fieldErrors?.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
            </div>
            {actionData?.fieldErrors?.email && (
              <p className="mt-2 text-sm text-red-600">
                {actionData.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm ${
                  actionData?.fieldErrors?.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
            </div>
            {actionData?.fieldErrors?.password && (
              <p className="mt-2 text-sm text-red-600">
                {actionData.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </Form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
