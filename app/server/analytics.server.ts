import { db } from "~/db/db.server";
import { accounts, analyticsHistory, apiCache } from "~/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  getChannelAnalytics,
  getChannelInfo,
  refreshAccessToken,
  getTopVideos,
  getDemographics,
  getTrafficSources,
  getVideoDetails,
  getChannelOverview,
  getTopCountries,
  getTopSubscriberVideos,
  getShortsAggregateRatios,
  getTopShortsVideos,
  getTopSubscriberShortsVideos,
  getSingleTopVideo,
  getSingleTopShort,
} from "./youtube.server";
import { subscribe } from "diagnostics_channel";
import { get } from "http";
import { watch } from "fs";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

async function ensureValidToken(account: typeof accounts.$inferSelect) {
  let accessToken = account.accessToken;

  if (!accessToken) throw new Error("No access token available");

  try {
    await getChannelInfo(accessToken);
    return accessToken;
  } catch (error: any) {
    if (error.message === "Unauthorized" && account.refreshToken) {
      console.log("🔄 Token expired. Refreshing...");
      try {
        const newTokens = await refreshAccessToken(account.refreshToken);
        if (newTokens.access_token) {
          await db
            .update(accounts)
            .set({ accessToken: newTokens.access_token })
            .where(eq(accounts.id, account.id));
          return newTokens.access_token;
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        throw refreshError;
      }
    }
    throw error;
  }
}

export async function refreshAccountStats(accountId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account) throw new Error("Account not found");

  const accessToken = await ensureValidToken(account);

  const channelInfo = await getChannelInfo(accessToken);
  const totalPosts = parseInt(channelInfo.statistics.videoCount);

  const history = await getAccountAnalytics(
    accountId,
    account.platform,
    30,
    true
  );

  const latest = history[history.length - 1];

  if (latest) {
    await db
      .update(accounts)
      .set({
        followers: latest.followers,
        totalViews: latest.views,
        engagementRate: latest.engagementRate,
        totalPosts: totalPosts,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));

    return {
      followers: latest.followers,
      views: latest.views,
      engagement: latest.engagementRate,
      totalPosts,
    };
  }

  return { followers: 0, views: 0, engagement: 0 };
}

export async function getAccountAnalytics(
  accountId: string,
  platform: string,
  days: number,
  forceRefresh: boolean = false
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  if (!forceRefresh) {
    const cachedData = await db
      .select()
      .from(analyticsHistory)
      .where(
        and(
          eq(analyticsHistory.accountId, accountId),
          gte(analyticsHistory.date, formatDate(startDate)),
          lte(analyticsHistory.date, formatDate(endDate))
        )
      )
      .orderBy(desc(analyticsHistory.date));

    if (cachedData.length >= days - 2) {
      console.log("✅ Serving from Cache");
      return cachedData
        .map((row) => ({
          date: row.date,
          views: row.impressionCount,
          dailyViews: row.impressionsGained,
          followers: row.followerCount,
          followersGained: row.followersGained,
          likes: row.likes,
          comments: row.comments,
          shares: row.shares,
          interactions: row.totalInteractions,
          engagementRate: row.engagementRate,
          watchTimeHours: (row.watchMinutes || 0) / 60,
        }))
        .reverse();
    }
  }

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account) return [];

  if (
    platform === "youtube" &&
    account.accessToken &&
    account.platformAccountId
  ) {
    let accessToken: string;

    // Try refreshing token if invalid
    try {
      accessToken = await ensureValidToken(account);
    } catch (error) {
      console.error("failed to validate token:", error);
      return [];
    }

    try {
      console.log("🌍 Fetching from YouTube API...");
      const channelInfo = await getChannelInfo(accessToken);
      let currentTotalSubs = parseInt(channelInfo.statistics.subscriberCount);
      let currentTotalViews = parseInt(channelInfo.statistics.viewCount);

      const rows = await getChannelAnalytics(
        accessToken,
        account.platformAccountId,
        formatDate(startDate),
        formatDate(endDate)
      );

      const history = [];

      // reverse the rows to process from newest to oldest
      const reversedRows = [...rows].reverse();

      for (const row of reversedRows) {
        // row: [date, views, subsGained, subsLost, likes, comments, shares, estimatedMinutesWatched, averageViewDuration]
        const dateStr = row[0];
        const dailyViews = Math.max(0, row[1]);
        const netSubs = row[2] - row[3];
        const likes = Math.max(0, row[4] || 0);
        const comments = Math.max(0, row[5] || 0);
        const shares = Math.max(0, row[6] || 0);
        const estimatedMinutesWatched = Math.max(0, row[7] || 0);
        const avgViewDurationSeconds = Math.max(0, row[8] || 0);

        // Fallback: estimate minutes
        const watchMinutes =
          estimatedMinutesWatched > 0
            ? estimatedMinutesWatched
            : Math.round((avgViewDurationSeconds * dailyViews) / 60);

        // Calculate engagement rate (likes + comments + shares) / views
        const engagementRate =
          dailyViews > 0 ? ((likes + comments + shares) / dailyViews) * 100 : 0;

        const interactions = likes + comments + shares;

        history.push({
          date: dateStr,
          views: currentTotalViews,
          dailyViews: dailyViews,
          followers: currentTotalSubs,
          followersGained: netSubs,
          likes,
          comments,
          shares,
          engagementRate,
          watchTimeHours: watchMinutes / 60,
          interactions,
        });

        await db
          .insert(analyticsHistory)
          .values({
            accountId: account.id,
            date: dateStr,
            followerCount: currentTotalSubs,
            followersGained: netSubs,
            impressionCount: currentTotalViews,
            impressionsGained: dailyViews,
            likes,
            comments,
            shares,
            totalInteractions: interactions,
            engagementRate,
            watchMinutes,
          })
          .onConflictDoUpdate({
            target: [analyticsHistory.accountId, analyticsHistory.date],
            set: {
              followerCount: currentTotalSubs,
              followersGained: netSubs,
              impressionCount: currentTotalViews,
              impressionsGained: dailyViews,
              likes,
              comments,
              shares,
              totalInteractions: interactions,
              engagementRate,
              watchMinutes,
            },
          });

        currentTotalViews -= dailyViews;
        currentTotalSubs -= netSubs;
      }

      return history.reverse();
    } catch (error) {
      console.error("YouTube API Error:", error);
      return [];
    }
  }

  return [];
}

