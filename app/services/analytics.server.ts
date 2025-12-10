import { db } from "~/db/db.server";
import { accounts, analyticsHistory } from "~/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  getChannelAnalytics,
  getChannelInfo,
  refreshAccessToken,
} from "./youtube.server";

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
          engagementRate: row.engagementRate,
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
        // row: [date, views, subsGained, subsLost, likes, comments, shares]
        const dateStr = row[0];
        const dailyViews = row[1];
        const netSubs = row[2] - row[3];
        const likes = row[4] || 0;
        const comments = row[5] || 0;
        const shares = row[6] || 0;

        // Calculate engagement rate (likes + comments + shares) / views
        const engagementRate =
          dailyViews > 0 ? ((likes + comments + shares) / dailyViews) * 100 : 0;

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
            engagementRate,
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
              engagementRate,
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
          (entry.likes || 0) + (entry.comments || 0) + (entry.shares || 0);

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
