# Phase 4 LOSA — PSA Write Execution Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-PSA-WRITE** |
| **Status** | Owner **LOSA PSA write** gate adopted — **framework + dry-run only** |
| **Closure label** | `PHASE_4_LOSA_PSA_WRITE_GATE_ADOPTED_NO_EXECUTION` |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisite** | **P4-LOSA-PSA** schema (`a5785aa`) |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-PSA-WRITE** |

Defines bounded **#2-class** LOSA PSA write path (separate from Contour B ordinary ingest). **Does not** authorize an execution session, production inserts, pipeline patch, or Route/UI.

---

## 1. Write unit (nationwide pattern)

| Field | Rule |
|-------|------|
| `availability_scope` | **`losa_fjern_delivery_municipality`** only |
| `institution_id` | Provider NSR institution — **not** delivery site as fake school |
| `municipality_code` | Delivery municipality — **required** |
| `verification_status` | Default **`needs_review`** for LOSA until Utdanning path defined |
| `source` | `vilbli` (observation lineage) |
| Profession / county | Parameters — **no** hardcoded `56` / `electrician` in write logic |

**Reference proof county:** `56` / `electrician` for CLI dry-run only.

---

## 2. Preconditions (all required before execution session)

| # | Precondition |
|---|--------------|
| 1 | **P4-LOSA-PSA** migration **applied** to target DB — **satisfied** on main (`2026-05-29`; see `phase-4-losa-psa-schema-main-apply-checklist.md`) |
| 2 | Row-level §4 **`ROW_SECTION_4_SATISFIED`** + publication decision recorded |
| 3 | Filled owner-held charter (`phase-4-losa-psa-write-execution-charter-template.md`) |
| 4 | Pre-session dry-run: `npm run losa:preview-psa-write` — chartered row count matches |
| 5 | **Not** Contour B `pickInstitutionsForPsaEmission` path |

**Current posture (post tail 2026-05-29):** **1** LOSA PSA row inserted (Alta pilot); Route **#3** wired; reference operational tail **closed**; bulk/remaining **17** rows not written.

---

## 3. Owner decisions (P4LPW0–P4LPW12)

| # | Question | Answer |
|---|----------|--------|
| P4LPW0 | Adopt write gate framework after schema gate? | **Yes** |
| P4LPW1 | Dry-run scaffold only until first row §4 closes? | **Yes** |
| P4LPW2 | Nationwide write rules (reference county `56` for proof)? | **Yes** |
| P4LPW3 | Max pilot rows per session when authorized: **1** (expand via new charter)? | **Yes** |
| P4LPW4 | **No** execution session at gate adoption? | **Yes** |
| P4LPW5 | **No** Route / #3 in this gate? | **Yes** |
| P4LPW6 | Contour B ordinary ingest unchanged (still skips `isLosa`)? | **Yes** |
| P4LPW7 | Separate script path — not `run-vgs-truth-pipeline` default? | **Yes** |
| P4LPW8 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LPW9 | Charter template in repo? | **Yes** |
| P4LPW10 | CLI: `npm run losa:preview-psa-write` exit 0 with **0** candidates today | **Yes** |
| P4LPW11 | Next: owner-held charter + apply migration → first bounded write session | **When** §4 row closes |
| P4LPW12 | Route gate **P4-LOSA-ROUTE** remains separate | **Yes** |

---

## 4. Artifacts

| Artifact | Role |
|----------|------|
| `phase-4-losa-psa-write-execution-charter-template.md` | Owner-held session charter |
| `scripts/lib/losa-psa-write.mjs` | Write candidate builder (dry-run) |
| `scripts/preview-losa-psa-write.mjs` | CLI preview — **no** DB writes |

---

## Final statement

Write **path** is defined; **0** LOSA PSA rows authorized today. Execution requires filled charter + §4-closed row + applied schema.
