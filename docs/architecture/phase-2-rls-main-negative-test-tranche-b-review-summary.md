# Phase 2 RLS MAIN Tranche B Negative-Test Review Safe Summary

| Field | Value |
|-------|--------|
| **Status** | Safe summary of completed MAIN Tranche B bounded negative-test session — client-role denial checks **PASS** / Route-PSA unchecked / Q4 owner review pending / **NOT_READY_FOR_APPLY** unchanged |
| **Suggested status code** | `RLS_MAIN_TRANCHE_B_NEGATIVE_TEST_REVIEWED_WITH_ROUTE_PSA_LIMITATION_SAFE_SUMMARY` |
| **Date** | 2026-05-26 |
| **Basis checkpoint** | `abe65d5` (Phase 2 RLS MAIN Tranche B review safe summary template) |
| **Scope** | Safe summary only; full logs, SQL output, raw errors, owner-held charter, and raw session artifacts remain **owner-held** |
| **Gate** | TB0–TB21 per `phase-2-rls-main-negative-test-tranche-b-execution-gate-owner-decision-record.md` (Section **W**) |
| **Tranche** | `Q4_BLOCKING_DENY_PASS` (**Tranche B only**) |

This record safely summarizes the completed bounded **MAIN-OWNER-USED** / **PROD** Tranche B negative-test session and owner/security **review preparation**. It records client-role read/write denial outcomes and final no-persistent-row check. It does **not** include raw SQL output, raw logs, raw rows, screenshots, project identifiers, URLs, service keys, connection strings, or real person identities. It does **not** approve packet, runtime/write, PSA, Route, Phase 3, or Phase 4. It does **not** claim **N12** packet pass. It does **not** automatically claim **Q4** pass because Route and PSA remain **UNCLEAR** / **not tested**.

**Role labels in this record:** **TECH_EXECUTOR**, **OWNER**, **SECURITY_APPROVER**, **ROLLBACK_OWNER** (real names/emails **owner-held**). **Charter:** **owner-held** — ID and text **not** in git.

---

## This document is not

- not raw SQL output storage
- not raw test log storage
- not Tranche B charter storage
- not **Q4** automatic pass
- not **N12** packet pass
- not execution packet approval
- not runtime/write approval
- not Phase 2 row writes approval
- not PSA approval
- not Route approval
- not operator/admin workflow approval
- not helper/pipeline integration approval (beyond tested client-role scope)
- not Phase 3 approval
- not Phase 4 approval
- not cleanup/migration/new project approval
- not **NOT_READY_FOR_APPLY** clearance

---

## MAIN-OWNER-USED / PROD Tranche B negative-test review summary

| Field | Value |
|-------|--------|
| Session result | **COMPLETED** |
| Owner review (Q4) | **READY_FOR_OWNER_SECURITY_REVIEW_WITH_ROUTE_PSA_LIMITATION** — **not** Q4 pass reviewed in this file |
| Target | MAIN-OWNER-USED / PROD |
| Tranche | B — `Q4_BLOCKING_DENY_PASS` |
| Session type | Bounded Tranche B negative-test session |
| R3G read-denial result | **PASS** (no rows returned) |
| R4G write-denial result | **PASS** (no rows returned) |
| anon read | **PASS** |
| authenticated read | **PASS** |
| anon write | **PASS** |
| authenticated write | **PASS** |
| Persistent test rows | **no** |
| Successful DML | **no** |
| Final row counts | **0** on all **7** Phase 2 tables |
| Raw data exposure | **no** observed |
| service / high-privilege | **excluded** from product proof (N8) |
| Route | **UNCLEAR** / **not tested** |
| PSA | **UNCLEAR** / **not tested** |
| Q4 status | **READY_FOR_OWNER_SECURITY_REVIEW_WITH_ROUTE_PSA_LIMITATION** |
| Q4 pass claimed | **no** |
| N12 packet pass claimed | **no** |
| Packet approved | **no** |
| Runtime/write approved | **no** |
| Rollback invoked | **no** |
| NOT_READY_FOR_APPLY | **unchanged** |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | **unchanged** |

---

## N6 outcome matrix (session safe labels)

Bounded-session labels below. **Partial pass forbidden** for any future **Q4** claim. Route/PSA **UNCLEAR** blocks automatic **Q4** closure (N11).

| N6 outcome (session label) | Safe label | Notes in git |
|----------------------------|------------|--------------|
| anon read denial | **PASS** | R3G read-denial; no rows returned |
| authenticated read denial | **PASS** | R3G read-denial; no rows returned |
| anon write denial | **PASS** | R4G write-denial; attempts expecting denial only |
| authenticated write denial | **PASS** | R4G write-denial; attempts expecting denial only |
| no persistent test rows | **PASS** | final row counts **0** on all **7** tables |
| raw data exposure | **PASS** / none observed | |
| Route path | **UNCLEAR** / **not tested** | not pass by omission |
| PSA path | **UNCLEAR** / **not tested** | not pass by omission |

**Aggregate session verdict:** `CLIENT_ROLE_READ_WRITE_DENIAL_PASS_ROUTE_PSA_UNCLEAR`

### N6 plan alignment (N plan row labels)

| N6 outcome (plan) | Safe label | Notes in git |
|-------------------|------------|--------------|
| Visitors / anonymous denied | **PASS** | via anon read denial |
| Ordinary logged-in denied | **PASS** | via authenticated read denial |
| App/browser direct DB shortcut denied | **NOT_TESTED** | not in bounded session scope |
| Route raw Phase 2 access denied | **UNCLEAR** / **not tested** | |
| PSA/publication raw access denied | **UNCLEAR** / **not tested** | |
| Writes denied (attempts only) | **PASS** | anon + authenticated write denial |
| Diagnostics ≠ published truth | **NOT_TESTED** | not in bounded session scope |
| Diagnostics ≠ go-live gate | **NOT_TESTED** | not in bounded session scope |

