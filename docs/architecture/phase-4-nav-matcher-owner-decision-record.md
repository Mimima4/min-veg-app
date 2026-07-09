# Phase 4 — NAV Matcher Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-NAV-MATCHER** |
| **Status** | **IMPLEMENTATION CLOSED** — go-live **2026-06-13** (`phase-4-nav-matcher-go-live-closure-summary.md`) |
| **Date (UTC)** | 2026-06-10 |
| **Scope** | NAV/STYRK matching contract for route construction, available professions, and alternatives — gated by `filter_id` and contour truth |
| **Implementation** | **Production-first only** — see §1.1; family-facing ship after V-1…V-8, no interim or degraded surfaces |
| **Prerequisites** | `phase-4-route-outcome-filter-owner-decision-record.md`, `phase-4-multi-contour-truth-registry-owner-decision-record.md` |

---

## 1. Purpose

Connect **Vilbli-backed route outcomes** to **NAV occupation taxonomy (STYRK)** and the local **profession catalog**, scoped by the active **route outcome filter** (`filter_id` / `preferred_education_level`).

The matcher does **not** invent schools, programmes, occupations, or synthetic profession IDs. It operates only on **materialized contour truth** and **versioned mapping tables**.

**Forbidden:** fuzzy title-only matching as the sole production gate; live NAV HTML scrape on route page load; `review-*` placeholder profession slugs in family UI; shipping filter gates with ad-hoc STYRK allowlists “until v2”.

### 1.1 Production-first rule (binding)

All matcher work ships **directly for production**: scalable, automated, and quality-bar production — **not** pilots that “good enough for now”, not paths labeled “finish later”, not family-facing half-implementations behind feature flags without full ops (snapshot, refresh, map versioning, verification).

Phases A→B→C define **build order**, not permission to ship a degraded matcher. Family-facing “matcher live” is a single gate: NM-0…NM-6 signed **and** V-1…V-8 pass on **production** target.

---

## 2. Chain model (locked)

```
filter_id
  → path variant (VGS)              [C-VGS-YRKESFAG — materialized truth only]
  → scoped Vilbli outcomes          [yrker links from selected variant / branch]
  → path_family outcome binding     [curated map: outcome URL / Vilbli title ↔ path_family]
  → NAV occupation (STYRK)          [C-NAV-OCCUPATION — versioned snapshot only]
  → catalog profession              [local professions row must exist]
  → full step route                 [buildStepsFromAvailabilityTruth — all steps]
```

**VG1 rule:** one VG1 anchor per path family; **VG2 and beyond** branch by variant and programme options. Changing `filter_id` changes **outcome set and gates**, not sort order alone.

**One NAV-yrke ≠ one Vilbli slug:** filter narrows which outcomes are in scope; mapping is many-to-many within a path family.

---

## 3. Matcher API contract (logical)

### 3.1 Inputs

| Input | Required | Source |
|-------|----------|--------|
| `filter_id` | Yes | Route filter or child planning (`preferred_education_level` after enum migration) |
| `profession_slug` | Yes | Target route profession |
| `path_variants` | Yes | `buildPathVariants` from **availability truth** (never legacy seed) |
| `selected_path_variant_id` | No | User-locked variant; else derive from `filter_id` |
| `child_context` | Yes | `is_child_route` — `pabygging_studiekompetanse` forbidden |
| `county_code` / `municipality_codes` | Yes | Route geography context |
| `path_family_slug` | Yes | From profession + Vilbli path definition |
| `nav_snapshot_version` | Yes | Materialized C-NAV snapshot row version |

### 3.2 Outputs

| Output | Description |
|--------|-------------|
| `primary_path_variant_id` | Variant for primary **full** step route |
| `primary_outcomes` | Vilbli outcomes in scope (verified URLs only) |
| `nav_matches` | `nav_code`, `nav_title`, `confidence`, `match_method`, `mapping_source` |
| `catalog_profession_links` | Only rows that **exist** in `professions` |
| `hidden_filter_ids` | Filters with no live contour — **hidden in UI**, not stubbed |
| `alternative_routes` | Up to K=3 **full** routes per filter record §3; each or nothing |

**County-local primary (2026-07-09):** alternatives may include routes whose **school chain PSA** lives in another fylke (relocation / neighboring county), but those routes **never** populate the home-fylke primary school pickers. Primary in home fylke requires full required chain locally — see `phase-4-county-local-primary-route-completeness-owner-policy.md`.

### 3.3 Code modules (closed 2026-06-13)

| Module | Production path |
|--------|-----------------|
| Path-family map + filter gates | `src/lib/nav/path-family-outcome-nav-map.ts` |
| Variant selection | `src/server/children/routes/resolve-path-variant-for-filter.ts` |
| NAV matches on route build | `src/server/children/routes/build-route-path-variant-nav-context.ts` |
| Available professions | `src/server/children/routes/get-study-route-available-professions.ts` |
| NAV snapshot read | `src/server/nav/get-nav-occupation-snapshot.ts` |
| `/matches` | Redirect to route-scoped professions (`matches/page.tsx`) |

