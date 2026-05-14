# Phase 2 RLS/Policy SQL Draft

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Review-only SQL draft |
| **Scope** | Future Phase 2 RLS/policy SQL candidate |
| **Repository checkpoint** | `99137b8 Add Phase 2 RLS policy design plan` |
| **Created at (UTC)** | 2026-05-13 |
| **CONTEXT_WARN** | None — `git log -1 --oneline` matches expected checkpoint. |
| **Not for execution** | Yes |
| **Not a migration** | Yes |
| **Not applied** | Yes |
| **Not RLS enablement** | Yes |
| **Not policy creation** | Yes |
| **Not DB write approval** | Yes |
| **Not runtime/write approval** | Yes |
| **Not app integration approval** | Yes |
| **Not PSA approval** | Yes |
| **Not Route approval** | Yes |
| **Not Phase 3 approval** | Yes |
| **No partial integration approval** | Yes |
| **Internal truth-processing contour only** | Phase 2 is an internal contour for ambiguous/problematic cases — not a user-facing feature |
| **No user-facing raw Phase 2 access** | Yes |
| **Child-information protection principle** | Applies — maximum protection, truthfulness, and data-safety over speed |

---

## 3. Source basis

The following repository documents were read for context when authoring this draft:

- `docs/architecture/phase-2-rls-security-review-plan.md` (Gate 23)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` (Gate 24)
- `docs/architecture/phase-2-rls-policy-design-plan.md` (Gate 25)
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

**This file does not modify** any of the above sources, including Gate 23 / 24 / 25 documents.

---

## 4. Design constraints inherited from Gate 24/25

- **Deny-by-default** posture for client-facing database roles.  
- **No** anonymous direct access to raw Phase 2 tables.  
- **No** authenticated end-user direct access to raw Phase 2 tables.  
- **No** frontend direct access to raw Phase 2 tables.  
- **No** “authenticated can select own rows” (or similar) **permissive** pattern.  
- **No** Route Engine raw-table access.  
- **No** PSA raw-table access.  
- **Service role** is **not** automatically approved; **no** service_role allow policy in this draft.  
- **Internal backend** access paths are **not** active and **not** implemented here.  
- **No partial integration** — no ripped connections to app/runtime/PSA/Route/pipeline.  
- **Child-information protection first** — security and truthful presentation over speed.  
- Phase 2 is an **internal truth-processing contour**, **not** a user-facing surface or the main Route/happy-path engine.  

---

## 5. SQL draft warning

**This SQL is a draft for review only.**

- It **must not** be executed manually.  
- It **must not** be pasted into the Supabase SQL editor (or any production or staging console) **without** a **separate owner-approved apply gate**, SQL review, security approval, staging apply plan, and post-apply verification.  
- It **must not** be placed in `supabase/migrations/` or any auto-applied migration path.  
- **Copy-paste execution from this document is forbidden.**  
- It requires **separate** SQL review, security approval, staging apply gate, post-apply verification, negative access tests, and diagnostics compatibility checks before any real change.  

---

## 6. RLS / Supabase bypass review notes

- **RLS alone is not a complete security review.** Enabling RLS changes default access for roles that are subject to policies; it does **not** by itself prove that **all** high-privilege paths are appropriately constrained.  
- **Table owner**, **superuser**, **BYPASSRLS** roles, and **service-role-like** paths (including typical Supabase service role behavior) **must** be reviewed explicitly. This draft **does not** resolve service-role bypass.  
- **`FORCE ROW LEVEL SECURITY`** is an **open review decision**, not automatically selected here. Commented candidates appear only as **review questions**, not recommendations.  
- **Service role usage is not approved** by this document.  
- **No** app/runtime, PSA, Route, Phase 3, or ordinary user-facing access is **approved** by this document.  

---

## 7. Deny posture options (review alternatives — not approved)

**Option A — RLS enabled, no permissive policies for client roles**

- After `ENABLE ROW LEVEL SECURITY`, **no** `CREATE POLICY` that grants `anon` / `authenticated` access to the table.  
- Whether default-deny without explicit policies is sufficient for all command types and all client roles must be verified in **SQL review** and **negative tests** for the project’s Postgres/Supabase version.  

**Option B — RLS enabled plus explicit restrictive deny policies for `anon` and `authenticated`**

- Adds explicit `CREATE POLICY` rows with **`USING (false)`** / **`WITH CHECK (false)`** (or equivalent) for `anon` and `authenticated` so the deny intent is visible in catalog metadata.  
- Must still avoid any permissive policy; reviewer must confirm policy combination semantics (including multiple policies per command).  

**Both options**

- Are **draft review options only** — **neither** is approved.  
- Require **SQL review**, **security approval**, **staging apply gate**, and **post-apply negative tests**.  
- **Diagnostics/helper compatibility** must be reviewed before any apply (see §9).  
- **Neither** option approves runtime/write, DB writes, or app integration.  

---

## 8. Draft SQL block

**The fenced block below is not for execution.** It illustrates conservative **candidates** for discussion. Adjust schema qualifiers (`public`) and Postgres version (`FOR ALL` requires **PostgreSQL 15+**; otherwise split per `SELECT` / `INSERT` / `UPDATE` / `DELETE` with DBA guidance).

```sql
-- REVIEW DRAFT ONLY.
-- NOT FOR EXECUTION.
-- DO NOT PASTE INTO SUPABASE SQL EDITOR.
-- DO NOT PLACE IN supabase/migrations/.
-- REQUIRES SEPARATE OWNER-APPROVED APPLY GATE.
--
-- Option B candidate: explicit deny policies for roles "anon" and "authenticated".
-- Option A would OMIT the CREATE POLICY lines below and rely on RLS + zero permissive policies (must be validated in review).
-- FOR ALL requires PostgreSQL 15+; split per command if on older Postgres.
--
-- FORCE ROW LEVEL SECURITY: open review only — table owner / service-role-like bypass must be decided outside this draft.
-- Example (commented only — do not uncomment without security review):
--   ALTER TABLE public.source_school_observations FORCE ROW LEVEL SECURITY;

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

