# Phase 2 Staging RLS Execution Packet
This packet does not authorize SQL execution.

## 2. Snapshot / status

- **Gate 34A wording rule:** This Gate 34A file **approves nothing**. It may prepare a packet for later **Gate 34B** owner-approved manual execution. **Only Gate 34B** may later authorize manual execution of this packet’s RLS/policy DDL. Gate 34A itself does **not** authorize execution.
- **Status:** Execution packet artifact only
- **Scope:** Packet for a future owner-approved manual staging SQL execution gate
- **Repository checkpoint:** `7956621 Add Phase 2 staging RLS SQL execution prompt draft`
- **Created at (UTC):** 2026-05-13
- **Not SQL execution**
- **Not RLS enablement by this document**
- **Not policy creation in DB by this document**
- **Not migration creation**
- **Not runtime/write approval**
- **Not admin dashboard integration authorization**
- **Not app integration authorization**
- **Not PSA authorization**
- **Not Route authorization**
- **Not Phase 3 authorization**
- **Not production apply authorization**
- **No partial integration authorization**
- **No secrets / project refs / URLs / keys included**
- **Child-information protection principle applies**

This RLS execution packet does not define Phase 2 problem-contour activation logic, read-model rules, problematic-case selection, admin presentation rules, Route publication behavior, PSA publication behavior, or full contour readiness.

## 3. Source basis

The following repository documents inform this packet (read for context; **this file does not modify** prior gate sources):

- `docs/architecture/phase-2-staging-rls-sql-execution-prompt-draft.md` (Gate 33)
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

**SQL shape:** Option B restrictive deny policies derived from Gate 33 / `phase-2-rls-policy-sql-draft.md` §8, with **stable abbreviated policy names** for rollback pairing. **`CREATE POLICY … FOR ALL`** and **`AS RESTRICTIVE`** require **PostgreSQL 15+** (hard stop if unknown or lower).

## 4. Target verification block (manual — no identifiers in-repo)

Before any future execution under **Gate 34B**, the executor must complete outside-repo and dashboard checks:

- [ ] Owner-held staging target notes are opened **outside this repository** (no secrets pasted into tickets from this file).
- [ ] Supabase (or equivalent) dashboard **environment label** matches owner-held staging intent; **STOP** if label conflicts with owner-held target notes.
- [ ] **Read-back** of project identity is performed **outside repo** (typed confirmation), not inferred from `.env` defaults.
- [ ] Confirmed **not production** (explicit non-prod assertion recorded in Gate 34B evidence).
- [ ] **Executor identity** will be recorded in Gate 34B (who runs SQL, who approves).
- [ ] No script execution and no “run all” from partial editor selection.

## 5. Pre-apply read-only snapshot block

| Check | Requirement | Notes |
|--------|----------------|--------|
| PostgreSQL major | **Must be known and ≥ 15** | **STOP** if unknown or &lt; 15 while this packet’s `FOR ALL` / `AS RESTRICTIVE` SQL is used. Otherwise require a **narrow SQL revision** (split by command) before execution. |
| Schema | `public` for all seven relations | **STOP** if not `public` unless explicitly re-approved with revised qualifiers. |
| Tables exist | All seven names present | `source_school_observations`, `school_identity_candidates`, `identity_aliases`, `school_locations`, `school_identity_resolution_decisions`, `programme_availability_publication_decisions`, `school_identity_review_events` |
| Row counts | Baseline counts captured | Use **counts only** — **no** raw row dumps of child/evidence data. |
| RLS state | `relrowsecurity` per table | Baseline before apply. |
| Policy catalog | `pg_policies` / equivalent | Baseline; **planned policy names must not already exist**. |
| Policy name collision | Planned names absent | **STOP** if any `p2_deny_*` from §6 already exists on the target table. |
| Table owner | Recorded | For bypass review. |
| BYPASSRLS / role facts | Recorded where visible | Include `service_role` **as role name only** — never keys. |
| Diagnostics baseline | Read-only helper behavior noted | Non-publication posture unchanged at baseline. |
| Integrations | None in this window | No app/admin/PSA/Route wiring as part of DDL work. |
| Evidence hygiene | No screenshots/tickets with raw child rows | Unless a **separate** policy explicitly allows. |

**Raw-data minimization:** Verification and tests must prefer **catalog, counts, permission errors**, and **redacted** evidence — not table dumps.

## 6. Execution SQL packet

OWNER EXECUTION GATE 34B STILL REQUIRED.  
DO NOT RUN UNTIL OWNER GIVES FINAL GO IN GATE 34B.  
STAGING ONLY.  
PRODUCTION APPLY NOT APPROVED.  
DO NOT RUN PARTIAL SELECTION.  
DO NOT USE DEFAULT .env.  
DO NOT RUN FROM SCRIPT.  
RAW CHILD/EVIDENCE ROW DUMPS ARE FORBIDDEN FOR VERIFICATION.

