import { NavLink, Link, Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/channel";
import { requireUserId } from "~/server/auth.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getAccountAnalytics,
  getYoutubeDashboardData,
} from "~/server/analytics.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const handle = params.handle;

  if (!handle) throw new Response("Handle required", { status: 400 });

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam) : 30;

  const [youtubeAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.platform, "youtube"),
        eq(accounts.username, handle)
      )
    )
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
    return { data, charts: { history: history }, handle };
  } catch (error) {
    console.error("Failed to load YouTube channel data:", error);
    return {
      data: null,
      error: "Failed to load YouTube channel data.",
      handle,
    };
  }
}

export default function YoutubeChannelLayout() {
  const loaderData = useLoaderData<typeof loader>();
  const { data, error, handle } = loaderData as any;

  if (error || !data) {
    return (
      <div className="p-6 rounded-md bg-red-50 text-red-700">
        <p className="text-center text-xl! mb-0! font-bold">
          Error loading data for @{handle}. Please try refreshing or
          reconnecting your account.
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
              <Link
                to={data?.channel?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-400 ease-in-out"
              >
                <img
                  src={data.channel.avatar}
                  alt={data.channel.title}
                  className="h-16 w-16 rounded-full border-2 border-white"
                />
              </Link>
            )}
            <div className="flex flex-col justify-center">
              <h3 className="mb-0!">{data?.channel?.title}</h3>
              <Link
                to={data?.channel?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:underline"
              >
                {data?.channel?.handle}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-5">
          <div className="inline-flex rounded-lg bg-surface-inverse p-1 shadow-sm text-sm uppercase font-bold">
            <NavLink
              to={`/dashboard/youtube/${handle}`}
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-md transition ${
                  isActive
                    ? "bg-accent text-text-inverse"
                    : "text-text-main opacity-50 hover:bg-surface hover:text-text-inverse"
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to={`/dashboard/youtube/${handle}/shorts`}
              className={({ isActive }) =>
                `ml-1 px-3 py-1.5 rounded-md transition ${
                  isActive
                    ? "bg-accent text-text-inverse"
                    : "text-text-main opacity-50 hover:bg-surface hover:text-text-inverse"
                }`
              }
            >
              Shorts
            </NavLink>
          </div>
        </div>
      </header>

      <Outlet context={loaderData} />
    </div>
  );
}
