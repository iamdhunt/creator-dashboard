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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    <div className="mx-auto">
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

      <div className="bg-surface shadow rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-4">Connected Accounts</h2>
        {accounts.length === 0 ? (
          <p className="">No accounts connected yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium capitalize">{account.platform}</p>
                  <p className="text-sm">@{account.username}</p>
                </div>
                <Form method="post">
                  <input type="hidden" name="intent" value="disconnect" />
                  <input type="hidden" name="accountId" value={account.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 border-2 border-transparent hover:border-2 hover:border-red-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600"
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
      <div className="bg-surface shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Connect New Account</h2>
        <Form method="post">
          <input type="hidden" name="intent" value="init-youtube" />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-md bg-[#FF0000] px-3 py-2 text-sm font-semibold shadow-sm hover:bg-[#D90000] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#FF0000] cursor-pointer"
          >
            <FontAwesomeIcon icon={["fab", "youtube"]} size="lg" />
            Connect YouTube
          </button>
        </Form>
      </div>

      <div className="bg-surface shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Update Profile</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update-profile" />

          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium">
              New Email Address
            </label>
            <input
              type="email"
              name="newEmail"
              id="newEmail"
              className="mt-1 block w-full rounded-md bg-offwhite border border-transparent shadow-sm sm:text-sm p-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue placeholder-gray-500"
              placeholder={user.email}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              className="mt-1 block w-full rounded-md bg-offwhite border border-transparent shadow-sm sm:text-sm p-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue placeholder-gray-500"
              placeholder="Leave blank to keep current"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium"
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <p className="text-xs mb-2 opacity-60">Required to save changes</p>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              required
              className="mt-1 block w-full rounded-md bg-offwhite text-text-main shadow-sm sm:text-sm p-2 border border-transparent focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
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
            className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
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
