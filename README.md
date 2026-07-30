# Seikret Sauce

A loadout optimizer and community build archive for Monster Hunter Wilds.

Choose the skills you want, find ranked armor combinations that satisfy them,
forge complete equipment loadouts, and share builds with other hunters.

## Development

To install dependencies:

```bash
bun install
```

Copy the environment template and fill it in:

```bash
cp .env.example .env
```

To start a development server:

```bash
bun dev
```

## Configuration

All client-side configuration is read from `BUN_PUBLIC_*` environment variables and
validated in `src/lib/env.ts` / `src/lib/supabase.ts`, which throw at startup if a
value is missing.

| Variable | Required | Purpose |
| --- | --- | --- |
| `BUN_PUBLIC_API_BASE_URL` | yes | Origin of the search/talisman API |
| `BUN_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (Discord auth) |
| `BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase publishable key |
| `PORT` | no | Local dev server port (default 3002) |

These are inlined into the bundle at **build** time, so they must be present in the
environment that runs `bun run build` — changing one requires a rebuild/redeploy.
Everything under this prefix is visible to anyone who loads the page: no secrets.

## Production

Build the application:

```bash
bun run build
```

Start the production server:

```bash
bun start
```

## Deploying to Vercel

The app builds to a fully static SPA in `dist/`, so it deploys as a static site — no
serverless functions involved. `vercel.json` pins the install/build commands, the output
directory, and the SPA rewrite that sends every unmatched path to `index.html` (required
by the client-side router).

1. Import the repo at [vercel.com/new](https://vercel.com/new). Leave the framework
   preset as **Other** — `vercel.json` supplies the settings.
2. Under **Settings → Environment Variables**, add each variable from the
   [Configuration](#configuration) table for Production, Preview, and Development.
   Vercel only exposes variables to the build, and the bundler inlines them there.
3. Deploy. Any later change to an environment variable needs a **redeploy** to take
   effect, since the values are baked into the bundle.

Point `BUN_PUBLIC_API_BASE_URL` at the deployed API origin, and make sure that API
allows the Vercel domain via CORS — the browser calls it cross-origin, and preview
deployments get a different hostname on every push.
