# Phase 0–6 Contour B — VGS profession addition template

| Field | Value |
|-------|--------|
| **Status** | **ACTIVE TEMPLATE** (reference instance: `painter` / Maler, closed 2026-07-10) |
| **Date (UTC)** | 2026-07-10 |
| **Scope** | Repeatable checklist for adding a **new VGS catalogue profession** from Vilbli truth through production UI |
| **Parent governance** | `phase-4-multi-contour-truth-registry-owner-decision-record.md` (P4-MCT-1); `VGS_OPERATIONAL_RUNNERS.md` § Expansion gate |

**Use this doc** when onboarding a profession that NAV maps to a catalogue slug. Copy the checklist into a per-profession **branch owner record** (`phase-0-6-contour-b-<slug>-vilbli-branch-owner-record.md`). Do **not** skip contour overlays — apply only the rows marked **required** or **if applicable**.

---

## 0. Governance before code

| # | Gate | Required | Notes |
|---|------|----------|-------|
| G-0 | Owner signs Vilbli branch (VG1→VG2→kolonne-3 scope) | **Yes** | One signed contour per profession — not full Vilbli area menu |
| G-1 | NAV catalog slug + matcher level | **Yes** | `phase-4-nav-matcher-owner-decision-record.md` — vacancy-catalog level, not per kolonne-3 STYRK |
| G-2 | P4-MCT-1 phase open | **Yes** | Professions added **incrementally** by owner pace; NAV is scope gate, not auto-ingest |
| G-3 | No production stubs | **Yes** | Omit filter/alt/bedrift surfaces until contour is live |

---

## 1. Branch owner record (per profession)

Create `docs/architecture/phase-0-6-contour-b-<slug>-vilbli-branch-owner-record.md` with:

| Section | Content |
|---------|---------|
| Signed Vilbli contour | VG1/VG2 tokens, kolonne-3 policy, show/do-not-show table |
| Reference URLs | National strukturkart + **county pipeline** URL (`side=p5`) |
| Materialization slugs | `{slug}-vg1-…`, `{slug}-vg2-…`, VG3/bedrift pattern |
| Lærebedrift | Primary `larefag_code` + **kolonne-3 roster JSON** (`data/larebedrift/kolonne3-rosters/<slug>.json`) — see template §4.4.1 |
| Owner decisions | P-1…P-n (pilot fylke, rollout, bedrift, northern policy, …) |
| Classify matrix | Per-fylke `status`, primary eligibility, relay notes |
| Closure checklist | Code → relay → E2E → prod sign-off |

**Reference:** `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` (most complete — includes P-6, P-7).

---

## 2. Contour B — path definition & expansion gate

**Authority:** `VGS_OPERATIONAL_RUNNERS.md` § Expansion gate (steps 1–10).

| Step | Artifact | Action |
|------|-----------|--------|
| 2.1 | `scripts/vgs-path-definitions.mjs` | `stageNodes` with `requiredForWrite: true` for each school stage Vilbli requires |
| 2.2 | `scripts/vgs-programme-materialization-planner.mjs` | Programme slug/title rows per fylke |
| 2.3 | `COUNTY_CODE_TO_VILBLI` | `classify-vgs-truth-readiness.mjs` + `scripts/lib/vilbli-county-meta.mjs` |
| 2.4 | `VGS_PIPELINE_COUNTY_CODES` | `scripts/lib/contour-b-operational-eligibility.mjs` **and** `src/lib/vgs/contour-b-operational-eligibility.ts` (**keep in sync**) |
| 2.5 | `SUPPORTED_VGS_PROFESSION_SLUGS` | TS route read path |
| 2.6 | `CONTOUR_A_OPERATIONAL_BY_PROFESSION` | If profession uses green Contour A counties — relay skips those pairs |
| 2.7 | `professions` catalog + `profession_program_links` | Seed SQL / migration |
| 2.8 | `npm run build` + deploy | Rebuild scheduler bundle |
| 2.9 | Relay dry-run (one county smoke) | `--dry-run --county <code> --profession <slug>` |
| 2.10 | Relay production | **Full matrix only** — never single-pair production relay |
| 2.11 | Block C E2E | `programme_selection.options` for pilot + green counties |

**Relay interpretation:**

| `action` | Meaning |
|----------|---------|
| `ingested` / `contour_b_partial` | PSA write OK |
| `ABORT` / `missing_programme_rows` | Vilbli county extract lacks required stage — **correct**, do not patch |
| `canonical_matching_review` | Matching confidence limit — **not** a runtime defect; see §5 |

---

## 3. Runtime — county-local primary gate (P-6, all professions)

