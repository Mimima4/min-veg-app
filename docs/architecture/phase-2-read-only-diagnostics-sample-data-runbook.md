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
- no runtime/write integration

Note:

- `unknown::<index>` fallback cannot be tested through current DB sample inserts because `source_school_code` is constrained as `NOT NULL` and non-empty by schema.
- Fallback key behavior should be covered later by unit/fixture-level testing, not DB insert sample.

## 4. Summary count semantics

- Summary counters are row-based diagnostic counts, not unique-school counts.
- `identityResolutionBySchoolCode` provides per-school aggregates/flags.
- One school can contribute to multiple row-based counters when both resolution and publication rows exist.

## 5. Minimal sample rows (planned, not executed)

### `source_school_observations` (4 rows)

Run scope:

- `profession_slug = electrician`
- `county_code = 56`
- `source_snapshot_label = phase2_diag_sample_v1`

Rows:

1. `SC-PUB-01` — publishable scenario
2. `SC-REV-01` — needs_review scenario
3. `SC-UNS-01` — unsupported scenario
4. `SC-UNR-01` — unresolved scenario

Required fields checklist for every planned observation row:

- `source`
- `county_code`
- `profession_slug`
- `stage`
- `source_school_code`
- `source_school_label`
- `source_reference_url`
- `source_snapshot_label`
- `observed_at`

Constraints to respect:

- `source_school_code` must be non-empty.
- `source_school_label` must be non-empty.
- `source_snapshot_label` must be `phase2_diag_sample_v1`.
- no real family/user data.

### `school_identity_resolution_decisions` (5 rows)

1. `SC-PUB-01`: `decision_state = publishable`
2. `SC-REV-01`: `decision_state = needs_review`
3. `SC-UNS-01`: `decision_state = unsupported_losa`
4. `SC-UNR-01` older:
   - `decision_state = needs_review`
   - `superseded_at` must be non-null
   - `superseded_by` must reference the newer `SC-UNR-01` resolution decision row
5. `SC-UNR-01` newer:
   - `decision_state = identity_unresolved`
   - `superseded_at = null`
   - `superseded_by = null`

Required fields for every planned resolution row:

- `observation_id`
- `decision_state`
- `decision_actor_type = system`
- `decision_basis_version = phase2_diag_sample_v1`
- `decision_reason_codes` JSON array containing `phase2_diag_sample_v1`
- `confidence_status` (`verified` or `needs_review`, scenario-dependent)
- `audit_ref = phase2_diag_sample_v1::<case>`
- `decided_at` deterministic timestamp
- `superseded_at` / `superseded_by` only for explicit supersession scenarios if needed

Mandatory supersession note for SC-UNR-01 pair:

- Supersession pairing is required to satisfy `uq_res_active_obs`.
- Only one active resolution decision per observation is allowed where `superseded_at IS NULL`.

### `programme_availability_publication_decisions` (3 rows planned)

1. `SC-PUB-01`: `publishability_state = publishable`
2. `SC-REV-01`: `publishability_state = needs_review`
3. `SC-UNS-01`: `publishability_state = blocked`

Required fields for every planned publication row:

- `observation_id`
- `resolution_decision_id` referencing corresponding active resolution decision
- `programme_key`
- `stage`
- `publishability_state`
- `decision_actor_type = system`
- `decision_basis_version = phase2_diag_sample_v1`
- `decision_reason_codes` JSON array containing `phase2_diag_sample_v1`
- `audit_ref = phase2_diag_sample_v1::<case>`
- `decided_at` deterministic timestamp

## 6. Expected output

### Planned expected output

- `observationsCount = 4`
- `resolutionDecisionCount = 5`
- `publicationDecisionCount = 3`
- `publishableCount = 1`
- `needsReviewCount = 3` (row-based: 2 resolution + 1 publication)
- `unsupportedCount = 2` (row-based: 1 `unsupported_losa` resolution + 1 `blocked` publication)
- `unresolvedCount = 1`
- `identityResolutionBySchoolCode` keys:
  - `SC-PUB-01`
  - `SC-REV-01`
  - `SC-UNS-01`
  - `SC-UNR-01`
- `SC-UNR-01.latestDecisionState = identity_unresolved` (newer decision wins)

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
- Require marker presence in decision/publication rows before cleanup:
  - `audit_ref` contains `phase2_diag_sample_v1`
  - `decision_reason_codes` contains `phase2_diag_sample_v1`
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
