import { Link, Form, useNavigation } from "react-router";
import type { Route } from "./+types/home";
import { requireUserId } from "~/services/auth.server";
import { eq } from "drizzle-orm";
import { accounts, users } from "~/db/schema";
import { db } from "~/db/db.server";
import { refreshAccountStats } from "~/services/analytics.server";
import { GrowthChart } from "~/components/growth-chart";

import type { ChartDataPoint } from "~/components/growth-chart";
import { processChartData } from "~/utils/analytics";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const userWithAccounts = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      accounts: {
        with: {
          analyticsHistory: true,
        },
      },
    },
  });

  if (!userWithAccounts) {
    throw new Response("User not found", { status: 404 });
  }

  const accounts = userWithAccounts.accounts;

  const totalFollowers = accounts.reduce(
    (sum, acc) => sum + (acc.followers || 0),
    0
  );
  const totalViews = accounts.reduce(
    (sum, acc) => sum + (acc.totalViews || 0),
    0
  );
  const avgEngagement =
    accounts.length > 0
      ? accounts.reduce((sum, acc) => sum + (acc.engagementRate || 0), 0) /
        accounts.length
      : 0;

  const allHistory = accounts.flatMap((acc) => acc.analyticsHistory);

  const charts = processChartData(allHistory, accounts);

  return {
    user: userWithAccounts,
    accounts,
    stats: {
      totalFollowers,
      totalViews,
      avgEngagement,
      accountCount: accounts.length,
    },
    charts,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "refresh") {
    const userAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
    });

    await Promise.all(
      userAccounts.map((account) => refreshAccountStats(account.id))
    );
  }

  return { success: true };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { user, stats, charts, accounts } = loaderData;
  const navigation = useNavigation();
  const isRefreshing =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "refresh";

  return (
    <div className="space-y-6">
      <header>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-2 text-gray-600">
            You are logged in as{" "}
            <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        {stats.accountCount > 0 && (
          <Form method="post">
            <button
              type="submit"
              name="intent"
              value="refresh"
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Stats"}
            </button>
          </Form>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Placeholder Stats Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Followers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalFollowers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg. Engagement</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.avgEngagement.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      {stats.accountCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrowthChart
            title="Follower Growth"
            data={charts.followers}
            color="#4f46e5"
            accounts={accounts}
          />
          <GrowthChart
            title="Total Impressions"
            data={charts.impressions}
            color="#0ea5e9"
            accounts={accounts}
          />
          <GrowthChart
            title="Avg. Engagement Rate"
            data={charts.engagement}
            color="#ec4899"
            unit="%"
            accounts={accounts}
          />
        </div>
      )}

      {stats.accountCount === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            Connect your social accounts to see real data.
          </p>
          <Link
            to="/dashboard/settings"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Connect Account
          </Link>
        </div>
      )}
    </div>
  );
}
