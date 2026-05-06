# Phase 2 Read-Only Diagnostics Sample Data Runbook

## 1. Status / boundary

- Status: **PROPOSED / NOT EXECUTED**
- Target: `my-app-test` only.
- Never run against main/prod.
- No runtime integration.
- No PSA writes.
- No Route Engine/UI/billing changes.
- No real family/user data.
- Synthetic sample data only.

## 2. Sample marker

Use marker:

- `source_snapshot_label = "phase2_diag_sample_v1"`

Also include same marker in:

- `decision_reason_codes`
- evidence references
- `audit_ref`

where applicable for test traceability and cleanup safety.

## 3. Sample goals

Prove diagnostics behavior for:

- `observationsCount`
- `resolutionDecisionCount`
- `publicationDecisionCount`
- `publishableCount`
- `needsReviewCount`
- `unsupportedCount`
- `unresolvedCount`
- `identityResolutionBySchoolCode` aggregation
- latest decision rule
- fallback key `unknown::<index>`
- no runtime/write integration

## 4. Summary count semantics

- Summary counters are row-based diagnostic counts, not unique-school counts.
- `identityResolutionBySchoolCode` provides per-school aggregates/flags.
- One school can contribute to multiple row-based counters when both resolution and publication rows exist.

## 5. Minimal sample rows (planned, not executed)

### `source_school_observations` (5 rows)

Run scope:

- `profession_slug = electrician`
- `county_code = 56`
- `source_snapshot_label = phase2_diag_sample_v1`

Rows:

1. `SC-PUB-01` — publishable scenario
2. `SC-REV-01` — needs_review scenario
3. `SC-UNS-01` — unsupported scenario
4. `SC-UNR-01` — unresolved scenario
5. empty `source_school_code` — fallback key `unknown::0001`

### `school_identity_resolution_decisions` (6 rows)

1. `SC-PUB-01`: `decision_state = publishable`
2. `SC-REV-01`: `decision_state = needs_review`
3. `SC-UNS-01`: `decision_state = unsupported_losa`
4. `SC-UNR-01`: `decision_state = identity_unresolved`
5. unknown row older: `decision_state = needs_review`
6. unknown row newer: `decision_state = external_delivery`

### `programme_availability_publication_decisions` (3 rows planned)

1. `SC-PUB-01`: `publishability_state = publishable`
2. `SC-REV-01`: `publishability_state = needs_review` if supported by current CHECK vocabulary; otherwise skip and use fallback expected counts
3. `SC-UNS-01`: `publishability_state = blocked`

## 6. Expected output

### If publication `needs_review` row is supported

- `observationsCount = 5`
- `resolutionDecisionCount = 6`
- `publicationDecisionCount = 3`
- `publishableCount = 1`
- `needsReviewCount = 3`
- `unsupportedCount = 3`
- `unresolvedCount = 1`
- `identityResolutionBySchoolCode` keys:
  - `SC-PUB-01`
  - `SC-REV-01`
  - `SC-UNS-01`
  - `SC-UNR-01`
  - `unknown::0001`
- `unknown::0001.latestDecisionState = external_delivery`

### If publication `needs_review` row is not supported

- `publicationDecisionCount = 2`
- `needsReviewCount = 2`
- all other relevant expectations adjusted accordingly

## 7. Insert execution boundary

- Insert step requires explicit approval before execution.
- Execute only against `my-app-test`.
- Never against main/prod.
- Controlled SQL only.
- No migration file changes.
- No runtime code changes.
- No PSA writes.
- Service-role/operator-owned test execution only.

## 8. Cleanup plan

- Delete only sample rows from new Phase 2 tables.
- Identify rows by `source_snapshot_label = phase2_diag_sample_v1` and linked `observation_id`.
- Delete child rows first:
  1. `programme_availability_publication_decisions`
  2. `school_identity_resolution_decisions`
  3. `source_school_observations`
- Do not touch existing runtime/truth tables.
- Verify marker counts return to `0`.

## 9. Safety checks before execution

1. Confirm `project_ref=egalvhjvdvmoqboxbwzo` / `my-app-test`.
2. Confirm environment is not main/prod.
3. Confirm sample marker value.
4. Confirm tables currently have no marker rows.
5. Confirm baseline script output for county `56` is zero-count diagnostics before insert.

## 10. Risks

- sample rows left behind;
- sample data confused with real decisions;
- wrong environment execution;
- cleanup filter mistakes;
- hidden manual truth interpretation.

## 11. Next gate

1. Review/approve this sample insert/cleanup runbook.
2. Execute sample insert in `my-app-test` only.
3. Run diagnostics script.
4. Verify expected output.
5. Cleanup sample rows.
6. Verify cleanup counts.
