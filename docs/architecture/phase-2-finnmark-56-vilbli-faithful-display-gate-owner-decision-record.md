# Phase 2 Finnmark `56` Vilbli-Faithful Display — Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **FM56-VILBLI-DISPLAY** |
| **Status** | Owner **Vilbli-faithful display** product gate adopted — bounded implementation **approved** |
| **Closure label** | `FINNMARK_56_VILBLI_FAITHFUL_DISPLAY_GATE_ADOPTED` |
| **County / profession** | `56` / `electrician` pilot scope |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisites** | **P4-LOSA-FM-PLANNING-SUFFICIENT**; **P06-CONTOUR-B-UPDATE-3-post**; **A3-CONTOUR-A-56-post** |

---

## Product intent (owner-approved)

Show in the application what the user can find on **official Vilbli** for Finnmark electrician availability — including **LOSA** rows — with explicit display types. **Better empty than lie** applies to PSA publication only; **empty UI is not the product goal** for this county class.

| Display type | Meaning |
|--------------|---------|
| `ordinary` | Vilbli row matched to NSR — **not** PSA-published for `56` |
| `losa_external_delivery` | LOSA / external delivery — **not** ordinary VGS campus |
| `identity_unresolved` | Listed on Vilbli — NSR match not resolved |

---

## Boundaries (binding)

| Allowed | Forbidden |
|---------|-----------|
| Read-only Vilbli extract + NSR classify (same family as Contour A dry-run) | PSA write / permission **#2** on `56` |
| UI panel on study route when planning includes Finnmark `56` | Treating display rows as `programme_school_availability` truth |
| Static planning enrichment labels (Tier 1/2 summaries) | Live Lovdata/Udir fetch in Route runtime |
| Server cache (~1h) of extract payload | Matcher write / auto-retry on `56` |

**NOT_READY_FOR_APPLY** unchanged. Contour **B** remains information-only — does **not** repair matcher/UI.

---

## Owner decisions (FM56VFD0–FM56VFD8)

### FM56VFD0 — Scope

**Decision:** **Yes.** Pilot **`56` + `electrician`** only until a separate gate expands scope.

### FM56VFD1 — Read model

**Decision:** **Yes.** `scripts/build-vilbli-faithful-availability.mjs` + server `get-vilbli-faithful-availability.ts`.

### FM56VFD2 — UI

**Decision:** **Yes.** Study route detail panel when child planning includes county `56`.

### FM56VFD3 — No PSA lie

**Decision:** **Yes.** `psaPublished: false` on all rows; route steps still use PSA only where truth-ready.

### FM56VFD4 — LOSA presentation

**Decision:** **Yes.** LOSA must use `losa_external_delivery` — never ordinary campus card.

### FM56VFD5 — Enrichment

**Decision:** **Yes.** Planning CONFIRMED labels may appear as captions — not substitute Vilbli list.

### FM56VFD6 — Prerequisites

**Decision:** **Yes.** Planning sufficient does **not** block this product read path.

### FM56VFD7 — Expansion

**Decision:** **Yes.** Other counties require **separate** gate — no ad hoc enablement.

### FM56VFD8 — Checklist

**Decision:** **Yes.** Log **FM56-VILBLI-DISPLAY** in `phase-2-closure-criteria-checklist.md`.

---

## Implementation reference (safe)

| Artifact | Path |
|----------|------|
| Builder | `scripts/lib/vilbli-faithful-availability-builder.mjs` |
| CLI | `scripts/build-vilbli-faithful-availability.mjs` |
| Server | `src/server/children/routes/get-vilbli-faithful-availability.ts` |
| UI | `src/app/.../route/[routeId]/vilbli-faithful-availability-panel.tsx` |
