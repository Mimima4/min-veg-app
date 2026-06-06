# Phase 4 LOSA — Alta Publication Decision Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-ALTA-PUBLICATION-DECISION-post** |
| **Status code** | `LOSA_ALTA_PUBLICATION_DECISION_PASS` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PUBLICATION-DECISION-ALTA-2026-05-29-01` |
| **Gate** | `phase-4-losa-alta-publication-decision-gate-owner-decision-record.md` |

---

## Aggregates

| Field | Value |
|-------|--------|
| Publication decisions recorded | **1** (Alta) |
| Emission-allowed plans (ref county) | **1** / **18** |
| Write preview candidates | **1** (institution_id resolve at write session) |
| PSA execution authorized | **false** |
| `NOT_READY_FOR_APPLY` | unchanged |

---

## CLI proof

```bash
npm run losa:finnmark-publication-plan   # emission allowed: 1
npm run losa:preview-psa-write -- --expect-write-count 1
```

---

## Recommended next

Owner-held **P4-LOSA-PSA-WRITE** charter (`MAIN-LOSA-PSA-WRITE-2026-05-29-01`) → bounded **1** row insert session after NSR `institution_id` resolve.

---

## Final statement

Alta row is **charter-ready** for first LOSA PSA pilot insert; product apply remains owner-gated.