---

## 4. Path variant selection (`filter_id` → variant)

When `hasBranchingVg3OrBedrift` and both variants exist:

| `filter_id` | Primary `path_variant_id` |
|-------------|---------------------------|
| `fast_to_work` | `vilbli-branch-direct-bedrift` |
| `vg3_before_apprenticeship` | `vilbli-branch-vg3-then-bedrift` |
| `open` | `vilbli-branch-direct-bedrift` (canon) |
| `flexible` | `vilbli-branch-direct-bedrift` (primary); alts per filter record §3 |

**Post-VGS / other kontur filters** (`fagskole_after_vgs`, `long_academic`, `pabygging_studiekompetanse`):

| Rule | Behavior |
|------|----------|
| Contour **not live** | Filter **hidden**; alternative **not shown**; matcher **not invoked** for that `filter_id` |
| Contour **live** | **Full step route** from that contour’s materialized truth — appended after VGS or separate route per charter |
| Never | One-line label, teaser copy with fake institution names, or NAV-only card without steps |

When only one VGS variant exists, use it; hide `vg3_before_apprenticeship` if VG3 branch absent in truth.

**Outcome scoping:** `sourceOutcomeUrl` from nodes of the **variant tied to the active `filter_id`** (primary or alternative).

### 4.1 Same profession, multiple VG1 entries (owner rule 2026-07-07)

If one profession is reachable by more than one materialized VGS chain that starts at different VG1 programmes, those chains must be modeled as **alternative route variants** for that profession:

- keep one `profession_slug`
- expose one primary + optional `alternative_routes[]`
- never split into synthetic extra professions only because VG1 entry differs

**Example shape (illustrative):** for one profession, route alternatives can be `VG1 Bygg- og anleggsteknikk -> VG2 X -> ...` and `VG1 Teknologi- og industrifag -> VG2 Y -> ...`, both shown as alternatives under the same profession when both chains are in truth.

---

## 5. NAV match and filter gates (production rules)

### 5.1 Path-family outcome binding (authoritative)

Before NAV title logic:

1. Resolve `path_family_slug` from `profession_slug` + Vilbli path definition.
2. Map each scoped outcome URL / Vilbli title through **`path_family_outcome_nav_map`** (versioned table or checked-in manifest with `source_reference_url` per row).
3. If no map row → outcome **excluded** from family UI (ops review queue only).

Title fuzzy match may exist **only** as an offline ingest aid to **propose** map rows — not as runtime family-facing matcher.

### 5.2 NAV occupation resolution

| Rule | Detail |
|------|--------|
| Source | Materialized `nav_occupation_snapshot` (from C-NAV ingest) |
| Route request | Read snapshot by version — **no** live `arbeidsplassen.nav.no` fetch |
| Refresh | Scheduled job per multi-contour registry U-6 |
| Match methods allowed in production UI | `exact_title`, `title_contains`, `path_family_map` |
| Forbidden in production UI | `keyword_contains` alone; unmapped outcomes |

### 5.3 Filter gates (require path_family map + STYRK)

Gates apply **after** path_family binding — not ad-hoc category guessing:

| `filter_id` | Gate |
|-------------|------|
| `fast_to_work` | Map rows tagged `lære` / `fagbrev`; exclude rows tagged `akademisk` / `profesjonsstudier` |
| `vg3_before_apprenticeship` | Map rows tagged `vg3_spesialisering` for active branch |
| `fagskole_after_vgs` | Only when C-FAGSKOLE live; map rows tagged `fagskole` |
| `long_academic` | Only when C-HOYSKOLE / C-PROFESJONSSTUDIER live; map rows tagged `akademisk` or `profesjonsstudier` |
| `pabygging_studiekompetanse` | Only when C-PABYGGING live; child routes forbidden |
| `open` | Canon map row set for path family default |
| `flexible` | Union of rows passing gates for each **live** alternative `filter_id` |

Each map row carries: `path_family_slug`, `filter_tags[]`, `nav_styrk_code`, `vilbli_outcome_url` (optional), `profession_slug` (optional), `source_reference_url`, `version`.

### 5.4 Catalog profession link

| Result | Family UI |
|--------|-----------|
| `professions` row exists for mapped NAV / catalog slug | Show linked profession |
| No catalog row | **Omit** — do not show NAV card, do not synthesize `review-*` slug |
| Ops | Unmapped rows in review dashboard (out of family UI) |

---

## 6. Product integration

| Surface | Rule |
|---------|------|
| **Primary route** | `filter_id` → variant → full steps from truth |
| **Alternatives** | Different `filter_id` → different variant or contour → **complete** step list or slot omitted |
| **Available professions** | Catalog-linked only; scoped by filter gates |
| **`/matches` explorer** | **Deprecate** as matcher surface — redirect to route-scoped professions or remove after route matcher live |
| **Staleness** | `filter_id` in `route_input_signature` |

