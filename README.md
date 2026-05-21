# MongolType

Modern realtime competitive typing for Mongolian Cyrillic keyboard practice.

## Stack

- Next.js 15 App Router with TypeScript
- Tailwind CSS and shadcn/ui-style components
- Framer Motion animation system
- Supabase Auth, Postgres, Realtime, Storage, and RLS
- Zustand for in-memory UI/session state only
- Cloudflare Pages static export with CDN cache headers

## Cloudflare Pages Setup

MongolType is intentionally built as a static-export Next app. All realtime data, auth, rooms, leaderboards, missions, and profile state sync through Supabase from the browser, so the Cloudflare deployment does not need Vercel APIs, Next server routes, Node-only APIs, or middleware.

Cloudflare Pages settings:

- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run pages:build`
- Build output directory: `out`
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`

Useful commands:

```bash
npm install
npm run dev
npm run pages:build
npm run pages:preview
npm run pages:deploy
```

## Supabase Setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](./supabase/schema.sql) in the SQL editor.
3. Enable Google OAuth in Supabase Auth if desired.
4. Add your Cloudflare Pages URL to Supabase Auth redirect URLs:
   - `https://your-domain.pages.dev/auth/`
   - `https://your-domain.pages.dev/onboarding/`
5. Copy the project URL and anon key into Cloudflare Pages environment variables.

## Data Rules

- Core app data is not written to `localStorage`.
- Supabase Auth uses PKCE and browser `sessionStorage` via a custom storage adapter.
- Race state, leaderboard rows, missions, profile stats, match history, and achievements live in Supabase.
- Realtime tables are published for Supabase Realtime in `schema.sql`.

## Production Notes

- `_headers` adds immutable caching for Next static assets and security headers.
- `next.config.ts` uses `output: "export"` and unoptimized images for Cloudflare Pages compatibility.
- The app uses only browser-safe APIs for race sync and typing effects.
- The schema includes RLS policies, indexes, realtime publications, and security-definer RPCs for match completion and mission seeding.
