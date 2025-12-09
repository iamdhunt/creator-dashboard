import { Link, Form, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { requireUserId } from "~/services/auth.server";
import { eq } from "drizzle-orm";
import { accounts, users } from "~/db/schema";
import { db } from "~/db/db.server";
import {
  refreshAccountStats,
  getAggregateAnalytics,
} from "~/services/analytics.server";
import { GrowthChart } from "~/components/growth-chart";

import type { ChartDataPoint } from "~/components/growth-chart";
import { processChartData } from "~/utils/analytics";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam) : 30;

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  const history = await getAggregateAnalytics(userId, days);

  const latest = history[history.length - 1] || { followers: 0, views: 0 };

  const stats = {
    totalFollowers: latest.followers,
    totalViews: latest.views,
    avgEngagement: 0,
    accountCount: userAccounts.length,
  };

  return {
    stats,
    charts: {
      followers: history,
      views: history,
    },
    days,
    accounts: userAccounts,
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
  const { stats, charts, accounts, days } = loaderData;
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isRefreshing =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "refresh";

  return (
    <div className="space-y-6">
      <header>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          </div>
          <div className="flex items-center gap-4">
            {stats.accountCount > 0 && (
              <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {[7, 30, 90].map((d) => (
                  <Link
                    key={d}
                    to={`?days=${d}`}
                    preventScrollReset
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      days === d
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {d}D
                  </Link>
                ))}
              </div>
            )}
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
        </div>
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
            lines={[
              { key: "followers", color: "#4f46e5", name: "Total Followers" },
            ]}
          />
          <GrowthChart
            title="Total Impressions/Views"
            data={charts.views}
            lines={[{ key: "views", color: "#10b981", name: "Total Views" }]}
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
