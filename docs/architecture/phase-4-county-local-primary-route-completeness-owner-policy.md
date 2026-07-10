# Phase 4 — County-local primary route completeness (owner policy)

| Field | Value |
|-------|--------|
| **Status** | **OWNER SIGNED** (2026-07-09) |
| **Scope** | All VGS-backed professions in `SUPPORTED_VGS_PROFESSION_SLUGS` |
| **Parent** | `route-engine-master-spec.md` (published internal truth only); `phase-4-nav-matcher-owner-decision-record.md` §3–4 |
| **Triggered by** | Painter / Overflateteknikk in northern fylke (VG2=0 county-local on Vilbli) |

---

## One-sentence rule

**Primary route in the child’s home fylke is shown only when the full required school chain for that profession exists in county-scoped PSA truth — never patched, never “VG1-only”, never borrowed from another fylke.**

If the chain is incomplete locally → **no suitable primary route** (honest empty / unavailable state).

Cross-fylke Vilbli offerings may appear **only** under **alternative routes**, clearly labeled — never promoted to primary.

---

## Definitions

| Term | Meaning |
|------|---------|
| **Home fylke** | County derived from child home kommune (`county_code` on route context) |
| **County-scoped PSA** | `programme_school_availability` rows for `county_code = home fylke`, `source = vilbli`, active, NSR-matched institutions |
| **Required school chain** | All `stageNodes` with `stageType = school_programme` and `requiredForWrite = true` in `vgs-path-definitions.mjs` for that profession |
| **Primary route** | The main working/saved route for `(child, profession_slug, home fylke)` |
| **Alternative route** | Entry in `alternative_routes[]` — separate variant, separate save signature, never substitutes for primary |

---

## Binding rules

### R-1 — No invention

| Forbidden | Allowed |
|-----------|---------|
| Writing VG1-only PSA when VG2 is missing locally and calling it a “route” | PSA ingest **stops** when required Vilbli stage absent in county extract (`ABORT: Missing required extracted stages`) |
| Showing schools from **other fylke** in the primary VG2 school picker | Schools in primary picker = **home fylke PSA only** |
| Fabricating programme rows to satisfy classify | `missing_programme_rows` stays honest until full chain can be written |
| National Vilbli strukturkart list as primary truth | County pipeline URL + county-scoped extract only for primary |

### R-2 — Primary completeness gate

Primary route is **eligible** only when **every** required school stage (typically VG1 + VG2 for VGS yrkesfag) has **≥1** county-scoped PSA row for that profession’s materialized programme slugs in home fylke.

If any required stage is missing → primary route = **not available** (UI: no steps / explicit copy — not a truncated chain).

**Bedrift / kolonne-3 / NAV** downstream steps are irrelevant until the school chain gate passes.

### R-3 — Cross-fylke as alternative only (owner 2026-07-09)

When Vilbli shows continuation schools in **neighboring fylke** (e.g. Nordland / Trøndelag for Overflateteknikk when home is Finnmark / Troms):

| Layer | Rule |
|-------|------|
| **Primary** | No route (R-2) — honest |
| **Alternative** | May offer **full** routes built from **that fylke’s PSA truth** **only when Vilbli’s county-scoped extract confirms the same programme chain** (VG1→VG2→…) exists there — PSA alone is not enough if Vilbli does not list that continuation for the profession branch |
| **Labeling** | Alternative must name the **other fylke** / relocation context (same pattern family as curated regional delivery — e.g. Steigen veksling) |
| **Matcher** | `alternative_routes[]` — **full step route or nothing** (`phase-4-nav-matcher-owner-decision-record.md` §3.2) |

**Never** merge neighboring-fylke schools into the home-fylke primary dropdown.

### R-4 — Pipeline alignment

| Component | Behavior |
|-----------|----------|
| `classify-vgs-truth-readiness` | `missing_programme_rows` when programme links / extract incomplete — **expected**, not a bug |
| `run-contour-b-operational-ingest` | Does **not** relax missing required Vilbli stages into partial writes |
| `build-steps-from-availability-truth` | Must not emit a **primary** step list that stops mid-chain without passing R-2 (see §Implementation status) |
| `route-truth-invariants` | Primary completeness invariant (planned code id: `PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY`) |