export async function getAggregateAnalytics(userId: string, days: number = 30) {
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  const allHistory = await Promise.all(
    userAccounts.map((acc) => getAccountAnalytics(acc.id, acc.platform, days))
  );

  // Aggregate data by date
  const dateMap = new Map<
    string,
    {
      views: number;
      followers: number;
      followersGained: number;
      interactions: number;
      dailyViews: number;
    }
  >();

  // Initialize map with empty dates (to ensure no gaps)
  for (let i = 0; i < days; i++) {
    const d = new Date();

    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = formatDate(d);
    dateMap.set(dateStr, {
      views: 0,
      followers: 0,
      followersGained: 0,
      interactions: 0,
      dailyViews: 0,
    });
  }

  // Sum up the data
  for (const history of allHistory) {
    // loop through each account
    for (const entry of history) {
      // loop through each day in account history
      const current = dateMap.get(entry.date); // look up date in map
      if (current) {
        current.views += entry.views || 0;
        current.followers += entry.followers || 0;
        current.followersGained += entry.followersGained || 0;

        const entryInteractions =
          Math.max(0, entry.likes || 0) +
          Math.max(0, entry.comments || 0) +
          Math.max(0, entry.shares || 0);

        current.interactions += entryInteractions;
        current.dailyViews += entry.dailyViews || 0;
      }
    }
  }

  // Convert map back to array for chart component
  return Array.from(dateMap.entries()).map(([date, stats]) => {
    const engagementRate =
      stats.dailyViews > 0 ? (stats.interactions / stats.dailyViews) * 100 : 0;

    return {
      date,
      views: stats.views,
      followers: stats.followers,
      followersGained: stats.followersGained,
      dailyViews: stats.dailyViews,
      engagementRate,
      interactions: stats.interactions,
    };
  });
}

