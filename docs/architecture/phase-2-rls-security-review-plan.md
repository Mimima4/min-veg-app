# Phase 2 RLS/Security Review Plan

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Documentation-only security planning |
| **Scope** | Phase 2 RLS/security review before any future write/runtime use |
| **Repository checkpoint** | `95f96ea Refresh Phase 2 closure checklist references` |
| **Created at (UTC)** | 2026-05-13 |
| **Gate 22-C facts** | Staging-only observations; not generalized to production |
| **Not production verification** | Yes — this plan does not verify production |
| **Not RLS approval** | Yes |
| **Not policy approval** | Yes |
| **Not DB write approval** | Yes |
| **Not runtime/write approval** | Yes |
| **Not PSA approval** | Yes |
| **Not Route approval** | Yes |
| **Not Phase 3 approval** | Yes |
| **Does not modify migrations** | Yes |
| **Does not create policies** | Yes |
| **Does not enable RLS** | Yes |

---

## 3. Gate 22-C facts

Facts below were **observed on staging only**. They do **not** authorize any environment, do **not** close security review, and do **not** imply production state.

| Fact | Observed value | Environment | What it proves | What it does NOT prove |
|------|----------------|---------------|----------------|-------------------------|
| Migration applied | `20260506112154` — `school_identity_location_resolution_phase2` recorded as applied | Staging | Staging schema includes the Phase 2 migration outcome | Production migration state; security review completion; RLS readiness |
| Phase 2 tables exist | All **7** expected tables present | Staging | Object definitions exist on staging for review | Safe to write; policies exist; production parity |
| Row counts | **0** rows in each of the 7 tables | Staging | Staging is empty for these objects at observation time | Security complete; no sensitive data risk; “safe” for anon/authenticated access |
| RLS | `rls_enabled = false`, `rls_forced = false` on all 7 tables | Staging | RLS was not enabled on these tables at observation time | Acceptable for runtime; intentional final posture; approval to defer RLS |
| Security review | Migration file warns RLS/security are not final | Repo + staging context | Review is **still required** before treating tables as ready for write/runtime use | That any environment has completed owner/security sign-off |

---

## 4. Repo-derived Phase 2 table inventory

Table names are derived from `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`. This section classifies **risk and intent for planning** only — **not** access policies.

### source_school_observations

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Immutable source evidence per snapshot / profession / stage / school (no publishability fields in-table). |
| **Why sensitive / internal** | Raw ingestion-aligned evidence; integrity and provenance matter; misuse could bias identity or publication narratives. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled (`rls_enabled = false`, `rls_forced = false`) |
| **Security review status** | **Open** — migration warns security/RLS not final; staging RLS off does not satisfy review |

### school_identity_candidates

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Generated evidence / candidate layer; not authoritative decision. |
| **Why sensitive / internal** | Competitive or ambiguous matching signals; premature exposure could mislead operators or downstream consumers. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

### identity_aliases

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Alias evidence only; no publishability semantics in-table. |
| **Why sensitive / internal** | Identity linking data; errors or leaks affect resolution fairness and privacy posture. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

### school_locations

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Identity / location evidence layer. |
| **Why sensitive / internal** | Location and identity correlation; not a substitute for approved publication paths. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

### school_identity_resolution_decisions

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Append-only resolution decisions with supersession; audit fields emphasized in migration comments. |
| **Why sensitive / internal** | Authoritative internal decisions; tampering or broad read/write undermines trust contour. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

### programme_availability_publication_decisions

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Publication gate decisions; migration states no PSA write triggers or runtime automation in this layer. |
| **Why sensitive / internal** | Directly adjacent to what may become publication truth; accidental mutation or leak is high impact. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

### school_identity_review_events

| Attribute | Planning note |
|-----------|----------------|
| **Likely data category** | Append-only review / audit event log. |
| **Why sensitive / internal** | Operator workflow and audit trail; must not replace authoritative decision rows but still requires strict access control when populated. |
| **Current staging row count** | 0 (Gate 22-C) |
| **RLS staging state** | RLS disabled |
| **Security review status** | **Open** |

---

## 5. Scope: IN / OUT

### IN

- Security review planning  
- Access-risk classification  
- Read/write actor **questions** (open)  
- RLS/policy design **questions** (open)  
- Blocked access paths (conceptual)  
- Owner/security decisions required (listed as decisions **not** made here)

### OUT

- SQL policy implementation  
- RLS enablement  
- Migration edits  
- DB writes  
- App/runtime integration  
- Pipeline/readiness integration  
- PSA materialization/publication  
- Route Engine consumption  
- Phase 3 implementation  

