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

**Full checklist:** `docs/architecture/phase-0-6-contour-b-vgs-profession-addition-template.md` (reference instance: `painter`). Per-profession branch records copy §7 closure checklist from the template.

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
| 10 | **Current-year offering (I-1…I-3; anlegg VG2 enforced)** | Relay fetches landslinje offering HTML (`strukturkartReferenceUrl` → Oslo course `side=p5` for anleggsteknikk). Gate **default ON**; structure-only skipped when extract succeeds. Opt out: `CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING=0`. Dense professions without landslinje probe URL stay fail-open. Live smoke: `npm run smoke:current-year-offering -- --live`. See `phase-4-current-year-programme-offering-owner-decision-record.md` §4/§4a. |
| 11 | Product proof | E2E: `programme_selection.options` for that profession + county (Block C) |

If step 3–6 are missing, relay **will not** process the new pair even if the product UI shows it.

### Interpreting relay results (not failures)

| `action` | Meaning |
|----------|---------|
| `skipped` / `use_contour_a` | Contour A owns this pair; relay must not overwrite |
| `ingested` / `contour_b_partial` | Production PSA write completed (partial verified subset) |
| `dry_run_ok` | Safe to run production for that pair |
| `failed` | Fix before treating product data as updated |

Readiness values such as `missing_programme_rows` or `canonical_matching_review` after **`ingested`** are **expected** for Contour B partial counties (e.g. Finnmark **56** LOSA tail). **P06-OPERATIONAL-CLOSED** (2026-06-05); remaining LOSA rows → Phase 4, not P06 rework.

**LOSA (cross-profession):** Phase 4 LOSA / `losa_fjern_delivery_municipality` is a **geography + delivery-model** overlay — **not** tied to one VGS profession. When LOSA PSA rows exist for a fylke, **route truth surfaces them on every Contour B profession** in that county context (mapped to the route’s VG-stage programme for display). Electrician Finnmark was the **reference ingest**; other professions do not need duplicate PSA rows until their own LOSA slices are published. See `docs/architecture/phase-4-source-truth-contour-map.md` §7.

### Authority

- Product policy: P06 §12 + `docs/architecture/phase-0-6-contour-b-operational-closure-checklist.md` (**P06-CLOSURE**)
- Eligibility source of truth (scripts): `scripts/lib/contour-b-operational-eligibility.mjs`
- Route read path (app): `src/lib/vgs/contour-b-operational-eligibility.ts` — **must stay aligned with scripts**

---

## Cadence

**Every 6 months** — automated via **home-IP relay** (see below). Vilbli.no returns a stub (~2KB, HTTP 202) to Vercel/datacenter IPs, so **do not** rely on Vercel Cron to fetch Vilbli directly.

**Production relay scope (binding):** Contour B relay **always** runs the **full** `SUPPORTED_VGS_PROFESSION_SLUGS × VGS_PIPELINE_COUNTY_CODES` matrix. **Never** scope production relay to one profession or one county. `--profession` / `--county` are **smoke-only** with `--dry-run` (scripts enforce this).

## Production automation (required)

1. **Mac (or any network where Vilbli returns full HTML ~97KB)** with `.env.local`:
   - `VERCEL_APP_URL` (e.g. `https://min-veg-app.vercel.app`)
   - `CRON_SECRET` (same as Vercel Production)

2. **Dry-run one county:**