**TODO / owner-gated (not implemented in this draft):** any future internal server-side read/write path, operator workflow, or service-role policy must be **designed, reviewed, and approved** under **separate** gates. **No** such policies appear here.

---

## 9. Diagnostics/helper reconciliation

- Existing Phase 2 **diagnostics/helper** boundaries remain **read-only** and **non-publication** per `phase-2-read-only-diagnostics-contract.md` and `phase-2-read-only-diagnostics-helper-boundary-adr.md`.  
- This SQL draft **does not** authorize changes to diagnostics/helper code, contracts, or ADRs.  
- Any future **RLS apply gate** must **reconcile** whether enabling RLS and adding policies affects the **read-only diagnostics** path (including which database role the helper uses and whether it bypasses RLS), and must **resolve** that safely **before** apply.  
- Diagnostics/helper output **must not** become **publication truth**.  

---

## 10. Review questions before any apply gate

- Should **`FORCE ROW LEVEL SECURITY`** be used on any or all of the seven tables?  
- Should deny-by-default rely on **no permissive policies** (Option A), **explicit deny policies** for `anon` / `authenticated` (Option B), or **both** (if ever justified)?  
- Should **service-role-like** paths be constrained by **architecture** (dedicated role, no broad service reuse) rather than by **policy** alone?  
- How will **read-only diagnostics** behave after RLS (role, bypass, caps, fail-closed vs fail-open)?  
- What **negative tests** must pass (anon, authenticated, frontend paths, no raw leaks to runtime/PSA/Route)?  
- What **staging verification** must run after apply (catalog checks, smoke, diagnostics script)?  
- What **rollback plan** is needed (drop policy order, disable RLS risks)?  
- How will **child-information exposure** be minimized in any future allow path (not defined here)?  

### Reviewer grep checklist (reject before any apply gate if found in approved SQL)

The following substrings or patterns must be **rejected** during SQL review before any apply gate (non-exhaustive grep aid):

- `USING (true)`  
- `WITH CHECK (true)`  
- `TO authenticated` **with** permissive access (any policy that widens access beyond explicit deny — reviewer judgment)  
- `TO anon` **with** permissive access  
- `GRANT`  
- `REVOKE`  
- `SECURITY DEFINER`  
- `CREATE VIEW`  
- `CREATE FUNCTION`  
- service_role **allow** / permissive service-role policy  
- Route access / PSA access / frontend access as policy intent  
- Any permissive `SELECT` / `INSERT` / `UPDATE` / `DELETE` policy on Phase 2 tables for client or app roles  

---

## 11. Required future gates

This document **approves none** of the following:

1. SQL review gate  
2. Security approval gate  
3. Staging apply gate  
4. Post-apply verification gate  
5. Negative access test gate  
6. Diagnostics compatibility verification  
7. No app/runtime integration until **full contour** owner approval  

---

## 12. Forbidden shortcuts

The following are **invalid inferences** — **not** allowed behavior:

- SQL draft exists → SQL approved  
- SQL draft exists → execute in Supabase  
- SQL draft exists → migration created  
- RLS SQL exists → RLS enabled  
- Deny policy drafted → security complete  
- RLS enabled → service role approved  
- Staging apply → production apply  
- RLS enabled → DB writes approved  
- RLS enabled → runtime/write approved  
- RLS enabled → PSA/Route/Phase 3 approved  
- RLS enabled → partial app integration allowed  
- RLS enabled → user-facing access approved  

---

## 13. Final boundary statement

Phase 2 RLS/policy SQL is drafted here for review only, but RLS enablement, policy creation, DB writes, runtime/write integration, PSA publication, Route Engine consumption, Phase 3, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
