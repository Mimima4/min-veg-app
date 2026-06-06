# Phase 4 LOSA PSA Write — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Gate** | `phase-4-losa-psa-write-execution-gate-owner-decision-record.md` (**P4-LOSA-PSA-WRITE**) |
| **Permission** | Bounded **LOSA PSA insert** — **not** Contour B ordinary ingest, **not** #3 Route/UI |

**Forbidden:** `programme_in_school` scope for LOSA rows; `pickInstitutionsForPsaEmission`; bulk 18-row write; Route changes; Phase 2 DML; secrets in git.

---

## 1. Approval (owner-held)

| Field | Fill before session |
|-------|---------------------|
| Charter ID | e.g. `MAIN-LOSA-PSA-WRITE-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| **TECH_EXECUTOR** | yes / no |
| Schema migration applied on target DB | yes / no |
| `P4-LOSA-PSA` gate cited | yes / no |

---

## 2. Scope (parameters — not hardcoded region)

| Field | Value |
|-------|--------|
| County code | e.g. `56` (reference) |
| Profession slug | e.g. `electrician` |
| Max rows this session | **1** (default pilot) |
| Vilbli school code(s) | owner-listed |
| Delivery municipality | must match manifest + §4 closure |

**Alta pilot reference (2026-05-29):** delivery **Alta**; `ROW_SECTION_4_SATISFIED`; `institution_id` = NSR resolve at session (not in git).

---

## 3. Pre-session dry-run

```bash
npm run losa:preview-psa-write -- --profession <slug> --expect-write-count <n>
```

| Check | Pass |
|-------|------|
| Write candidate count matches charter | |
| All candidates `losa_fjern_delivery_municipality` | |
| No ordinary-scope collision | |

---

## 4. Success criteria

| Criterion | Pass |
|-----------|------|
| Insert count ≤ chartered max | |
| `verification_status` = `needs_review` unless charter says otherwise | |
| No Contour A/B ordinary rows touched | |
| Post-write dry-run preview unchanged for non-chartered rows | |

---

## Final statement

One bounded LOSA PSA pilot only — not Finnmark bulk closure, not Route activation.