**Policy:** `phase-4-county-local-primary-route-completeness-owner-policy.md`

| Rule | Implementation |
|------|----------------|
| Primary only when VG1+VG2 (required stages) in **home fylke PSA** | `assessHomeCountyPrimaryRouteEligibility()` — gate id `psa_to_primary` |
| LOSA rows **excluded** from primary completeness | `home-county-primary-route-completeness.ts` |
| No VG1-only primary | `create-initial-study-route`, `trigger-study-route-recompute`, `build-steps-from-availability-truth` |
| Invariant smoke | `PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY` in `smoke-route-truth-invariants` |

**UX copy (primary unavailable — incomplete home-fylke chain):**

| Locale | Copy |
|--------|------|
| nb | «Ingen rutetrinn er tilgjengelige ennå.» |
| nn | «Ingen rutetrinn er tilgjengelige enno.» |
| en | «No route steps are available yet.» |

Source: `src/lib/i18n/route-steps-empty-copy.ts`. Signal: `PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY`.

**No P-7 overlay:** fylke with VG2=0 but **not** covered by a chartered cross-fylke pilot (e.g. painter `15,32,33,39,40`) → primary empty + copy above only — **no** alternative routes panel unless another overlay applies (Steigen, etc.).

---

## 4. Contour overlays (apply if applicable)

### 4.1 C-LOSA-FJERN (Finnmark / remote delivery)

| When | Separate from Contour B ordinary ingest |
|------|----------------------------------------|
| Vilbli `isLosa` rows | Contour B **skips** ordinary emit; Phase 4 LOSA PSA charter |
| Route consumption | `losa/availability-scope.ts` — dropdown labels, badge |
| Primary gate | LOSA **not** counted toward VG1/VG2 completeness |

**Refs:** `phase-4-losa-*` gates; `phase-0-6-contour-b-operational-closure-checklist.md` § Finnmark split.

### 4.2 Steigen / curated regional delivery (carpenter veksling)

| When | Nordland `18` + carpenter + owner charter |
|------|-------------------------------------------|
| Sync | `sync-study-route-curated-regional-alternatives.ts` |
| Variant | `steigen-carpenter-veksling-path-variant.ts` |
| UX | Badge + info copy; **alternative only** — never primary |
| Decoupled from | `contourBTruthPathUsed` when charter says sync anyway |

**Ref:** `phase-4-nordland-steigen-regional-delivery-research-owner-record.md`

### 4.3 P-7 — profession-specific north cross-fylke (painter precedent)

**Only when owner charters it** — not automatic for all VG2=0 fylke.

| Element | Painter implementation |
|---------|------------------------|
| Eligibility | `painter-north-cross-fylke-pilot.ts` — home `55`/`56` only |
| Route shape | VG1 PSA **home** + VG2+ PSA **neighbor** (split, not full chain in neighbor) |
| Builder | `build-painter-north-cross-fylke-route-steps.ts` |
| Sync trigger | `shouldSyncStudyRouteCuratedRegionalAlternatives()` when home has no PSA rows |
| UI testid | `painter-north-cross-fylke-alternative-route` |
| Bedrift scope | `countyCodesForEmployerScope: [homeFylkeCode]` |

**Shared VG1 fallback:** when painter VG1 catalogue row missing but V.BA VG1 exists via carpenter slug — document in branch record; not a runtime hack.

**Do not** use P-7 pattern for `15,32,33,39,40` unless owner signs a new charter.

### 4.5 P-8 — sparse national VG2 + relocation (anleggsteknikk precedent)

**Only when owner charters it** — gated by PSA-derived sparse eligibility; **not** for dense VGS professions.

| Element | Planned implementation |
|---------|------------------------|
| Charter | `phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md` |
| Geography contract | `phase-4-relocation-geography-contract-owner-decision-record.md` |
| Contour | C-VGS-YRKESFAG only |
| North zone | Primary picker `{55,56}` + `{18}`; national VG2 → alternative |
| Relocation | First VGS school activation; bedrift already scoped |
| Implementation gate | Opus 4.8+ review |

**Do not** apply P-8 pattern to carpenter/plumber/electrician/mechanic without new sparse gate proof.

### 4.4 Verified lærebedrift (C-VGS bedrift layer)

| Step | Artifact |
|------|----------|
| Pilot scope | `primary-route-larebedrift-pilot.ts` — add profession to set when ready |
| **Kolonne-3 roster (required when chain has ≥2 bedrift fag)** | See **§4.4.1** — one JSON per signed VG1→VG2 chain; **do not** hand-wire fag one-by-one in route code |
| Ingest roster | `scheduled-larebedrift-ingest-fags.ts` — merges `data/larebedrift/kolonne3-rosters/*.json` |
| Truth | `larebedrift_truth` — **godkjent-only** |
| Empty list | Honest — «Ingen godkjente lærebedrifter…» — **not** a P4-MCT-1 blocker |

