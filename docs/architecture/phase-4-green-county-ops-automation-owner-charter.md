# Phase 4 — Green-county ops automation owner charter

| Field | Value |
|-------|--------|
| **Status** | **OPS BOOTSTRAP CLOSED** (2026-06-11) — launchd installed; initial production refresh run |
| **Governs** | Contour A truth refresh for `03` / `11` / `46` / `50` |
| **Separate from** | Finnmark LOSA `56` (closed 18/18); Contour B partial relay |

---

## Scope

| County | Label | Contour |
|--------|-------|---------|
| `03` | Oslo | A (green) |
| `11` | Rogaland | A (green) |
| `46` | Vestland | A (green) |
| `50` | Trøndelag | A (green) |

Professions: `electrician`, `mechanic` (per `CONTOUR_A_OPERATIONAL_BY_PROFESSION`).

Contour B Vilbli relay **must not** overwrite these counties (`use_contour_a`). Green refresh uses **`run-vgs-truth-pipeline`** (full Contour A write when readiness is green).

---

## Automation (implemented)

| Script | Role |
|--------|------|
| `scripts/run-contour-a-green-counties.mjs` | Home-IP Vilbli fetch + Contour A pipeline per green pair |
| `scripts/run-vgs-scheduled-ops.mjs` | **Relay B → Green A → stale-draft batch** (unified 6-month job) |
| `scripts/run-stale-draft-recompute-batch.mjs` | Production API batch for stale drafts |

npm aliases: `npm run ops:scheduled`, `ops:green-counties`, `ops:stale-draft-batch`.

---

## Cadence (owner)

| Job | When | Command |
|-----|------|---------|
| **Full ops** | Every **6 months** (with Contour B relay), **03:00** home IP | `npm run ops:scheduled` |
| **Stale-draft sweep** | **Quarterly**, **03:00–05:00** Oslo | `npm run ops:scheduled -- --skip-relay --skip-green-a` |
| **After deploy / logic bump** | Manual | `npm run ops:stale-draft-batch -- --force` |

Dry-run anytime: append `-- --dry-run` (batch step uses `--force` in dry-run for window bypass).

---

## Preconditions

- Mac (or home IP) where Vilbli returns full HTML (~97KB)
- `.env.local`: `VERCEL_APP_URL`, `CRON_SECRET`, Supabase service role
- Readiness **green** for pair (`ready_for_write` / `verification_ready_after_write`) — non-green pairs are **skipped** with log

---

## E2E proof (after production green refresh)

1. Child home fylke **46** Vestland (e.g. Vaksdal) → electrician route → `programme_selection` options from truth.
2. `node scripts/verify-contour-b-psa-snapshot.mjs` — green counties `hasTruth: true`; `latestUpdatedAt` advanced after refresh.
3. Stale **draft** routes in affected fylke recompute (relay hook + end-of-ops batch).

---

## Bootstrap run (2026-06-11)

| Pair | Result |
|------|--------|
| electrician `11`, `46`, `50` | **refreshed** |
| electrician `03` | **skipped** — `missing_programme_rows` (Oslo partial truth; 5 VG2 rows) |
| mechanic `46` | **refreshed** |
| mechanic `03`, `11`, `50` | **skipped** — `missing_programme_rows` (separate path/materialization charter if product needs mechanic in green counties) |

Post-refresh: `ops:stale-draft-batch --force` → **3/3** stale drafts recomputed. launchd: `./scripts/install-vgs-launchd.sh` on owner Mac.

---

## Explicitly out of scope

- Finnmark LOSA PSA rows (`56` tail) — separate Phase 4 LOSA records
- Troms `55` — charter when owner requests
- RLS MAIN apply — independent `NOT_READY` track
