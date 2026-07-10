# Phase 0–6 — Painter North P-6/P-7 Prod E2E Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — automated + owner spot-check 2026-07-10 |
| **Date (UTC)** | 2026-07-10 |
| **Prerequisite** | `c9d5b65`+ (VG2 buildable-route gate, P-7 merge, Buskerud filter) |

---

## Automated proof

| Check | Result |
|-------|--------|
| `npm run smoke:painter-north-cross-fylke` | PASS |
| `npm run test:e2e:painter` | PASS (green fylke VG1, 2026-07-09) |
| `npm run test:e2e:painter-north-p67` | PASS when `E2E_CHILD_ID` + `E2E_NORTH_HOME=1` |

---

## P-6 — empty primary (home fylke `55`/`56`)

- [x] Primary route **empty** when local VG2=0 (no VG1-only patch)
- [x] Copy references heimfylke / alternatives (`primary-route-empty-state-copy.ts`)
- [x] Buskerud `33` — **no** P-7 alternatives (read-time filter)

## P-7 — nabofylke alternative

- [x] **One** card «Overflateteknikk nabofylke» (not per-neighbor cards)
- [x] VG1 schools in home fylke; VG2 school dropdown (≥2 schools when neighbors have PSA)
- [x] VG2 programme picker on V.BA routes includes **Maler** when P-7 buildable (`profession-has-buildable-route-in-fylke.ts`)

---

## Owner prod spot-check (2026-07-10)

- [x] Troms / Finnmark — VG2 Maler in programme dropdown (alternative path)
- [x] Buskerud `33` — no stale P-7 alternatives
- [x] Recompute stable (no infinite poll)

**Sign-off:** owner confirmed in chat 2026-07-10.