**Ref:** `phase-4-verified-larebedrift-employer-layer-charter.md`

#### 4.4.1 Kolonne-3 VIGO roster (automatic Fagvalg → bedrift match)

**Policy:** Fagvalg options come from Vilbli (`build-path-variants.ts`). Bedrift matching is **URL-first**: parse tail VIGO code from `programme_url` (`_v.baamf3----` → `BAAMF3`) via `kolonne3-larefag-mapping.ts`. Title matchers are fallback only.

| Step | Command / artifact |
|------|-------------------|
| 1. Extract | `node scripts/extract-vilbli-kolonne3-roster.mjs --profession <slug> --county-slug <pilot> --chain "<VG1>_<VG2>"` |
| 2. Commit roster | `data/larebedrift/kolonne3-rosters/<slug>.json` — all kolonne-3 fag on the signed chain |
| 3. Register TS | Import roster in `src/lib/larebedrift/kolonne3-roster.ts` (`KOLONNE3_PROFESSION_ROSTERS`) |
| 4. Verify | `npm run verify:kolonne3-roster -- <slug>` — JSON matches live Vilbli extract |
| 5. Smoke | `npm run smoke:kolonne3-larefag-mapping` — URL + title resolution per roster entry |
| 6. Ingest batch | Set `ingestBatch` on roster JSON; add cron batch in `scheduled-larebedrift-ingest-fags.ts` + `vercel.json` when >5 fag |
| 7. Prod ingest | `GET /api/internal/larebedrift/run-ingest?larefagCode=<CODE>` per fag or whole batch |

**Do not** use wrong VIGO tokens in docs (`BAANL3` in `kurs` URL breaks Vilbli extract). Tail codes come from kolonne-3 `href` on the chain page (`side=p5`), e.g. anleggsteknikk: `BAAMF3`, `BAARL3`, `BAVOA3`, …

**Profession default** (`profession-larefag-mapping.ts`): one primary kolonne-3 fag when user has not opened Fagvalg — not the full sibling list.

### 4.5 V.BA shared VG1 — multi-profession VG2 switch

| When | `carpenter`, `plumber`, `painter`, `anleggsteknikk` (Bygg VG1) |
|------|-----------------------------------------------|
| UX | Two-zone VG2 card: programme picker → school picker |
| Programme picker | **Only professions with a buildable route in home fylke** — primary (local VG1+VG2) or curated alternative (e.g. painter P-7); not every V.BA catalogue slug (`resolve-vba-shared-vg2-programme-options.ts`) |
| Cross-profession switch | `switch-study-route-for-vg2-programme.ts` — new working route, no VG1 carry-over |
| Hub | `child_profession_interests` upsert on switch |

**Ref:** `VGS_OPERATIONAL_RUNNERS.md` § V.BA shared VG1 gate

### 4.6 C-TRANSPORT-KOMMUNE

| When | All routes with PSA truth + home kommune |
|------|------------------------------------------|
| Sort | `buildKommuneTransportSortContext` on recompute |
| Flag | `KOMMUNE_TRANSPORT_NATIONAL_ACTIVE` |

**Ref:** `phase-4-route-kommune-transport-logistics-owner-record.md`

### 4.7 C-NAV-OCCUPATION (matcher)

| Step | Action |
|------|--------|
| Catalog profession row | One NAV vacancy-catalog slug per catalogue profession |
| Path variants | `buildRoutePathVariantNavContext` — kolonne-3 shapes outcomes |
| Alternatives | Full step route or nothing (`phase-4-nav-matcher-owner-decision-record.md` §3.2) |
| Outcome filter alts | `sync-study-route-outcome-filter-alternatives.ts` when chartered |

### 4.8 Outcome filter / kolonne-3 depth (P4-MCT-1)

For each kolonne-3 fag Vilbli lists on the signed chain in a fylke:

- Fagvalg step shows option
- Matching bedrift `larefag_code` in ingest roster (ops hygiene)
- E2E sample per profession slice

---

## 5. Classify & `canonical_matching_review` (batch ops)

**Not profession-specific.** Run as **matrix hygiene** after relay batches.

| `status` | Meaning | Action |
|----------|---------|--------|
| `verification_ready_after_write` | Green — matching confidence OK | None |
| `canonical_matching_review` | NSR identity / slash / multi-avd tail | Owner review queue — **UI may still work** (`contour_b_partial`) |
| `missing_programme_rows` | Required Vilbli stage absent in county | Expected when VG2=0 — **do not** force ingest |

