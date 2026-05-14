# Phase 2 RLS SQL Human/Security Review Packet

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Human/security review packet |
| **Scope** | Review questions and unresolved findings for Phase 2 RLS SQL draft |
| **Repository checkpoint** | `4874cf7 Add Phase 2 RLS policy SQL draft` |
| **Created at (UTC)** | 2026-05-13 |
| **CONTEXT_WARN** | None — `git log -1 --oneline` matches expected checkpoint. |
| **Gate 27 verdict** | `SQL_REVIEW_COMPLETE_NO_APPLY_AUTHORIZATION` |
| **Gate 27 meaning (review finding)** | No scoped fenced-block blockers were found under Gate 27 read-only checks; this is **not** authorization to apply SQL, create migrations, enable RLS, or integrate runtime/app/PSA/Route/Phase 3. |
| **Not SQL approval** | Yes |
| **Not security sign-off** | Yes |
| **Not apply planning** | Yes |
| **Not migration creation** | Yes |
| **Not Supabase execution** | Yes |
| **Not RLS enablement** | Yes |
| **Not policy creation** | Yes |
| **Not DB write approval** | Yes |
| **Not runtime/write approval** | Yes |
| **Not app integration approval** | Yes |
| **Not PSA approval** | Yes |
| **Not Route approval** | Yes |
| **Not Phase 3 approval** | Yes |
| **No partial integration approval** | Yes |

---

## 3. Source basis

The following repository documents were read for context when authoring this packet:

- `docs/architecture/phase-2-rls-policy-sql-draft.md`
- `docs/architecture/phase-2-rls-policy-design-plan.md`
- `docs/architecture/phase-2-rls-security-owner-decision-record.md`
- `docs/architecture/phase-2-rls-security-review-plan.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

**This packet does not modify** any of the above files, including **`docs/architecture/phase-2-rls-policy-sql-draft.md`**.

---

## 4. Gate 27 unresolved review items

**Review finding:** the following **unresolved items** remain **open** after Gate 27. **This packet does not close them** and **does not authorize** any follow-up work.

| Unresolved item | Why it matters | Required reviewer evidence | Possible non-executing outcome | Decision required before apply planning? |
|-----------------|----------------|------------------------------|-------------------------------|------------------------------------------|
| **PostgreSQL major version / `FOR ALL` compatibility** | Draft SQL uses `CREATE POLICY ... FOR ALL` (see `phase-2-rls-policy-sql-draft.md` fenced block, **L122**, **L131+**), which is version-sensitive. | Confirmed major version for **staging** and **production** from authoritative project records or DBA; written acceptance or rejection of `FOR ALL` shape. | PostgreSQL/version discovery gate; or narrow docs revision to split policies per command. | **Yes** |
| **RLS bypass story: `service_role` / table owner / superuser / `BYPASSRLS` / `FORCE ROW LEVEL SECURITY` vs architecture** | RLS policies on `anon` / `authenticated` do not by themselves bound high-privilege paths (Gate 27 review finding). | Written model: who owns tables, which roles bypass RLS, whether `FORCE ROW LEVEL SECURITY` is in scope, and whether controls are policy-only vs architecture. | Formal security sign-off gate; narrow docs revision to capture decisions. | **Yes** |
| **Diagnostics/helper compatibility after RLS** | Read-only diagnostics use a service-like key path in helper code (Gate 27 review finding: `scripts/lib/phase2-readonly-diagnostics-helper.mjs` **L104–L116**); behavior after RLS must be reconciled with contract/ADR. | Evidence plan for post-RLS reads: role/key, failure modes, and contract compliance; no publication-truth leakage. | Diagnostics compatibility audit; narrow docs revision. | **Yes** |
| **Optional wording revision (L272 checklist title)** | A checklist heading in the SQL draft could be **misread** if skimmed (`phase-2-rls-policy-sql-draft.md` **L272**). | Reviewer notes whether rename is worth a **separate** docs-only revision gate. | Narrow SQL draft revision (docs-only); or no-op / stop for this nit. | **Optional** |

---

## 5. What Gate 27 found

**Review findings (scoped to Gate 27 rules):**

- The **fenced SQL draft block** in `docs/architecture/phase-2-rls-policy-sql-draft.md` (**L113–L246**) had **no** Gate-27-scoped **blockers** under the read-only checks (forbidden constructs were checked **inside the fence only**; markdown checklist examples outside the fence were excluded from those checks).  
- **No permissive policies** were identified **inside the fenced SQL draft** — policies reviewed used `USING (false)` / `WITH CHECK (false)` for `anon` and `authenticated` (**e.g. L135–L136, L142–L143**, pattern through **L245**).  
- **No** user-facing raw-table access pattern (**“authenticated can select own rows”** style) was identified **in the fenced SQL draft**.  
- **No** `service_role` **allow** policy was identified **in the fenced SQL draft**.  
- **No** Route / PSA / app raw-table access policy was identified **in the fenced SQL draft**.  

**Not authorized by this packet or by Gate 27:** SQL apply, migration creation, RLS enablement in any database, runtime/write, app integration, PSA, Route, Phase 3, or partial integration.

---

## 6. Human/security review questions

| Review area | Question | Why it matters | Source / finding | Possible non-executing outcomes | Decision required before next gate? |
|-------------|----------|----------------|------------------|-----------------------------------|-------------------------------------|
| **PostgreSQL major version / `FOR ALL` compatibility** | Is `FOR ALL` acceptable on staging and production Postgres versions? | Mismatch breaks apply or creates partial coverage. | SQL draft **L111, L122**, fenced policies **L131+** | PostgreSQL/version discovery gate; narrow docs revision; keep draft as-is for later review | **Yes** |
| **Policy command coverage** | Should policies be split per `SELECT` / `INSERT` / `UPDATE` / `DELETE` for clarity and tooling? | Affects reviewability and test mapping. | SQL draft **L122** | Narrow docs revision; keep draft as-is for later review | **Yes** |
| **Permissive vs restrictive semantics** | Are default policy types and combination semantics acceptable for this project? | Wrong semantics can widen access unintentionally. | Gate 27 discussion of deny posture | Formal security sign-off gate; narrow docs revision | **Yes** |
| **RLS bypass: service_role-like path** | How are service-like paths constrained outside `anon`/`authenticated` policies? | Service-like paths may bypass RLS depending on configuration. | Gate 27 review finding; helper **L104–L116** | Diagnostics compatibility audit; formal security sign-off gate | **Yes** |
| **RLS bypass: table owner / superuser / BYPASSRLS** | Who owns the tables and which roles bypass RLS? | Owner/bypass can invalidate “deny client roles” story. | SQL draft §6 **L80–L82** | Formal security sign-off gate; PostgreSQL/version discovery gate | **Yes** |
| **`FORCE ROW LEVEL SECURITY`** | Is `FORCE` required for any table, and under what role model? | Impacts owner/service-like behavior vs operational breakage risk. | SQL draft comments **L124–L131** pattern | Formal security sign-off gate; narrow docs revision | **Yes** |
| **Diagnostics/helper access after RLS** | What is the supported read path after RLS, still consistent with contract/ADR? | Risk of breaking diagnostics or leaking publication-truth semantics. | Contract + ADR + helper **L92–L116** | Diagnostics compatibility audit; narrow docs revision | **Yes** |
| **No-copy-paste / migration placement discipline** | How will the org prevent accidental execution from docs? | Human process failure mode. | SQL draft warnings **L66–L74**, **L114–L118** | Formal security sign-off gate; narrow docs revision | **Yes** |
| **Staging vs production separation** | What evidence will prove staging outcomes do not imply production readiness? | Prevents environment confusion. | Gate 24/25 boundaries (referenced in prior gates) | Formal security sign-off gate; no-op / stop | **Yes** |
| **Child-information protection / data minimization** | What additional minimization applies if any future allow path exists? | Child-data sensitivity is non-negotiable per owner record. | Gate 24 owner record (referenced) | Formal security sign-off gate; narrow docs revision | **Yes** |
| **Optional wording revision (L272 checklist title)** | Should the checklist heading at `phase-2-rls-policy-sql-draft.md` **L272** be renamed to reduce skim risk? | Reduces misread risk; not a SQL semantic change. | `phase-2-rls-policy-sql-draft.md` **L272** | Narrow SQL draft revision; no-op / stop | **Optional** |

**Constraint:** **Do not** list “apply SQL” as an outcome in this table.

---

## 7. Required evidence for reviewer

The reviewer (human/security + owner as applicable) must obtain or confirm **evidence** — **not authorized by this packet**:

- Project **PostgreSQL major version** for **staging** and **production** (authoritative source).  
- Whether **`FOR ALL`** policy syntax is accepted on those versions.  
- Whether **explicit deny policies** vs **RLS without permissive policies** (Option A vs B in the SQL draft, **§7**) is the chosen direction — **decision required**, evidence required.  
- How **`service_role`-like** paths are controlled (architecture vs policy vs both).  
- **Who owns** the Phase 2 tables in staging and production (role / migration identity).  
- Whether **table owner / migration role / service-like roles** can **bypass RLS** in this stack.  
- Whether **`FORCE ROW LEVEL SECURITY`** is required — **decision required**, evidence required.  
- How **diagnostics/helper** would read after RLS (role/key, bypass behavior, fail modes) consistent with contract/ADR.  
- **Which role/key** would run **negative tests** in staging.  
- **Anon** negative test expectations (documented).  
- **Authenticated** negative test expectations (documented).  
- **Service-like-path** negative or controlled-path expectations (documented).  
- How **staging apply** would be **isolated** from production (process + credentials).  
- **Rollback evidence** expectations before any apply (snapshot/plan — documentation of process, not execution here).  
- What **negative tests** are required (catalog).  
- How **child-information exposure** is minimized under any future path (principle check).  

---

## 8. Reviewer sign-off placeholder

**Review finding:** this table is a **placeholder only**. **This packet does not fill it** and **does not imply** sign-off.

| Reviewer | Date | Decision | Required follow-up | Notes |
|----------|------|----------|--------------------|--------|
| Human/security reviewer | PENDING | PENDING | PENDING | **Not authorized by this packet** |
| Owner | PENDING | PENDING | PENDING | **Not authorized by this packet** |

---

## 9. What reviewer must NOT conclude

- Gate 27 does **not** approve apply.  
- This packet does **not** approve SQL.  
- This packet does **not** approve migration.  
- This packet does **not** approve security sign-off.  
- This packet does **not** approve RLS enablement.  
- This packet does **not** approve DB writes.  
- This packet does **not** approve writes/runtime/app/PSA/Route/Phase 3.  
- This packet does **not** approve partial integration.  
- **Grep-clean** fenced SQL (or absence of forbidden substrings in-scope) does **not** mean the overall posture is **secure** — bypass paths remain **unresolved** until evidenced and decided.  
- **Staging** outcomes do **not** prove **production** readiness.  
- The SQL draft is **not** organizational **security sign-off**.  

---

## 10. Possible next outcomes

**Review finding:** the following are **candidate next steps** — **selection does not execute** any of them.

- narrow SQL draft revision  
- PostgreSQL/version discovery gate  
- diagnostics compatibility audit  
- formal security sign-off gate  
- no-op / stop  

**Selection of an outcome does not execute it.**

---

## 11. Final boundary statement

Phase 2 RLS SQL human/security review is packetized here for decision support only, but SQL approval, RLS enablement, policy creation, DB writes, runtime/write integration, PSA publication, Route Engine consumption, Phase 3, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
