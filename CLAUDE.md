@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js 16 — read the bundled docs first

This app runs **Next.js 16.2.2 + React 19**. Several conventions changed from prior versions and from common training-data patterns. Before touching framework-level code (routing, middleware, server components, fetching, caching), check the bundled docs in `node_modules/next/dist/docs/01-app/` for the current API. Do not assume Next 14/15 behavior.

Concrete differences already in this codebase:

- **Middleware lives in [src/proxy.ts](src/proxy.ts), not `middleware.ts`.** The exported function is named `proxy` (not `middleware`). It still uses the `config.matcher` export. When adding global request handling, edit this file — do not create a `middleware.ts`.
- `cookies()` and route `params` are async — both are awaited (see [src/lib/supabase/server.ts:5](src/lib/supabase/server.ts#L5) and [src/app/(app)/g/[id]/layout.tsx:14](src/app/(app)/g/[id]/layout.tsx#L14)).
- Auth-gated layouts opt out of static rendering with `export const dynamic = 'force-dynamic'`.

## Commands

```bash
npm run dev      # start dev server on :3000
npm run build    # production build
npm run start    # run built app
npm run lint     # eslint (flat config in eslint.config.mjs)
```

There is no test runner configured. Type-check via `npx tsc --noEmit` if needed.

## Environment

`.env.local` (see `.env.local.example`) must define:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `NEXT_PUBLIC_TMDB_API_KEY` — TMDB v3 key, used by [src/lib/tmdb.ts](src/lib/tmdb.ts)
- `RESEND_API_KEY` (optional) — if absent, [src/app/api/notify-watched/route.ts](src/app/api/notify-watched/route.ts) silently no-ops
- `NEXT_PUBLIC_APP_URL` (optional) — used in transactional email links

`SETUP.md` contains real keys committed to the repo (personal project) — treat as authoritative for local dev.

## Architecture

This is a small social app for tracking and randomly drawing movies to watch within a **group**. Architecture is dictated by two cross-cutting concerns: Supabase auth/RLS and group scoping.

### Routing layout

Uses the App Router with a route group:

- [src/app/(app)/](src/app/(app)/) — all authenticated routes. The group's `layout.tsx` redirects to `/auth` if no Supabase session.
- [src/app/(app)/page.tsx](src/app/(app)/page.tsx) — root redirector: sends user to their first group `/g/[id]` or to `/groups` if they have none.
- [src/app/(app)/g/[id]/](src/app/(app)/g/[id]/) — group-scoped pages (`HomeClient`, `bucket`, `chat`, `watched`). Its [layout.tsx](src/app/(app)/g/[id]/layout.tsx) verifies `group_members` membership server-side before rendering and redirects non-members to `/groups`.
- [src/app/(app)/groups/](src/app/(app)/groups/) — list/create/join groups.
- [src/app/auth/](src/app/auth/) and [src/app/invite/](src/app/invite/) — public; whitelisted in `proxy.ts`'s redirect logic.

Pattern: each route is a thin server `page.tsx` that fetches initial data with the server Supabase client, then renders a `*Client.tsx` component that takes that data as props and handles interactivity. Don't break this split — server pages enable RLS-aware fetching with the user's session cookie.

### Supabase clients (two flavors)

- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — `createClient()` for Server Components / Route Handlers. Awaits `cookies()` and wires read/write through `@supabase/ssr`.
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) — `createClient()` for Client Components. Browser client, reads cookies set by the server.
- [src/proxy.ts](src/proxy.ts) — middleware that calls `supabase.auth.getUser()` to refresh tokens on every non-static request and redirects unauthenticated users (except `/auth` and `/invite/*`) to `/auth?next=...`.

Always use the right client for the rendering context. Don't import the browser client in a server file or vice versa.

### Data model

The schema evolved from single-tenant to multi-tenant:

- [supabase-schema.sql](supabase-schema.sql) — initial schema (`profiles`, `movies`, `reviews`, `messages`, `settings`).
- [supabase-groups-migration.sql](supabase-groups-migration.sql) — adds `groups`, `group_members`, and a `group_id` foreign key on `movies` and `messages`. The legacy `settings` row is migrated into a default group.
- [supabase-fix-trigger.sql](supabase-fix-trigger.sql) — patches the `handle_new_user` trigger that auto-creates `profiles` on signup.

When adding a query against `movies` or `messages`, **always filter by `group_id`** — RLS does not enforce group isolation today (policies allow any authenticated user to read everything). Group scoping is enforced in application code via the `/g/[id]/layout.tsx` membership check plus explicit `.eq('group_id', groupId)` filters.

Realtime is enabled on `messages` (`alter publication supabase_realtime add table messages`). The chat page subscribes via the browser client.

### Domain types

[src/lib/types.ts](src/lib/types.ts) is the source of truth for shared types (`Group`, `Movie`, `Review`, `Message`, `Profile`, `MovieStatus`, `Frequency`). Keep it in sync with the SQL schema when adding columns.

### TMDB integration

[src/lib/tmdb.ts](src/lib/tmdb.ts) calls TMDB directly from the browser using `NEXT_PUBLIC_TMDB_API_KEY`. Posters render via `next/image` — `image.tmdb.org` is whitelisted in [next.config.ts](next.config.ts).

### Styling

Tailwind v4 via the PostCSS plugin only (no `tailwind.config`). Global CSS variables for the design tokens live in [src/app/globals.css](src/app/globals.css); see [design-system/cinephile/MASTER.md](design-system/cinephile/MASTER.md) for the palette/typography reference (cinema-dark + play-red).

### Path alias

`@/*` → `src/*` (see [tsconfig.json](tsconfig.json)).
