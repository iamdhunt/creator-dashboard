import type { Route } from "./+types/home";
import { requireUserId } from "~/services/auth.server";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import { users } from "~/db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { user };
}

export default function DashboardHome({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-2 text-gray-600">
          You are logged in as{" "}
          <span className="font-semibold">{user.email}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Placeholder Stats Cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Followers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0%</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Posts Tracked</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">
          Connect your social accounts to see real data.
        </p>
        <button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Connect Account
        </button>
      </div>
    </div>
  );
}
