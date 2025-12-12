import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/youtube";
import { requireUserId } from "~/services/auth.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getAccountAnalytics,
  getYoutubeDashboardData,
} from "~/services/analytics.server";
import { VideoList } from "~/components/youtube/video-list";
import { DemographicsChart } from "~/components/youtube/demographics-chart";
import { TrafficSourceChart } from "~/components/youtube/traffic-source-chart";
import { CountryList } from "~/components/youtube/country-list";
import { SubscriberVideoList } from "~/components/youtube/subscriber-video-list";
import { GrowthChart } from "~/components/growth-chart";

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

export default function YoutubeDashboard({ loaderData }: Route.ComponentProps) {
  const { hasAccount, data, error, charts } = loaderData;

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
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {data.channel.avatar && (
            <img
              src={data.channel.avatar}
              alt={data.channel.title}
              className="h-16 w-16 rounded-full border border-gray-200"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {data.channel.title}
            </h1>
            <a
              href={data.channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-indigo-600 hover:underline"
            >
              {data.channel.handle}
            </a>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Subscribers (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.subscriberCount.toLocaleString()}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Views (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.viewCount.toLocaleString()}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Videos (Lifetime)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.channel.videoCount.toLocaleString()}
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Watch Time (30d)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.overview?.watchTimeHours.toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-500">hrs</span>
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Avg. Video View (30d)
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {data.overview?.avgViewPercentage.toFixed(1)}%
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <VideoList videos={data.topVideos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <TrafficSourceChart data={data.trafficSources} />
        </div>
        <CountryList data={data.countries} />
      </div>

      <div className="grid grid-cols-1">
        <DemographicsChart data={data.demographics} />
      </div>

      <div className="grid grid-cols-1">
        <SubscriberVideoList videos={data.topSubscriberVideos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart
          title="Watch Time (Hours)"
          data={charts.history}
          lines={[
            {
              key: "watchTimeHours",
              color: "#f59e0b",
              name: "Watch Time (Hours)",
            },
          ]}
        />
        <GrowthChart
          title="Subscribers Gained"
          data={charts.history}
          lines={[
            {
              key: "followersGained",
              color: "#4f46e5",
              name: "Subscribers Gained",
            },
          ]}
        />
        <GrowthChart
          title="Views"
          data={charts.history}
          lines={[
            {
              key: "dailyViews",
              color: "#10b981",
              name: "Views",
            },
          ]}
        />
        <GrowthChart
          title="Interactions (Likes, Comments & Shares)"
          data={charts.history}
          lines={[
            {
              key: "interactions",
              color: "#ec4899",
              name: "Likes, Comments & Shares",
            },
          ]}
        />
      </div>
    </div>
  );
}
