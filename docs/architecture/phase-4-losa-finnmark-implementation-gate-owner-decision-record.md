# Phase 4 LOSA Finnmark — Implementation Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-IMPL** |
| **Status** | Owner **Phase 4 LOSA Finnmark implementation** gate adopted at **docs level** — **bounded Tranche 1 only** |
| **Closure label** | `PHASE_4_LOSA_FINNMARK_IMPLEMENTATION_GATE_ADOPTED_TRANCHE_1` |
| **Date (UTC)** | 2026-06-05 |
| **County reference** | `56` (Finnmark) |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-IMPL** |
| **Prerequisites** | **P4-LOSA-FM-PLANNING-SUFFICIENT**; **P06-OPERATIONAL-CLOSED** (partial D); publishability contract **`ACCEPTED WITH NOTES`** |

This gate authorizes **read-only LOSA entity modelling and Vilbli manifest extraction** for the **18** Finnmark LOSA municipality rows — **not** PSA publication, Route/UI, Phase 2 DML, or further evidence curl pilots without a new gate.

**Adopting this gate does NOT change `NOT_READY_FOR_APPLY`.**

---

## 1. Problem anchor

| Signal | Value |
|--------|--------|
| Vilbli LOSA rows (Finnmark `56`) | **18** excluded from ordinary PSA (P06 Block D tail) |
| Matcher | **CASE 4** — `isLosa` abort; Contour B partial skips |
| Planning evidence | **5** owner-held CONFIRMED — **§4 not closed** |
| `publishability_posture` | `STILL_BLOCKED_ALL_SECTION_4` |

**Goal:** implement **safe read-only** LOSA row semantics (provider vs delivery site) and auditable manifest — first step toward publication model, **without** ordinary-campus PSA shortcut.

---

## 2. Tranche plan (ordered)

| Tranche | Deliverable | Gate |
|---------|-------------|------|
| **1** (this gate) | `scripts/lib/losa-finnmark-entity.mjs` + `scripts/extract-losa-finnmark-manifest.mjs`; `src/lib/losa/boundary.ts` | **P4-LOSA-IMPL** |
| **2** | Evidence linkage per row (claim class map) | **P4-LOSA-EVIDENCE-LINK** (2026-06-05) |
| **3** | Phase 2 observation writes (if approved) | separate |
| **4** | LOSA PSA publication model + pipeline rule | separate |
| **5** | Route `programme_selection` consumption | separate (#3) |

---

## 3. Owner decisions (P4LIM0–P4LIM12)

| # | Question | Answer |
|---|----------|--------|
| P4LIM0 | Adopt **P4-LOSA-IMPL** after planning sufficiency? | **Yes** |
| P4LIM1 | Tranche 1 = **read-only** manifest + entity parse only? | **Yes** |
| P4LIM2 | County **`56`** reference; patterns nationwide-applicable? | **Yes** |
| P4LIM3 | Provider vs delivery site separation enforced in parser? | **Yes** |
| P4LIM4 | No PSA / #2 / #3 / Phase 2 DML in Tranche 1? | **Yes** |
| P4LIM5 | No further curl pilots without new gate? | **Yes** (per planning sufficiency) |
| P4LIM6 | Vilbli label = observation input only; not legal truth? | **Yes** |
| P4LIM7 | Expected manifest count **18** LOSA rows (abort if drift)? | **Yes** |
| P4LIM8 | `publishability_posture` remains blocked until §4 per row? | **Yes** |
| P4LIM9 | Matcher CASE 4 unchanged — no NSR ordinary match for LOSA? | **Yes** |
| P4LIM10 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LIM11 | Tranche 1 proof = `node scripts/extract-losa-finnmark-manifest.mjs` exit 0 | **Yes** |
| P4LIM12 | Next gate after Tranche 1 = **P4-LOSA-EVIDENCE-LINK** or publication model charter | **Yes** |

---

## 4. Explicit non-scope (Tranche 1)

- not PSA rows for LOSA municipalities
- not Route options surfacing LOSA as ordinary schools
- not automated semiannual refresh deployment
- not NSR provider linkage without Tier 2 evidence
- not `missing_programme_rows` resolution for electrician (orthogonal)

---

## 5. Artifacts

| Artifact | Role |
|----------|------|
| `scripts/lib/losa-finnmark-entity.mjs` | Parse provider/delivery; §4 blocked posture |
| `scripts/extract-losa-finnmark-manifest.mjs` | Vilbli extract → 18-row manifest CLI |
| `src/lib/losa/boundary.ts` | Forbidden actions + gate order scaffold |
| `phase-4-losa-finnmark-publishability-contract-draft.md` | §3 entity model + §4 claims |

---

## Final statement

**Phase 4 LOSA Finnmark implementation** begins with **Tranche 1** read-only modelling. Publication for the **18** rows remains **blocked** until separate gates close §4 per row and define LOSA PSA shape.