```bash
set -a && source .env.local && set +a
node scripts/relay-contour-b-vilbli-to-production.mjs --dry-run --county 56 --profession electrician
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

## Freshness watchdog (Vercel Cron — read-only reminder)

The relay stays a home-IP/launchd job (above). A **separate** Vercel Cron watchdog only **reads** the snapshot age and reminds the owner if the home-IP refresh was missed. It **never** fetches Vilbli and **never** writes.

| Aspect | Value |
|--------|-------|
| Endpoint | `GET/POST /api/internal/vgs/psa-snapshot-watchdog` (auth: `CRON_SECRET`) |
| Cron | Weekly, `0 6 * * 1` (`vercel.json`) |
| Reads | Latest `last_verified_at` of active `source='vilbli'` PSA rows |
| Stale rule | age > `PSA_SNAPSHOT_STALE_DAYS` (default **210** = 6-month cadence + grace), or no snapshot |
| Reminder | POST to `OPS_ALERT_WEBHOOK_URL` (Slack/Discord-compatible). If unset → no push, logs a warning; status JSON still returned |
| Inspect only | append `?notify=false` |

Owner setup (optional but recommended): set `OPS_ALERT_WEBHOOK_URL` in Vercel env to a Slack or Discord incoming webhook. Tune `PSA_SNAPSHOT_STALE_DAYS` if cadence changes.

## Unified scheduled ops (Contour B + green A + stale drafts)

**Scripts (home IP):**

```bash
set -a && source .env.local && set +a

# Dry-run full cycle (30 relay pairs — **15–45 min**, not hung)
npm run ops:scheduled -- --dry-run

# Quick dry-run smoke (one county)
npm run ops:scheduled -- --dry-run --county 56 --profession electrician

# Production full cycle (Feb/Aug schedule): relay → green counties → stale-draft batch
npm run ops:scheduled

# Quarterly stale-draft sweep only (Jan/Apr/Jul/Oct; 03:00–05:00 Oslo; no --force)
npm run ops:scheduled -- --skip-relay --skip-green-a

# Individual steps
npm run ops:green-counties
npm run ops:stale-draft-batch -- --force   # manual anytime
```

| Step | Script | Notes |
|------|--------|--------|
| Contour B relay | `relay-contour-b-vilbli-to-production.mjs` | Skips green `03/11/46/50`; post-relay draft batch in API |
| Contour A green | `run-contour-a-green-counties.mjs` | `03/11/46/50` × electrician/mechanic; see `phase-4-green-county-ops-automation-owner-charter.md` |
| Stale drafts | `run-stale-draft-recompute-batch.mjs` | Calls production API; **03:00–05:00** unless `--force` |

**launchd install (one command):**

```bash
chmod +x scripts/install-vgs-launchd.sh
./scripts/install-vgs-launchd.sh
```

See `scripts/launchd/README.md` — **Feb/Aug** full ops + **Jan/Apr/Jul/Oct** stale-batch agents; logs under `~/Library/Logs/`.

## API endpoints

| Endpoint | Role |
|----------|------|
| `POST /api/internal/vgs/ingest-contour-b-vilbli-relay` | Accepts `{ professionSlug, countyCode, dryRun?, vilbliHtml }` — **production processing** |
| `GET /api/internal/vgs/run-contour-b-operational-scheduler` | On Vercel returns `vilbli_direct_fetch_blocked_on_vercel` — use relay instead |
| `?vilbliProbe=<county>` | Diagnostic (direct fetch from caller’s IP — on Vercel still shows block) |

Auth: `Authorization: Bearer <CRON_SECRET>` or `x-internal-secret`.

## Local-only (no Vercel)

```bash
node scripts/run-contour-b-operational-scheduler.mjs [--dry-run]
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

## Regression smoke (Block F)

After pipeline or ingest changes:

```bash
set -a && source .env.local && set +a
npm run smoke:contour-b
```

Checks: CLI rejects `--contour-b-partial` on `run-vgs-truth-pipeline.mjs`; Contour B ingest dry-run for **56** exits 0.

## Product position (2026-07-04)

**Global plan authority:** `docs/architecture/phase-4-multi-contour-truth-registry-owner-decision-record.md` (contours + phased order P4-MCT-1…5). **Route engine:** `docs/architecture/route-engine-master-spec.md`.

**Current phase: P4-MCT-1 — IN PROGRESS.** Matcher wiring went live 2026-06-13; that does **not** close the phase. Close when **all** planned VGS professions are in pipeline and every kolonne-3 fag Vilbli lists appears in routes — with godkjent-only bedrift and NAV catalog-level matcher as below.

