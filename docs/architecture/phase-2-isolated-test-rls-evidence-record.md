# Phase 2 Isolated Test Supabase RLS Evidence Record

## 2. Snapshot / status

- **Status:** temporary test evidence record / docs-only
- **Scope:** isolated test Supabase RLS/policy validation
- **Repository checkpoint:** `d73d307 Add Phase 2 problem contour activation map`
- **Created at (UTC):** 2026-05-10
- **Not main apply approval**
- **Not owner-used Supabase apply approval**
- **Not production apply approval**
- **Not SQL execution authorization for main**
- **Not RLS approval for main**
- **Not DB write approval for main**
- **Not runtime/write approval**
- **Not admin dashboard integration approval**
- **Not app integration approval**
- **Not PSA approval**
- **Not Route approval**
- **Not Phase 3 approval**
- **Not Phase 4/source-truth execution approval**
- **Not Gate 34B main/manual execution approval**
- **Not full-contour readiness proof**
- **No partial integration authorization**
- **Temporary evidence lifecycle applies**

## 3. Evidence source / attestation

- Evidence comes from **manual** isolated test Supabase SQL runs performed by the owner/executor.
- Evidence was **owner-supplied in redacted form** for this record.
- The **exact test project identifier is intentionally not recorded** here.
- **No** project ref, dashboard URL, secrets, keys, raw rows, or production identifiers are recorded in this file.
- This record does **not** contain raw child/evidence rows.
- This record does **not** quote SQL execution blocks from migrations or execution packets; only **paths** and **summarized outcomes** appear below.
- This is a **lab-style temporary evidence record**, not a normative architecture spec.

## 4. Environment boundary

- **Isolated test Supabase only** — not connected to the application.
- **Main / owner-used Supabase** was **not** touched.
- **Production** was **not** touched.
- **App env** was **not** modified.
- **Supabase CLI** was **not** used.
- **Migrations** in the repository were **not** modified.
- **No** app / admin / Route / PSA / runtime integration occurred as part of this work.
- This evidence **must not** be treated as main/app readiness.

## 5. T0 schema bootstrap result

- Isolated test Supabase **initially had none** of the seven Phase 2 tables.
- The existing Phase 2 migration was **manually applied** to isolated test Supabase **only**, from the committed repository path:  
  `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`  
  (SQL text is **not** quoted in this record.)
- **After bootstrap:**
  - **7/7** Phase 2 tables exist
  - **Schema:** `public`
  - **Row counts:** `0`
  - **Policy count:** `0`
  - **Table owner:** `postgres` (all seven)
  - **RLS enabled:** `true` on all seven tables
  - **FORCE RLS:** `false` on all seven tables
- **Interpretation:** the migration baseline **already enables RLS** on these tables while **no** policies existed yet.

## 6. S1 read-only snapshot result

- **Suggested snapshot category:** `S1_SNAPSHOT_READY_FOR_OWNER_REVIEW`
- **table_count:** `7`; **distinct_owner_count:** `1`
- **visible_phase2_table_count:** `7`
- **rls_enabled_table_count:** `7`
- **rls_forced_table_count:** `0`
- **total_existing_policy_count:** `0`
- **Planned `p2_deny_*` collision check:** `collision_count = 0`
- **Owner / BYPASS facts:** captured (`S1_OWNER_BYPASS_FACTS_CAPTURED`); **`owner_role_not_visible_count = 0`**, **`current_role_not_visible_count = 0`**; see §7 for interpretation.
- **Client roles:** `anon` and `authenticated` exist; **`role_has_bypassrls = false`** for both; **`role_can_login = false`** for both (`OK_CLIENT_ROLE_NO_BYPASSRLS`).
- **Warning — client privileges:** `anon` and `authenticated` have **SELECT/INSERT/UPDATE/DELETE** privileges on all seven Phase 2 tables. Privileges are **broad**; **RLS + deny policies + negative tests** are therefore a **mandatory** security layer (not a panic outcome).

## 7. BYPASSRLS / owner interpretation

