# Phase 2 Staging RLS Execution Decision Record

## 2. Snapshot / status

- **Status:** Staging RLS execution decision record
- **Scope:** Decision before preparing any future staging SQL execution prompt
- **Repository checkpoint:** `7c6fa57 Add Phase 2 staging RLS apply plan`
- **Created at (UTC):** 2026-05-13
- **Not SQL execution**
- **Not RLS enablement**
- **Not policy creation in DB**
- **Not migration creation**
- **Not DB write approval**
- **Not runtime/write approval**
- **Not admin dashboard integration approval**
- **Not app integration approval**
- **Not PSA approval**
- **Not Route approval**
- **Not Phase 3 approval**
- **Not production apply approval**
- **No partial integration approval**
- **Child-information protection principle applies**

## 3. Source basis

The following repository documents were read as the basis for this decision record:

- `docs/architecture/phase-2-staging-rls-apply-plan.md`
- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md`
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md`
- `docs/architecture/phase-2-rls-policy-sql-draft.md`
- `docs/architecture/phase-2-rls-policy-design-plan.md`
- `docs/architecture/phase-2-rls-security-owner-decision-record.md`
- `docs/architecture/phase-2-rls-security-review-plan.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

## 4. Owner execution decisions

| Topic | Owner decision | Evidence / source | Meaning | Still not approved |
| --- | --- | --- | --- | --- |
| exact staging target | Staging execution target is the owner-used Supabase project for the next planning step; **exact project identifier / project ref / dashboard URL is kept outside the repository** in owner/security notes. Do not write the sensitive project identifier into this document. | Owner Gate 32 message | Target is defined operationally without persisting sensitive identifiers in-repo. | SQL execution, RLS apply, production apply |
| owner-used Supabase project vs staging target | Owner-used project **is confirmed** as the staging execution target for the next planning step (sensitive identifiers out-of-repo). | Owner Gate 32 message | Same project is intentionally staging for this track; not inferred silently. | Production apply, any non-staging target |
| SQL option selected | **Option B** selected for the future execution prompt: RLS enabled plus explicit deny policies for `anon` / `authenticated`. Option A is **not** selected for the first staging execution prompt. | Owner Gate 32 message | First prompt plans explicit client-role denies for auditability. | SQL execution, policy creation in DB |
| FORCE RLS decision | **FORCE RLS is not included** in the first staging execution prompt; remains commented / review-only. Separate security review with role/table-owner reasoning required before any later use. | Owner Gate 32 message | Defer FORCE until owner/bypass posture is understood. | FORCE application, SQL execution |
| apply executor | **Owner-approved manual SQL execution path** only; **no scripts**; **no default `.env` assumptions**; **no direct execution from** `docs/architecture` markdown. Executor identity must be explicit in the future execution gate. | Owner Gate 32 message | Human-controlled, non-automated, non-doc-copied execution path. | Any execution until separate gate |
| no default `.env` assumptions | Executor must not rely on default environment assumptions for target or credentials. | Owner Gate 32 message | Prevents accidental wrong-project execution. | Execution, integration |
| rollback requirements | Rollback is **mandatory before** the future execution prompt. Rollback must include policy drop strategy, RLS disable strategy, executor identity, trigger criteria, and post-rollback verification. **No concrete rollback SQL in this record.** | Owner Gate 32 message | Reversibility is a prerequisite to drafting the execution prompt. | Actual rollback SQL execution |
| negative tests | **Mandatory**; **reproducible by role/key/client**. Required future tests: anon denied; authenticated denied; frontend direct DB denied; Route raw table access denied; PSA raw table access denied; write attempts denied unless explicitly approved; diagnostics output does not become publication truth; no raw evidence leaks to runtime/PSA/Route. **Not executed by this record.** | Owner Gate 32 message | Post-apply verification plan is defined; execution is out of scope here. | Running those tests (future gate) |
| diagnostics/helper compatibility | Compatibility **must be checked after apply**. Diagnostics remains read-only and non-publication. **No bypass** for diagnostics is approved here; any bypass needs separate owner/security approval. | Owner Gate 32 message | Post-apply validation without weakening RLS via diagnostics shortcuts. | Diagnostics bypass, publication truth |
| production separation | Production apply is **not** approved; requires a **separate future gate**. Staging success does not prove production readiness. | Owner Gate 32 message | Staging decisions do not carry to prod. | Production apply |
| no app/admin/runtime/PSA/Route integration | No app, admin dashboard, runtime/write, PSA, Route, Phase 3, production apply, or partial integration is authorized here. | Owner Gate 32 message | This gate is infra/decision only; no product wiring. | All listed integrations |
| child-information protection | Child-information protection, privacy, truthful presentation, and data minimization **override speed**; principle acts as a **veto** over shortcuts. | Owner Gate 32 message | Non-negotiable bar for any future execution or integration. | Any shortcut conflicting with this principle |

## 5. Execution-prompt readiness outcome

**READY_TO_PREPARE_STAGING_SQL_EXECUTION_PROMPT_ONLY**

This means only that a **future staging SQL execution prompt may be drafted**. It does **not** execute SQL. It does **not** approve SQL execution. It does **not** apply RLS. It does **not** create policies in DB. It does **not** approve production apply. It does **not** approve runtime/write, app, admin dashboard, PSA, Route, or Phase 3.

## 6. Future staging SQL execution prompt requirements

The future execution prompt must include:

- Exact target project / DB identity; **kept outside repo if sensitive** (per owner/security notes).
- Exact SQL source / **Option B** (RLS enabled plus explicit deny policies for `anon` / `authenticated`).
- Explicit statement that execution is **staging only**.
- **Executor identity** (explicit in that gate).
- **No default `.env` assumption** for target or credentials.
- **No script execution** for apply.
- Pre-apply **read-only** snapshot.
- SQL to execute must be provided **in the execution gate or a separate execution artifact**, not copied from docs markdown by assumption.
- **Rollback** instructions (concrete SQL allowed only in that execution gate / artifact, not here).
- Post-apply **verification**.
- **Negative tests** (reproducible by role/key/client).
- **Diagnostics/helper compatibility** check after apply.
- **No** app/admin/runtime/PSA/Route integration as part of that apply.
- **No** production apply.

## 7. What remains blocked

- Current SQL execution
- RLS enablement
- Policy creation in DB
- DB writes
- Runtime/write integration
- Admin dashboard integration
- App integration
- Pipeline/readiness integration
- PSA publication/materialization
- Route Engine consumption
- Phase 3
- Production apply
- Partial integration

## 8. Final boundary statement

Phase 2 staging RLS execution may be decision-recorded here for future prompt preparation only, but SQL execution, RLS enablement, policy creation, DB writes, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, production apply, and any partial app integration remain blocked until a separate owner-approved execution gate.
