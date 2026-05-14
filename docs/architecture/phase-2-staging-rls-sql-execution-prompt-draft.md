# Phase 2 Staging RLS SQL Execution Prompt Draft
This document does not authorize SQL execution.

## 2. Snapshot / status

- **Status:** Execution prompt draft only
- **Scope:** Drafting a future staging SQL execution prompt
- **Repository checkpoint:** `0bd7368 Add Phase 2 staging RLS execution decision`
- **Created at (UTC):** 2026-05-13
- **Not SQL execution**
- **Not RLS enablement**
- **Not policy creation in DB**
- **Not migration creation**
- **Not DB write approval**
- **Not runtime/write approval**
- **Not admin dashboard integration authorization**
- **Not app integration authorization**
- **Not PSA authorization**
- **Not Route authorization**
- **Not Phase 3 authorization**
- **Not production apply authorization**
- **No partial integration authorization**
- **Not an execution artifact**
- **No secrets / project refs / URLs / keys included**
- **Child-information protection principle applies**

## 3. Source basis

The following repository documents inform this draft (read for context; **this file does not modify** prior gate sources):

- `docs/architecture/phase-2-staging-rls-execution-decision.md` (Gate 32)
- `docs/architecture/phase-2-staging-rls-apply-plan.md` (Gate 31)
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

## 4. Execution target handling

- Exact staging project / DB identity is **owner-held outside the repository**; this document **must not** contain project ref, dashboard URL, connection strings, or API/service keys.
- The operator must **manually verify** the target before any future execution (**no** default `.env` assumptions).
- **No** script execution for apply from this document.
- **No** production apply is authorized or described here.
- **No** execution from this document without a **separate owner-approved execution gate**.
- A **future execution gate** must verify that **all seven** named relations exist in the **target staging schema** before any execution (and that `public` is correct unless explicitly confirmed otherwise).

## 5. SQL provenance and drift control

- The **future SQL block** in §7 is **derived from** `docs/architecture/phase-2-rls-policy-sql-draft.md` **§8** (Option B candidate: `ENABLE ROW LEVEL SECURITY` plus explicit `anon` / `authenticated` deny policies with `USING (false)` / `WITH CHECK (false)`; `FORCE` lines **commented only**).
- It is **constrained by** `docs/architecture/phase-2-staging-rls-execution-decision.md` (Gate 32): **Option B only**; **no** active `FORCE ROW LEVEL SECURITY`; **no** `service_role` allow policy; **no** grants; **no** app/admin/PSA/Route/runtime policies; **no** production apply.
- It is **aligned with** `docs/architecture/phase-2-staging-rls-apply-plan.md` (seven Phase 2 tables, staging-only posture, pre-apply / rollback / verification expectations at planning level).
- **Do not** silently extend policy logic beyond those sources; any deviation requires **narrow review** and must be captured in a **future execution artifact**, not by editing this draft as a substitute for that gate.
- A **future execution gate** must **reconcile** live schema/table reality (names, `public` qualifier, Postgres version — e.g. `FOR ALL` requires **PostgreSQL 15+** per the SQL draft; split per command on older versions with DBA guidance) before execution.

## 6. Future execution prompt skeleton

A later owner-approved execution gate prompt should be structured roughly as follows:

1. **Target confirmation** — operator-verified staging identity (owner-held evidence outside repo); no `.env` autopilot.
2. **Executor identity** — named accountable party; owner-approved manual path only.
3. **Pre-apply read-only snapshot** — catalog and counts per §9.
4. **SQL source / execution artifact confirmation** — canonical text for that run is supplied or confirmed **only** in that gate’s artifact (this markdown is **not** the execution source).
5. **Rollback artifact** — concrete rollback SQL and ordering, with policies dropped **by explicit name** (not in this Gate 33 file).
6. **Post-apply verification** — per §10.
7. **Negative tests** — reproducible by role/key/client; failures block acceptance.
8. **Diagnostics/helper compatibility check** — read-only, non-publication; no bypass without separate approval.
9. **Explicit boundary** — **no** app / admin / **runtime** / PSA / Route integration as part of apply.
10. **Explicit boundary** — **no** production apply.

## 7. Future SQL block (DRAFT FOR LATER EXECUTION GATE ONLY)

NOT EXECUTED BY THIS DOCUMENT.  
DO NOT RUN FROM THIS DOCUMENT.  
DO NOT PASTE FROM THIS DOCUMENT INTO SUPABASE.  
OWNER EXECUTION GATE REQUIRED.  
STAGING ONLY.  
PRODUCTION APPLY NOT APPROVED.  
ACTUAL EXECUTION ARTIFACT MUST BE CONFIRMED IN A FUTURE GATE.

