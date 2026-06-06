# Phase 4 LOSA — Alta Publication Decision Gate (Sub-gate 6)

| Field | Value |
|--------|--------|
| **Status** | Owner **publication decision** adopted for Alta LOSA pilot row |
| **Section** | **P4-LOSA-ALTA-PUBLICATION-DECISION** |
| **Closure label** | `PHASE_4_LOSA_ALTA_PUBLICATION_DECISION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Alta **evidence §4 satisfied** (`P4-LOSA-ALTA-SUPPORTING-EVIDENCE-post`) |

**Does NOT:** authorize PSA **execution** session, Route **#3**, or clear `NOT_READY_FOR_APPLY`.

---

## Decision object (binding)

| Field | Value |
|--------|--------|
| Delivery site | **Alta** (`delivery_site_alta`) |
| County (ref) | `56` |
| Evidence posture | `ROW_SECTION_4_SATISFIED` |
| Max PSA rows this decision | **1** |
| Owner-held charter | `MAIN-LOSA-PUBLICATION-DECISION-ALTA-2026-05-29-01` |
| Repo index | `scripts/lib/losa-finnmark-publication-decision.mjs` |

**Provider `institution_id`:** resolved at **write session** NSR lookup — not stored in git.

---

## Owner decisions (P4LAPD0–P4LAPD8)

| # | Decision | Answer |
|---|----------|--------|
| P4LAPD0 | Record decision only after Alta evidence §4 satisfied? | **Yes** |
| P4LAPD1 | Max **1** row per this decision (Alta only)? | **Yes** |
| P4LAPD2 | Enables `emissionAllowed` in publication plan — not DB insert | **Yes** |
| P4LAPD3 | **No** PSA execution without separate write charter | **Yes** |
| P4LAPD4 | **No** Route **#3** | **Yes** |
| P4LAPD5 | `provider_institution_id` resolve at write session only | **Yes** |
| P4LAPD6 | CLI: `losa:finnmark-publication-plan` → **1** emission allowed | **Yes** |
| P4LAPD7 | CLI: `losa:preview-psa-write --expect-write-count 1` → **1** candidate | **Yes** |
| P4LAPD8 | Next: owner-held **P4-LOSA-PSA-WRITE** charter → bounded insert | **Yes** |

---

## Final boundary

Publication **decision** recorded; **execution** remains charter-gated. Nationwide pattern — reference county `56` only.