---

## 6. Access principles

Principles below frame **review expectations**, not approved policy.

- Phase 2 tables are **internal truth-contour** tables for ambiguous/problematic cases; they are not the main happy-path publication engine by themselves.  
- **No** anonymous direct access to these tables should be **assumed** safe or intended.  
- **No** authenticated end-user direct access should be **assumed** safe or intended.  
- **Service-role** usage is **not** approved, allocated, or restricted by this document — only flagged for **explicit** owner/security decision later.  
- Any future access must be **least-privilege** and **explicitly** owner/security approved per environment.  
- **Read** access and **write** access must be reviewed **separately** (different blast radius and audit needs).  
- Evidence, review, decision, and publication data must **not** leak to family-facing runtime unless exposed through **separately approved** publication truth paths.  

---

## 7. Read actor questions

*Open questions only — not decisions.*

- Which internal services, if any, may read Phase 2 evidence tables, and under what audit obligations?  
- Which operator/reviewer roles, if any, may read review and decision data, and through which surfaces (not direct ad-hoc SQL)?  
- Which diagnostics/reporting contexts, if any, may read aggregates or metadata without row-level exposure?  
- Should any table be restricted to **internal server/service** contexts only, with no direct client path?  
- Should any table be **hidden** from authenticated application roles entirely until a workflow exists?  
- What audit evidence (logs, approvals, change tickets) is required **before** any read access is granted in non-local environments?  

---

## 8. Write actor questions

*Open questions only — not decisions.*

- Which future process, if any, may write **source** observations, and how is idempotency/immutability enforced?  
- Which future process, if any, may write **candidates**, and how is overwrite vs append governed?  
- Which future process, if any, may write **resolution** decisions, and who may supersede?  
- Which future process, if any, may write **publication** decisions, and how is separation from PSA materialization enforced?  
- Which future process, if any, may write **review events**, and may system actors differ from operator actors?  
- What **explicit approval** (owner/security + implementation gate) is required before **any** write actor exists in staging or production?  

---

## 9. RLS / policy design questions

*Open questions only — not decisions.*

- Should RLS be enabled on **all seven** tables before any write path is allowed in any non-local environment?  
- Should policies be **deny-by-default** everywhere until each access path is explicitly modeled?  
- Should reads be **internal/service-context-only** until an operator workflow and UI/API contract exist?  
- Should writes be restricted to **internal server/service** contexts only (no client direct writes)?  
- How should **review/audit events** be protected against tampering and silent deletion?  
- How should **publication decisions** be protected from accidental mutation and from conflation with PSA pipelines?  
- How should **rollback/supersession** flows be protected so history cannot be rewritten without traceability?  

---

## 10. Forbidden shortcuts

- Tables exist → safe to write  
- Zero rows → security complete  
- RLS disabled → acceptable for runtime  
- Staging verified → production verified  
- Migration applied → RLS approved  
- Service role available → service role approved  
- Authenticated user exists → authenticated access approved  
- Policy plan exists → policy implemented  
- RLS plan exists → RLS enabled  
- Security plan exists → runtime/write approved  
- Security plan exists → PSA/Route/Phase 3 approved  

---

## 11. Owner/security decisions required

The following must be decided in **separate** owner/security forums; this document does **not** record outcomes.

- Whether RLS must be enabled **before** any Phase 2 writes in non-local environments  
- Whether **deny-by-default** is mandatory for all seven tables  
- **Approved read actors** (if any), per table class  
- **Approved write actors** (if any), per operation type  
- **Service-role policy** (permitted/denied uses; never implied by tooling availability)  
- **Anon/authenticated direct-access policy** (default deny vs limited exceptions)  
- **Audit/logging** requirements for read and write  
- **Policy test** requirements (who signs off; staging vs prod parity rules)  
- **Production/staging separation** requirements (credential isolation, data classification)  
- **Rollback/supersession** security requirements (immutability, who can supersede, retention)  

---

## 12. What remains blocked

Until separate owner-approved security and implementation gates:

- RLS enablement  
- Policy creation  
- DB writes to Phase 2 tables  
- Decision rows (as operational approval, not schema existence)  
- Publication rows (as operational approval)  
- Runtime/write integration  
- Pipeline/readiness integration  
- PSA publication/materialization  
- Route Engine consumption of Phase 2 as an approved path  
- Phase 3 implementation  

---

## 13. Final boundary statement

Phase 2 RLS/security review is planning-defined here, but RLS enablement, policy creation, DB writes, runtime/write integration, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved security and implementation gates.
