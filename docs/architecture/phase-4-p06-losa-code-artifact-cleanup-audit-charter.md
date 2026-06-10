# Phase 4 / P06 — Code & Runtime Artifact Cleanup Audit Charter

| Field | Value |
|-------|--------|
| **Status** | **CHARTERED INVENTORY** — deletions require per-finding owner OK |
| **Date (UTC)** | 2026-05-29 |
| **Trigger** | Post Finnmark **18/18** + post-pilot steps 1–5 |
| **Out of scope** | Git history; owner-held JSON; gate decision records (keep unless superseded) |

---

## Goal

Find **runtime/code** leftovers from multi-week pilot: stale guards, dead branches, misleading scaffold comments, unused constants — **remove only what is proven unused**.

**Not a blanket doc purge:** architecture records stay unless explicitly superseded.

---

## Initial inventory (read-only, 2026-05-29)

| ID | Location | Issue | Action |
|----|----------|-------|--------|
| C-01 | `src/lib/losa/boundary.ts` | Header says **"scaffold only"** + `wire_losa_into_app_or_api_or_ui` forbidden — **UI is wired** (`route-steps-panel`, `LOSA_ROUTE_UI_INTEGRATION_APPROVED`) | Update comments/constants or relocate boundary doc — **owner OK before edit** |
| C-02 | `extract-losa-finnmark-manifest.mjs` | Prints `STILL_BLOCKED_ALL_SECTION_4` for all rows — **planning default**, correct for raw manifest but confusing post-18/18 | Consider output tweak or doc cross-ref only |
| C-03 | `losa-finnmark-entity.mjs` `assessLosaFinnmarkPublishabilityPosture()` | Always returns blocked posture — used for **manifest scaffolding**, not link CLI | Keep unless proven dead import path |
| C-04 | Per-row `DEFAULT_*_PILOT_CHARTER_ID` (×18) in `losa-psa-write-session.mjs` | All rows closed — charters still needed for **idempotency / re-execute** | **Keep** |
| C-05 | `link-losa-finnmark-evidence.mjs` per-row assertions (×18) | Large guard block — valuable regression harness | **Keep**; optional refactor later |
| C-06 | Contour B `isLosa` skip in ingest | Still required so ordinary ingest doesn't emit LOSA as campus | **Keep** — verify no duplicate PSA path |
| C-07 | `PHASE4_LOSA_ALLOWED_SCOPE_LABEL` | Unclear runtime consumer | Grep consumer; delete if zero refs **after owner OK** |

---

## Audit procedure

1. **Grep** `losa`, `LOSA`, `contour-b-partial`, `isLosa`, `STILL_BLOCKED`, `scaffold` in `src/` + `scripts/`.
2. **Trace** each hit → production path vs CLI-only vs dead.
3. **Classify:** `DELETE` | `UPDATE` | `KEEP` | `DOC-ONLY`.
4. **Owner sign-off** per `DELETE`/`UPDATE` batch.
5. **One PR per batch** with regression: `smoke:contour-b` + full LOSA CLI chain.

---

## Explicit non-goals

- No removal of §4 gate docs or row closure records.
- No change to `NOT_READY_FOR_APPLY` flag in code without separate gate.
- No new county implementation.

---

## Exit criteria

- Inventory **100%** classified.
- Zero stale **misleading** runtime comments on wired paths.
- No dead code paths that confuse next county slice.
- P06 Block D docs aligned with **18 LOSA PSA** (step 1).
