import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  real,
  date,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    platform: text("platform").notNull(),
    platformAccountId: text("platform_account_id").notNull(),
    username: text("username").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    followers: integer("followers").default(0),
    totalViews: integer("total_views").default(0),
    engagementRate: real("engagement_rate").default(0),
    totalPosts: integer("total_posts").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.platform, t.platformAccountId)]
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .notNull(),
  platformPostId: text("platform_post_id").notNull(),
  title: text("title"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsHistory = pgTable(
  "history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    followerCount: integer("follower_count").default(0),
    followersGained: integer("followers_gained").default(0),
    impressionCount: integer("impression_count").default(0),
    impressionsGained: integer("impressions_gained").default(0),
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
    totalInteractions: integer("total_interactions").default(0),
    engagementRate: real("engagement_rate").default(0),
    engagementRateChange: real("engagement_rate_change").default(0),
    watchMinutes: integer("watch_minutes").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.accountId, t.date)]
);

export const apiCache = pgTable(
  "api_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    key: text("key").notNull(),
    data: jsonb("data").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.accountId, t.key)]
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations Tables

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  passwordResetTokens: many(passwordResetTokens),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  posts: many(posts),
  analyticsHistory: many(analyticsHistory),
  apiCache: many(apiCache),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  account: one(accounts, {
    fields: [posts.accountId],
    references: [accounts.id],
  }),
}));

export const analyticsHistoryRelations = relations(
  analyticsHistory,
  ({ one }) => ({
    account: one(accounts, {
      fields: [analyticsHistory.accountId],
      references: [accounts.id],
    }),
  })
);

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);
