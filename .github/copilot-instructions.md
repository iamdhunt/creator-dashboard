# Creator Dashboard - AI Coding Instructions

## Architecture & Tech Stack

- **Framework**: React Router v7 (Node.js adapter).
- **Routing**: Config-based routing defined in `app/routes.ts`. NOT file-system routing.
- **Database**: PostgreSQL (via Docker) with Drizzle ORM.
- **Styling**: Tailwind CSS v4.
- **Auth**: Custom cookie-based session authentication (`app/services/auth.server.ts`).

## Core Conventions

- **Server-Side Logic**: Place backend logic in `.server.ts` files or within `loader`/`action` functions.
- **Database Access**:
  - Schema defined in `app/db/schema.ts`.
  - Use `drizzle-orm` for queries.
  - DB connection and pool managed in `app/services/auth.server.ts` (consider refactoring to dedicated `db.server.ts` if scaling).
- **Imports**: Use `~/*` alias to reference the `app/` directory (e.g., `~/db/schema`).
- **Type Safety**: Use Zod for validation and TypeScript for strict typing.

## Routing & Layouts

- **Configuration**: Always check/update `app/routes.ts` when adding new routes.
- **Layouts**: Nested routes use layout files (e.g., `routes/auth/layout.tsx`, `routes/dashboard/layout.tsx`).
- **Protected Routes**: Use `requireUserId` from `~/services/auth.server.ts` in loaders to protect routes.

## Database Workflow

- **Schema Changes**:
  1. Modify `app/db/schema.ts`.
  2. Run `npx drizzle-kit generate` to create migration files.
  3. Run `npx drizzle-kit migrate` (or apply via script) to update the DB.
- **Local Dev**: Ensure Docker container (`creator_db`) is running via `docker-compose up`.

## Development Commands

- `npm run dev`: Start the React Router development server.
- `npm run typecheck`: Run TypeScript validation.
- `docker-compose up`: Start the PostgreSQL database.

## Common Patterns

- **Data Loading**: Use `loader` functions in route modules to fetch data server-side.
- **Mutations**: Use `action` functions in route modules for form submissions.
- **Auth Check**:
  ```typescript
  import { requireUserId } from "~/services/auth.server";
  export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request);
    // ... fetch user data
  }
  ```