```sql
-- Phase 2 staging Option B — explicit restrictive deny policies for anon / authenticated.
-- HARD PREREQ: PostgreSQL 15+ (FOR ALL + AS RESTRICTIVE on CREATE POLICY). STOP if not met.
-- FORCE ROW LEVEL SECURITY is excluded from this first execution (commented note only; do not enable as active SQL).
-- No service_role allow policies. No GRANT/REVOKE. No data DML.

ALTER TABLE public.source_school_observations ENABLE ROW LEVEL SECURITY;
-- FORCE ROW LEVEL SECURITY intentionally omitted for first staging execution (Gate 32 / Gate 33 posture).

CREATE POLICY p2_deny_anon_source_obs
  ON public.source_school_observations
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_source_obs
  ON public.source_school_observations
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_school_candidates
  ON public.school_identity_candidates
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_school_candidates
  ON public.school_identity_candidates
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.identity_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_identity_aliases
  ON public.identity_aliases
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_identity_aliases
  ON public.identity_aliases
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_school_locations
  ON public.school_locations
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_school_locations
  ON public.school_locations
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_resolution_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_identity_decisions
  ON public.school_identity_resolution_decisions
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_identity_decisions
  ON public.school_identity_resolution_decisions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.programme_availability_publication_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_publication_decisions
  ON public.programme_availability_publication_decisions
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_publication_decisions
  ON public.programme_availability_publication_decisions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER TABLE public.school_identity_review_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY p2_deny_anon_review_events
  ON public.school_identity_review_events
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY p2_deny_auth_review_events
  ON public.school_identity_review_events
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
```

OWNER EXECUTION GATE 34B STILL REQUIRED.  
DO NOT RUN UNTIL OWNER GIVES FINAL GO IN GATE 34B.  
STAGING ONLY.  
PRODUCTION APPLY NOT APPROVED.  
DO NOT RUN PARTIAL SELECTION.  
DO NOT USE DEFAULT .env.  
DO NOT RUN FROM SCRIPT.  
RAW CHILD/EVIDENCE ROW DUMPS ARE FORBIDDEN FOR VERIFICATION.

## 7. Rollback SQL packet

ROLLBACK ALSO REQUIRES OWNER/AUTHORIZED EXECUTOR ACTION.  
DO NOT RUN PARTIAL SELECTION.  
ROLLBACK MUST MATCH THE POLICY NAMES CREATED ABOVE.  
DO NOT TOUCH DATA.  
DO NOT TOUCH UNRELATED TABLES.

```sql
-- Rollback ordering:
-- 1) Drop created policies by exact name (IF EXISTS tolerates partial prior state; verify zero rows after).
-- 2) Verify policy removal (run SELECTs below; expect no matching policies).
-- 3) FULL REVERT only: uncomment DISABLE ROW LEVEL SECURITY block after step 2 is clean.
-- 4) Verify final RLS state (SELECTs at end).

-- --- Step 1: drop policies (names must match §6 exactly) ---
DROP POLICY IF EXISTS p2_deny_anon_source_obs ON public.source_school_observations;
DROP POLICY IF EXISTS p2_deny_auth_source_obs ON public.source_school_observations;

DROP POLICY IF EXISTS p2_deny_anon_school_candidates ON public.school_identity_candidates;
DROP POLICY IF EXISTS p2_deny_auth_school_candidates ON public.school_identity_candidates;

DROP POLICY IF EXISTS p2_deny_anon_identity_aliases ON public.identity_aliases;
DROP POLICY IF EXISTS p2_deny_auth_identity_aliases ON public.identity_aliases;

DROP POLICY IF EXISTS p2_deny_anon_school_locations ON public.school_locations;
DROP POLICY IF EXISTS p2_deny_auth_school_locations ON public.school_locations;

DROP POLICY IF EXISTS p2_deny_anon_identity_decisions ON public.school_identity_resolution_decisions;
DROP POLICY IF EXISTS p2_deny_auth_identity_decisions ON public.school_identity_resolution_decisions;

DROP POLICY IF EXISTS p2_deny_anon_publication_decisions ON public.programme_availability_publication_decisions;
DROP POLICY IF EXISTS p2_deny_auth_publication_decisions ON public.programme_availability_publication_decisions;

DROP POLICY IF EXISTS p2_deny_anon_review_events ON public.school_identity_review_events;
DROP POLICY IF EXISTS p2_deny_auth_review_events ON public.school_identity_review_events;

-- --- Step 2: verify policy removal (read-only) ---
-- Expect zero rows for each query:
-- SELECT polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
--   WHERE c.relname = 'source_school_observations' AND polname LIKE 'p2_deny_%';
-- (repeat per table name as needed)

-- --- Step 3: FULL REVERT optional path — RLS disable (only after policies confirmed gone; uncomment to run) ---
-- ALTER TABLE public.source_school_observations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_candidates DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.identity_aliases DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_locations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_resolution_decisions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.programme_availability_publication_decisions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.school_identity_review_events DISABLE ROW LEVEL SECURITY;

-- --- Step 4: verify final RLS state (read-only) ---
-- SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND relname IN (
--     'source_school_observations','school_identity_candidates','identity_aliases','school_locations',
--     'school_identity_resolution_decisions','programme_availability_publication_decisions','school_identity_review_events'
--   );
```

