# Architecture

MongolType uses a Cloudflare Pages static-export architecture.

## Runtime Shape

- Next.js renders static routes into `out`.
- Cloudflare Pages serves assets globally from the CDN.
- Supabase handles auth, database writes, storage uploads, presence, and realtime subscriptions.
- No API routes, server actions, middleware, or Vercel-specific primitives are required.

## Client Data Flow

1. Supabase Auth boots with PKCE and `sessionStorage`.
2. Zustand stores only current in-memory UI state and active session references.
3. Profile, race, race_players, leaderboard, missions, and match history data is fetched from Supabase.
4. Race rooms subscribe to `races` and `race_players`.
5. Leaderboards subscribe to `leaderboard`.
6. Missions subscribe to `daily_missions`.

## Realtime Race Lifecycle

1. Host creates a `races` row with a generated Mongolian prompt.
2. Players join through `race_players` and ready up.
3. Host moves the race to `countdown`.
4. Clients calculate the countdown from `countdown_started_at`.
5. Host flips status to `live`.
6. Players stream progress, WPM, accuracy, and combo to `race_players`.
7. Completion calls `complete_race_result`, which writes match history, typing stats, XP, profile stats, missions, achievements, and leaderboard rows.

## Mongolian Typing Engine

- Text is normalized to Unicode NFC.
- Input is split as Unicode glyphs with `Array.from`.
- ө, ү, ё and Cyrillic punctuation remain first-class characters.
- WPM uses the standard five-correct-characters-per-word calculation.
- Accuracy is calculated from correct typed glyphs over typed glyphs.

## Cloudflare Compatibility

- Static export avoids Workers-only SSR concerns.
- `next/image` optimization is disabled because Pages static export cannot use Vercel image optimization.
- Browser `fetch`, Web Audio, Web Crypto, and Supabase WebSocket usage are edge-safe.
- CDN caching is handled by `public/_headers`.
