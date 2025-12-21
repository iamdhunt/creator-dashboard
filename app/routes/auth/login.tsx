import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { login } from "~/services/auth.server";
import { redirectIfLoggedIn } from "~/services/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await redirectIfLoggedIn(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form data" };
  }

  try {
    return await login(email, password);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Something went wrong" };
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-surface p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Sign in to your account
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
                required
                className="block w-full rounded-md border border-transparent bg-offwhite text-text-main px-3 py-2 shadow-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-accent-blue sm:text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium hover:underline focus:outline-none focus:ring-2"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border border-transparent bg-offwhite text-text-main px-3 py-2 shadow-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium shadow-sm hover:cursor-pointer hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-inverse focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </Form>

        <div className="text-center text-sm">
          <span className="text-inverse">Don't have an account? </span>
          <Link
            to="/auth/signup"
            className="font-medium text-accent-blue hover:underline focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
