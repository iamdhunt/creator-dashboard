import { Form, useNavigation, useActionData, redirect } from "react-router";
import type { Route } from "./+types/settings";
import { requireUserId } from "~/services/auth.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { logout } from "~/services/auth.server";
import { users } from "~/db/schema";
import bcrypt from "bcryptjs";
import { updateProfileSchema } from "~/services/validation";
import { generateAuthUrl, revokeToken } from "~/services/youtube.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { accounts: userAccounts, user };
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

    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
      .limit(1);

    if (account) {
      if (account.platform === "youtube" && account.accessToken) {
        await revokeToken(account.accessToken);
      }

      await db.delete(accounts).where(eq(accounts.id, accountId));
    }
  }

  if (intent === "init-youtube") {
    const url = generateAuthUrl();
    return redirect(url);
  }

  if (intent === "delete-user") {
    await db.delete(users).where(eq(users.id, userId));

    return logout(request);
  }

  if (intent === "update-profile") {
    const data = Object.fromEntries(formData);

    const result = updateProfileSchema.safeParse(data);

    if (!result.success) {
      const error = result.error.issues[0].message;
      return { error };
    }

    const { currentPassword, newEmail, newPassword } = result.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return { error: "User not found" };

    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCorrectPassword) {
      return { error: "Current password is incorrect" };
    }

    const updates: { email?: string; passwordHash?: string } = {};

    if (newEmail && newEmail !== user.email) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, newEmail))
        .limit(1);

      if (existing) return { error: "Email is already in use" };
      updates.email = newEmail;
    }

    if (newPassword) {
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, userId));
    }

    return { success: true };
  }

  return { success: true };
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { accounts, user } = loaderData;
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {actionData?.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Profile updated successfully.</span>
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{actionData.error}</span>
        </div>
      )}

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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Connect New Account</h2>
        <Form method="post">
          <input type="hidden" name="intent" value="init-youtube" />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-md bg-[#FF0000] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#D90000] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#FF0000] cursor-pointer"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Connect YouTube
          </button>
        </Form>

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

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Update Profile</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update-profile" />

          <div>
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium text-gray-700"
            >
              New Email Address
            </label>
            <input
              type="email"
              name="newEmail"
              id="newEmail"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder={user.email}
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Leave blank to keep current"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Required to save changes
            </p>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </Form>
      </div>

      <div className="mt-10 bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4 text-red-700">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Form method="post">
          <input type="hidden" name="intent" value="delete-user" />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            onClick={(e) => {
              if (
                !confirm(
                  "Are you sure you want to delete your account? This action can't be reversed."
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            Delete My Account
          </button>
        </Form>
      </div>
    </div>
  );
}
