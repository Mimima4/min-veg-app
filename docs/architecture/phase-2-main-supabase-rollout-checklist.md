# Phase 2 Main Supabase Rollout Checklist

## 1. Status / boundary

- Status: **CLOSED / COMPLETE — Phase 2 additive schema rollout to main only** — see §13–§15.
- Broader Phase 2 programme effort (identity/location resolution, data fill, future integrations) is **not** closed by this document; separate owner gates apply.
- This file is both a historical checklist/runbook and execution + closure evidence for **that schema rollout**; §3–§10 are historical preflight/apply procedure and must not be read as current pending apply status.
- This checklist does not approve apply or downstream integrations by itself. **No SQL, migration, or DB execution is performed by this document** (this Markdown file does not run tools); factual apply and post-apply verification are recorded in **§13–§15**.
- No backfill.
- No runtime/write integration.
- No Route Engine/UI/billing changes.
- No PSA publication changes.
- No operator workflow enablement.
- This closure does not approve readiness or pipeline integration; standalone read-only diagnostics/helper boundaries remain per Phase 2 helper ADR/contract.

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
11. Confirm backup/restore readiness is evidence-confirmed and owner-accepted:
    - current backup/PITR status or backup window is known;
    - restore procedure is known/available;
    - owner explicitly accepts restore posture for this controlled additive migration;
    - if any of the above cannot be confirmed, STOP.
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
11. Backup/restore readiness is not evidence-confirmed or owner-accepted.

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
- Main post-apply read-only smoke completed; see **§14** and **§15 Checklist closure**.

## 12. Main preflight/dry-run result

Status:

- **MAIN PREFLIGHT DRY-RUN PASSED**
- Target: `project_ref=bgmtxyfchtqjuvzuuoon`

Confirmations:

1. Git/integrity:
   - branch is `main`;
   - working tree clean except allowed transient `supabase/.temp`;
   - HEAD SHA: `db3ba10c9f206fa155b29f71047b708e7a8d1fa2`;
   - migration SHA256 matched:
     - `bc72a924bcba216a2009662aee91d874772d7b1d694f51df9a9832ccdeaa4549`.
2. Target confirmation:
   - linked target is main `project_ref=bgmtxyfchtqjuvzuuoon`;
   - target is not `my-app-test` / `egalvhjvdvmoqboxbwzo`.
3. Migration history confirmation:
   - remote migration history does not contain `20260506112154`.
4. Dry-run confirmation:
   - dry-run planned only:
     - `20260506112154_school_identity_location_resolution_phase2.sql`.
5. Backup/restore gate:
   - owner confirmed backup/restore readiness.
6. `pgcrypto` main check:
   - `name=pgcrypto`;
   - `default_version=1.3`;
   - `installed_version=1.3`.
7. Build gate:
   - `rm -rf .next && npm run build` passed.

Scope note:

- **Pre-apply snapshot (§12):** at the time this section was written, preflight/dry-run had passed; main apply was **not yet** reflected here in the document timeline.
- The «main apply not executed» wording above applies **only to this §12 snapshot** and is **superseded** by **§13–§15** (factual main apply, smoke, and checklist closure for schema-only scope).
- Runtime/write integration remains **blocked**.

## 13. Main apply result

Status:

- **MAIN APPLY COMPLETED**
- Target: `project_ref=bgmtxyfchtqjuvzuuoon`

Apply execution:

- Command executed: `npx supabase db push --linked`
- Applied migration:
  - `20260506112154_school_identity_location_resolution_phase2.sql`
- `pgcrypto` notice:
  - extension already exists, skipping.

Pre-apply confirmation:

- Remote migration history did not contain `20260506112154`.

Post-apply confirmation:

1. Remote migration history now contains `20260506112154`.
2. All 7 Phase 2 tables exist:
   - `source_school_observations`
   - `school_identity_candidates`
   - `identity_aliases`
   - `school_locations`
   - `school_identity_resolution_decisions`
   - `programme_availability_publication_decisions`
   - `school_identity_review_events`
3. Estimated row count for all 7 tables is `0`.
4. Required indexes exist:
   - `uq_res_active_obs`
   - `uq_pub_active_obs_prog_stage`

Operational boundary confirmation:

- Schema only.
- Runtime/write integration remains blocked.
- No backfill.
- No PSA publication changed.
- No operator workflow enabled.
- No manual SQL.
- No code/script changes.
- No Route Engine/UI/billing changes.

Next gate (historical; superseded by checklist closure):

- main post-apply read-only smoke completed; see **§15 Checklist closure**.

## 14. Main post-apply read-only smoke result

Status:

- **MAIN POST-APPLY SMOKE PASSED**
- Target: `project_ref=bgmtxyfchtqjuvzuuoon`

Confirmations:

1. Migration history:
   - remote migration history includes `20260506112154`.
2. Table existence:
   - all 7 Phase 2 tables exist:
     - `source_school_observations`
     - `school_identity_candidates`
     - `identity_aliases`
     - `school_locations`
     - `school_identity_resolution_decisions`
     - `programme_availability_publication_decisions`
     - `school_identity_review_events`
3. Row counts:
   - all 7 tables have estimated row count `0`.
4. Key indexes:
   - `uq_res_active_obs` exists;
   - `uq_pub_active_obs_prog_stage` exists.
5. Isolation confirmation:
   - no backfill;
   - no runtime/write integration;
   - no manual SQL;
   - no Route Engine/UI/billing changes;
   - no operator workflow enablement;
   - no sample data in main;
   - PSA publication unchanged.
6. Build confirmation:
   - `rm -rf .next && npm run build` passed on first attempt.

Limitation:

- Optional script smoke against main was not run because safe env vars were not available in this session.
- This is not a blocker for schema smoke and may be run later as read-only diagnostics smoke when env is available.

Schema rollout status:

- **PHASE 2 SCHEMA ROLLOUT COMPLETE**
- Runtime/write integration remains blocked.
- No backfill.
- No PSA publication change.
- No operator workflow enabled.

Next gate (historical; superseded by checklist closure):

- owner decision between read-only integration planning and freeze/no further action; see **§15 Checklist closure**.

## 15. Checklist closure

- Main schema rollout and main post-apply read-only smoke are **complete**.
- This checklist’s execution lifecycle is **closed** for Phase 2 schema rollout.
- Phase 2 schema rollout is **frozen** at schema-only scope: no assumed approval for runtime/write integration, operator workflow, PSA publication changes, or backfill.
- Future integration or follow-on work must open a **separate owner gate** (e.g. Phase 2 read-only integration planning).