**High-privilege paths (N8):** **owner-held** only if documented. service_role / SQL editor / BYPASSRLS are **not** product proof.

---

## Per-table row persistence (final check)

| Table | Final row count | Persistent test row |
|-------|-----------------|---------------------|
| source_school_observations | **0** | **no** |
| school_identity_candidates | **0** | **no** |
| identity_aliases | **0** | **no** |
| school_locations | **0** | **no** |
| school_identity_resolution_decisions | **0** | **no** |
| programme_availability_publication_decisions | **0** | **no** |
| school_identity_review_events | **0** | **no** |

---

## Cross-check with U-post / V-post

| Prior fact | Tranche B observation | Consistent? |
|----------|----------------------|-------------|
| U-post: RLS on all 7; FORCE off; 14 policies; rows 0 | final counts **0**; no persistent rows | **yes** |
| V-post: RLS-path PASS; counters all 0 | client-role denial checks; no row exposure observed | **yes** |
| No persistent test rows | **no** persistent test rows | **yes** |

---

## Interpretation

- Client-role read denial and bounded write-denial checks **passed** for **anon** and **authenticated** on the **7** Phase 2 tables (R3G/R4G safe interpretation).
- **No** persistent rows were created; final row counts remain **0** on all **7** tables.
- This **strengthens** RLS deny-posture evidence for tested client roles; it does **not** prove Route or PSA paths.
- Route and PSA were **not tested** and remain **UNCLEAR** (N11 — not pass by omission).
- Because Route/PSA remain **UNCLEAR**, this **W-post** does **not** by itself close **Q4**.
- **Q4** is **ready** for **OWNER** / **SECURITY_APPROVER** review with explicit Route/PSA limitation — a **separate** Q4-reviewed decision is required to claim **Q4** pass.
- **N12** packet pass is **not** claimed.
- Execution packet remains **forbidden**.
- Runtime/write remains **blocked**.
- **NOT_READY_FOR_APPLY** remains **unchanged** unless a **later separate** owner decision says otherwise.

---

## Closes / does not close

### Closes (safe summary / session evidence level)

| Item | Status |
|------|--------|
| MAIN Tranche B bounded session **completed** | **yes** |
| Client-role read denial checked (anon / authenticated) | **yes** — **PASS** |
| Client-role write-denial checked (anon / authenticated) | **yes** — **PASS** |
| Final no-persistent-rows check **completed** | **yes** |
| No raw data exposure observed | **yes** |
| **W-post** safe summary recorded | **yes** |
| Detailed evidence remains **owner-held** | **yes** |

### Does not close

| Item | Status |
|------|--------|
| Automatic **Q4** pass | **not** closed |
| **Q4** owner/security **review decision** | **not** closed |
| Route/PSA resolution or owner exception for **UNCLEAR** | **not** closed |
| **N12** packet pass | **not** closed |
| Execution packet | **not** closed |
| Runtime/write | **not** closed |
| Phase 2 row writes | **not** closed |
| PSA activation / approval | **not** closed |
| Route activation / approval | **not** closed |
| Operator/admin workflow | **not** closed |
| Helper/pipeline integration (beyond tested scope) | **not** closed |
| Phase 3 | **not** closed |
| Phase 4 | **not** closed |
| Cleanup/migration/new project decision | **not** closed |
| **NOT_READY_FOR_APPLY** clearance | **not** closed |
| RLS **production-safe** globally | **not** closed |

---

## Next gates (informational only)

This safe summary does **not** select or approve an execution gate.

1. **Q4 owner/security review** — next step is **OWNER** / **SECURITY_APPROVER** **Q4** decision, **not** packet. Review must explicitly decide how to handle Route/PSA **UNCLEAR**.
2. If owner/security accept **Q4** with Route/PSA limitation, record that in a **separate Q4-reviewed decision** — **not** implied by this file alone.
3. If Route/PSA must be tested first, require a **separate** gate before **Q4** pass claim.
4. **N12** / execution packet — **separate** gates; **Q4** pass alone does **not** draft packet.
5. **Runtime/write**, PSA, Route, Phase 3/4 — remain **blocked**.

---

## Related records

- `phase-2-rls-main-negative-test-tranche-b-execution-gate-owner-decision-record.md` — TB0–TB21 (Section **W**)
- `phase-2-rls-main-negative-test-tranche-b-charter-template.md` — charter (**owner-held** when filled)
- `phase-2-rls-main-negative-test-tranche-b-review-summary-template.md` — template source
- `phase-2-rls-main-deny-posture-apply-review-summary.md` — **U-post**
- `phase-2-rls-main-diagnostics-post-rls-compatibility-review-summary.md` — **V-post**
- `phase-2-rls-negative-test-plan-owner-decision-record.md` — N6, N8, N11
- `phase-2-closure-criteria-checklist.md` — Section **W** + **W-post**

---

## Final boundary statement

- Client-role read/write denial **PASS** in this **W-post** does **not** equal automatic **Q4** pass.
- **W-post** does **not** equal **N12** pass.
- **W-post** does **not** approve packet, runtime/write, PSA, or Route.
- Route and PSA remain **UNCLEAR** unless **separately** tested or accepted by owner/security exception.
- **NOT_READY_FOR_APPLY** — **unchanged**.
- **EXECUTION_PACKET_DRAFT_FORBIDDEN** — **unchanged**.
- service_role / admin paths **≠** family-facing safety proof (N8).