### R-5 — Catalog vs availability

A profession may exist in the **catalog** nationwide while **unavailable** in some fylke. That is correct: catalog ≠ “route exists everywhere”.

---

## Precedents (why this is not “VG1-only ingest”)

| Profession | Troms `55` / Finnmark `56` Vilbli extract (county-scoped) | Primary in north |
|------------|-----------------------------------------------------------|------------------|
| carpenter (Tømrer) | VG2 **present** locally | Full chain possible |
| plumber (Rørlegger) | VG2 **present** locally | Full chain possible |
| painter (Overflateteknikk) | VG2 **absent** locally | **No primary** — alternatives only (future) |

Electrician Finnmark has local VG2 on `V.EL` — different Vilbli branch; partial UI there is matching/LOSA, not missing VG2 stage.

**There is no precedent for “write VG1-only PSA and show primary route”.** Earlier professions did not need it.

---

## UX copy (target)

| Locale | Primary unavailable |
|--------|---------------------|
| nb | «Det finnes ingen fullstendig skolevei for dette yrket i barnets heimfylke.» |
| en | «There is no complete school pathway for this trade in the child’s home county.» |

Alternatives block: existing **Alternative routes** collapsible — never the main card.

---

## Integration layer (where the gate lives)

**Gate id:** `psa_to_primary` — `assessHomeCountyPrimaryRouteEligibility()` in `home-county-primary-route-completeness.ts`.

| Layer | Role |
|-------|------|
| Contour B ingest / classify / relay | Writes PSA or stops (`ABORT`, `missing_programme_rows`). **Not modified** by this policy. |
| `get-availability-truth` | Reads PSA rows (incl. LOSA scope). **Not a gate.** |
| **`psa_to_primary` gate** | Before primary steps: county-scoped school rows (LOSA **excluded**) must cover VG1+VG2. |
| `create-initial-study-route` / `trigger-study-route-recompute` | Explicit handoff call before path-variant build. |
| `build-path-variants` / `build-steps-from-availability-truth` | Defense-in-depth at truth→steps transform. |
| `sync-study-route-curated-regional-alternatives` (Steigen) | **After** primary snapshot — **never** gated here. |
| `get-study-route-alternatives` | Read-time teasers — **not** primary correctness. |
| P-7 cross-fylke (planned) | Same family as Steigen — neighbor fylke PSA + Vilbli, **alternative only**. |

**Contour B runtime handoff:** product does not call classify on page load; it reads PSA. Empty or incomplete school chain → `contourBHandoff: primary_steps_blocked` → no VG1-only primary steps.

---

## Implementation status (systemic / automatic)

| Piece | Status | Notes |
|-------|--------|-------|
| PSA ingest abort on missing required Vilbli stage | **Live** | Correct — do not relax |
| Classify `missing_programme_rows` | **Live** | Honest readiness |
| `psa_to_primary` eligibility contract | **Live** | `assessHomeCountyPrimaryRouteEligibility`; create + recompute + builders |
| Primary completeness invariant | **Live** | `PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY` in smoke |
| Neighboring-fylke **alternative** builder | **Live (P-7)** | `painter-north-cross-fylke-*` curated variants; neighbor PSA + `psa_to_primary` gate |
| Smoke / audit | **Live** (partial) | `smoke-route-truth-invariants`; LOSA exclusion case |

**Non-regression:** Green counties and professions with local full chains (carpenter, plumber, electrician, mechanic in fylke where VG2 PSA exists) must behave **unchanged** when the completeness gate ships.

---

## References

- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — Truth policies § County-local primary route
- `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` — P-6, P-7
- `phase-4-nav-matcher-owner-decision-record.md` — §3.2 alternatives or nothing; §4.1 variant split
- `phase-4-losa-regional-delivery-models-fit-analysis.md` — curated regional / veksling labeling
- `src/lib/regional-delivery/steigen-carpenter-veksling-path-variant.ts` — alternative-route UX precedent
