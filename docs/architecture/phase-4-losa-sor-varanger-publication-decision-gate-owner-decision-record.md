# Phase 4 LOSA — Sør-Varanger Publication Decision Gate (Sub-gate 4)

| Field | Value |
|--------|--------|
| **Status** | Owner **publication decision** adopted for Sør-Varanger row **3** |
| **Section** | **P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION** |
| **Closure label** | `PHASE_4_LOSA_SOR_VARANGER_PUBLICATION_DECISION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Sør-Varanger **evidence §4 satisfied** (`P4-LOSA-SOR-VARANGER-SUPPORTING-EVIDENCE-post`) |

**Does NOT:** authorize PSA **execution** session or clear `NOT_READY_FOR_APPLY`.

---

## Decision object (binding)

| Field | Value |
|--------|--------|
| Delivery site | **Sør-Varanger** (`delivery_site_sor_varanger`) |
| County (ref) | `56` |
| Vilbli school code | `6108481` |
| `municipality_code` | `5636` |
| Evidence posture | `ROW_SECTION_4_SATISFIED` |
| Max PSA rows this decision | **1** |
| Owner-held charter | `MAIN-LOSA-PUBLICATION-DECISION-SOR-VARANGER-2026-05-29-01` |
| Repo index | `scripts/lib/losa-finnmark-publication-decision.mjs` |

---

## Owner decisions (P4LSVPD0–P4LSVPD7)

| # | Decision | Answer |
|---|----------|--------|
| P4LSVPD0 | Record decision only after Sør-Varanger evidence §4 satisfied? | **Yes** |
| P4LSVPD1 | Max **1** PSA row per this decision | **Yes** |
| P4LSVPD2 | Enables `emissionAllowed` — not DB insert | **Yes** |
| P4LSVPD3 | **No** PSA execution without separate write charter | **Yes** |
| P4LSVPD4 | CLI: `losa:finnmark-publication-plan` → **3** emission allowed | **Yes** |
| P4LSVPD5 | CLI: `losa:preview-psa-write` → **3** candidates | **Yes** |
| P4LSVPD6 | Alta + Hammerfest PSA rows in DB unchanged | **Yes** |
| P4LSVPD7 | Next: **P4-LOSA-PSA-WRITE** charter → Sør-Varanger bounded insert | **Yes** |

---

## Final statement

Sør-Varanger publication **decision** recorded; **execution** remains charter-gated.
