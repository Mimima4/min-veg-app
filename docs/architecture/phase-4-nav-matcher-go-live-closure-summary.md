# Phase 4 NAV Matcher — Go-Live Closure Summary

| Field | Value |
|-------|--------|
| **Status** | **MATCHER WIRING CLOSED** — family-facing matcher live on production **2026-06-13**. **P4-MCT-1 phase remains open** until all VGS catalogue professions and kolonne-3 fag are prod-live (`phase-4-multi-contour-truth-registry-owner-decision-record.md` §5). |
| **Date (UTC)** | 2026-06-13 |
| **Authority** | `phase-4-nav-matcher-owner-decision-record.md` |
| **Out of scope** | P4-NM-D post-VGS contours (hidden until respective registry gates pass) |

---

## Delivery phases

| Phase | Delivers | Status | Proof |
|-------|----------|--------|-------|
| **P4-NM-A** | `path_family_outcome_nav_map` v1 + `resolvePathVariantForFilter` | ☑ | `src/lib/nav/path-family-outcome-nav-map.ts`, `resolve-path-variant-for-filter.ts` |
| **P4-NM-B** | Materialized `nav_occupation_snapshot` + scheduled refresh | ☑ | Migration `20260610130000_nav_occupation_snapshot.sql`; prod snapshot v1 (**113** occupations, 2026-06-12); `ops:scheduled` → `nav-occupation-snapshot` |
| **P4-NM-C** | Matcher wired: route build, available professions, alternatives; `/matches` redirect | ☑ | `build-route-path-variant-nav-context.ts`; `matches/page.tsx` → route-scoped professions; deprecated live-fetch module removed |

---

## Verification gates (V-1…V-8)

| # | Check | Status | Proof |
|---|-------|--------|-------|
| V-1 | `fast_to_work` → `vilbli-branch-direct-bedrift` | ☑ | `npm run verify:nav-matcher-v-gates` |
| V-2 | `vg3_before_apprenticeship` → `vilbli-branch-vg3-then-bedrift`; hidden without VG3 PSA | ☑ | same |
| V-3 | Filter change scopes outcomes via map rows | ☑ | `verify:nav-matcher-v-gates` path-family fixture |
| V-4 | `fagskole_after_vgs` / `long_academic` hidden until contour live | ☑ | same |
| V-5 | No live NAV fetch on route request path | ☑ | same |
| V-6 | No `review-*` synthetic profession IDs in family UI | ☑ | same |
| V-7 | Browser E2E: primary + alternative full steps (mechanic Vestland) | ☑ | `phase-4-nav-matcher-v7-mechanic-vestland-owner-verify-checklist.md` **CLOSED** 2026-06-10 |
| V-8 | `npm run build` passes | ☑ | qa 2026-06-13 |

---

## Production posture (binding)

- Route truth: Vilbli PSA + path variants only — matcher adds NAV/catalog linkage, not schools.
- Post-VGS filters remain **hidden** (not stubbed) until P4-NM-D per-contour gates.
- NAV snapshot refresh: `npm run ops:scheduled` (Feb/Aug full ops) or `npm run ops:nav-snapshot-ingest`.

---

## References

- `phase-4-nav-matcher-owner-decision-record.md` — contract (NM-0…NM-7 signed)
- `phase-4-route-outcome-filter-owner-decision-record.md` — filter semantics
- `phase-4-multi-contour-truth-registry-owner-decision-record.md` — post-VGS contour gates
