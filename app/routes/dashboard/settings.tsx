import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/settings";
import { requireUserId } from "~/services/auth.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { success } from "zod";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });

  return { accounts: userAccounts };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "connect") {
    const platform = formData.get("platform");
    const username = formData.get("username");

    if (typeof platform !== "string" || typeof username !== "string") {
      return { error: "Invalid form data" };
    }

    await db.insert(accounts).values({
      userId,
      platform,
      username,
      platformAccountId: `mock-${platform}-${username}`,
      accessToken: "mock-token",
    });
  } else if (intent === "disconnect") {
    const accountId = formData.get("accountId");
    if (typeof accountId !== "string") return { error: "Invalid account ID" };

    await db
      .delete(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
  }

  return { success: true };
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { accounts } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Connected Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-500">No accounts connected yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {account.platform}
                  </p>
                  <p className="text-sm text-gray-500">@{account.username}</p>
                </div>
                <Form method="post">
                  <input type="hidden" name="intent" value="disconnect" />
                  <input type="hidden" name="accountId" value={account.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:text-red-900 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Disconnect
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Connect New Account</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="connect" />

          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700"
            >
              Platform
            </label>
            <select
              name="platform"
              id="platform"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter / X</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username / Handle
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g. mychannel"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Connecting..." : "Connect Account"}
          </button>
        </Form>
      </div>
    </div>
  );
}