```text
-- DRAFT ONLY — derived from docs/architecture/phase-2-rls-policy-sql-draft.md §8 (Option B shape).
-- NOT FOR EXECUTION FROM THIS FILE.
-- FOR ALL requires PostgreSQL 15+; split per SELECT/INSERT/UPDATE/DELETE if target is older (see SQL draft §8).
--
-- FORCE ROW LEVEL SECURITY: excluded from first staging execution per Gate 32 — commented review questions only.

ALTER TABLE public.source_school_observations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.source_school_observations FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_source_school_observations
  ON public.source_school_observations
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_source_school_observations
  ON public.source_school_observations
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_candidates FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_school_identity_candidates
  ON public.school_identity_candidates
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_school_identity_candidates
  ON public.school_identity_candidates
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.identity_aliases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.identity_aliases FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_identity_aliases
  ON public.identity_aliases
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_identity_aliases
  ON public.identity_aliases
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_locations FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_school_locations
  ON public.school_locations
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_school_locations
  ON public.school_locations
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_resolution_decisions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_resolution_decisions FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_school_identity_resolution_decisions
  ON public.school_identity_resolution_decisions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_school_identity_resolution_decisions
  ON public.school_identity_resolution_decisions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.programme_availability_publication_decisions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.programme_availability_publication_decisions FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_programme_availability_publication_decisions
  ON public.programme_availability_publication_decisions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_programme_availability_publication_decisions
  ON public.programme_availability_publication_decisions
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_review_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_review_events FORCE ROW LEVEL SECURITY;  -- REVIEW QUESTION ONLY

CREATE POLICY deny_anon_school_identity_review_events
  ON public.school_identity_review_events
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY deny_authenticated_school_identity_review_events
  ON public.school_identity_review_events
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
```

NOT EXECUTED BY THIS DOCUMENT.  
DO NOT RUN FROM THIS DOCUMENT.  
DO NOT PASTE FROM THIS DOCUMENT INTO SUPABASE.  
OWNER EXECUTION GATE REQUIRED.  
STAGING ONLY.  
PRODUCTION APPLY NOT APPROVED.  
ACTUAL EXECUTION ARTIFACT MUST BE CONFIRMED IN A FUTURE GATE.

## 8. Rollback requirements placeholder

**No concrete rollback SQL in this Gate 33 artifact.** A later execution gate or dedicated rollback artifact must supply it.

Rollback planning must include:

- **Policy drop strategy** — drop each introduced policy **by explicit policy name** (names as in §7 block: `deny_anon_*`, `deny_authenticated_*` per table).
- **RLS disable strategy** — per table, if and when disabling RLS is chosen; ordering vs policy drops must match Postgres semantics for that gate’s plan.
- **Executor identity** — who performs rollback.
- **Rollback trigger criteria** — which failure modes invoke rollback.
- **Post-rollback verification** — catalog policy list, RLS flags, row counts, negative tests, diagnostics baseline.

## 9. Pre-apply read-only snapshot requirements

Before any future execution, capture read-only evidence on the **verified staging target**:

- PostgreSQL version (major)
- Target DB identity (owner-held; not written here)
- Schema is `public` or explicitly confirmed otherwise
- All **seven** relations exist: `source_school_observations`, `school_identity_candidates`, `identity_aliases`, `school_locations`, `school_identity_resolution_decisions`, `programme_availability_publication_decisions`, `school_identity_review_events`
- Row counts (baseline)
- RLS enabled/disabled state per table
- Existing policy list per table
- Table owner per table
- Role / bypass facts (`service_role`, `postgres`, `BYPASSRLS`, etc.) — documented, not assumed
- Diagnostics/helper baseline (read-only, non-publication)

## 10. Post-apply verification requirements

After any future apply (under execution gate only):

- RLS enabled state matches intent (all seven tables)
- Policy list matches Option B intent (two deny policies per table for `anon` and `authenticated`; no permissive client policies)
- Row counts unchanged (unless a separate approved write gate exists — none here)
- `anon` denied
- `authenticated` denied
- Frontend direct DB denied
- Route raw access denied
- PSA raw access denied
- Write attempts denied unless separately approved
- Diagnostics/helper compatibility confirmed
- Diagnostics output does not become publication truth
- No app / admin / **runtime** / PSA / Route integration occurred as part of the apply

## 11. Forbidden shortcuts

The following inferences are **invalid**:

- execution prompt draft exists → SQL may run
- SQL block exists → SQL approved
- staging target named outside repo → target verified automatically
- Option B selected → apply authorized
- RLS enabled in staging → production apply approved
- negative tests listed → tests passed
- diagnostics checked → publication truth approved
- RLS apply → runtime/write authorized
- RLS apply → app/admin/PSA/Route authorized
- RLS apply → partial integration allowed
- docs/architecture markdown exists → execution artifact exists

## 12. Execution-prompt draft outcome

**EXECUTION_PROMPT_DRAFT_CREATED_NOT_AUTHORIZED**

This means a future execution prompt draft exists in this file. It does **not** authorize SQL execution. It does **not** authorize opening the Supabase SQL editor. It does **not** authorize RLS enablement. It does **not** authorize policy creation in DB. It does **not** authorize production apply. It does **not** authorize runtime/write, app, admin, PSA, Route, or Phase 3.

## 13. Final boundary statement

Phase 2 staging RLS SQL execution prompt is drafted here for future review only, but SQL execution, RLS enablement, policy creation, DB writes, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, production apply, and any partial app integration remain blocked until a separate owner-approved execution gate.