- Table owner / current SQL editor session exhibited **BYPASSRLS-related facts** in the captured snapshot (`owner_bypassrls_true_count = 7`, `current_or_session_bypassrls_true_count = 1` in redacted summary).
- This **does not** mean **client-role** negative tests are meaningless: **`anon` / `authenticated`** were shown **without BYPASSRLS** and were exercised separately.
- It **does** mean **SQL editor / owner-like** paths are **high-privilege** and **must not** be confused with **product access** paths.
- **`service_role` / owner / BYPASSRLS`** paths remain **separate risk surfaces** for **main/app** contexts and are **not** fully resolved by this isolated test.
- This isolated test **does not** resolve **FORCE RLS** or full **high-privilege production access design**.

## 8. S2 deny-policy apply and verification result

- **Scope:** isolated test Supabase **only**.
- **Pattern:** Option B deny policies (from Gate 34A packet shape), applied manually.
- **Guards observed:** no **FORCE RLS** activation; no **`service_role` allow** policy; no **GRANT/REVOKE**; no **data DML**; no app/admin/Route/PSA/runtime integration.
- **Verification (`S2_POLICIES_CREATED_AND_VERIFIED`):**
  - **14/14** `p2_deny_*` policies created
  - All policies **RESTRICTIVE**, **`FOR ALL`**, roles **`anon` / `authenticated`**, **`USING (false)` / `WITH CHECK (false)`**
  - **RLS** remains enabled on all seven tables; **FORCE RLS** remains `false`
  - **`extra_policy_count = 0`**

## 9. S3 negative tests result

- **Context:** tests were performed in **SQL editor / session-role** context (**not** through real app **JWT / PostgREST / client** integration).
- **S3A — SELECT:** `authenticated` and `anon` **SELECT counts = 0** on **all seven** tables.
- **S3B — INSERT:** `anon` and `authenticated` **INSERT** into `source_school_observations` **failed** with:  
  `ERROR 42501: new row violates row-level security policy`  
  (error class only; no row payload recorded here.)
- **S3B — UPDATE/DELETE:** did **not** modify/delete the synthetic row as `anon` / `authenticated`.
- **Intermediate check (inside controlled test):** `remaining_rows = 1` with original label unchanged where applicable during the write test narrative.
- **Residue:** after rollback / cleanup narrative, **residue = 0** on **all seven** tables.
- **Synthetic data:** used **only** inside a transaction scope and **rolled back**; **no** raw child/evidence rows.

## 10. S4 rollback result

- **Policy-only rollback:** all `p2_deny_*` policies **dropped**.
- **Post-rollback (`S4_POLICY_ROLLBACK_VERIFIED`):**
  - **visible_phase2_table_count:** `7`
  - **rls_enabled_table_count:** `7`
  - **rls_forced_table_count:** `0`
  - **total_policy_count_after_rollback:** `0`
- **Current final state (isolated test, after S4):** Phase 2 **schema exists** (seven tables); **RLS** remains **enabled** from migration baseline; **FORCE RLS** remains **`false`**; **`p2_deny_*` policies** are **removed**; **no** synthetic test data remains (per redacted residue checks).

## 11. What this proves

Every bullet below is **only** about the **isolated test project**.

- In the isolated test project, the schema supports the **seven** Phase 2 tables after T0 bootstrap.
- In the isolated test project, **Option B** deny policies were **syntactically valid** and **catalog-verified** after S2.
- In the isolated test project, **`anon` / `authenticated`** were **denied SELECT** on all seven tables in the **SQL role-switch** test context (S3A).
- In the isolated test project, **`anon` / `authenticated`** were **denied INSERT** on `source_school_observations` with **42501** RLS policy violations in the **SQL role-switch** test context (S3B).
- In the isolated test project, **`anon` / `authenticated`** did **not** UPDATE/DELETE the synthetic row in the **SQL role-switch** test context (S3B).
- In the isolated test project, **rollback** removed the `p2_deny_*` policies cleanly while leaving the migration **RLS baseline** intact (S4).
- In the isolated test project, **no** synthetic residue remained after the controlled test and rollback narrative (S3/S4).

## 12. What this does NOT prove

- Main / **owner-used** Supabase safety or parity
- **Production** readiness
- **App / frontend** behavior
- **Actual API / client / JWT / PostgREST** behavior
- **Admin dashboard** integration
- **Route / PSA** integration
- **Diagnostics/helper** compatibility in a **real app** context
- **Phase 4 / source-truth** contour operation
- **Full automatic contour** operation as **one validated organism**
- **FORCE RLS** decision
- **`service_role` / high-privilege** path design for product contexts
- **Gate 34B** main/manual execution approval

## 13. Main apply / full-contour readiness rule

- **Main / owner-used Supabase apply is blocked** on the basis of this evidence alone.
- **Main apply** may be considered **only after** all relevant contours work **automatically** as **one validated organism in test mode**, per owner decision.
- **Required future validation** (non-exhaustive; owner-gated) includes:
  - Source-truth / **Phase 4** source identification and trust validation
  - Periodic **authentic** data pulls
  - Deterministic processing of **trusted** data
  - **Problem-contour** processing
  - **Diagnostics/helper** compatibility
  - **App/client** behavior
  - **API / JWT / PostgREST** negative tests where applicable
  - **Rollback / observability**
  - **Owner-approved** main apply planning
- **Isolated RLS evidence alone must never be used as main apply approval.**

## 14. Temporary lifecycle / cleanup boundary

- This file is **temporary test evidence**.
- It is useful **before** main/app/full-contour validation supersedes it.
- It **must not** become a **permanent architecture source of truth**.
- **Do not** cite it as normative spec once **replacement evidence** exists.
- Once main/app/contour validation supersedes it, treat this file as a **cleanup candidate** only.
- **Deletion must not** happen automatically.
- **Deletion** requires a **separate owner-approved cleanup gate**.
- That cleanup gate must verify **replacement evidence exists** before deletion.

## 15. Follow-up gates / blocked items

- Main / owner-used Supabase **read-only** snapshot and parity checks
- **Main apply planning** only after **full test-contour validation** as one organism
- **App/client** negative tests when the app connects to the real target
- **API / JWT / PostgREST** negative tests where applicable
- **Diagnostics/helper** compatibility in real app context
- **FORCE RLS** decision
- **`service_role` / high-privilege** access design
- **Phase 4 / source-truth** contour validation
- **Production apply** still blocked
- **Admin / app / Route / PSA** integration still blocked

## 16. Evidence outcome

**ISOLATED_TEST_RLS_EVIDENCE_RECORDED_TEMPORARY**

This means isolated test evidence is recorded. It does **not** approve main apply. It does **not** approve owner-used Supabase apply. It does **not** approve production apply. It does **not** approve Gate 34B main/manual execution. It does **not** approve app/admin/Route/PSA/runtime integration. It does **not** replace future main/app/full-contour validation. It is **temporary** and later cleanup-eligible **only** after replacement evidence exists.

## 17. Final boundary statement

Phase 2 isolated test RLS evidence is recorded here as temporary validation evidence only, but main apply, owner-used Supabase apply, production apply, SQL execution authorization for main, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, Phase 4/source-truth execution, Gate 34B main/manual execution, and any partial app integration remain blocked until separate owner-approved gates and full automatic contour validation in test mode.
