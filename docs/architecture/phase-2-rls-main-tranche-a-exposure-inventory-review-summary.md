# Phase 2 RLS MAIN Tranche A Exposure Inventory Review Safe Summary

| Field | Value |
|-------|--------|
| **Status** | Safe summary of completed MAIN Tranche A read-only exposure inventory and owner review — **NOT_READY_FOR_APPLY** unchanged / **EXECUTION_FORBIDDEN** unchanged / **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged |
| **Suggested status code** | `RLS_MAIN_TRANCHE_A_EXPOSURE_INVENTORY_REVIEWED_WITH_FINDINGS_SAFE_SUMMARY` |
| **Date** | 2026-05-19 |
| **Basis checkpoint** | `792da48` (Phase 2 RLS MAIN Tranche A read-only exposure inventory gate) |
| **Scope** | Safe summary only; detailed findings **owner-held** |
| **Tranche** | `PRE_DENY_EXPOSURE_INVENTORY` (**Tranche A only**) |

This record safely summarizes the completed bounded read-only **MAIN-OWNER-USED** / **PROD** Tranche A exposure inventory session and **OWNER** / **SECURITY_APPROVER** review. It does **not** include raw rows, secrets, project identifiers, service keys, connection strings, full grants, bypass dumps, SQL output, screenshots, or real person identities. It does **not** approve Tranche B, write-denial tests, **Q4-blocking pass**, **N12 packet pass**, apply, packet, runtime/write, PSA, Route, Phase 3, or Phase 4.

**Role labels in this record:** **TECH_EXECUTOR**, **OWNER**, **SECURITY_APPROVER** (real names/emails **owner-held**). **Target label:** **MAIN-OWNER-USED** / **PROD** only. **Charter:** **owner-held** outside git — not stored in this record.

---

## This document is not

- not SQL
- not Supabase connect
- not a raw test log
- not raw evidence storage
- not a charter
- not Tranche B approval
- not write-denial test approval
- not DML approval
- not test row approval
- not Q4-blocking pass
- not N12 packet pass
- not execution packet approval
- not apply approval
- not RLS policy apply
- not FORCE enablement
- not runtime/write approval
- not Phase 2 row writes
- not PSA
- not Route
- not operator/admin workflow
- not helper/pipeline integration
- not Phase 3
- not Phase 4
- not cleanup/migration/new project approval

---

## MAIN-OWNER-USED / PROD Tranche A exposure inventory review summary

| Field | Value |
|-------|--------|
| Session result | COMPLETED_WITH_EXPOSURE_FINDINGS |
| Owner review | PASS_WITH_EXPOSURE_FINDINGS |
| Target | MAIN-OWNER-USED / PROD |
| Tranche | A — `PRE_DENY_EXPOSURE_INVENTORY` |
| Read-only only | yes |
| Write attempts | no |
| DML / test rows | no |
| Tables checked | 7/7 |
| Aggregate row counts | all 0 |
| RLS state | RLS off on all 7 |
| FORCE RLS state | FORCE off on all 7 |
| Policy counts | 0 policies on all 7 |
| anon/authenticated grants | present on all 7 |
| Exposure findings | yes — all 7 tables |
| Route wiring status | not checked |
| PSA wiring status | not checked |
| Raw rows exposed | no |
| Sensitive output risk | none from CSV |
| Full findings | **owner-held** |
| Review status | **OWNER** / **SECURITY_APPROVER** reviewed |
| Q4 pass claimed | no |
| N12 packet pass claimed | no |
| NOT_READY_FOR_APPLY | unchanged |
| EXECUTION_FORBIDDEN | unchanged |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged |

---

## Per-table safe summary (seven Phase 2 tables)

| Table | Row count | RLS | FORCE RLS | Policy count | anon/authenticated grants | Tranche A exposure result |
|-------|-----------|-----|-----------|--------------|---------------------------|---------------------------|
| source_school_observations | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| school_identity_candidates | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| identity_aliases | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| school_locations | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| school_identity_resolution_decisions | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| programme_availability_publication_decisions | 0 | off | off | 0 | present | EXPOSURE_FINDING |
| school_identity_review_events | 0 | off | off | 0 | present | EXPOSURE_FINDING |

**Prohibited in git (this record complies):** raw rows; owner names; table-owner values; grant matrices; bypass role details; URLs; keys; SQL output; screenshots; project_ref; connection strings; JWT dumps.

---

