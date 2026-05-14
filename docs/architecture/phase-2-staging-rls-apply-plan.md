# Phase 2 Staging RLS Apply Plan

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Staging RLS apply **planning** only |
| **Scope** | Planning before a **future** owner-approved **staging SQL execution** gate |
| **Repository checkpoint** | `f1c658f Add Phase 2 RLS apply readiness decision` |
| **Created at (UTC)** | 2026-05-13 |
| **CONTEXT_WARN** | None — `git log -1 --oneline` matches expected checkpoint. |
| **Gate 30 outcome** | `READY_FOR_STAGING_RLS_APPLY_PLANNING_ONLY` (planning posture only; **not** execution authorization) |
| **Not SQL execution** | Yes |
| **Not RLS enablement** | Yes |
| **Not policy creation in DB** | Yes |
| **Not migration creation** | Yes |
| **Not DB write approval** | Yes |
| **Not runtime/write approval** | Yes |
| **Not admin dashboard integration approval** | Yes |
| **Not app integration approval** | Yes |
| **Not PSA approval** | Yes |
| **Not Route approval** | Yes |
| **Not Phase 3 approval** | Yes |
| **Not production apply approval** | Yes |
| **No partial integration approval** | Yes |
| **Child-information protection principle** | Applies — security, privacy, truthful presentation, and data minimization override speed |

This file is a **planning artifact only**. It does **not** instruct anyone to run SQL, does **not** approve a staging apply, and does **not** modify any prior gate documents.

---

## 3. Source basis

The following repository documents inform this plan (read for context; **this file does not modify** Gate 26 / 27 / 28 / 30 sources):

- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` (Gate 30)
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` (Gate 28)
- `docs/architecture/phase-2-rls-policy-sql-draft.md` (Gate 26) — **SQL reference path only**; **no** SQL copied into this plan
- `docs/architecture/phase-2-rls-policy-design-plan.md` (Gate 25)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` (Gate 24)
- `docs/architecture/phase-2-rls-security-review-plan.md` (Gate 23)
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

---

## 4. Target environment boundary

- **Target scope:** **Staging RLS apply planning only** — not production apply, not runtime integration.  
- **Exact staging project / ref / database** for execution must be **owner-confirmed** before any future execution gate (**no** default `.env` assumption; **no** guessing).  
- **Current staging target identity status:** **`OWNER_DECISION_REQUIRED`** — not supplied in this Gate 31 prompt.  
- **Production apply** is **separate** and **not** approved by this plan.  
- If the **staging** database is **physically different** from the **owner-used Supabase project** referenced in Gate 30 for PostgreSQL version evidence, **staging parity** (version, table owner, role/bypass behavior, policy assumptions) must be **verified first** before treating staging as validated.  
- **Staging outcomes do not prove production readiness.**  
- **Missing** owner target confirmation **does not** block creating this plan; it **blocks execution** until resolved.  

---

## 5. SQL option selection

**Rule:** This plan **does not** select an execution path. **Do not** run SQL from this document. SQL lives only in `docs/architecture/phase-2-rls-policy-sql-draft.md` (see that file’s **§7** for Option A vs B narrative).

| Option | Description | Status | Required decision before execution |
|--------|-------------|--------|-------------------------------------|
| **Option A** | RLS enabled with **no** permissive client policies for `anon` / `authenticated`. | **`OWNER_DECISION_REQUIRED`** | Owner/security must pick A vs B and record the choice in the **execution gate** materials. |
| **Option B** | RLS enabled plus **explicit** deny policies for `anon` / `authenticated` (see SQL draft for draft shape). | **`OWNER_DECISION_REQUIRED`** | Same as Option A — **mutually exclusive** execution choice per environment. |

---

## 6. FORCE RLS handling

- **`FORCE ROW LEVEL SECURITY`** is a **review-required** item; it must **not** be auto-enabled.  
- In the SQL draft, `FORCE` remains **commented / review-only** unless a **later security gate** explicitly permits it with **role / table-owner** reasoning.  
- Execution requires an explicit **`FORCE` yes/no** decision tied to the named staging target and role model.  

---

## 7. Pre-apply checklist (before any future execution gate)

Required evidence / checks (to be performed under the **future execution gate**, not here):

- Exact **target project / environment** (owner-confirmed).  
- Current **PostgreSQL major version** on **that** target (not inferred from a different project).  
- **Seven** Phase 2 tables exist and match migration identifiers (`supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`).  
- Current **RLS** enabled/disabled state per table.  
- Current **policy catalog** state per table (names, roles, permissive vs deny intent).  
- **Table owner** and migration-role assumptions.  
- **Role / bypass** assumptions (`service_role`, `postgres`, `BYPASSRLS`, etc.) documented, not assumed.  
- **Diagnostics/helper** current behavior baseline (read-only, non-publication).  
- **Backup / snapshot** or other **rollback readiness** evidence exists per rollback §9.  

---

## 8. Apply executor requirements

- **Executor identity** must be **explicitly named** before execution (person or role accountable).  
- Executor must use the **owner-approved target only** — **no** implicit default from unchecked configuration.  
- Executor must **not** rely on “whatever `.env` loads” without an explicit owner mapping to the **staging** target.  
- Executor must **not** “run from docs” — execution must follow a **separate**, owner-approved **execution gate** procedure (runbook / ticket / controlled console), outside this markdown file.  

---

## 9. Rollback plan requirements

**Planning only — no concrete rollback SQL in this document.**

Before execution is accepted, a rollback plan must define:

- **Order** of operations (policy drops before or after RLS disable — to be decided in execution materials, consistent with Postgres semantics).  
- **Policy drop strategy** (how to remove only the introduced policies; naming discipline).  
- **RLS disable strategy** (when disabling RLS is allowed vs not; risks).  
- **Who** executes rollback (named).  
- **Trigger criteria** for rollback (what failure modes invoke it).  
- **Post-rollback verification** (catalog state, negative tests re-run, diagnostics check).  

---

## 10. Negative access test plan

Required **future** tests (to be executed under the execution gate — **not** written, run, or passing as of this plan):

- `anon` denied for Phase 2 tables  
- `authenticated` denied for Phase 2 tables  
- **Frontend** direct DB denied (may require **architecture / role** evidence, not SQL alone)  
- **Route** raw table access denied  
- **PSA** raw table access denied  
- **Writes** denied unless explicitly approved by a separate gate  
- **Diagnostics** output does **not** become publication truth  
- **No** raw evidence leaks to runtime / PSA / Route  

**Review finding:** this plan **does not** claim tests exist, have run, or have passed.

---

## 11. Diagnostics/helper compatibility plan

- Diagnostics/helper remains **read-only** and **non-publication** per contract + ADR.  
- The **execution gate** must **verify** diagnostics/helper behavior **after** RLS changes on the **same** target environment.  
- **No** bypass access for diagnostics is authorized by this plan.  
- A **compatibility failure** must **block** apply **acceptance** until resolved under a separate decision.  

---

## 12. Post-apply read-only verification plan

After any future staging apply, verification should include (read-only / catalog / controlled tests):

- RLS **enabled** state matches intent  
- **Policy list** matches chosen Option A/B and `FORCE` decision  
- **Row counts** unchanged for Phase 2 tables (unless a separate approved write gate exists — none here)  
- **Negative test** results recorded  
- **Diagnostics compatibility** result recorded  
- Evidence that **no** app / admin / PSA / Route integration occurred as part of the apply  

---

## 13. Admin dashboard / app / PSA / Route boundary

- **No** admin dashboard integration is approved by this plan.  
- **No** new server routes are approved.  
- **No** UI reads from Phase 2 are approved.  
- A **future** admin dashboard may show **only** processed, readable, **action-oriented problematic** cases requiring owner/admin decision support — **not** raw dumps, not all rows, not default happy-path streams.  
- **No** raw JSON / all-rows / raw evidence dumps as owner/admin UX.  
- **No** app / runtime / PSA / Route consumption of Phase 2 is approved.  
- **No** readiness / **pipeline hooks** are approved.  

---

## 14. Apply-plan outcome

**`APPLY_PLAN_CREATED_NOT_APPROVED`**

**Meaning:**

- A **planning artifact** now exists.  
- This **does not** approve SQL execution.  
- This **does not** approve staging apply.  
- This **does not** approve RLS enablement.  
- This **does not** approve policy creation in any database.  
- This **does not** approve production apply.  
- This **does not** approve app, admin dashboard, runtime, PSA, Route, or Phase 3 work.  

---

## 15. Final boundary statement

Phase 2 staging RLS apply planning is documented here, but SQL execution, RLS enablement, policy creation, DB writes, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, production apply, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
