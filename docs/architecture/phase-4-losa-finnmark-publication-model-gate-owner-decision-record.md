# Phase 4 LOSA Finnmark — Publication Model Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-PUBLICATION-MODEL** |
| **Status** | Owner **publication model draft** adopted at **docs level** |
| **Closure label** | `PHASE_4_LOSA_FINNMARK_PUBLICATION_MODEL_DRAFT_ADOPTED` |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisite** | **P4-LOSA-EVIDENCE-LINK** (`0c219de`) |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-PUBLICATION-MODEL** |

Adopts `phase-4-losa-finnmark-publication-model-draft.md` and read-only emission planner scaffold — **not** PSA writes, SQL migration, or Route/UI.

---

## Owner decisions (P4LPM0–P4LPM11)

| # | Question | Answer |
|---|----------|--------|
| P4LPM0 | Adopt LOSA publication model **draft** after evidence-link? | **Yes** |
| P4LPM1 | LOSA scope **`losa_fjern_delivery_municipality`** distinct from `programme_in_school`? | **Yes** |
| P4LPM2 | Provider `institution_id` + delivery `municipality_code` separation preserved? | **Yes** |
| P4LPM3 | Pipeline rule R1–R7 binding for future PSA gate? | **Yes** |
| P4LPM4 | Schema migration deferred to **P4-LOSA-PSA**? | **Yes** |
| P4LPM5 | All **18** rows remain emission-blocked at plan time? | **Yes** |
| P4LPM6 | Contour B continues skipping `isLosa` until PSA gate? | **Yes** |
| P4LPM7 | Route consumption deferred to **P4-LOSA-ROUTE** / #3? | **Yes** |
| P4LPM8 | No PSA / #2 / Phase 2 DML in this gate? | **Yes** |
| P4LPM9 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LPM10 | CLI proof: `npm run losa:finnmark-publication-plan` exit 0 | **Yes** |
| P4LPM11 | Next gate = **P4-LOSA-PSA** (schema + bounded write charter) | **Yes** |

---

## Artifacts

| Artifact | Role |
|----------|------|
| `phase-4-losa-finnmark-publication-model-draft.md` | Normative draft |
| `scripts/lib/losa-finnmark-publication-model.mjs` | Read-only emission planner |
| `scripts/plan-losa-finnmark-publication.mjs` | CLI proof |

---

## Final statement

Publication **shape** is defined; **no row** may be written until **P4-LOSA-PSA** and row-level §4 satisfaction.
