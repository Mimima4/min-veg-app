# Phase 2 RLS MAIN Route/PSA Wiring Review — Safe Summary (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to git as **X-post** only after owner review |
| **Gate** | Section **X** — `phase-2-rls-main-route-psa-wiring-review-gate-owner-decision-record.md` |
| **Charter ID** | _fill_ (**owner-held** charter; ID only in git) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) |
| **Date (UTC)** | _fill_ |

**Do not** include: `project_ref`, keys, connection strings, raw rows, SQL output, full search logs, or PII.

---

## Session status

| Field | Value |
|-------|--------|
| Wiring review performed | **yes** / **no** |
| Owner review verdict | _PASS_WITH_FINDINGS_ / _STOP_UNCLEAR_ / _fill_ |
| Charter cited | _charter ID only_ |

---

## Route outcome

| Field | Value |
|-------|--------|
| Label | `ROUTE_NO_TOUCH_PHASE2_TABLES_CONFIRMED` / `ROUTE_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` / `ROUTE_WIRING_UNCLEAR_STOP` |
| Published-truth only (no raw Phase 2)? | yes / no / n/a |
| Path classes (safe) | _e.g. none / API / batch — no secrets_ |
| Negative-test gate required | yes / no |

---

## PSA outcome

| Field | Value |
|-------|--------|
| Label | `PSA_NO_TOUCH_PHASE2_TABLES_CONFIRMED` / `PSA_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` / `PSA_WIRING_UNCLEAR_STOP` |
| Published-truth only (no raw Phase 2)? | yes / no / n/a |
| Path classes (safe) | _fill_ |
| Negative-test gate required | yes / no |

---

## Per-table touch summary (safe)

| Table | Route | PSA |
|-------|-------|-----|
| source_school_observations | no / yes / unclear | no / yes / unclear |
| school_identity_candidates | | |
| identity_aliases | | |
| school_locations | | |
| school_identity_resolution_decisions | | |
| programme_availability_publication_decisions | | |
| school_identity_review_events | | |

---

## Q4 / N12 / apply posture (unchanged unless separate gate)

| Field | Value |
|-------|--------|
| W-post limitation narrowed | yes / no / partial |
| Full Q4 pass claimed | **no** (default) |
| N12 claimed | **no** |
| NOT_READY_FOR_APPLY | **unchanged** |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | **unchanged** |

---

## Next gate (informational)

| Condition | Next step |
|-----------|-----------|
| Either `*_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` | Separate Route/PSA negative-test **execution** gate |
| Both `*_NO_TOUCH_*` confirmed | Owner/security **X-post** review for partial Q4 advancement (not automatic full pass) |
| Either `*_WIRING_UNCLEAR_STOP` | **Stop** (N11) — no packet/N12/runtime |

---

## Sign-off labels (git-safe)

| Role | Verdict |
|------|---------|
| OWNER | _approved / not approved_ |
| SECURITY_APPROVER | _approved / not approved_ |
