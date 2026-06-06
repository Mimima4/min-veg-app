# Phase 4 LOSA — Hammerfest Publication Decision Gate (Sub-gate 4)

| Field | Value |
|--------|--------|
| **Status** | Owner **publication decision** adopted for Hammerfest row **2** |
| **Section** | **P4-LOSA-HAMMERFEST-PUBLICATION-DECISION** |
| **Closure label** | `PHASE_4_LOSA_HAMMERFEST_PUBLICATION_DECISION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Hammerfest **evidence §4 satisfied** (`P4-LOSA-HAMMERFEST-SUPPORTING-EVIDENCE-post`) |

**Does NOT:** authorize PSA **execution** session or clear `NOT_READY_FOR_APPLY`.

---

## Decision object (binding)

| Field | Value |
|--------|--------|
| Delivery site | **Hammerfest** (`delivery_site_hammerfest`) |
| County (ref) | `56` |
| Vilbli school code | `6108473` |
| `municipality_code` | `5603` |
| Evidence posture | `ROW_SECTION_4_SATISFIED` |
| Max PSA rows this decision | **1** |
| Owner-held charter | `MAIN-LOSA-PUBLICATION-DECISION-HAMMERFEST-2026-05-29-01` |
| Repo index | `scripts/lib/losa-finnmark-publication-decision.mjs` |

---

## Owner decisions (P4LHPD0–P4LHPD7)

| # | Decision | Answer |
|---|----------|--------|
| P4LHPD0 | Record decision only after Hammerfest evidence §4 satisfied? | **Yes** |
| P4LHPD1 | Max **1** PSA row per this decision | **Yes** |
| P4LHPD2 | Enables `emissionAllowed` — not DB insert | **Yes** |
| P4LHPD3 | **No** PSA execution without separate write charter | **Yes** |
| P4LHPD4 | CLI: `losa:finnmark-publication-plan` → **2** emission allowed | **Yes** |
| P4LHPD5 | CLI: `losa:preview-psa-write` → **2** candidates | **Yes** |
| P4LHPD6 | Alta pilot PSA row in DB unchanged | **Yes** |
| P4LHPD7 | Next: **P4-LOSA-PSA-WRITE** charter → Hammerfest bounded insert | **Yes** |

---

## Final statement

Hammerfest publication **decision** recorded; **execution** remains charter-gated.
