# VGS Contour B operational scheduler

Batch verify/ingest for eligible `(profession, county)` pairs. **Not** invoked on route page load.

## Cadence

**Every 6 months** — automated via **home-IP relay** (see below). Vilbli.no returns a stub (~2KB, HTTP 202) to Vercel/datacenter IPs, so **do not** rely on Vercel Cron to fetch Vilbli directly.

## Production automation (required)

1. **Mac (or any network where Vilbli returns full HTML ~97KB)** with `.env.local`:
   - `VERCEL_APP_URL` (e.g. `https://min-veg-app.vercel.app`)
   - `CRON_SECRET` (same as Vercel Production)

2. **Dry-run one county:**

```bash
set -a && source .env.local && set +a
node scripts/relay-contour-b-vilbli-to-production.mjs --dry-run --county 56
```

3. **Full batch (all pipeline counties):**

```bash
node scripts/relay-contour-b-vilbli-to-production.mjs --dry-run
node scripts/relay-contour-b-vilbli-to-production.mjs   # production write
```

4. **Schedule every 6 months (macOS launchd example):**

```xml
<!-- ~/Library/LaunchAgents/no.minveg.contour-b-relay.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>no.minveg.contour-b-relay</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>cd /path/to/min-veg-app && set -a && source .env.local && set +a && node scripts/relay-contour-b-vilbli-to-production.mjs</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Month</key><integer>1</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer></dict>
    <dict><key>Month</key><integer>7</integer><key>Day</key><integer>1</integer><key>Hour</key><integer>3</integer></dict>
  </array>
</dict>
</plist>
```

Load: `launchctl load ~/Library/LaunchAgents/no.minveg.contour-b-relay.plist`

## API endpoints

| Endpoint | Role |
|----------|------|
| `POST /api/internal/vgs/ingest-contour-b-vilbli-relay` | Accepts `{ professionSlug, countyCode, dryRun?, vilbliHtml }` — **production processing** |
| `GET /api/internal/vgs/run-contour-b-operational-scheduler` | On Vercel returns `vilbli_direct_fetch_blocked_on_vercel` — use relay instead |
| `?vilbliProbe=<county>` | Diagnostic (direct fetch from caller’s IP — on Vercel still shows block) |

Auth: `Authorization: Bearer <CRON_SECRET>` or `x-internal-secret`.

## Local-only (no Vercel)

```bash
node scripts/run-contour-b-operational-scheduler.mjs [--dry-run] [--county 56]
```

Uses direct Vilbli fetch from your machine + local Supabase env.

## Build

`npm run build` runs `scripts/vercel-bundle/build.mjs` → `src/server/vgs/generated/contour-b-scheduler.bundle.mjs` (gitignored, created at build).
