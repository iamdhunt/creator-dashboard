import { db } from "~/db/db.server";
import { accounts, analyticsHistory } from "~/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  getChannelAnalytics,
  getChannelInfo,
  refreshAccessToken,
} from "./youtube.server";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export async function refreshAccountStats(accountId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account) throw new Error("Account not found");

  const currentFollowers = account.followers || 0;
  const currentViews = account.totalViews || 0;
  const currentEngagement = account.engagementRate || 0;

  const newFollowers = currentFollowers + Math.floor(Math.random() * 50) + 1;
  const newViews = currentViews + Math.floor(Math.random() * 500) + 100;

  const engagementChange = Math.random() - 0.5;
  const newEngagement = Math.max(0, currentEngagement + engagementChange);

  await db
    .update(accounts)
    .set({
      followers: newFollowers,
      totalViews: newViews,
      engagementRate: newEngagement,
      updatedAt: new Date(),
    })
    .where(eq(accounts.id, accountId));

  const today = new Date().toISOString().split("T")[0];

  await db.insert(analyticsHistory).values({
    accountId: accountId,
    date: today,
    followerCount: newFollowers,
    followersGained: newFollowers - currentFollowers,
    impressionCount: newViews,
    impressionsGained: newViews - currentViews,
    engagementRate: newEngagement,
    engagementRateChange: newEngagement - currentEngagement,
  });

  return {
    followers: newFollowers,
    views: newViews,
    engagement: newEngagement,
  };
}

export async function getAccountAnalytics(
  accountId: string,
  platform: string,
  days: number
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

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
        followers: row.followerCount,
        followersGained: row.followersGained,
      }))
      .reverse();
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
    let accessToken = account.accessToken;

    // Try refreshing token if invalid
    try {
      await getChannelInfo(accessToken);
    } catch (error: any) {
      if (error.message === "Unauthorized" && account.refreshToken) {
        console.log("🔄 Token expired. Refreshing...");
        try {
          const newTokens = await refreshAccessToken(account.refreshToken);
          if (newTokens.access_token) {
            accessToken = newTokens.access_token;

            await db
              .update(accounts)
              .set({ accessToken: newTokens.access_token })
              .where(eq(accounts.id, accountId));
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          return [];
        }
      } else {
        console.error("API Error:", error);
        return [];
      }
    }

    try {
      console.log("🌍 Fetching from YouTube API...");
      const channelInfo = await getChannelInfo(accessToken);
      let currentTotalSubs = parseInt(channelInfo.statistics.subscriberCount);
      let currentTotalViews = parseInt(channelInfo.statistics.viewCount);

      const rows = await getChannelAnalytics(
        account.accessToken,
        account.platformAccountId,
        formatDate(startDate),
        formatDate(endDate)
      );

      const history = [];

      // reverse the rows to process from newest to oldest
      const reversedRows = [...rows].reverse();

      for (const row of reversedRows) {
        // row: [date, views, subscribersGained, subscribersLost]
        const dateStr = row[0];
        const dailyViews = row[1];
        const netSubs = row[2] - row[3];

        history.push({
          date: dateStr,
          views: currentTotalViews,
          followers: currentTotalSubs,
          followersGained: netSubs,
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
          })
          .onConflictDoUpdate({
            target: [analyticsHistory.accountId, analyticsHistory.date],
            set: {
              followerCount: currentTotalSubs,
              followersGained: netSubs,
              impressionCount: currentTotalViews,
              impressionsGained: dailyViews,
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
    { views: number; followers: number; followersGained: number }
  >();

  // Initialize map with empty dates (to ensure no gaps)
  for (let i = 0; i < days; i++) {
    const d = new Date();

    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = formatDate(d);
    dateMap.set(dateStr, { views: 0, followers: 0, followersGained: 0 });
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
      }
    }
  }

  // Convert map back to array for chart component
  return Array.from(dateMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));
}

export async function getAnalyticsHistory(userId: string, days: number = 30) {
  const [youtubeAccount] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.platform, "youtube")))
    .limit(1);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // fetch database cache first
  if (youtubeAccount) {
    const cachedData = await db
      .select()
      .from(analyticsHistory)
      .where(
        and(
          eq(analyticsHistory.accountId, youtubeAccount.id),
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
          followers: row.followerCount,
          followersGained: row.followersGained,
          likes: 0,
          comments: 0,
        }))
        .reverse();
    }
  }

  //check that YouTube is connected
  if (
    youtubeAccount &&
    youtubeAccount.accessToken &&
    youtubeAccount.platformAccountId
  ) {
    try {
      console.log("🌍 Fetching from YouTube API...");
      const channelInfo = await getChannelInfo(youtubeAccount.accessToken);
      let currentTotalSubs = parseInt(channelInfo.statistics.subscriberCount);
      let currentTotalViews = parseInt(channelInfo.statistics.viewCount);

      const rows = await getChannelAnalytics(
        youtubeAccount.accessToken,
        youtubeAccount.platformAccountId,
        formatDate(startDate),
        formatDate(endDate)
      );

      const history = [];

      // reverse the rows to process from newest to oldest
      const reversedRows = [...rows].reverse();

      for (const row of reversedRows) {
        // row: [date, views, subscribersGained, subscribersLost]
        const dateStr = row[0];
        const dailyViews = row[1];
        const netSubs = row[2] - row[3];

        const dayStats = {
          date: dateStr,
          views: currentTotalViews,
          followers: currentTotalSubs,
          followersGained: netSubs,
          likes: 0,
          comments: 0,
        };

        history.push(dayStats);

        await db
          .insert(analyticsHistory)
          .values({
            accountId: youtubeAccount.id,
            date: dateStr,
            followerCount: currentTotalSubs,
            followersGained: netSubs,
            impressionCount: currentTotalViews,
            impressionsGained: dailyViews,
          })
          .onConflictDoUpdate({
            target: [analyticsHistory.accountId, analyticsHistory.date],
            set: {
              followerCount: currentTotalSubs,
              followersGained: netSubs,
              impressionCount: currentTotalViews,
              impressionsGained: dailyViews,
            },
          });

        currentTotalViews -= dailyViews;
        currentTotalSubs -= netSubs;
      }

      return history.reverse();
    } catch (error) {
      console.error(
        "Failed to fetch real YouTube stats, falling back to mock:",
        error
      );
    }
  }

  const data = [];
  let currentFollowers = 1000;
  let currentViews = 5000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));

    const dailyFollowers = Math.floor(Math.random() * 10) + 1;
    const dailyViews = Math.floor(Math.random() * 100) + 50;

    currentFollowers += dailyFollowers;
    currentViews += dailyViews;

    data.push({
      date: formatDate(date),
      followers: currentFollowers,
      followersGained: dailyFollowers,
      views: currentViews, // Cumulative views
      likes: Math.floor(dailyViews * 0.1),
      comments: Math.floor(dailyViews * 0.01),
    });
  }

  return data;
}