export async function getYoutubeDashboardData(
  accountId: string,
  days: number = 30
) {
  const cacheKey = `youtube_dashboard_${days}d`;

  const [cachedEntry] = await db
    .select()
    .from(apiCache)
    .where(and(eq(apiCache.accountId, accountId), eq(apiCache.key, cacheKey)))
    .limit(1);

  if (cachedEntry && new Date(cachedEntry.expiresAt) > new Date()) {
    console.log("⚡ Serving Dashboard from Cache");
    return cachedEntry.data as any;
  }

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account || account.platform !== "youtube") {
    throw new Error("YouTube account not found");
  }

  const accessToken = await ensureValidToken(account);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  const channelInfo = await getChannelInfo(accessToken);

  console.log("🌍 Fetching from YouTube API...");
  const [
    topVideosRaw,
    topSubVideosRaw,
    demographicsRaw,
    trafficRaw,
    countriesRaw,
    overview,
    shortsRatios,
    topShortsRaw,
    topSubShortsRaw,
    topVideoByViewsRaw,
    topVideoBySubsRaw,
    topVideoByEstimatedMinutesWatchedRaw,
    topShortByViewsRaw,
    topShortBySubsRaw,
    topShortByEstimatedMinutesWatchedRaw,
  ] = await Promise.all([
    getTopVideos(accessToken, account.platformAccountId!, startStr, endStr),
    getTopSubscriberVideos(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getDemographics(accessToken, account.platformAccountId!, startStr, endStr),
    getTrafficSources(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getTopCountries(accessToken, account.platformAccountId!, startStr, endStr),
    getChannelOverview(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getShortsAggregateRatios(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getTopShortsVideos(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getTopSubscriberShortsVideos(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr
    ),
    getSingleTopVideo(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-views"
    ),
    getSingleTopVideo(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-subscribersGained"
    ),
    getSingleTopVideo(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-estimatedMinutesWatched"
    ),
    getSingleTopShort(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-views"
    ),
    getSingleTopShort(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-subscribersGained"
    ),
    getSingleTopShort(
      accessToken,
      account.platformAccountId!,
      startStr,
      endStr,
      "-estimatedMinutesWatched"
    ),
  ]);

  const allVideoIds = new Set([
    ...topVideosRaw.map((r: any) => r[0]),
    ...topSubVideosRaw.map((r: any) => r[0]),
    ...topShortsRaw.map((r: any) => r[0]),
    ...topSubShortsRaw.map((r: any) => r[0]),
    ...(topVideoByViewsRaw ? [topVideoByViewsRaw[0]] : []),
    ...(topVideoBySubsRaw ? [topVideoBySubsRaw[0]] : []),
    ...(topVideoByEstimatedMinutesWatchedRaw
      ? [topVideoByEstimatedMinutesWatchedRaw[0]]
      : []),
    ...(topShortByViewsRaw ? [topShortByViewsRaw[0]] : []),
    ...(topShortBySubsRaw ? [topShortBySubsRaw[0]] : []),
    ...(topShortByEstimatedMinutesWatchedRaw
      ? [topShortByEstimatedMinutesWatchedRaw[0]]
      : []),
  ]);
  const videoDetails = await getVideoDetails(
    accessToken,
    Array.from(allVideoIds)
  );

  const processVideoList = (rows: any[]) =>
    rows.map((row: any) => ({
      id: row[0],
      title: videoDetails[row[0]]?.title || "Unknown Video",
      thumbnail:
        videoDetails[row[0]]?.thumbnail?.maxres?.url ||
        videoDetails[row[0]]?.thumbnail?.standard?.url ||
        videoDetails[row[0]]?.thumbnail?.high?.url ||
        "",
      views: row[1],
      engagedViews: row[2],
      likes: row[3],
      comments: row[4],
      shares: row[5],
      avgViewPercentage: row[6],
      subscribersGained: row[7],
      avgDuration: row[8],
      watchTimeHours: row[9] / 60,
    }));

  const resultData = {
    channel: {
      title: channelInfo.snippet.title,
      handle: channelInfo.snippet.customUrl,
      avatar:
        channelInfo.snippet.thumbnails?.medium?.url ||
        channelInfo.snippet.thumbnails?.default?.url ||
        "",
      url: `https://youtube.com/${channelInfo.snippet.customUrl || "channel/" + channelInfo.id}`,
      subscriberCount: parseInt(channelInfo.statistics.subscriberCount),
      videoCount: parseInt(channelInfo.statistics.videoCount),
      viewCount: parseInt(channelInfo.statistics.viewCount),
    },
    overview,
    topVideos: processVideoList(topVideosRaw),
    topSubscriberVideos: topSubVideosRaw.map((row: any) => ({
      id: row[0],
      title: videoDetails[row[0]]?.title || "Unknown Video",
      thumbnail:
        videoDetails[row[0]]?.thumbnail?.maxres?.url ||
        videoDetails[row[0]]?.thumbnail?.standard?.url ||
        "",
      views: row[1],
      engagedViews: row[2],
      subscribersGained: row[3],
      subscribersLost: row[4],
      avgViewPercentage: row[5],
    })),
    demographics: demographicsRaw.map((row: any) => ({
      age: row[0],
      gender: row[1],
      percentage: row[2],
    })),
    trafficSources: trafficRaw.map((row: any) => ({
      source: row[0],
      views: row[1],
    })),
    countries: countriesRaw.map((row: any) => ({
      code: row[0],
      views: row[1],
    })),
    shortsRatios,
    topShortsVideos: processVideoList(topShortsRaw),
    topSubscriberShorts: topSubShortsRaw.map((row: any) => ({
      id: row[0],
      title: videoDetails[row[0]]?.title || "Unknown Video",
      thumbnail:
        videoDetails[row[0]]?.thumbnail?.maxres?.url ||
        videoDetails[row[0]]?.thumbnail?.standard?.url ||
        "",
      views: row[1],
      engagedViews: row[2],
      subscribersGained: row[3],
      subscribersLost: row[4],
      avgViewPercentage: row[5],
    })),
    // All single top video objects
    topVideoByViews: topVideoByViewsRaw
      ? {
          id: topVideoByViewsRaw[0],
          title: videoDetails[topVideoByViewsRaw[0]]?.title,
          thumbnail:
            videoDetails[topVideoByViewsRaw[0]]?.thumbnail?.maxres?.url,
          views: Number(topVideoByViewsRaw[1]),
          engagedViews: Number(topVideoByViewsRaw[2]),
        }
      : null,
    topVideoBySubs: topVideoBySubsRaw
      ? {
          id: topVideoBySubsRaw[0],
          title: videoDetails[topVideoBySubsRaw[0]]?.title,
          thumbnail: videoDetails[topVideoBySubsRaw[0]]?.thumbnail?.maxres?.url,
          subscribersGained: Number(topVideoBySubsRaw[3]),
        }
      : null,
    topVideoByEstimatedMinutesWatched: topVideoByEstimatedMinutesWatchedRaw
      ? {
          id: topVideoByEstimatedMinutesWatchedRaw[0],
          title: videoDetails[topVideoByEstimatedMinutesWatchedRaw[0]]?.title,
          thumbnail:
            videoDetails[topVideoByEstimatedMinutesWatchedRaw[0]]?.thumbnail
              ?.maxres?.url,
          watchTimeHours: Number(topVideoByEstimatedMinutesWatchedRaw[4]) / 60,
        }
      : null,
    topShortByViews: topShortByViewsRaw
      ? {
          id: topShortByViewsRaw[0],
          title: videoDetails[topShortByViewsRaw[0]]?.title,
          thumbnail:
            videoDetails[topShortByViewsRaw[0]]?.thumbnail?.maxres?.url,
          views: Number(topShortByViewsRaw[1]),
          engagedViews: Number(topShortByViewsRaw[2]),
        }
      : null,
    topShortBySubs: topShortBySubsRaw
      ? {
          id: topShortBySubsRaw[0],
          title: videoDetails[topShortBySubsRaw[0]]?.title,
          thumbnail: videoDetails[topShortBySubsRaw[0]]?.thumbnail?.maxres?.url,
          subscribersGained: Number(topShortBySubsRaw[3]),
        }
      : null,
    topShortByEstimatedMinutesWatched: topShortByEstimatedMinutesWatchedRaw
      ? {
          id: topShortByEstimatedMinutesWatchedRaw[0],
          title: videoDetails[topShortByEstimatedMinutesWatchedRaw[0]]?.title,
          thumbnail:
            videoDetails[topShortByEstimatedMinutesWatchedRaw[0]]?.thumbnail
              ?.maxres?.url,
          watchTimeHours: Number(topShortByEstimatedMinutesWatchedRaw[4]) / 60,
        }
      : null,
  };

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await db
    .insert(apiCache)
    .values({
      accountId: accountId,
      key: cacheKey,
      data: resultData,
      expiresAt: expiresAt,
    })
    .onConflictDoUpdate({
      target: [apiCache.accountId, apiCache.key],
      set: {
        data: resultData,
        expiresAt: expiresAt,
        updatedAt: new Date(),
      },
    });

  return resultData;
}