### Display (locked)

Horizontal steps: institution + programme + stage. No shorthand-only route rows.

### Omit (locked)

No contour truth → hide filter, omit alternative, **no matcher call** — not a degraded/stub experience.

---

## 7. Worked example — mechanic (Vestland)

| Slot | `filter_id` | Route |
|------|-------------|-------|
| Kanon | `fast_to_work` | Full steps: VG1 teknologi → VG2 kjøretøy → lære (direct-bedrift variant) |
| Alt 1 | `vg3_before_apprenticeship` | Full steps: … → VG3 (branch option) → lære |
| Alt 2 | `fagskole_after_vgs` | **Hidden** until C-FAGSKOLE gate passed; then full fagskole steps after VGS |
| Alt 3 | `long_academic` | **Hidden** until C-HOYSKOLE gate passed; then full høyskole steps (separate kontur) |

Same VG1; VG2+ and post-VGS contours diverge per map rows.

### 7.1 Kolonne-3 fag vs NAV vacancy catalog (owner binding 2026-07-04)

Within one VGS catalogue profession (e.g. `mechanic`, `electrician`):

| Layer | Granularity | Rationale |
|-------|-------------|-----------|
| **VG1 / VG2** | Shared school path for the family | Same foundation before specialization |
| **Fagvalg (kolonne-3)** | Per fag from Vilbli chain | Honest route + godkjent bedrift pool per lærefag |
| **NAV matcher / catalog** | **One** NAV vacancy-catalog profession per catalogue slug (e.g. Mekaniker, Elektriker) | Matches post-graduation job search on NAV/Finn — specialization appears in ad text, not separate STYRK per kjøretøy/elektro fag |

**Forbidden:** treating missing per-fag STYRK rows as P4-MCT-1 blockers for mechanic/electrician families already mapped at catalog level.

---

## 8. Delivery phases (production build order — single family-facing gate)

Phases are **implementation sequence**, not staggered product quality tiers. Code in each phase is written to **production** standards (versioned data, ops refresh, no request-time scrape, no synthetic IDs).

| Phase | Delivers (production-grade) |
|-------|----------------------------|
| **P4-NM-A** | Versioned `path_family_outcome_nav_map` for `electrician` + `mechanic`; `resolvePathVariantForFilter` |
| **P4-NM-B** | Materialized `nav_occupation_snapshot` + scheduled refresh (C-NAV U-1…U-6) |
| **P4-NM-C** | Matcher wired end-to-end: route build, available professions, alternatives, `/matches` deprecation path |
| **P4-NM-D** | Post-VGS contours — each full step route when respective registry contour gate passes |

**One family-facing go-live:** after P4-NM-A+B+C complete **and** V-1…V-8 on production. P4-NM-D per contour as contours become live (still production-only, never stub).

---

## 9. Verification (required before family-facing “matcher live”)

| # | Check |
|---|-------|
| V-1 | `fast_to_work` → `vilbli-branch-direct-bedrift` when both variants exist (mechanic + electrician) |
| V-2 | `vg3_before_apprenticeship` → `vilbli-branch-vg3-then-bedrift` |
| V-3 | Filter change changes scoped outcomes via **map rows**, not sort-only |
| V-4 | `fagskole_after_vgs` / `long_academic` **hidden** until respective contour gate — never stub |
| V-5 | No live NAV fetch in route request path |
| V-6 | No `review-*` synthetic profession IDs in family UI |
| V-7 | Browser E2E: primary + one alternative = full horizontal steps (mechanic Vestland pilot) |
| V-8 | `npm run build` passes |

---

## 10. Owner sign-off

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| NM-0 | Chain requires path_family map + versioned NAV snapshot? | **Yes** | ☑ 2026-06-10 |
| NM-1 | No production title-only / keyword-only matcher? | **Yes** | ☑ 2026-06-10 |
| NM-2 | Post-VGS filters hidden until contour live — never teaser/stub? | **Yes** | ☑ 2026-06-10 |
| NM-3 | No synthetic `review-*` profession IDs in family UI? | **Yes** | ☑ 2026-06-10 |
| NM-4 | `/matches` deprecated as matcher surface after P4-NM-C? | **Yes** | ☑ 2026-06-10 |
| NM-5 | Phases A→B→C are build order; one production go-live gate (V-1…V-8)? | **Yes** | ☑ 2026-06-10 |
| NM-6 | Production-first only — no temporaries / “finish later” family surfaces? | **Yes** | ☑ 2026-06-10 |
| NM-7 | Implementation unblocked after this record effective + V-1…V-8 pass? | **Yes** | ☑ 2026-06-10 |

---

## 11. References

- `phase-4-route-outcome-filter-owner-decision-record.md`
- `phase-4-multi-contour-truth-registry-owner-decision-record.md`
- `build-path-variants.ts`
- `phase-4-nav-matcher-go-live-closure-summary.md`
- `route-engine-stage-6-ux.md`
