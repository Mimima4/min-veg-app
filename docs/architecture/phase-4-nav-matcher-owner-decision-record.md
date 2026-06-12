# Phase 4 — NAV Matcher Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-NAV-MATCHER** |
| **Status** | **EFFECTIVE** — owner sign-off 2026-06-10 |
| **Date (UTC)** | 2026-06-10 |
| **Scope** | NAV/STYRK matching contract for route construction, available professions, and alternatives — gated by `filter_id` and contour truth |
| **Implementation** | **P4-MCT-1 only** — wire matcher on **C-VGS-YRKESFAG** + **C-NAV-OCCUPATION**; post-VGS contours omit until live per multi-contour registry |
| **Prerequisites** | `phase-4-route-outcome-filter-owner-decision-record.md`, `phase-4-multi-contour-truth-registry-owner-decision-record.md` |

---

## 1. Purpose

Connect **Vilbli-backed route outcomes** to **NAV occupation taxonomy (STYRK)** and the local **profession catalog**, scoped by the active **route outcome filter** (`filter_id` / `preferred_education_level`).

The matcher does **not** invent schools or programmes. It selects **which verified path variant and outcomes** are in scope, then maps outcome titles to NAV codes with explicit confidence and review flags.

**Non-goals (v1):** replace Contour B ingest; scrape NAV on route page load without versioned snapshot; power legacy `/matches` as source of truth.

---

## 2. Chain model (locked)

```
filter_id
  → path variant (VGS)           [C-VGS-YRKESFAG]
  → scoped Vilbli outcomes       [yrker links from variant / branch]
  → NAV occupation match         [C-NAV-OCCUPATION]
  → catalog profession link      [local professions table]
  → full step route (not labels) [buildStepsFromAvailabilityTruth]
```

**VG1 rule:** one VG1 anchor per path family; **VG2 and beyond** branch by variant and programme options. Changing `filter_id` changes **outcome set and gates**, not sorting alone.

**One NAV-yrke ≠ one Vilbli slug:** same path family may expose multiple outcomes; filter narrows which outcomes are primary vs alternative.

---

## 3. Matcher API contract (logical)

### 3.1 Inputs

| Input | Required | Source |
|-------|----------|--------|
| `filter_id` | Yes | Route filter or child planning (`preferred_education_level` after enum migration) |
| `profession_slug` | Yes | Target route profession (e.g. `mechanic`, `electrician`) |
| `path_variants` | Yes | `buildPathVariants` result for current availability truth |
| `selected_path_variant_id` | No | User-locked variant; if absent, derive from `filter_id` |
| `child_context` | Yes | `is_child_route` — disables `pabygging_studiekompetanse` |
| `county_code` / `municipality_codes` | Yes | Geography for truth scope (existing route context) |

### 3.2 Outputs

| Output | Description |
|--------|-------------|
| `primary_path_variant_id` | Variant used to build primary step route |
| `primary_outcomes` | Vilbli outcomes in scope for primary |
| `nav_matches` | Per outcome: `nav_code`, `nav_title`, `confidence`, `match_method`, `review_needed`, `review_reason` |
| `catalog_profession_links` | Local `profession_id` / `slug` when title match exists |
| `omitted_filters` | `filter_id` values with no valid contour (for UI hide / alt omit) |

### 3.3 Existing code baseline

| Module | Role today | Gap |
|--------|------------|-----|
| `map-vilbli-outcomes-to-nav.ts` | Title fuzzy match → NAV | No `filter_id`; no variant scoping |
| `build-path-variants.ts` | Variants + outcomes | Not selected by filter |
| `get-study-route-available-professions.ts` | NAV map → profession list | Ignores planning filter |

---

## 4. Path variant selection (`filter_id` → variant)

Applies when `hasBranchingVg3OrBedrift` and both variants exist:

| `filter_id` | Primary `path_variant_id` | Notes |
|-------------|---------------------------|--------|
| `fast_to_work` | `vilbli-branch-direct-bedrift` | VG1 → VG2 → opplæring i bedrift |
| `vg3_before_apprenticeship` | `vilbli-branch-vg3-then-bedrift` | VG1 → VG2 → VG3 → lære |
| `open` | `vilbli-branch-direct-bedrift` | Canon = shortest valid yrkesfag path; alts per filter record §3 |
| `flexible` | Same as `open` for primary | May surface ranked cross-filter alts |
| `fagskole_after_vgs` | **No VGS variant change** | Post-VGS contour; omit full route until C-FAGSKOLE live |
| `long_academic` | **No VGS variant** | Separate kontur; omit until C-HOYSKOLE / C-PROFESJONSSTUDIER live |
| `pabygging_studiekompetanse` | **N/A (child)** | Disabled for barn |

When only one variant exists, all filters that need VGS use that variant; omit filters that require a missing branch (e.g. no VG3 → hide `vg3_before_apprenticeship`).

**Outcome scoping:** collect `sourceOutcomeUrl` from apprenticeship / VG3 branch nodes of the **selected primary variant** only. For `flexible` / `open` alternatives, use the variant tied to each alternative `filter_id`.

---

## 5. NAV match + filter gates

### 5.1 Base match (MVP — keep)

1. Load NAV taxonomy snapshot (`nav-taxonomy-adapter.ts`).
2. For each scoped Vilbli outcome, rank NAV occupations by title (`exact_title` > `title_contains` > `keyword_contains`).
3. Emit `confidence`: high / medium / low; `review_needed` when not exact contains-match.

### 5.2 Filter gates (MVP — add)

After base match, apply **inclusion / exclusion** by `filter_id`:

| `filter_id` | Include | Exclude |
|-------------|---------|---------|
| `fast_to_work` | Lære/fagbrev-oriented outcomes; yrkesfag NAV categories | VG3-only spesialisering titles when broader lære match exists; akademisk STYRK (ingeniør, lege, …) |
| `vg3_before_apprenticeship` | Outcomes tied to selected VG3 branch / spesialisering | Broad “mekaniker” when narrow VG3 outcome matches |
| `fagskole_after_vgs` | Fagskole-adjacent STYRK (when C-FAGSKOLE live) | Direct lære-only primary outcomes |
| `long_academic` | Høyskole/uni + lang profesjonsløp STYRK | Fagbrev/lære-only from same Vilbli chain |
| `pabygging_studiekompetanse` | Etter-VGS bridge occupations only | All VG lære matching (child: skip) |
| `open` | Default profession outcome set for path family | — |
| `flexible` | Union of valid filter scopes, ranked by distance order | Outcomes failing any active contour truth |

**Gate implementation (MVP):** STYRK `level1Code` / `navYrkeskategori` allowlist-denylist per `filter_id` + outcome URL variant affinity. **v2:** explicit `path_family_slug` ↔ STYRK map table.

### 5.3 Catalog profession link

Match `nav_title` or `vilbliTitle` to local `professions.title_i18n` (existing normalize in `get-study-route-available-professions.ts`).

| Result | UI |
|--------|-----|
| Local profession found | Link to catalog profession |
| NAV match only | Show with `reviewNeeded` |
| No match | Omit from list; do not fabricate slug |

---

## 6. Product integration points

| Surface | Matcher behavior |
|---------|------------------|
| **Primary route build** | `filter_id` → primary variant → steps via `buildStepsFromAvailabilityTruth` |
| **Route header / available professions** | Scoped outcomes + gated NAV matches |
| **Alternative routes (K≤3)** | Each alt = different `filter_id` → different variant/contour → **full step route**, not shorthand label |
| **Child profile `/matches`** | Legacy; not updated in P4-MCT-1 |
| **Signature / staleness** | `filter_id` already in `route_input_signature`; recompute when filter changes |

### Display rule (locked)

Families see **horizontal steps** (institution + programme + stage). Planning shorthand (e.g. «VG2 kjøretøy → lære») is **not** a substitute for step UI.

### Omit rule (locked)

If required contour is not live (multi-contour registry §4), **omit** filter option or alternative — no institution names, no stub schools.

---

## 7. Worked example — mechanic (Vestland)

| Slot | `filter_id` | Primary variant | Example NAV outcomes (illustrative) |
|------|-------------|-----------------|-------------------------------------|
| Kanon | `fast_to_work` | `direct-bedrift` | Bilmekaniker, mekaniker lette kjøretøy |
| Alt 1 | `vg3_before_apprenticeship` | `vg3-then-bedrift` | Motormekaniker |
| Alt 2 | `fagskole_after_vgs` | — (post-VGS) | Omit until C-FAGSKOLE; else transport/logistikk STYRK |
| Alt 3 | `long_academic` | — (annet kontur) | Maskiningeniør; omit until C-HOYSKOLE live |

Shared across rows: **same VG1** (teknologi); divergence at VG2 options / VG3 / lære outcome URLs.

---

## 8. MVP vs v2

| Capability | P4-MCT-1 (MVP) | v2 |
|------------|------------------|-----|
| `filter_id` → path variant | Yes | — |
| Scoped outcomes | Yes | — |
| Title match + filter gates | Yes | Path-family STYRK table |
| NAV snapshot persistence | No (live fetch) | Versioned snapshot table + refresh job |
| Fagskole / høyskole matcher | Omit | Per contour charter |
| Legacy enum migration | No | `filter_id` in DB + forms |

---

## 9. Verification (P4-MCT-1)

| # | Check | Required before claiming matcher live |
|---|-------|--------------------------------------|
| V-1 | Mechanic + electrician: `fast_to_work` selects `direct-bedrift` when both variants exist | Yes |
| V-2 | Same pair: `vg3_before_apprenticeship` selects `vg3-then-bedrift` | Yes |
| V-3 | Changing filter changes scoped outcomes (not identical NAV set when variants differ) | Yes |
| V-4 | `long_academic` / `fagskole_after_vgs` alts omitted when contour not live | Yes |
| V-5 | `npm run build` passes | Yes |
| V-6 | Manual route E2E: primary steps unchanged except variant-driven VG3 node | Yes |

**Out of scope for this record:** test Supabase staging contour (not required per owner).

---

## 10. Owner sign-off

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| NM-0 | Adopt three-layer matcher model (§2)? | **Yes** | ☑ 2026-06-10 |
| NM-1 | `filter_id` drives path variant + outcome scope + NAV gates? | **Yes** | ☑ |
| NM-2 | Full step routes for alts; VG1 shared, VG2+ branches? | **Yes** | ☑ |
| NM-3 | MVP = C-VGS + C-NAV only; post-VGS omit not stub? | **Yes** | ☑ |
| NM-4 | Keep title-match baseline; add filter gates in MVP? | **Yes** | ☑ |
| NM-5 | Legacy `/matches` not in P4-MCT-1 scope? | **Yes** | ☑ |
| NM-6 | Implementation allowed after this record effective? | **Yes** | ☑ |

---

## 11. References

- `phase-4-route-outcome-filter-owner-decision-record.md` — filter catalog + alternative ordering
- `phase-4-multi-contour-truth-registry-owner-decision-record.md` — C-VGS, C-NAV, omit rules
- `map-vilbli-outcomes-to-nav.ts` — current title matcher
- `build-path-variants.ts` — variant IDs
- `route-engine-stage-6-ux.md` — route outcome filter UX