**Batch procedure:**

1. `node scripts/classify-vgs-truth-readiness.mjs` (or relay output matrix)
2. Export all `canonical_matching_review` pairs **across professions**
3. Triage per `norway-school-identity-matching-spec.md` — CASE 2 multi-avd, slash schools, etc.
4. Close rows in owner-held evidence; re-classify
5. **Do not** block prod UI on review status alone when PSA ingested and runtime gate passes

**Current partial counties (all professions, 2026-07-10):** `34`, `42`, `56` commonly `canonical_matching_review`; painter also documents `34`/`42` post-ingest.

---

## 6. Quality gates before closure

| Gate | Command / artifact |
|------|-------------------|
| Typecheck + build | `npx tsc --noEmit && npm run build` |
| Route invariants | `npm run smoke:route-truth-invariants` |
| Profession smokes | e.g. `npm run smoke:painter-north-cross-fylke-pilot` when P-7 applies |
| Kolonne-3 roster verify | `npm run verify:kolonne3-roster -- <slug>` when bedrift chain has ≥2 fag |
| Kolonne-3 mapping smoke | `npm run smoke:kolonne3-larefag-mapping` |
| E2E | `npm run test:e2e:<profession>` — Block C `programme_selection` |
| Prod relay | Full matrix from home IP; record `ingested`/`ABORT` per pair in branch record |
| Prod UI spot-check | Owner sign-off per pilot matrix row |

---

## 7. Closure checklist (copy into branch record)

| # | Item |
|---|------|
| 1 | Branch owner record signed |
| 2 | Expansion gate steps 2.1–2.7 complete |
| 3 | Dry-run green counties |
| 4 | Production relay (full matrix) |
| 5 | P-6 primary gate verified (incl. VG2=0 fylke → empty primary + copy) |
| 6 | Overlay contours chartered & verified (LOSA / Steigen / P-7 / bedrift — as applicable) |
| 7 | Classify matrix documented |
| 8 | E2E PASS |
| 9 | Prod UI owner sign-off |
| 10 | Update `phase-4-multi-contour-truth-registry-owner-decision-record.md` profession count when closing slice |

---

**Reference instance — `anleggsteknikk` (6th profession, closed 2026-07-12)**

| Overlay | Applied? | Evidence |
|---------|----------|----------|
| Contour B path + relay | **Yes** | 14/15 counties; Oslo `03` ABORT |
| P-6 primary gate | **Yes** | Local VG2 in `55`/`56` |
| P-7 north | **No** | Local VG2 present |
| V.BA VG2 switch | **Yes** | carpenter/plumber/painter/anleggsteknikk |
| Bedrift kolonne-3 roster | **Yes** | `kolonne3-rosters/anleggsteknikk.json`, batch 7 |
| Steigen / LOSA-specific | **No** | Cross-profession LOSA only (Finnmark charter) |

---

## 8. Reference instance — `painter` (Maler)

| Overlay | Applied? | Evidence |
|---------|----------|----------|
| Contour B path + relay | **Yes** | `vgs-path-definitions.mjs` `painter` |
| P-6 primary gate | **Yes** | `e0098e3` |
| P-7 north (`55`/`56`) | **Yes** | `painter-north-cross-fylke-*`, E2E + prod Troms/Finnmark |
| V.BA VG2 switch | **Yes** | Shared with carpenter/plumber |
| Bedrift | **Yes** | `BAMOT3` / `BAIMF3`, batch 0 |
| Steigen | **No** | Carpenter-only |
| LOSA | **No** (painter) | Finnmark painter ABORT — no ordinary PSA |
| Empty primary copy | **Yes** | `15,32,33,39,40` — no P-7 |

**Fylke matrix (painter):**

| Fylke codes | Vilbli VG2 local | Primary | Alternatives |
|-------------|------------------|---------|--------------|
| `03,11,18,31,46,50` | Yes | Yes | Standard |
| `34,42` | Yes | Yes (after ingest) | `canonical_matching_review` — batch ops |
| `15,32,33,39,40` | No | **No** + copy §3 | **None** |
| `55,56` | No | **No** + copy §3 | **P-7** north only |

---

## 9. References

- `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` — closed reference instance
- `phase-0-6-contour-b-third-profession-expansion-owner-record.md` — expansion gate checklist pattern
- `phase-4-county-local-primary-route-completeness-owner-policy.md` — P-6 policy
- `phase-4-multi-contour-truth-registry-owner-decision-record.md` — global phases P4-MCT-1…5
- `phase-4-nav-matcher-owner-decision-record.md` — matcher contract
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — ops runbook
