# Phase 4 LOSA — Bounded CONFIRMED Promotion (Alta Programme Tier 2) Gate

| Field | Value |
|--------|--------|
| **Status** | Docs gate for **at most 1** additional `CONFIRMED` row from Pilot 3b programme evidence |
| **Section** | **P4-LOSA-CONFIRMED-ALTA-PROGRAMME** |
| **Date (UTC)** | 2026-06-03 |
| **Prerequisite** | **P4-LOSA-SNIPPET-SESSION-2-post**; **P4-LOSA-REFRESH-PILOT-3B-post**; **P4-LOSA-CONFIRMED-UDIR-FJERN-post** |

**Does NOT:** clear publishability §4, PSA write, Route/UI (#3), matcher on `56`, or `NOT_READY_FOR_APPLY`.

---

## Row eligible for CONFIRMED (binding)

| source_id | claim_class | Citation basis |
|-----------|-------------|----------------|
| `T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP` | `programme_stage_availability` | Pilot 3b `utdanningstilbud/` snapshot (Elektro og datateknologi listed) |

**Not eligible:** other schools, kommune, utdanning.no, Nordkapp LOSA_CONTEXT-only rows, duplicate second programme CONFIRMED.

---

## Owner decisions

| # | Decision | Answer |
|---|----------|--------|
| 1 | Promote only from `session_2_snippets` with `SNIPPET_CAPTURED` | **Yes** |
| 2 | Max **1** new row; preserve existing **2** Udir CONFIRMED | **Yes** |
| 3 | Owner-held `confirmed-claims-2026-06-03.json` only — not git | **Yes** |
| 4 | Charter + QA before write | **Yes** |

---

## Final boundary

Bounded **Tier 2 programme** CONFIRMED for Alta reference school only — not Finnmark operational closure.