### Truth policies (owner binding 2026-07-04)

| Topic | Rule |
|-------|------|
| **Bedrift empty list** | **Not a defect.** We publish **godkjent-only** employers. No godkjent rows → empty dropdown + existing copy «Ingen godkjente lærebedrifter for dette faget ennå.» (`route-steps-panel.tsx`). Never invent placeholders or potensielle. |
| **County-local primary route** | **No patching.** Primary route in home fylke only when the full required school chain (per `vgs-path-definitions.mjs` `requiredForWrite`) exists in **county-scoped PSA**. Missing local VG2 (or any required stage) → **no primary route** — not VG1-only, not cross-fylke schools in primary picker. Neighboring-fylke Vilbli continuations → **`alternative_routes[]` only** (PSA-backed, labeled). Charter: `docs/architecture/phase-4-county-local-primary-route-completeness-owner-policy.md`. **Do not** relax pipeline `ABORT` on missing required Vilbli stages into partial PSA writes. |
| **NAV / mechanic & electrician** | VG1+VG2 are **shared** within the catalogue profession; kolonne-3 fag shape the route and bedrift pool. **NAV matcher** uses **vacancy-catalog level** (e.g. Mekaniker, Elektriker) — same as post-graduation search on NAV/Finn where specialization is mostly in ad text. **Not** separate STYRK per kjøretøy/elektro fag. |
| **Roster expansion** | Adding a lærefag to monthly ingest is **ops hygiene** when owner wants refreshed godkjent snapshot — not “closing a hole” if national godkjent count is zero. |

| Layer | Status |
|-------|--------|
| **C-VGS-YRKESFAG** | **6 professions** in pipeline (`electrician`, `mechanic`, `carpenter`, `plumber`, `painter`, **`anleggsteknikk`**); anleggsteknikk PSA nationwide batch 2026-07-10 (Oslo `03` VG2=0 ABORT) |
| **C-NAV-OCCUPATION** | Matcher wired at **catalog profession / NAV vacancy level** |
| **Verified bedrift** | P3b for **6 professions**; ingest roster = tømrer + rørlegger + maler kolonne-3 + **anleggsmaskinfører (`BAAMF3`)** + 11 elektro + 10 kjøretøy; **empty bedrift when no godkjent = OK** |
| **C-TRANSPORT-KOMMUNE** | Live nationwide overlay |
| **C-LOSA-FJERN** | Live Finnmark (56) electrician charter |
| **C-FAGSKOLE / C-HOYSKOLE / C-PROFESJONSSTUDIER / C-PABYGGING** | **Out of scope for P4-MCT-1** — filters hidden until respective MCT phases |

**Fylke note:** `VGS_PIPELINE_COUNTY_CODES` = all **15** Norwegian fylke. No new counties to add; ops = relay refresh (6-month cadence) + per-pair quality.

## Deferred gates (do not skip before scaling)

Record for when these become blockers — **without them we cannot scale professions or bedrift UX further**.

### VG2 programme selection cascade

When VG2 programme options expand (new branches per profession/county), **downstream steps must recompute**, not reuse a frozen snapshot:

- **Fagvalg (kolonne-3)** list comes from the active VG1→**chosen VG2** chain on Vilbli (per fylke).
- **Bedrift** pools are per **lærefag VIGO code**, not per profession slug — changing VG2 can change which kolonne-3 fags exist and therefore which `larebedrift_truth.larefag_code` rows apply.
- **Product note:** Changing **VG2 programme** or **Fagvalg** (kolonne-3) can change the **target outcome profession** (fagbrev / NAV-linked outcome), not only which employers appear. After recompute the child may see **different route shapes, alternatives, and saved-profession options** than before — this is expected when exploring fags within the same catalogue profession (e.g. elektro kolonne-3 branches, kjøretøy fag).

**Ops order when adding VG2 programmes:** Contour B relay for that county/profession → route recompute E2E → ingest any **new** kolonne-3 lærefag codes into `larebedrift_truth` → prod-check Fagvalg + bedrift for 2–3 fag samples.

