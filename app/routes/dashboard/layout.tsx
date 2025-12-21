import { Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/layout";
import { requireUserId } from "~/services/auth.server";
import DashboardSidebar from "~/components/dashboard-sidebar";
import { db } from "~/db/db.server";
import { accounts } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const userAccounts = await db
    .select({
      id: accounts.id,
      platform: accounts.platform,
      username: accounts.username,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  return { userAccounts };
}

export default function DashboardLayout() {
  const { userAccounts } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar accounts={userAccounts} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
