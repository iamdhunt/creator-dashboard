import { redirect } from "react-router";
import type { Route } from "./+types/callback";
import { requireUserId } from "~/server/auth.server";
import { getChannelInfo, getTokensFromCode } from "~/server/youtube.server";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/dashboard/settings?error=No code provided");
  }

  try {
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    const channel = await getChannelInfo(tokens.access_token);

    if (!channel) {
      return redirect("/dashboard/settings?error=No YouTube channel found");
    }

    const rawHandle = channel.snippet.customUrl || channel.snippet.title;
    const handle = rawHandle.replace(/^@/, "");

    // Save to Database
    await db
      .insert(accounts)
      .values({
        userId,
        platform: "youtube",
        platformAccountId: channel.id,
        username: handle,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })
      .onConflictDoUpdate({
        target: [accounts.platform, accounts.platformAccountId],
        set: {
          username: handle,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          followers: parseInt(channel.statistics.subscriberCount) || 0,
          totalViews: parseInt(channel.statistics.viewCount) || 0,
          totalPosts: parseInt(channel.statistics.videoCount) || 0,
          updatedAt: new Date(),
        },
      });

    return redirect(
      "/dashboard/settings?success=YouTube account linked successfully"
    );
  } catch (error) {
    console.error("OAuth Error:", error);
    return redirect(
      "/dashboard/settings?error=Failed to connect YouTube account"
    );
  }
}