ROLLBACK ALSO REQUIRES OWNER/AUTHORIZED EXECUTOR ACTION.  
DO NOT RUN PARTIAL SELECTION.  
ROLLBACK MUST MATCH THE POLICY NAMES CREATED ABOVE.  
DO NOT TOUCH DATA.  
DO NOT TOUCH UNRELATED TABLES.

**Post-rollback verification expectations:** policy names absent from catalog for the seven tables; if full revert was taken, `relrowsecurity` matches agreed baseline; row counts reconciled; negative tests and diagnostics checks re-run per Gate 34B record.

## 8. Post-apply verification checklist

- [ ] Catalog: RLS enabled on all seven tables as intended.
- [ ] Catalog: exactly the fourteen policies from §6 exist (`p2_deny_*`), no extra permissive client policies.
- [ ] Row counts: unchanged **or** explained by an agreed, documented maintenance window (else **STOP**).
- [ ] `anon` denied on Phase 2 tables (evidence: error text / empty result per test design — **no raw dumps**).
- [ ] `authenticated` denied (same).
- [ ] Frontend direct DB access denied.
- [ ] Route raw table access denied.
- [ ] PSA raw table access denied.
- [ ] Writes denied unless explicitly approved elsewhere.
- [ ] Diagnostics/helper compatibility recorded (read-only, non-publication).
- [ ] Diagnostics output is **not** treated as publication truth.
- [ ] No app / admin / **runtime** / PSA / Route integration occurred during the change window.
- [ ] No raw evidence leaks to runtime / PSA / Route.

## 9. Stop conditions

Stop (do **not** execute apply; do **not** accept completion) if any apply:

- Target project uncertain or production selected.
- Staging identity cannot be verified or **environment label conflicts** with owner-held notes.
- PostgreSQL major **unknown** or **&lt; 15** while this packet’s `FOR ALL` / `AS RESTRICTIVE` SQL is used.
- Schema is not `public` (unless revised and re-approved).
- Any of the seven tables missing.
- Planned `p2_deny_*` policy names **already exist**.
- Unexpected policies conflict with planned names or intent.
- RLS already enabled in an **unexplained** state (partial prior apply suspected).
- Table owner / `BYPASSRLS` facts **unknown** where required for safety judgment.
- Diagnostics baseline unknown.
- Rollback packet incomplete or not understood by executor.
- Negative tests not ready, or required paths **untestable** without waiving (waiving is forbidden — **block acceptance** instead).
- Executor unsure; **default `.env`** assumptions involved; **script execution** proposed.
- Any app/admin/PSA/Route integration bundled into this work.
- Child/data protection concern appears.
- Any raw evidence / row dump would be **required** to “prove” success.

## 10. Manual execution instructions for later Gate 34B

- This packet **alone is not enough** to execute; **Gate 34B** must explicitly authorize manual execution after preconditions pass.
- Executor must **confirm target outside repo** (read-back) before running anything.
- Execute the **complete, reviewed** §6 and §7 blocks only — **no partial selection**, no ad-hoc edits during paste unless the run is aborted and re-planned.
- **No default `.env`** target selection; **no scripts**.
- Record **who executed, when, and verification evidence** in Gate 34B materials **without** raw child/evidence dumps.
- Prefer a **single controlled transaction** only if the executor and Postgres session policy agree; otherwise use explicit failure handling — never leave half-applied policies without an immediate rollback decision.

## 11. Execution-packet outcome

**EXECUTION_PACKET_CREATED_NOT_EXECUTED**

This means the packet exists for later owner-approved execution. It does **not** authorize execution by itself. It does **not** authorize opening the Supabase SQL editor. It does **not** authorize production apply. It does **not** authorize runtime/write, app, admin, PSA, Route, or Phase 3.

## 12. Final boundary statement

Phase 2 staging RLS execution packet is documented here for future owner-approved manual execution only, but SQL execution, RLS enablement, policy creation in DB, DB writes beyond RLS/policy DDL, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, production apply, and any partial app integration remain blocked until a separate Gate 34B owner execution approval.
