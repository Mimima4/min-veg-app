# VGS Contour B operational scheduler

Batch verify/ingest for eligible `(profession, county)` pairs. **Not** invoked on route page load.

## Mandatory rules when updating application information (REQUIRED)

These rules are **blocking** for any change that adds or changes **professions**, **counties (fylke)**, **Vilbli-backed programme data**, or **route programme options** in the product. They apply to engineers, operators, and agents.

### What does **not** run automatically

| Event | Contour B relay / PSA ingest |
|--------|------------------------------|
| User edits child profile, county, or profession in the app | **No** |
| Route recompute / page load | **No** |
| Vercel deploy or `git push` | **No** |
| Supabase content edits without relay | **No** |
| Vercel Cron (removed; Vilbli blocks datacenter IPs) | **No** |

**Product UI scope ≠ pipeline scope.** The app may expose fewer professions or counties than the batch job. Conversely, **new product counties/professions do not receive Vilbli PSA data until this contour is extended and run manually** (or on the 6-month launchd schedule for pairs already in the pipeline).

### When you **must** run or re-verify this contour

Run **dry-run then production relay** (see commands below) before claiming data is live for a `(profession, county)` pair:

1. **New profession** in product or `vgs-path-definitions.mjs`
2. **New county / fylke** in product planning or route eligibility
3. **Change** to Vilbli URL, path nodes, Contour A green counties, or matching/identity policy affecting that pair
4. **After** first production relay for a pilot county (Block C charter / E2E `programme_selection` proof)
5. **Scheduled refresh:** at least every **6 months** for all pairs already in `VGS_PIPELINE_COUNTY_CODES` (launchd or manual relay from home IP)

Skipping this when product information was updated is a **process defect**, not an automatic backfill.

### Expansion gate (code + ops — all required)

Before production relay for a **new** `(professionSlug, countyCode)`:

| Step | Artifact | Required action |
|------|-----------|-----------------|
| 1 | `scripts/vgs-path-definitions.mjs` | Path definition + Vilbli `buildVilbliUrl` |
| 2 | `COUNTY_CODE_TO_VILBLI` in `scripts/classify-vgs-truth-readiness.mjs` (and `scripts/lib/vilbli-county-meta.mjs`) | County slug/label for classify + relay |
| 3 | `VGS_PIPELINE_COUNTY_CODES` in `scripts/lib/contour-b-operational-eligibility.mjs` | Pair included in batch |
| 4 | Same `VGS_PIPELINE_COUNTY_CODES` in `src/lib/vgs/contour-b-operational-eligibility.ts` | **Keep in sync** — route read path |
| 5 | `CONTOUR_A_OPERATIONAL_BY_PROFESSION` (if full Contour A applies) | Relay **skips** those counties (`use_contour_a`) |
| 6 | `SUPPORTED_VGS_PROFESSION_SLUGS` in **TS** (`src/lib/vgs/contour-b-operational-eligibility.ts`) | Route may read Contour B PSA |
| 7 | `npm run build` + deploy | Rebuild esbuild scheduler bundle on Vercel |
| 8 | Relay dry-run one county | `node scripts/relay-contour-b-vilbli-to-production.mjs --dry-run --county <code>` |
| 9 | Relay production | Same without `--dry-run` |
| 10 | Product proof | E2E: `programme_selection.options` for that profession + county (Block C) |

If step 3–6 are missing, relay **will not** process the new pair even if the product UI shows it.

### Interpreting relay results (not failures)

| `action` | Meaning |
|----------|---------|
| `skipped` / `use_contour_a` | Contour A owns this pair; relay must not overwrite |
| `ingested` / `contour_b_partial` | Production PSA write completed (partial verified subset) |
| `dry_run_ok` | Safe to run production for that pair |
| `failed` | Fix before treating product data as updated |

Readiness values such as `missing_programme_rows` or `canonical_matching_review` after **`ingested`** are **expected** for Contour B partial counties until Block D parity work closes.

### Authority

- Product policy: P06 §12 + `docs/architecture/phase-0-6-contour-b-operational-closure-checklist.md` (**P06-CLOSURE**)
- Eligibility source of truth (scripts): `scripts/lib/contour-b-operational-eligibility.mjs`
- Route read path (app): `src/lib/vgs/contour-b-operational-eligibility.ts` — **must stay aligned with scripts**

---

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

## Block C — product proof (after production relay)

**P06-CLOSURE Block C** (`docs/architecture/phase-0-6-contour-b-operational-closure-checklist.md`).

### 1. DB snapshot (read-only)

```bash
set -a && source .env.local && set +a
node scripts/verify-contour-b-psa-snapshot.mjs
node scripts/verify-contour-b-psa-snapshot.mjs --county 56
node scripts/verify-contour-b-psa-snapshot.mjs --county 18 --list-institutions
```

Expect `pilotAllHaveTruth: true` for pilot counties **56, 15, 18, 55** after relay. Contour B counties should appear under `contourBCountiesWithTruth`.

### 2. E2E in the app (manual)

1. Child with **home fylke** in a pilot county (e.g. Finnmark `56` or Møre `15`).
2. Profession **electrician** → open study route.
3. On `programme_selection` steps: options must come from **availability truth** (PSA), not empty and not legacy-only catalog for that contour.
4. Repeat for one **Contour A** green county (**03** or **50**): options still work; relay did not remove Contour A data.

### 3. Refresh proof (second relay)

```bash
node scripts/relay-contour-b-vilbli-to-production.mjs --county 56
node scripts/verify-contour-b-psa-snapshot.mjs --county 56
```

`latestUpdatedAt` on active rows should be recent after the second run.

### 4. Owner-held charter

Record pass/fail and screenshots in `owner-held/` (not committed). Close Block C in the closure checklist when E2E + refresh are done.
