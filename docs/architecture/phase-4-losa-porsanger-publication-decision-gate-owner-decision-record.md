# Phase 4 LOSA — Porsanger Publication Decision Gate (Sub-gate 4)

| Field | Value |
|--------|--------|
| **Status** | Owner **publication decision** adopted for Porsanger row **4** |
| **Section** | **P4-LOSA-PORSANGER-PUBLICATION-DECISION** |
| **Closure label** | `PHASE_4_LOSA_PORSANGER_PUBLICATION_DECISION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Porsanger **evidence §4 satisfied** (`P4-LOSA-PORSANGER-SUPPORTING-EVIDENCE-post`) |

**Does NOT:** authorize PSA **execution** session or clear `NOT_READY_FOR_APPLY`.

---

## Decision object (binding)

| Field | Value |
|--------|--------|
| Delivery site | **Porsanger** (`delivery_site_porsanger`) |
| County (ref) | `56` |
| Vilbli school code | `6108475` |
| `municipality_code` | `5630` |
| Evidence posture | `ROW_SECTION_4_SATISFIED` |
| Max PSA rows this decision | **1** |
| Owner-held charter | `MAIN-LOSA-PUBLICATION-DECISION-PORSANGER-2026-05-29-01` |
| Repo index | `scripts/lib/losa-finnmark-publication-decision.mjs` |

---

## Owner decisions (P4LPPD0–P4LPPD7)

| # | Decision | Answer |
|---|----------|--------|
| P4LPPD0 | Record decision only after Porsanger evidence §4 satisfied? | **Yes** |
| P4LPPD1 | Max **1** PSA row per this decision | **Yes** |
| P4LPPD2 | Enables `emissionAllowed` — not DB insert | **Yes** |
| P4LPPD3 | **No** PSA execution without separate write charter | **Yes** |
| P4LPPD4 | CLI: `losa:finnmark-publication-plan` → **4** emission allowed | **Yes** |
| P4LPPD5 | CLI: `losa:preview-psa-write` → **4** candidates | **Yes** |
| P4LPPD6 | Alta + Hammerfest + Sør-Varanger PSA rows in DB unchanged | **Yes** |
| P4LPPD7 | Next: **P4-LOSA-PSA-WRITE** charter → Porsanger bounded insert | **Yes** |

---

## Final statement

Porsanger publication **decision** recorded; **execution** remains charter-gated.