## Interpretation

| Statement | Meaning |
|-----------|---------|
| Tranche A confirms current **exposure posture**, not protection | Documents pre-deny structural risk |
| Immediate data exposure limited by **0 rows** | No row-level child/school data returned in session |
| Structural risk remains | RLS off, FORCE off, 0 policies, anon/authenticated grants present on all 7 |
| Strengthens block | Phase 2 writes, runtime/write, PSA, Route, packet, Gate 34B, and apply remain blocked |
| **Not** Q4-blocking pass | Q4 pass claimed: **no** |
| **Not** N12 packet pass | N12 packet pass claimed: **no** |
| **Not** deny posture | RLS policies not applied |
| **Not** proof RLS is secure | Exposure findings ≠ production-safe |
| **Not** Tranche B | Tranche B not approved; Route/PSA wiring **not checked** (future B rows remain unclear) |

---

## Cross-check with Tier 1 snapshot and pre-RLS baseline (Q-post / R-post)

| Prior fact | Tranche A result | Consistent? |
|----------|------------------|-------------|
| Q-post: 7/7 tables; all row counts 0 | 7/7; all 0 | yes |
| Q-post: RLS off; FORCE off; 0 policies | Same on all 7 | yes |
| Q-post: anon/authenticated grants present | present on all 7 | yes |
| R-post: phase2SchemaAvailable true | Read-only inventory on live schema | yes (no contradiction) |
| Q-post security findings | Tranche A **EXPOSURE_FINDING** on all 7 strengthens same posture | yes |

---

## Closes / does not close

### Closes (operational / evidence chain — safe summary level)

| Item | Status |
|------|--------|
| MAIN Tranche A read-only exposure inventory session completed | yes |
| MAIN Tranche A **OWNER** / **SECURITY_APPROVER** review completed | yes — PASS_WITH_EXPOSURE_FINDINGS |
| Exposure findings safely summarized in repo | yes (this file) |
| Detailed findings remain **owner-held** | yes |
| Current exposure posture documented for all 7 Phase 2 tables | yes |

### Does not close

| Item | Status |
|------|--------|
| Tranche B approval | not closed |
| write-denial tests | not closed |
| Q4-blocking pass | not closed |
| N12 packet pass | not closed |
| negative-test pass (Tranche B matrix) | not closed |
| deny posture / RLS policy apply on MAIN | not closed |
| diagnostics post-RLS compatibility pass (execution) | not closed |
| Tier 2 completion (if broader fields incomplete) | not closed |
| parity evidence | not closed |
| FORCE enablement | not closed |
| execution packet | not closed |
| Gate 34B | not closed |
| staging / main / production apply | not closed |
| runtime/write | not closed |
| Phase 2 row writes | not closed |
| PSA | not closed |
| Route | not closed |
| operator/admin workflow | not closed |
| helper/pipeline integration | not closed |
| Phase 3 | not closed |
| Phase 4 | not closed |
| cleanup/migration/new project decision | not closed |

---

## Next gates (informational only)

This safe summary does **not** select the next execution gate. Candidate next gates require **separate** owner selection. Likely future discussions:

1. Deny posture / RLS apply **planning** gate (separate approval).
2. **Tranche B** only after deny posture is applied and separately approved.
3. Tier 2 completion/defer if needed.
4. Post-RLS diagnostics compatibility pass after any RLS change on MAIN.
5. Execution packet only after Q4/N12 prerequisites are met through **separate** gates.

Do **not** infer SQL, Supabase connect, apply, packet, Tranche B, or write-denial tests from this file.

---

## Related records

- `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` — NT0–NT21 (Section S)
- `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md` — Q-post
- `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — R-post
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — N plan (N6 deferred for Tranche A)
- `docs/architecture/phase-2-closure-criteria-checklist.md` — Section S + S-post

---

## Final boundary statement

- **NOT_READY_FOR_APPLY** unchanged.
- **EXECUTION_FORBIDDEN** unchanged for apply / SQL / packet / Tranche B / write-denial tests / writes / STAGING.
- **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged.
- Tranche A completed **≠** Q4 pass.
- Exposure findings **≠** deny posture applied.
- Q4 pass claimed: **no**.
- N12 packet pass claimed: **no**.
- Tranche B, write attempts, DML/test rows, packet, apply, runtime/write, PSA/Route, Phase 3/4 remain **blocked**.
- Security findings **strengthen** the block; they do **not** weaken it.
