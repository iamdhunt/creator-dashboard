import type { ChartDataPoint } from "~/components/growth-chart";

interface HistoryEntry {
  date: string;
  accountId: string;
  followerCount: number | null;
  followersGained: number | null;
  impressionCount: number | null;
  impressionsGained: number | null;
  engagementRate: number | null;
  engagementRateChange: number | null;
  createdAt: Date;
}

export interface MultiLineChartData {
  date: any;
  value: number;
  delta: number;
  [accountId: string]: number | string;
}

export function processChartData(
  history: HistoryEntry[],
  accounts: { id: string; platform: string; username: string }[]
) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const historyMap = new Map<
    string,
    Map<
      string,
      {
        followers: { current: number; delta: number };
        impressions: { current: number; delta: number };
        engagement: { current: number; delta: number };
      }
    >
  >();

  sortedHistory.forEach((entry) => {
    const dateStr = entry.date;
    const accountId = entry.accountId;

    if (!historyMap.has(dateStr)) {
      historyMap.set(dateStr, new Map());
    }
    const dailyMap = historyMap.get(dateStr)!;

    const existing = dailyMap.get(accountId) || {
      followers: { current: 0, delta: 0 },
      impressions: { current: 0, delta: 0 },
      engagement: { current: 0, delta: 0 },
    };

    dailyMap.set(accountId, {
      followers: {
        current: entry.followerCount || 0,
        delta: existing.followers.delta + (entry.followersGained || 0),
      },
      impressions: {
        current: entry.impressionCount || 0,
        delta: existing.impressions.delta + (entry.impressionsGained || 0),
      },
      engagement: {
        current: entry.engagementRate || 0,
        delta: existing.engagement.delta + (entry.engagementRateChange || 0),
      },
    });
  });

  const sortedDates = Array.from(historyMap.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const followersData: MultiLineChartData[] = [];
  const impressionsData: MultiLineChartData[] = [];
  const engagementData: MultiLineChartData[] = [];

  sortedDates.forEach((date) => {
    const accountMap = historyMap.get(date)!;
    const values = Array.from(accountMap.values());
    const count = values.length;

    const totalFollowers = values.reduce(
      (sum, v) => sum + v.followers.current,
      0
    );
    const deltaFollowers = values.reduce(
      (sum, v) => sum + v.followers.delta,
      0
    );

    const totalImpressions = values.reduce(
      (sum, v) => sum + v.impressions.current,
      0
    );
    const deltaImpressions = values.reduce(
      (sum, v) => sum + v.impressions.delta,
      0
    );

    const avgEngagement =
      count > 0
        ? values.reduce((sum, v) => sum + v.engagement.current, 0) / count
        : 0;
    const deltaEngagement =
      count > 0
        ? values.reduce((sum, v) => sum + v.engagement.delta, 0) / count
        : 0;

    const followersEntry: MultiLineChartData = {
      date,
      value: totalFollowers,
      delta: deltaFollowers,
    };

    const impressionsEntry: MultiLineChartData = {
      date,
      value: totalImpressions,
      delta: deltaImpressions,
    };

    const engagementEntry: MultiLineChartData = {
      date,
      value: avgEngagement,
      delta: deltaEngagement,
    };

    accounts.forEach((acc) => {
      const accData = accountMap.get(acc.id);
      if (accData) {
        followersEntry[acc.id] = accData.followers.current;
        impressionsEntry[acc.id] = accData.impressions.current;
        engagementEntry[acc.id] = accData.engagement.current;
      }
    });

    followersData.push(followersEntry);
    impressionsData.push(impressionsEntry);
    engagementData.push(engagementEntry);
  });

  return {
    followers: followersData,
    impressions: impressionsData,
    engagement: engagementData,
  };
}
