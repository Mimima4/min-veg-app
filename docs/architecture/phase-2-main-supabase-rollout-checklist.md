# Phase 2 Main Supabase Rollout Checklist

## 1. Status / boundary

- Status: **PROPOSED / NOT EXECUTED**
- This checklist does not approve main apply by itself.
- No SQL execution is performed by this document.
- No migration execution is performed by this document.
- No DB writes are performed by this document.
- No backfill.
- No runtime/write integration.
- No Route Engine/UI/billing changes.
- No PSA publication changes.
- No operator workflow enablement.

## 2. Tested evidence from `my-app-test`

Evidence already established in test cycle:

1. Additive migration applied successfully.
2. All 7 Phase 2 tables created.
3. Initial row counts are 0.
4. Key indexes exist:
   - `uq_res_active_obs`
   - `uq_pub_active_obs_prog_stage`
5. Read-only diagnostics empty-table smoke passed.
6. Synthetic sample execution passed.
7. Sample cleanup returned marker counts to 0.
8. No runtime/write integration was enabled.

## 3. Main preflight checklist

Before any main apply attempt:

1. Confirm exact main `project_ref`.
2. Confirm owner-approved project label.
3. Confirm target is main Supabase (not test, not ambiguous).
4. Confirm git branch is `main`.
5. Confirm clean working tree (except allowed transient `supabase/.temp` link state).
6. Confirm migration file path:
   - `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`
7. Confirm migration SHA256 equals:
   - `bc72a924bcba216a2009662aee91d874772d7b1d694f51df9a9832ccdeaa4549`
8. Confirm remote migration history does not already include `20260506112154`.
9. Confirm `pgcrypto` is installed/allowed.
10. Confirm dry-run plans only:
    - `20260506112154_school_identity_location_resolution_phase2.sql`
11. Confirm backup/restore confidence is acknowledged by owner.
12. Confirm there are no pending unexpected migrations.

## 4. Allowed apply scope

Allowed:

- Apply only:
  - `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`
- Additive schema change only.

Forbidden:

- Backfill.
- Sample data insertion in main.
- Runtime/write integration.
- Route Engine changes.
- UI/billing changes.
- PSA writes/publication changes.
- Operator workflow enablement.
- Manual SQL outside migration framework.
- `supabase db reset`.

## 5. Final approval phrase

Use exact approval template before apply:

I approve applying migration 20260506112154_school_identity_location_resolution_phase2.sql to MAIN project_ref=[EXACT_MAIN_REF] as an additive-only schema change, with no backfill and no runtime integration. I confirm this is the intended main Supabase environment and that production runtime behavior must remain unchanged.

## 6. Apply command plan

1. Use one controlled apply command only.
2. Confirm link and dry-run immediately before apply.
3. No parallel apply actions.
4. Fail-fast on non-zero exit.
5. No blind retry.

## 7. Post-apply verification (read-only)

After apply:

1. Migration history includes `20260506112154`.
2. All 7 Phase 2 tables exist.
3. Row counts remain 0.
4. `uq_res_active_obs` exists.
5. `uq_pub_active_obs_prog_stage` exists.
6. `pgcrypto`/`gen_random_uuid` available if checkable.
7. No RLS/policies/grants added by migration.
8. No runtime/truth table changes.
9. Build passes.

## 8. Stop conditions

STOP immediately if any condition occurs:

1. Target ambiguous.
2. Wrong `project_ref`.
3. Migration already applied.
4. Dry-run shows unexpected migrations.
5. Hash drift from approved SHA.
6. `pgcrypto` mismatch.
7. No explicit approval phrase.
8. Dirty git beyond allowed transient `supabase/.temp`.
9. Any apply error.
10. Any post-apply verification failure.

## 9. Rollback awareness

- Change is additive-only.
- Rollback only before any future data/write integration.
- Rollback must not touch existing runtime/truth tables.
- Do not drop `pgcrypto` unless platform-owned and safe.
- Rollback requires separate decision gate.

## 10. Security boundary after main apply

Main apply does not enable:

- public/family/mobile direct table access;
- operator workflow;
- manual truth;
- runtime consumption.

New tables remain internal/unreferenced until separate integration approval.

## 11. Final status after successful main apply

- **APPLIED TO MAIN SCHEMA ONLY**
- Runtime/write integration still blocked.
- PSA publication unchanged.
- Next gate: main post-apply read-only smoke.
