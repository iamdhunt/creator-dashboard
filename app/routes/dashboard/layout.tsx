import { Outlet, Form, Link } from "react-router";
import type { Route } from "./+types/layout";
import { requireUserId, logout } from "~/services/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">CreatorDash</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
          >
            Overview
          </Link>
          <Link
            to="/dashboard/content"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
          >
            Content
          </Link>
          <Link
            to="/dashboard/settings"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
          >
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Form method="post">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md text-left"
            >
              Sign Out
            </button>
          </Form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
