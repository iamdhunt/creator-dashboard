import { Link, Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/youtube";
import { requireUserId } from "~/services/auth.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getAccountAnalytics,
  getYoutubeDashboardData,
} from "~/services/analytics.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam) : 30;

  const [youtubeAccount] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.platform, "youtube")))
    .limit(1);

  if (!youtubeAccount) {
    return { hasAccount: false, data: null };
  }

  try {
    const data = await getYoutubeDashboardData(youtubeAccount.id);
    const history = await getAccountAnalytics(
      youtubeAccount.id,
      youtubeAccount.platform,
      days
    );
    return { hasAccount: true, data, charts: { history: history } };
  } catch (error) {
    console.error("Failed to load YouTube data:", error);
    return {
      hasAccount: true,
      data: null,
      error: "Failed to load YouTube data.",
    };
  }
}

export default function YoutubeLayout() {
  const loaderData = useLoaderData();
  const { data, hasAccount, error } = loaderData as any;

  if (!hasAccount) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Connect YouTube Channel
        </h2>
        <p className="mt-2 text-gray-600">
          Link your YouTube account to see deep analytics.
        </p>
        <Link
          to="/dashboard/settings"
          className="mt-6 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-700">
        <p>
          Error loading YouTube data. Please try refreshing or reconnecting your
          account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {data?.channel?.avatar && (
              <img
                src={data.channel.avatar}
                alt={data.channel.title}
                className="h-16 w-16 rounded-full border border-gray-200"
              />
            )}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {data?.channel?.title}
              </h1>
              <a
                href={data?.channel?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-600 hover:underline"
              >
                {data?.channel?.handle}
              </a>
            </div>
          </div>
        </div>
        <div className="flex gap-5 mt-4">
          <Link
            to="/dashboard/youtube/"
            target=""
            rel=""
            className="w-100 text-center uppercase rounded-md bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Overview
          </Link>
          <Link
            to="/dashboard/youtube/shorts"
            target=""
            rel=""
            className="w-100 text-center uppercase rounded-md bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Shorts
          </Link>
        </div>
      </header>

      {/* mount child routes here; children can access loader data via useOutletContext() */}
      <Outlet context={loaderData} />
    </div>
  );
}
