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
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("unauthorized");
    }
    throw new Error("Failed to fetch channel info from YouTube API");
  }

  const data = await response.json();
  return data.items?.[0]; // Returns the first channel found
}

export async function getChannelAnalytics(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
) {
  const metrics = "views,subscribersGained,subscribersLost";
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
