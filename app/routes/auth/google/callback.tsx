import { redirect } from "react-router";
import type { Route } from "./+types/callback";
import { requireUserId } from "~/services/auth.server";
import { getChannelInfo, getTokensFromCode } from "~/services/youtube.server";
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

    // Save to Database
    await db.insert(accounts).values({
      userId,
      platform: "youtube",
      platformAccountId: channel.id,
      username: channel.snippet.title,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
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
