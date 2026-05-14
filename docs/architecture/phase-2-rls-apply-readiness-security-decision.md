# Phase 2 RLS Apply Readiness / Security Decision Record

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Security decision record |
| **Scope** | Readiness decision before any future staging RLS apply **planning** gate |
| **Repository checkpoint** | `fedccf6 Add Phase 2 RLS SQL security review packet` |
| **Created at (UTC)** | 2026-05-13 |
| **CONTEXT_WARN** | None — `git log -1 --oneline` matches expected checkpoint. |
| **Not RLS apply** | Yes |
| **Not SQL execution** | Yes |
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
| **Child-information protection principle** | Applies — see decision table row |

This document records **owner/security decisions** for **planning posture only**. It does **not** execute SQL, enable RLS, create policies in any database, approve writes, or approve integration.

---

## 3. Source basis

The following repository documents were read for context when authoring this record:

- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` (Gate 28)
- `docs/architecture/phase-2-rls-policy-sql-draft.md` (Gate 26)
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

**Owner-provided Gate 29 / Gate 30 planning fact (read-only check by owner, not re-verified in this task):**

- PostgreSQL **17.6**; `server_version_num` **170006**; session **`transaction_read_only = on`** on the **owner-used Supabase project** used for the version check.

**This file does not modify** Gate 26 / Gate 27 / Gate 28 documents or any other listed sources.

---

## 4. PostgreSQL version / target planning fact

Facts below are **planning evidence only** from the owner’s described read-only check. They are **not** authorization to modify any database.

| Environment / project | PostgreSQL version | server_version_num | transaction_read_only | What this proves | What this does NOT prove |
|-------------------------|--------------------|--------------------|-------------------------|------------------|---------------------------|
| **Owner-used Supabase project** (the project where the owner ran the read-only version query) | **17.6** | **170006** | **on** (read-only session) | For **this checked project**, PostgreSQL is new enough that **`FOR ALL`** policy shape in the SQL draft is **compatible at the major-version level** (draft notes: `phase-2-rls-policy-sql-draft.md` **L122**). | Staging apply; production apply; RLS enablement; policy correctness end-to-end; role/table-owner parity on any **other** database |

**Additional owner decision (recorded):**

- If a **physically separate** staging database exists, its PostgreSQL version and **role/table-owner / bypass parity** must be checked **separately** before treating staging as validated.

---

## 5. Decision table

Decisions below are **only** those supplied by the owner for Gate 30. **Nothing here is invented** beyond that input.

| Topic | Decision | Evidence basis | Remaining blocker? | Meaning | Still not approved |
|--------|----------|----------------|--------------------|---------|---------------------|
| **PostgreSQL version / `FOR ALL` compatibility** | **17.6** on the owner-checked project supports **`FOR ALL`** at the checked project. | Owner read-only query result (§4). | **YES** if a separate staging DB exists — parity check still required. | Version fact supports draft **compatibility** discussion only. | SQL apply; RLS enablement; any apply on other environments without parity evidence |
| **Target environment for planning** | The **owner-used Supabase project** with **PostgreSQL 17.6** is the **current reference project** for **planning** the next step. | Owner Gate 30 instruction + §4 table. | **YES** until any separate staging DB is evidenced. | **Planning reference** only. | Staging apply; production apply |
| **`FORCE ROW LEVEL SECURITY`** | **`FORCE` is required as a security-review item before apply**; it must **not** be auto-enabled; it stays **commented / review-only** in the draft unless a **later security gate** explicitly permits it with role/table-owner reasoning. | SQL draft comment pattern (`phase-2-rls-policy-sql-draft.md` **L124–L131**); owner Gate 30 instruction. | **YES** — explicit human/security decision still required before any apply bundle may include `FORCE`. | `FORCE` remains an **open engineering/security fork**, not a default-on switch. | Auto-applying `FORCE`; apply without that decision |
| **`service_role` / `postgres` / `BYPASSRLS` / table owner** | High-privilege paths (**including** `service_role`, `postgres`, `BYPASSRLS`, table owner) are **not** approved as **product access**. They may exist only as **controlled internal maintenance/security** paths. Any future server-side access must be **separately** owner/security-approved, **audited**, and **least-privilege by process**. High-privilege **diagnostics/helper** behavior is **not** product access approval and must be **explicitly audited**. | Owner Gate 30 instruction; Gates 24–27 context. | **YES** — audit and concrete role model still required before apply. | Deny-by-default client policies do **not** replace bypass analysis. | Product/runtime/dashboard/app/PSA/Route access via these paths |
| **Diagnostics/helper after RLS** | Compatibility must be **verified** after RLS planning. Diagnostics remains **read-only** and **non-publication**. **Do not** create or keep bypass access for diagnostics without **separate approval**. **No** branch choice is selected here among: keep current high-privilege behavior if approved; change role/pattern; disable diagnostics in some environments until separately gated. | Contract + ADR + helper uses service key (`scripts/lib/phase2-readonly-diagnostics-helper.mjs` **L104–L116** — cited as **review finding**, not execution). | **YES** — dedicated compatibility plan/audit still required. | RLS work must not silently break or “special-case” diagnostics without a gate. | Bypass “for diagnostics”; integration approval |
| **Negative tests** | Mandatory as **owner/security intent**; they are **not** already written, run, or passing. Required future tests: **anon** denied; **authenticated** denied; **frontend** direct DB denied; **Route** raw table access denied; **PSA** raw table access denied; **writes** denied unless explicitly approved; **no** raw evidence leaks to runtime/PSA/Route; **diagnostics** output does not become publication truth. **Frontend** direct DB denial may require **architecture/role** verification, not only SQL-level checks. | Owner Gate 30 instruction. | **YES** — test plan + execution belong to future gates. | Tests are **acceptance criteria**, not completed work. | Claiming tests pass; skipping architecture verification |
| **Staging apply isolation** | **Staging apply planning** may be considered **next** (still subject to separate gates and artifacts). | Owner Gate 30 instruction; this record outcome (§6). | **YES** — apply plan, rollback, verification, diagnostics plan still outstanding. | “Next” means **planning**, not execution. | Executing staging apply from this record |
| **Production apply separation** | **Production apply** is **separate** and **not** approved. **No** staging outcome may be treated as production proof. **Parity** must include PostgreSQL version, table owner, role/bypass behavior, and policy/role assumptions — **not** major version alone. | Owner Gate 30 instruction. | **YES** — production apply remains gated independently. | Staging evidence does not transfer automatically. | Production apply; inferring production readiness from staging checks alone |
| **Rollback** | **Mandatory** before any apply gate: pre-apply snapshot/checklist, rollback order, policy drop / RLS disable strategy, executor identity, rollback criteria, post-rollback verification. **Do not** write concrete rollback SQL **in this Gate 30 record**. | Owner Gate 30 instruction. | **YES** — concrete rollback SQL belongs to a future apply/migration artifact gate, not here. | Process requirement is **binding for planning**, not executed here. | Apply without rollback planning |
| **Admin dashboard future owner/admin view boundary** | A future admin dashboard may show **only** processed, readable, **action-oriented problematic** cases requiring owner/admin review. It must **not** show all Phase 2 rows, raw JSON, raw evidence dumps, all candidates, or **clean happy-path** cases as a default stream. **No** dashboard integration is approved here. **No** new server routes approved here. **No** UI reads from Phase 2 approved here. **No** direct Supabase/dashboard client connection to raw Phase 2 tables approved here. | Owner Gate 30 instruction. | **YES** — any future implementation remains behind full-contour gates. | UX boundary is **policy for later work**, not an implementation ticket. | Dashboard wiring; raw access; “show everything” |
| **Child-information protection principle** | Because Min Veg works with and for information about **children**, **security**, **privacy**, **truthful presentation**, and **data minimization** **override speed**. This principle is a **veto** against shortcuts that expose raw evidence or half-closed flows. | Owner Gate 30 instruction; aligns with Gate 24 child-protection posture. | **NO** (principle is adopted as decision input). | Shapes all later trade-offs. | Using speed to justify raw exposure |

---

## 6. Apply-readiness outcome

**`READY_FOR_STAGING_RLS_APPLY_PLANNING_ONLY`**

**Meaning (strict):**

- A **future staging RLS apply planning** gate may be **prepared** (documentation/planning artifacts), subject to §8 items and separate owner-approved execution gates.  
- This outcome **does not** execute SQL.  
- This outcome **does not** approve RLS enablement in any database.  
- This outcome **does not** approve policy creation in any database.  
- This outcome **does not** approve DB writes.  
- This outcome **does not** approve runtime/write, app, **admin dashboard**, PSA, Route, Phase 3, or **production** apply.  

---

## 7. What remains blocked

Until separate owner-approved security and implementation gates:

- SQL execution  
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
- **Production apply**  
- Partial integration  

---

## 8. Required next planning items before staging apply

**Review finding:** the following are **planning artifacts / decisions** still required before a **staging apply execution** gate — **not executed** by this record.

- Staging apply plan (scope, roles, order, who executes)  
- Exact apply SQL selection: **Option A vs Option B** (per `phase-2-rls-policy-sql-draft.md` **§7**)  
- **`FORCE ROW LEVEL SECURITY`** final yes/no with role/table-owner reasoning  
- Role / table-owner / bypass check documented for the **actual** staging database  
- Diagnostics/helper compatibility plan (no bypass without approval)  
- Negative access test plan (including architecture checks for “frontend direct DB denied”)  
- Rollback plan (including executor identity and verification criteria) — **without** embedding rollback SQL in this record  
- Post-apply verification plan  
- **No** app/runtime integration until **full contour** owner approval  

---

## 9. Final boundary statement

Phase 2 RLS apply readiness may be decision-recorded here, but SQL execution, RLS enablement, policy creation, DB writes, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
