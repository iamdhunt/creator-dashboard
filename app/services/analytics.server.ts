import { eq } from "drizzle-orm";
import { db } from "~/db/db.server";
import { accounts, analyticsHistory } from "~/db/schema";

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