### V.BA shared VG1 — multi-profession VG2 gate (live 2026-07-03)

**Hard rule — no cross-profession schools in one dropdown:** a **carpenter** route lists **only** carpenter VG2 **schools** under the school picker. A **plumber** route lists **only** plumber schools. Never mix rørlegger institutions into the carpenter school list.

**Program vs school are separate interactions (VG2 `programme_selection` card UX — owner mockup 2026-07-03):**

The VG2 step card is **two stacked zones** (each dynamic height; no clipping):

| Zone | Collapsed shows | Click opens | Dropdown contents | Outcome hint |
|------|-----------------|-------------|-------------------|--------------|
| **Top — programme** | VG2 programme title (e.g. `VG2 Elenergi og ekom`) + step badge + ▼ | **Programme** picker | Distinct VG2 **programmes** for this step (within-profession branches; gate later adds sibling-profession programmes that trigger a full route switch — **not** schools) | **Yes** — `VG2_OR_FAGVALG_OUTCOME_NOTE` above programme list |
| **Bottom — school** | Selected school name, location, study time, website link | **School** picker | Schools for the **currently selected programme** (existing behaviour) | **No** hint |

Reference: owner screenshots — collapsed two-part card; programme open = hint + programme list; school open = school list only.

**Backend when programme changes (gate — live):**

1. If new programme maps to **same** `target_profession_id` → full **recompute** of this working draft (geography, transport, Fagvalg, bedrift downstream).
2. If new programme maps to **another** V.BA catalogue profession (carpenter ↔ plumber) → **new working route** for that profession (`switch-study-route-for-vg2-programme.ts`); auto-upserts `child_profession_interests` for the **target** profession; full `createInitialStudyRoute` + `triggerStudyRouteRecompute` (standard PSA/transport/school ranking — **no** VG1 school carry-over from the source route); client navigates to the new route; source saved route is not mutated in place.

**Owner policy (2026-07-04):** do **not** add VG1 school carry-over on cross-profession switch. The new profession route must be built only by existing route rules (`selectTruthCandidateForRoute`, transport, relocation, PSA truth). If VG1 school differs from the source route, that is correct.

**Profession hub visibility:** `child_profession_interests` is upserted on **cross-profession programme switch** (not in `save-study-route.ts`). Saving the route then materializes the `study_routes` saved row; hub/compare shows the profession because the interest row already exists from the switch.

**Backend when school changes (unchanged):** selection within current programme; refresh ranking only; save = new saved row if ≥1 step differs.

**Save semantics:** any change to ≥1 step vs last saved snapshot → **new** `study_routes` saved row (`save-study-route.ts`).

**Implementation target:** `route-steps-panel.tsx` — split VG2 card into `openStepKey` modes e.g. `{stepKey}:programme` vs `{stepKey}:school` (not one toggle for the whole card). Fagvalg keeps single-zone + hint (kolonne-3 outcome change).

**Fagvalg scope vs VG2 school (Vilbli — owner check 2026-07-03):**

| Question | Vilbli answer | Product rule (now + gate) |
|----------|---------------|---------------------------|
| Does kolonne-3 / Fagvalg list **vary per selected VG2 school** (same programme, different school)? | **No** — on the county `skoler-og-laerebedrifter` chain page (`side=p5`, `kurs=VG1_VG2_…`), kolonne-3 is **one list for the active VG1→VG2 programme chain in that fylke**, not per-school sub-lists (`parseVg3BranchingOptions` in `build-path-variants.ts`; mechanic/carpenter owner records). | **Keep** county+chain-scoped Fagvalg; **do not** re-filter kolonne-3 when only the VG2 **school** changes. |
| When does Fagvalg change? | Different **VG2 programme** (branch) or different **fylke** / chain URL — not school pick alone. | Recompute Fagvalg on **programme** change (gate); school change → transport/geo only. |

