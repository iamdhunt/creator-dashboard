import { OAuth2Client } from "google-auth-library";
import { URL } from "url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error("Google OAuth environment variables are not set");
}

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export function generateAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Request refresh token
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ],
    prompt: "consent", // Force consent to get refresh token every time (useful for testing)
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

export async function revokeToken(token: string) {
  try {
    await oauth2Client.revokeToken(token);
  } catch (error) {
    console.warn("Failed to revoke token:", error);
  }
}

export async function getChannelInfo(accessToken: string) {
  const url =
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true";
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch channel info from YouTube API");
  }

  const data = await response.json();
  return data.items?.[0]; // Returns the first channel found
}

export async function getChannelOverview(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "estimatedMinutesWatched,averageViewDuration,averageViewPercentage,views,subscribersGained,subscribersLost";
  const dimensions = "";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const row = data.rows?.[0];

  if (!row) return null;

  return {
    watchTimeHours: (row[0] || 0) / 60,
    avgViewDuration: row[1] || 0,
    avgViewPercentage: row[2] || 0,
    views: row[3] || 0,
    netSubscribers: (row[4] || 0) - (row[5] || 0),
  };
}

export async function getChannelAnalytics(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,subscribersGained,subscribersLost,likes,comments,shares,estimatedMinutesWatched,averageViewDuration";
  const dimensions = "day";
  const sort = "day";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("sort", sort);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    const errorText = await response.text();
    console.error("YouTube Analytics API error:", errorText);
    throw new Error("Failed to fetch analytics data from YouTube API");
  }

  const data = await response.json();

  return data.rows || [];
}

export async function getTopVideos(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,engagedViews,likes,comments,shares,averageViewPercentage,subscribersGained,averageViewDuration,estimatedMinutesWatched";
  const dimensions = "video";
  const filters = "creatorContentType==videoOnDemand";
  const sort = "-views";
  const maxResults = "10";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sort);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Top Videos API Error:", errorText);
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

export async function getSingleTopVideo(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string,
  sortMetric: string
) {
  const metrics =
    "views,engagedViews,subscribersGained,estimatedMinutesWatched";
  const dimensions = "video";
  const filters = "creatorContentType==videoOnDemand";
  const maxResults = "1";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sortMetric);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Single Top Video API Error:", errorText);
    return null;
  }
  const data = await response.json();

  return data.rows?.[0] || null;
}

export async function getTopSubscriberVideos(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,engagedViews,subscribersGained,subscribersLost,averageViewPercentage";
  const dimensions = "video";
  const sort = "-subscribersGained";
  const filters = "creatorContentType==videoOnDemand";
  const maxResults = "10";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sort);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Top Subscriber Videos API Error:", errorText);
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

export async function getDemographics(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics = "viewerPercentage";
  const dimensions = "ageGroup,gender";
  const sort = "gender,ageGroup";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("sort", sort);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 400) {
      console.warn("Demographics data not available (privacy threshold)");
      return [];
    }
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

export async function getTrafficSources(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics = "views";
  const dimensions = "insightTrafficSourceType";
  const sort = "-views";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("sort", sort);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.rows || [];
}

export async function getVideoDetails(accessToken: string, videoIds: string[]) {
  if (videoIds.length === 0) return {};

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.append("part", "snippet,statistics");
  url.searchParams.append("id", videoIds.join(","));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return {};

  const data = await response.json();

  const videoMap: Record<string, any> = {};
  data.items.forEach((item: any) => {
    videoMap[item.id] = {
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt,
    };
  });
  return videoMap;
}

export async function getTopCountries(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics = "views";
  const dimensions = "country";
  const sort = "-views";
  const maxResults = "5";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("sort", sort);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.rows || [];
}

export async function getShortsAggregateRatios(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,likes,comments,shares,averageViewDuration,averageViewPercentage";
  const dimensions = "creatorContentType";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Shorts Aggregate Ratios API Error:", errorText);
    return [];
  }

  const data = await response.json();

  // console.log("Raw API Response Data:", JSON.stringify(data, null, 2));

  const shortsRow = (data.rows || []).find((row: any[]) => row[0] === "shorts");
  if (!shortsRow) return null;

  const views = Number(shortsRow[1]) || 0;
  const likes = Number(shortsRow[2]) || 0;
  const comments = Number(shortsRow[3]) || 0;
  const shares = Number(shortsRow[4]) || 0;
  const avgDuration = Number(shortsRow[5]) || 0;
  const avgPercentage = Number(shortsRow[6]) || 0;

  return {
    views,
    likes,
    comments,
    shares,
    likeToView: views > 0 ? (likes / views) * 100 : 0,
    commentToView: views > 0 ? (comments / views) * 100 : 0,
    shareToView: views > 0 ? (shares / views) * 100 : 0,
    avgDuration,
    avgPercentage,
  };
}

export async function getTopShortsVideos(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,engagedViews,likes,comments,shares,averageViewPercentage,subscribersGained,averageViewDuration,estimatedMinutesWatched";
  const dimensions = "video";
  const filters = "creatorContentType==shorts";
  const sort = "-views";
  const maxResults = "10";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sort);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Top Shorts Videos API Error:", errorText);
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

export async function getTopSubscriberShortsVideos(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics =
    "views,engagedViews,subscribersGained,subscribersLost,averageViewPercentage";
  const dimensions = "video";
  const filters = "creatorContentType==shorts";
  const sort = "-subscribersGained";
  const maxResults = "10";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sort);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Top Subscriber Shorts Videos API Error:", errorText);
    return [];
  }

  const data = await response.json();
  return data.rows || [];
}

export async function getSingleTopShort(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string,
  sortMetric: string
) {
  const metrics =
    "views,engagedViews,subscribersGained,estimatedMinutesWatched";
  const dimensions = "video";
  const filters = "creatorContentType==shorts";
  const maxResults = "1";

  const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  url.searchParams.append("ids", `channel==${channelId}`);
  url.searchParams.append("startDate", startDate);
  url.searchParams.append("endDate", endDate);
  url.searchParams.append("metrics", metrics);
  url.searchParams.append("dimensions", dimensions);
  url.searchParams.append("filters", filters);
  url.searchParams.append("sort", sortMetric);
  url.searchParams.append("maxResults", maxResults);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube Single Top Video API Error:", errorText);
    return null;
  }
  const data = await response.json();

  return data.rows?.[0] || null;
}
