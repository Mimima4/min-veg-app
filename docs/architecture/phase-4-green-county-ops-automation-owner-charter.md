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
| **Full ops** | **1 Feb + 1 Aug**, **03:00** Oslo (home IP) | `npm run ops:scheduled` |
| **Stale-draft sweep** | **1 Jan / Apr / Jul / Oct**, **03:00** Oslo | `npm run ops:scheduled -- --skip-relay --skip-green-a` |
| **After deploy / logic bump** | Manual | `npm run ops:stale-draft-batch -- --force` |

Rationale: Vilbli major offer refresh is typically **~January**; full truth ingest **Feb/Aug** avoids up to ~6 months stale school data. Quarterly batch re-aligns **draft routes** to existing truth between ingests (does not replace Vilbli fetch).

Dry-run anytime: append `-- --dry-run` (batch step uses `--force` in dry-run for window bypass).

---

## Preconditions

- Mac (or home IP) where Vilbli returns full HTML (~97KB)
- `.env.local`: `VERCEL_APP_URL`, `CRON_SECRET`, Supabase service role
- Pairs with `missing_programme_rows` / `missing_profession_links` are **runnable** — pipeline materializes then writes; only hard blockers (e.g. missing Vilbli source) skip

---

## E2E proof (after production green refresh)

1. Child home fylke **46** Vestland (e.g. Vaksdal) → electrician route → `programme_selection` options from truth.
2. `node scripts/verify-contour-b-psa-snapshot.mjs` — green counties `hasTruth: true`; `latestUpdatedAt` advanced after refresh.
3. Stale **draft** routes in affected fylke recompute (relay hook + end-of-ops batch).

---

## Professions (electrician + mechanic)

Both are in `CONTOUR_A_OPERATIONAL_BY_PROFESSION` for `03`/`11`/`46`/`50`. Transport/recompute E2E used **electrician** (Vaksdal→Voss) as pilot proof; **mechanic Vestland (`46`)** was refreshed in the same bootstrap. Green-a runs **both** professions per county.

Initial bootstrap incorrectly **skipped** pairs with `missing_programme_rows` before pipeline; fixed — pipeline materializes programmes then writes.

## Bootstrap run (2026-06-11)

| Pair | Result |
|------|--------|
| electrician `03` | refreshed (`verification_ready_after_write`) |
| electrician `11` | refreshed |
| electrician `46` | refreshed |
| electrician `50` | refreshed |
| mechanic `03` | refreshed |
| mechanic `11` | refreshed |
| mechanic `46` | refreshed |
| mechanic `50` | refreshed |

**8/8** green pairs closed. Post-refresh: `ops:stale-draft-batch --force` (2/2 stale recomputed). launchd reinstalled: **Feb/Aug** full ops, **Jan/Apr/Jul/Oct** stale batch.

---

## Explicitly out of scope

- Finnmark LOSA PSA rows (`56` tail) — separate Phase 4 LOSA records
- Troms `55` — charter when owner requests
- RLS MAIN apply — independent `NOT_READY` track