**Gate deferral:** no school-specific Fagvalg work planned unless a future Vilbli/school-approval audit shows otherwise (e.g. per-school VG3 school programmes — separate from bedrift lærefag list).

### Plumber (`plumber` / rørlegger) — bedrift ingest (live 2026-07-03)

`Rørleggerfaget` registered in `larebedrift-fagkode.mjs`, `kolonne3-larefag-mapping.ts` (`BARLF3`), `profession-larefag-mapping.ts`, and cron batch 0 (`scheduled-larebedrift-ingest-fags.ts`). Pilot gate: `primary-route-larebedrift-pilot.ts` (nationwide when child has home kommune). **Nationwide ingest verified** — ~902 active `RORLEGGERFAGET` rows in `larebedrift_truth` (2026-07-03 `verify-larebedrift-truth-snapshot.mjs` PASS); prod-check Fagvalg → bedrift on plumber route.

Contour B / catalog expansion checklist (if adding counties): `§ Expansion gate` above — relay dry-run → production → route E2E.

### Anleggsteknikk (`anleggsteknikk` / Anleggsmaskinfører) — scaffolding (2026-07-10)

**Code + nationwide PSA ingest (2026-07-10).** Vilbli chain: VG1 `V.BABAT1----` → VG2 `V.BAANL2----`; kolonne-3 from chain page (not `BAANL3` in `kurs`). Charter: `phase-0-6-contour-b-anleggsteknikk-vilbli-branch-owner-record.md`.

| Layer | Status |
|-------|--------|
| Path definition + materialization | ☑ |
| V.BA VG2 switch | ☑ |
| Catalog seed | ☑ applied prod DB |
| NAV map | ☑ `håndverkere.anleggsmaskinør` (confirm) |
| PSA ingest | ☑ **14/15 counties** written; **Oslo `03` ABORT** (VG2=0); `34`/`42`/`56` partial + matching review |
| Bedrift ingest | ☑ **Closed** — kolonne-3 roster 9 fag; 2140 active rows; prod UI 2026-07-12 |

### Bedrift UI performance (truth-preserving)

Current model: read **verified** rows from `larebedrift_truth` (server DB); live fetch on Fagvalg change (~300–800 ms). Acceptable for pilot.

**If this becomes a product blocker**, upgrade path without live external API:

1. **Preload at recompute** — bake `apprenticeship_options` for all kolonne-3 fags in the snapshot (instant UI; heavier recompute).
2. **Monthly cron ingest** — keep DB fresh so fetch stays fast and truthful.

Do **not** call Finnlærebedrift live in prod UI (no Brønnøysund gate, breaks charter).

### Electrician lærebedrift — nationwide (live)

Eleven elektro kolonne-3 lærefag in `larebedrift-fagkode.mjs` + `kolonne3-larefag-mapping.ts`; cron batches 1–3. Owner-verified on prod (2026-07-04). Manual refresh: `?larefagCode=ELEKTRIKERFAGET` or full cron batch.

### Mechanic lærebedrift — mapping + ingest (live 2026-07-03)

Ten kjøretøy kolonne-3 lærefag registered in `larebedrift-fagkode.mjs` + `kolonne3-larefag-mapping.ts` (VIGO `TP*` codes). Default profession slug `mechanic` → `MOTORMEKANIKERFAGET`. Pilot gate: `primary-route-larebedrift-pilot.ts` (nationwide when child has home kommune). **Nationwide ingest done (2026-07-03)** — ~1777 mechanic rows, ~6494 total active in `larebedrift_truth`; prod-check Vestland Fagvalg → bedrift.

**Monthly cron:** Vercel runs eight batched `GET /api/internal/larebedrift/run-ingest/{0..7}` jobs on the 1st — batch 0 core Bygg fag + `BAAMF3`; batch **7** anleggsteknikk sibling kolonne-3 (`scheduled-larebedrift-ingest-fags.ts` + `data/larebedrift/kolonne3-rosters/`). Manual single-fag: `?larefagCode=ANLEGGRORLEGGERFAGET`.
