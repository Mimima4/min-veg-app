# Norway School Identity Matching Execution Plan

## Status

Temporary planning artifact. **Delete after completion.**

**Canonical spec:** `docs/architecture/norway-school-identity-matching-spec.md`

## Purpose

Plan implementation phases for Vilbli → NSR → PSA matching without hacks, manual mappings, or architecture drift.

## Hard principles

- No manual internet-derived lookup tables.  
- No region-specific hacks.  
- No weakening fuzzy matching.  
- No random campus selection.  
- No PSA truth when identity/location is unresolved.  
- Abort is safer than false education availability.  
- All changes must follow `norway-school-identity-matching-spec.md`.

---

## Phase 0 — Current state

Document:

- **Existing conservative fuzzy patch** — generic school tokens stripped for fuzzy overlap; distinctive token overlap required; exact / core name tiers preserved.  
- **Read-only baseline before Phase 1A helper (electrician):**
  - `03` — `verification_ready_after_write` — `5/0/0` (matched/unmatched/ambiguous)
  - `11` — `verification_ready_after_write` — `13/0/0`
  - `15` — `canonical_matching_review` — `10/0/1`
  - `46` — `verification_ready_after_write` — `22/0/0`
  - `50` — `verification_ready_after_write` — `15/0/0`
  - `18` — `missing_programme_rows` — `13/0/1`
  - `55` — `missing_programme_rows` — `5/0/2`
  - `56` — `missing_programme_rows` — `2/22/0`
- **Current truth-ready counties for electrician** (`apply-route-selection-boundary` allowlist):  
  - `03` Oslo  
  - `11` Rogaland  
  - `15` Møre og Romsdal  
  - `46` Vestland  
  - `50` Trøndelag  
- **Current unsupported / problem counties** (VGS truth pipeline matching):  
  - `18` Nordland  
  - `55` Troms  
  - `56` Finnmark  
- **Current invalid assumption:**  
  **1 Vilbli school row → 1 NSR `institution_id`** (implemented via `matchedBySchoolCode` map and single PSA write per school row in `run-vgs-truth-pipeline.mjs`).

---

## Phase 1 — Safe identity parsing and abort semantics

### Goal

Implement school identity awareness **without** changing PSA schema or emitting multiple institutions.

### Phase 1A — Shared identity helper (additive)

#### Goal

Introduce one shared identity semantics helper for pipeline/readiness/cleanup scripts so alias/LOSA/multi-location signals are explicit and consistent.

#### Helper scope

- Normalize/parse school identity labels.
- Detect slash aliases.
- Detect LOSA signals.
- Detect multi-location signals.
- Produce stable reason codes for diagnostics/reporting.

#### Reason codes (Phase 1A)

- `slash_alias_detected`
- `alias_single_identity_candidate`
- `losa_unsupported`
- `multi_location_signal_detected`
- `identity_location_unresolved`
- `weak_fuzzy_rejected`
- `exact_name_candidate`
- `core_name_candidate`
- `no_nsr_candidate`
- `ambiguous_nsr_candidates`

#### Strict boundaries

- No Route Engine runtime changes.
- No PSA schema changes.
- No legacy removal.
- No matching/ranking policy changes.
- No county allowlist changes.
- No manual mappings or internet-derived overrides.
- No hidden data masking in UI/runtime.

### Scope

- Slash **alias** parsing (`/` = same identity, not two schools).  
- **LOSA** detection → unsupported / abort.  
- **Multi-location ambiguity** detection → abort.  
- **Shared helper** for matching logic used by pipeline, readiness, and cleanup scripts.  
- Preserve **exact** / **core** matching behaviour.  
- Preserve existing **green** counties (`03`, `11`, `15`, `46`, `50`).

### Files likely affected

- `scripts/run-vgs-truth-pipeline.mjs`  
- `scripts/classify-vgs-truth-readiness.mjs`  
- `scripts/cleanup-vgs-truth-contamination.mjs`  
- **New** helper under `scripts/` (e.g. shared parse + match orchestration).

### Success criteria

- `03`, `11`, `15`, `46`, `50` remain **green**.  
- `18` / `55` / `56` **fail honestly** with explicit reasons, not false matches.  
- **No PSA writes** for LOSA.  
- **No random campus** selected.

### Phase 1A validation gate

- Exact baseline table (electrician):
  - `03` — `verification_ready_after_write` — `5/0/0` (matched/unmatched/ambiguous)
  - `11` — `verification_ready_after_write` — `13/0/0`
  - `15` — `canonical_matching_review` — `10/0/1`
  - `46` — `verification_ready_after_write` — `22/0/0`
  - `50` — `verification_ready_after_write` — `15/0/0`
  - `18` — `missing_programme_rows` — `13/0/1`
  - `55` — `missing_programme_rows` — `5/0/2`
  - `56` — `missing_programme_rows` — `2/22/0`
- Hard acceptance rules:
  - Phase 1A.1 must not change `status` for any of these 8 fylke.
  - Phase 1A.1 must not change `matched/unmatched/ambiguous` counts for any of these 8 fylke.
  - Any change to status/counts is a failed integration unless explicitly approved before implementation.
- Integration boundary:
  - Helper runs only as post-processing diagnostics after existing readiness status/counts are computed.
  - Helper output must not participate in matching/ranking/status/count calculation.
  - Helper must not filter schools.
  - Helper must not make rows publishable.
  - Helper must not change PSA write behavior.
- Output compatibility:
  - Only additive fields are allowed: `details.identitySemanticsSummary`, `details.identitySemanticsBySchoolCode`.
  - Existing fields must not be renamed, removed, or type-changed.
  - New fields must use stable keys and stable types.
  - If helper fails, readiness must still return existing output with empty diagnostics or warning.
- Production-safe nationwide framing:
  - Coverage unit is `fylke × profession × stage`, not abstract county-wide coverage.
  - `green` = publishable/verified operational coverage.
  - `canonical_matching_review` = review coverage, not write expansion.
  - `missing_programme_rows` / `unsupported` = blocked coverage, not truth publication.
- No LOSA PSA write.
- No random campus selection.

### Phase 1A.1 implementation result (helper + readiness diagnostics only)

- Implementation scope completed as additive diagnostics only.
- No Route Engine runtime changes.
- No UI changes.
- No billing changes.
- No PSA write behavior changes.
- No matching/ranking/status/count logic changes.

#### Changed files

- `scripts/school-identity-semantics.mjs`
- `scripts/classify-vgs-truth-readiness.mjs`

#### Baseline after implementation (electrician)

- `03` — `verification_ready_after_write` — `5/0/0` — diagnostics: `schools=5, slash=0, losa=0, multi=0, unsupported=0, needsReview=0`
- `11` — `verification_ready_after_write` — `13/0/0` — diagnostics: `schools=13, slash=0, losa=0, multi=0, unsupported=0, needsReview=0`
- `15` — `canonical_matching_review` — `10/0/1` — diagnostics: `schools=10, slash=0, losa=0, multi=0, unsupported=0, needsReview=0`
- `46` — `verification_ready_after_write` — `22/0/0` — diagnostics: `schools=22, slash=0, losa=0, multi=1, unsupported=0, needsReview=1`
- `50` — `verification_ready_after_write` — `15/0/0` — diagnostics: `schools=15, slash=0, losa=0, multi=0, unsupported=0, needsReview=0`
- `18` — `missing_programme_rows` — `13/0/1` — diagnostics: `schools=13, slash=1, losa=0, multi=0, unsupported=0, needsReview=0`
- `55` — `missing_programme_rows` — `5/0/2` — diagnostics: `schools=5, slash=0, losa=0, multi=0, unsupported=0, needsReview=0`
- `56` — `missing_programme_rows` — `2/22/0` — diagnostics: `schools=24, slash=5, losa=18, multi=0, unsupported=18, needsReview=0`

#### Hard gate result

- Status unchanged for all 8 fylke.
- `matched/unmatched/ambiguous` unchanged for all 8 fylke.
- `helperError=false` for all 8 fylke.

#### Diagnostic findings

- `46` has multi-location signal and remains green.
- `18` has slash alias signal and remains non-green.
- `56` is LOSA-heavy with unsupported signals and remains non-green.

#### Phase status and next step

- Phase 1A.1 does **not** close Phase 1 fully.
- Next step is Phase 1A.2 design/approval before any pipeline write integration.
- No PSA write behavior was changed in Phase 1A.1.

### Phase 1A.2a — Pipeline dry-run mode requirement

#### Purpose

- Dry-run is required before any pipeline write integration in Phase 1A.2.
- Dry-run must allow safe validation of helper diagnostics, LOSA block semantics, and write-count parity without DB mutations.

#### Mutation boundaries that dry-run must block

- `runNodeScript("scripts/materialize-vgs-programmes-from-vilbli.mjs", ...)`
- `upsertEducationProgrammeByIdentity(...)`
- `ensureProfessionProgrammeLink(...)`
- `upsertAvailabilityRow(...)`
- Stale deactivation update on `programme_school_availability`
- Any future write-capable helper invoked from pipeline

#### Dry-run allowed behavior

- Extraction
- Matching
- Readiness check
- Write candidate planning
- Stale deactivation candidate planning
- Summary output

#### Dry-run forbidden behavior

- Any `insert` / `update` / `delete`
- Calling write-capable child scripts
- PSA upsert
- Stale deactivation update
- Materialization writes
- Hidden write side effects

#### Output contract

- `mode: "dry_run"`
- `profession`
- `county`
- `readinessStatus`
- `matching.matched` / `matching.unmatched` / `matching.ambiguous`
- `wouldWriteCount`
- `wouldDeactivateCount`
- `wouldSkipCount`
- `wouldBlockCount`
- `writeCandidatesSummary`
- `deactivateCandidatesSummary`
- `identitySemanticsSummary` (nullable/future)
- `safety.dbWritesExecuted=false`

#### Safety invariant

- Dry-run must be opt-in via `--dry-run`.
- Without `--dry-run`, existing behavior remains unchanged.
- If `isDryRun` and any write boundary is reached, script must plan/report instead of execute.
- Dry-run summary must always include `safety.dbWritesExecuted=false`.
- No fake dry-run: if a write-capable part cannot be safely simulated, dry-run must abort with explicit reason.

#### Validation

- `node --check scripts/run-vgs-truth-pipeline.mjs`
- Dry-run for `03` / `11` / `15` / `46` / `50` / `18` / `55` / `56`
- Readiness baseline comparison
- `rm -rf .next && npm run build`

#### Gate

- Phase 1A.2 helper/pipeline integration cannot start until Phase 1A.2a dry-run mode exists and passes validation.

### Phase 1A.2a implementation result

- Implemented in `scripts/run-vgs-truth-pipeline.mjs`.
- Added opt-in `--dry-run`.
- Added `assertCanWrite(boundaryName)` and explicit write-boundary guards.
- Added dry-run planning summary with `safety.dbWritesExecuted=false`.
- Added `dryRunLimitations` for skipped materialization parity gaps.
- Normal mode intentionally unchanged except `assertCanWrite(...)` before write boundaries.
- Normal write mode was not executed during validation.

#### Guarded write boundaries

- `runNodeScript("scripts/materialize-vgs-programmes-from-vilbli.mjs", ...)`
- `upsertEducationProgrammeByIdentity(...)`
- `ensureProfessionProgrammeLink(...)`
- `upsertAvailabilityRow(...)`
- stale `programme_school_availability` deactivation update

#### Validation result

- `node --check scripts/run-vgs-truth-pipeline.mjs` passed.
- `rm -rf .next && npm run build` passed.

#### Dry-run baseline result snapshot

- `03` — `verification_ready_after_write` — `5/0/0` — `wouldWrite=10` — `wouldDeactivate=0` — limitation: `materialization_skipped_write_candidate_parity_may_be_incomplete`
- `11` — `verification_ready_after_write` — `13/0/0` — `wouldWrite=26` — `wouldDeactivate=0` — limitation: `materialization_skipped_write_candidate_parity_may_be_incomplete`
- `15` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `46` — `verification_ready_after_write` — `22/0/0` — `wouldWrite=42` — `wouldDeactivate=0` — limitation: `materialization_skipped_write_candidate_parity_may_be_incomplete`
- `50` — `verification_ready_after_write` — `15/0/0` — `wouldWrite=29` — `wouldDeactivate=0` — limitation: `materialization_skipped_write_candidate_parity_may_be_incomplete`
- `18` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `55` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=2`
- `56` — `ABORT` — `School matching not clean. unmatched=22, ambiguous=0`

#### Operational notes

- Dry-run currently respects existing hard abort rules, so non-green counties may abort before full planning summary is produced.
- Successful dry-run output is informational only when `dryRunLimitations` is non-empty.
- Skipped materialization means write-parity is not yet full-proof.
- Phase 1A.2 helper/pipeline integration remains blocked until dry-run limitation semantics are explicitly approved.
- `15` Møre og Romsdal operational note:
  - Current app display aligns with Vilbli.
  - `canonical_matching_review` indicates matching/readiness confidence limits, not a UI/runtime defect.
  - Do not change or degrade current app/runtime behavior for `15`.
  - Further work must strengthen proof/diagnostics/identity confidence, not "fix" already-correct display.

### Phase 1A.2b — Dry-run materialization simulation decision

#### Current dry-run coverage

- Covers extraction, matching, readiness, and candidate planning.
- Guards write boundaries and enforces no DB writes in dry-run.
- Provides a useful safety smoke-test before write-path changes.

#### Current dry-run limitations

- Does not provide full write parity proof.
- Materialization is skipped in dry-run.
- Stale deactivation forecast may be incomplete.
- Expanded programme candidate completeness is not guaranteed.

#### Decision

- Before helper integration that can affect write decisions, improve dry-run materialization simulation inside `scripts/run-vgs-truth-pipeline.mjs`.
- No LOSA write-block integration yet.
- No helper integration into `scripts/run-vgs-truth-pipeline.mjs` yet.
- Normal mode must remain untouched.

#### Required next block

- Phase 1A.2c — Read-only materialization simulation inside dry-run path.

#### Gates

- `node --check`
- `rm -rf .next && npm run build`
- Readiness baseline unchanged
- Pipeline dry-run with no DB writes
- Normal mode not executed without explicit approval
- Dry-run limitations reduced or explicitly clarified

### Phase 1A.2c.0 implementation result (shared pure planner extraction)

#### Scope completed

- Added shared pure planner in `scripts/vgs-programme-materialization-planner.mjs`.
- Updated `scripts/materialize-vgs-programmes-from-vilbli.mjs` to consume planner output for deterministic programme specs.
- Kept IO/write/fetch/env/CLI behavior in materialize script.
- `scripts/run-vgs-truth-pipeline.mjs` was not changed in this block.
- DB write execution was not run in this block.

#### Single-source rules moved into planner

- Deterministic programme identity/spec derivation rules.
- Required-node spec derivation for electrician materialization nodes.
- `stagePresentInCounty` county-stage presence semantics.
- Stable warning/reason handling in planner result shape.

#### Validation result

- `node --check scripts/vgs-programme-materialization-planner.mjs` passed.
- `node --check scripts/materialize-vgs-programmes-from-vilbli.mjs` passed.
- `rm -rf .next && npm run build` passed.

#### Remaining note

- Parity proof remains limited until shared planner is also used by dry-run materialization simulation in `scripts/run-vgs-truth-pipeline.mjs`.
- Next block: Phase 1A.2c.1 — connect shared planner to dry-run materialization simulation in pipeline.
- No helper/LOSA write integration yet.

### Phase 1A.2c.1 implementation result (dry-run planner simulation integration)

#### Scope completed

- Implemented in `scripts/run-vgs-truth-pipeline.mjs`.
- Connected shared planner in dry-run-only path.
- Added read-only materialization simulation in dry-run.
- Added safe programme lookups with `.in("slug", slugs)` and `.in("program_code", programCodes)`.
- Empty arrays are not passed to `.in(...)`.
- Raw `.or(...)` lookup strings are not used.
- Read-only lookup results are deduplicated by programme `id`.
- Added attempt-level programme/link classification in dry-run summary.
- Unresolved future programme IDs are treated as attempt-level uncertainty (no fake certainty).
- Normal mode was not run and was intentionally not changed.
- Dry-run performed no DB writes.

#### Validation result

- `node --check scripts/run-vgs-truth-pipeline.mjs` passed.
- `node --check scripts/vgs-programme-materialization-planner.mjs` passed.
- `rm -rf .next && npm run build` passed.

#### Dry-run matrix result snapshot (electrician)

- `03` — `verification_ready_after_write` — `5/0/0` — `wouldWrite=10` — `wouldDeactivate=0` — `materializationSimulationComplete=false` — limitation: `materialization_simulated_read_only_not_write_parity_proof`
- `11` — `verification_ready_after_write` — `13/0/0` — `wouldWrite=26` — `wouldDeactivate=0` — `materializationSimulationComplete=false` — limitation: `materialization_simulated_read_only_not_write_parity_proof`
- `46` — `verification_ready_after_write` — `22/0/0` — `wouldWrite=42` — `wouldDeactivate=0` — `materializationSimulationComplete=false` — limitation: `materialization_simulated_read_only_not_write_parity_proof`
- `50` — `verification_ready_after_write` — `15/0/0` — `wouldWrite=29` — `wouldDeactivate=0` — `materializationSimulationComplete=false` — limitation: `materialization_simulated_read_only_not_write_parity_proof`
- `15` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `18` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `55` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=2`
- `56` — `ABORT` — `School matching not clean. unmatched=22, ambiguous=0`

#### Operational note

- Dry-run is improved and now planner-backed for materialization simulation, but it is still not a full parity-proof of write outcomes.
- Helper/LOSA write integration remains blocked until `materializationSimulationComplete` semantics are explicitly approved, or current limitation status is accepted as sufficient for diagnostics-only integration.

#### Next recommended block

- Phase 1A.2d — decide whether current improved dry-run is sufficient for pipeline helper diagnostics-only integration, or whether additional parity work is required.

### Phase 1A.2d decision (diagnostics-only integration gate)

#### Decision

- GO for pipeline helper diagnostics-only integration in `scripts/run-vgs-truth-pipeline.mjs`.
- `materializationSimulationComplete=true` is not required for this diagnostics-only step.
- LOSA write-block remains explicitly out of scope and not approved in this step.
- Write decisions must remain unchanged.

#### Allowed next step

- Add `identitySemanticsSummary` and `identitySemanticsBySchoolCode` in pipeline summary/log output only.
- Helper is allowed as additive diagnostics-only processing.
- Helper output must not participate in matching/readiness/status/count/write decisions.

#### Forbidden in this step

- No LOSA write-block integration.
- No filtering schools based on helper semantics output.
- No publishability decisions based on helper semantics output.
- No county allowlist changes.
- No normal mode write behavior changes.
- No Route Engine/UI/billing changes.

#### Acceptance gates

- `node --check`
- `rm -rf .next && npm run build`
- Readiness baseline unchanged.
- Pipeline dry-run successful for green counties.
- Dry-run abort behavior preserved for non-green counties.
- `safety.dbWritesExecuted=false`.
- Normal write mode not executed without explicit approval.

#### Note

- Additional parity work is required only when moving from diagnostics-only usage to write-confidence / write-decision usage.

### Phase 1A.2e implementation result (pipeline helper diagnostics-only integration)

#### Scope completed

- Implemented in `scripts/run-vgs-truth-pipeline.mjs`.
- `classifyIdentitySemantics` is integrated in dry-run path only.
- Diagnostics are computed after clean matching gate and only when `isDryRun=true`.
- Added dry-run-only summary fields:
  - `identitySemanticsSummary`
  - `identitySemanticsBySchoolCode`
  - `identitySemanticsWarning`
- Helper fail-open behavior implemented:
  - helper error does not abort pipeline;
  - `helperError` / `helperErrorMessage` / warning are populated.
- `identitySemanticsBySchoolCode` is deterministic:
  - sorted input;
  - `schoolCode` key when available;
  - fallback key `normalizedLabel::zeroPaddedStableIndex`;
  - capped at 100 entries.
- `identitySemanticsSummary` counts are computed from all analyzed schools, not from capped map entries.
- Normal mode was not run.
- Normal mode summary/output was not changed.
- LOSA write-block was not added.
- Write decisions were not changed.

#### Validation result

- `node --check scripts/run-vgs-truth-pipeline.mjs` passed.
- `node --check scripts/school-identity-semantics.mjs` passed.
- `rm -rf .next && npm run build` passed.

#### Dry-run matrix result snapshot (electrician)

- `03` — `verification_ready_after_write` — `5/0/0` — identity: `total=5 slash=0 losa=0 multi=0 unsupported=0 needsReview=0`
- `11` — `verification_ready_after_write` — `13/0/0` — identity: `total=13 slash=0 losa=0 multi=0 unsupported=0 needsReview=0`
- `46` — `verification_ready_after_write` — `22/0/0` — identity: `total=22 slash=0 losa=0 multi=1 unsupported=0 needsReview=1`
- `50` — `verification_ready_after_write` — `15/0/0` — identity: `total=15 slash=0 losa=0 multi=0 unsupported=0 needsReview=0`
- `15` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `18` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=1`
- `55` — `ABORT` — `School matching not clean. unmatched=0, ambiguous=2`
- `56` — `ABORT` — `School matching not clean. unmatched=22, ambiguous=0`

#### Operational notes

- Pipeline now includes dry-run-only identity semantics diagnostics.
- Diagnostics do not affect matching/readiness/write/deactivation logic.
- `46` has a multi-location signal but remains green; this remains diagnostics-only.
- Non-green counties still abort before diagnostics output because the existing hard matching gate is preserved.

### Phase 1A.2f — Dry-run abort diagnostics contract

#### Decision

- For `isDryRun=true` and matching-not-clean, the pipeline may compute identity diagnostics **before** abort.
- Abort still happens.
- No readiness override.
- No write planning.
- No deactivation planning.
- No PSA writes.
- No LOSA write-block.
- Normal mode abort behavior remains unchanged.

#### Structured abort diagnostics contract

When dry-run aborts on dirty matching, output should include:

```json
{
  "mode": "dry_run",
  "aborted": true,
  "abortReason": "string",
  "matching": {
    "matched": "number",
    "unmatched": "number",
    "ambiguous": "number"
  },
  "identitySemanticsSummary": {
    "totalSchoolsAnalyzed": "number",
    "slashAliasCount": "number",
    "losaCount": "number",
    "multiLocationSignalCount": "number",
    "unsupportedCount": "number",
    "needsReviewCount": "number",
    "helperError": "boolean",
    "helperErrorMessage": "string | null"
  },
  "identitySemanticsBySchoolCode": "Record<string, object>",
  "identitySemanticsWarning": "string | null",
  "safety": {
    "dbWritesExecuted": false
  }
}
```

#### Error/exit behavior

- The run must still fail/abort.
- Structured diagnostics must not turn abort into success.
- Primary abort reason remains matching-not-clean.
- Helper failures must not hide the primary abort reason.
- If helper fails, diagnostics should be fail-open:
  - `helperError=true`
  - `helperErrorMessage` set
  - `identitySemanticsBySchoolCode={}`
  - `identitySemanticsWarning` set.

#### Payload/cap rules

- Deterministic sorted input.
- Cap `identitySemanticsBySchoolCode` at 100.
- Summary counts use all analyzed schools, not capped map entries.
- Warning set if capped.

#### Forbidden

- No diagnostics before abort in normal mode.
- No changing normal abort message/behavior.
- No matching/ranking/status/count changes.
- No write candidates after failed matching.
- No deactivation forecast after failed matching.
- No use of helper output for publishability.

#### Validation gates

- `node --check`
- `rm -rf .next && npm run build`
- Dry-run `15` / `18` / `55` / `56` should still abort but output structured diagnostics.
- Dry-run `03` / `11` / `46` / `50` should remain successful.
- Normal write mode not run without approval.

### Phase 1A.2f implementation result (dry-run structured abort diagnostics)

#### Scope completed

- Implemented in `scripts/run-vgs-truth-pipeline.mjs`.
- `buildIdentitySemanticsDiagnosticsFromUniqueSchools(uniqueExtractedSchools)` extracted as a single local function for `identitySemanticsSummary` / `identitySemanticsBySchoolCode` / `identitySemanticsWarning` (reuse for successful dry-run summary and dirty-matching dry-run abort).
- Dirty matching in dry-run prints structured JSON diagnostics to **stdout** via `console.log(JSON.stringify(..., null, 2))` **before** the same `throw` with the existing ABORT message (`ABORT: School matching not clean...`).
- Successful dry-run summary output does **not** include `aborted: true`.
- Normal mode dirty-matching behavior/message unchanged (no structured diagnostics in normal mode).
- Admin dashboard (`/nb/admin/dashboard`) not integrated in this phase.
- Normal write mode was not run; dry-run DB writes were not executed.

#### Validation result

- `node --check scripts/run-vgs-truth-pipeline.mjs` passed.
- `node --check scripts/school-identity-semantics.mjs` passed.
- `rm -rf .next && npm run build` passed.

#### Dry-run matrix snapshot (electrician) — dirty counties (still abort)

- `15` — still abort — identity: `total=10 slash=0 losa=0 multi=0 unsupported=0 needsReview=0` — `safety.dbWritesExecuted=false`
- `18` — still abort — identity: `total=13 slash=0 losa=0 multi=0 unsupported=0 needsReview=0` — `safety.dbWritesExecuted=false`
- `55` — still abort — identity: `total=5 slash=0 losa=0 multi=0 unsupported=0 needsReview=0` — `safety.dbWritesExecuted=false`
- `56` — still abort — identity: `total=24 slash=0 losa=18 multi=0 unsupported=18 needsReview=0` — `safety.dbWritesExecuted=false`

#### Dry-run matrix snapshot (electrician) — green counties (still succeed)

- `03` — still succeeds — identity: `total=5 slash=0 losa=0 ...`
- `11` — still succeeds — identity: `total=13 ...`
- `46` — still succeeds — identity: `total=22 ...`
- `50` — still succeeds — identity: `total=15 ...`

#### Operational notes

- Diagnostics before abort apply **only** in dry-run; normal mode unchanged.
- Abort policy is unchanged (still hard fail on dirty matching; structured output does not imply success).
- `56` now exposes LOSA-heavy `unsupported` semantics in identity summary **before** abort (diagnostics-only).
- `15` / `18` / `55`: Phase **1A.2g** adds **matching ambiguity diagnostics** in the dry-run structured abort JSON only; counties remain **non-green** (abort unchanged). Identity semantics diagnostics remain additive.

### Phase 1A.2g — Matching ambiguity diagnostics contract

#### Decision

- Add matching ambiguity diagnostics **only** to dry-run structured abort JSON (extend Phase 1A.2f payload in `scripts/run-vgs-truth-pipeline.mjs`).
- Do not change matching policy.
- Do not change readiness script output (`scripts/classify-vgs-truth-readiness.mjs`) in this phase.
- Do not change normal mode behavior or summary.
- Do not make ambiguous counties publishable.

#### Output fields

`matchingAmbiguitySummary`:

```json
{
  "ambiguousSchoolsCount": "number",
  "topScoreTieCount": "number",
  "weakSignalTieCount": "number",
  "diagnosticsOnly": true
}
```

`matchingAmbiguityDiagnostics`:

Array of:

```json
{
  "vilbliSchoolCode": "string | null",
  "vilbliSchoolLabel": "string",
  "candidateCount": "number",
  "topScore": "number | null",
  "topMatchType": "string | null",
  "candidates": [
    {
      "institutionId": "string",
      "institutionName": "string",
      "matchType": "string",
      "score": "number"
    }
  ],
  "reasonCodes": ["string"],
  "explanationCode": "string"
}
```

#### Reason codes

Initial allowed codes:

- `equal_score_tie`
- `multiple_nsr_candidates_same_tier`
- `weak_signal_tie`

Reserved / future only (not required in first implementation):

- `multi_location_same_identity_possible`
- `slash_alias_needs_identity_resolution`
- `losa_related_ambiguity`
- `missing_disambiguating_source_field`

#### Caps / payload rules

- Cap `candidates` per ambiguous school at **5** (do not dump full ranked list).
- Truncate overly long institution or Vilbli labels if needed while keeping enough for operator review.
- Diagnostics are operator-facing tooling output, not end-user surfaced copy.

#### Hard constraints

- Diagnostics must **not** select a winning candidate.
- Diagnostics must **not** break ties.
- Diagnostics must **not** change matched / unmatched / ambiguous counts.
- Diagnostics must **not** alter abort behavior (still abort on dirty matching; structured JSON does not mean success).
- Diagnostics must **not** change readiness output.
- Diagnostics must **not** change normal mode output.
- Diagnostics must **not** influence write, deactivation, or publishability decisions.

#### Validation gates

- `node --check`
- `rm -rf .next && npm run build`
- Dry-run `15` / `18` / `55`: still abort and include `matchingAmbiguityDiagnostics` where ambiguous schools exist.
- Dry-run `56`: still abort; `matchingAmbiguityDiagnostics` may be empty when the failure is unmatched-heavy rather than ambiguity-heavy.
- Dry-run `03` / `11` / `46` / `50`: still succeed (no change to successful dry-run contract beyond additive fields absent when not aborting).

### Phase 1A.2g implementation result (matching ambiguity diagnostics)

#### Scope completed

- Matching ambiguity diagnostics are implemented in `scripts/run-vgs-truth-pipeline.mjs` only (extend Phase **1A.2f** dry-run structured abort payload).
- Uses **`ranked` / `best` / `ties`** from the **existing** matching loop; **no** second matching pass.
- Matching policy unchanged; **`matchedBySchoolCode` / `unmatchedSchools` / `ambiguousMatches` counts and semantics** unchanged.
- Normal mode unchanged (no structured ambiguity JSON on dirty matching; same throw as before).
- Normal write mode was **not** run for this validation.
- Readiness script output unchanged (`scripts/classify-vgs-truth-readiness.mjs` not modified).
- Write, deactivation, and publishability logic unchanged.

#### Reason / explanation rules (as implemented)

- **`equal_score_tie`**: included when `ties.length > 1` (top-score tie).
- **`multiple_nsr_candidates_same_tier`**: included when **capped** candidates (max 5, existing `ties` order) all share the same `matchType` (requires at least two capped candidates for the “multiple” signal).
- **`weak_signal_tie`**: included only when `topMatchType === "fallback_fuzzy"` **or** `topScore < 0.9` (aligned with existing `classifyInstitutionMatch` semantics: `core_name_match` tier is `0.9`; no new business thresholds for matching).
- **`explanationCode`** priority (single primary code per ambiguous school):
  1. `weak_signal_tie`
  2. `multiple_nsr_candidates_same_tier`
  3. `equal_score_tie`
- **`topScoreTieCount`**: number of ambiguous schools with a top-score tie; with current pipeline logic this **equals** `ambiguousMatches.length` / `ambiguousSchoolsCount`.
- If a county aborts **only** because of unmatched schools (`ambiguous=0`), **`matchingAmbiguityDiagnostics` is `[]`** and ambiguity summary counts are all **zero** (unmatched-heavy case).

#### Validation result

- `node --check scripts/run-vgs-truth-pipeline.mjs` — passed.
- `rm -rf .next && npm run build` — passed.

#### Dry-run matrix snapshot (electrician) — dirty counties (still abort)

- `15` — still aborts — `matchingAmbiguitySummary`: `ambiguousSchoolsCount=1`, `topScoreTieCount=1`, `weakSignalTieCount=1` — example: Surnadal (`candidateCount=4`), `explanationCode=weak_signal_tie`.
- `18` — still aborts — `matchingAmbiguitySummary`: `ambiguous=1`, `topScoreTie=1`, `weakSignal=1` — example: Nuortta-Sálto (`candidateCount=2`), `explanationCode=weak_signal_tie`.
- `55` — still aborts — `matchingAmbiguitySummary`: `ambiguous=2`, `topScoreTie=2`, `weakSignal=0` — example: Nord-Troms, `explanationCode=multiple_nsr_candidates_same_tier`.
- `56` — still aborts — `matchingAmbiguitySummary` all zero — `matchingAmbiguityDiagnostics=[]` because the county is **unmatched-heavy**, not ambiguity-heavy.

#### Dry-run matrix snapshot (electrician) — green counties (still succeed)

- `03` — succeeds.
- `11` — succeeds.
- `46` — succeeds.
- `50` — succeeds.

#### Operational notes

1. Phase **1A.2g** — **implementation result** as implemented in `scripts/run-vgs-truth-pipeline.mjs`: ambiguity payload is **dry-run structured abort only**.
2. Ambiguity diagnostics are **operator-facing** tooling; they **do not** resolve ambiguity or select an NSR institution.
3. Counties **`15` / `18` / `55`** now expose **why** matching is ambiguous (capped tie set + reason codes) but remain **non-green** until policy/product work—not diagnostic output alone.
4. County **`56`** remains dominated by **unmatched** Vilbli schools (and LOSA-heavy identity signals from earlier phases); the next useful layer is **unmatched diagnostics** and **LOSA handling**, not more ambiguity-only payload.
5. Successful dry-run JSON does **not** include `matchingAmbiguitySummary` / `matchingAmbiguityDiagnostics` (abort path only); normal success summary paths are unchanged.
6. Contract for unmatched-heavy diagnostics is **Phase 1A.2h.1** below (implemented in `scripts/run-vgs-truth-pipeline.mjs`; readiness unchanged).

### Phase 1A.2h — Unmatched-heavy diagnostics (design decision)

- **Design-pass outcome:** add **unmatched-heavy diagnostics** only to **dry-run structured abort JSON** in `scripts/run-vgs-truth-pipeline.mjs`.
- **First implementation step does not** change `scripts/classify-vgs-truth-readiness.mjs` output shape or behavior.
- Detailed contract: **Phase 1A.2h.1**.

### Phase 1A.2h.1 — Unmatched-heavy diagnostics contract

#### 1. Decision

- Add **matching unmatched diagnostics** only to **dry-run structured abort JSON** (extend the Phase **1A.2f** abort payload in `scripts/run-vgs-truth-pipeline.mjs`).
- Do **not** change matching policy.
- Do **not** change readiness output (`scripts/classify-vgs-truth-readiness.mjs`) in the **first** implementation step.
- Do **not** change normal mode.
- Do **not** make unmatched counties publishable.
- **Primary target:** county **`56` Finnmark** — unmatched-heavy + LOSA-heavy operator explanation (abort unchanged).

#### 2. Output fields

`matchingUnmatchedSummary`:

```json
{
  "unmatchedSchoolsCount": "number",
  "countyHasNsrInstitutions": "boolean",
  "nsrCountyCatalogCount": "number",
  "noNonNoneMatchCount": "number",
  "lowScoreCandidateCount": "number",
  "losaHintCount": "number",
  "slashHintCount": "number",
  "multiLocationHintCount": "number",
  "diagnosticsOnly": true
}
```

`matchingUnmatchedDiagnostics`:

Array of objects:

```json
{
  "vilbliSchoolCode": "string | null",
  "vilbliSchoolLabel": "string",
  "candidateCount": "number",
  "topCandidate": {
    "institutionId": "string",
    "institutionName": "string",
    "matchType": "string",
    "score": "number"
  },
  "reasonCodes": ["string"],
  "explanationCode": "string",
  "identityHintCodes": ["string"]
}
```

- `topCandidate` is **`null`** when there is no surviving non-`none` match under the current classifier (see matcher limitation below).

#### 3. Current matcher limitation

- Under the current `classifyInstitutionMatch` flow, **unmatched** means **no** candidate survived **`matchType !== "none"`**.
- Therefore **`topCandidate` should normally be `null`** in Phase **1A.2h.1**.
- **`lowScoreCandidateCount`** in `matchingUnmatchedSummary` stays **schema-ready**; expect **`0`** in **1A.2h.1** while no weak-candidate layer exists (no second scorer).
- Do **not** introduce a second weak-candidate scorer in this phase.
- Do **not** lower thresholds.
- Do **not** infer a likely NSR institution for matching purposes.

#### 4. Reason codes

**Initial allowed codes:**

- `no_nsr_candidate`
- `low_score_no_match`
- `losa_unsupported_hint`
- `slash_alias_hint`
- `multi_location_hint`
- `missing_school_code`
- `source_label_too_ambiguous`
- `possible_external_delivery_model`
- `unmatched_after_conservative_fuzzy_reject`

**`explanationCode` priority** (first applicable wins):

1. `missing_school_code`
2. `no_nsr_candidate`
3. `losa_unsupported_hint`
4. `low_score_no_match`
5. `slash_alias_hint`
6. `multi_location_hint`
7. `source_label_too_ambiguous`
8. `unmatched_after_conservative_fuzzy_reject`

#### Clarifications before implementation

1. **NSR county context**
   - `countyHasNsrInstitutions` and `nsrCountyCatalogCount` are **factual** county-level context fields.
   - Do **not** force them to zero when `unmatchedSchoolsCount === 0`.
   - If `unmatchedSchoolsCount === 0`:
     - unmatched-specific counters must be **0**;
     - `matchingUnmatchedDiagnostics` must be **`[]`**;
     - `countyHasNsrInstitutions` / `nsrCountyCatalogCount` remain **factual**.

2. **`low_score_no_match` vs `unmatched_after_conservative_fuzzy_reject`**
   - For Phase **1A.2h.1**, `explanationCode` should use **`low_score_no_match`** when the NSR catalog exists and no candidate survived current `matchType !== "none"` (and no higher-priority explanation applies).
   - **`unmatched_after_conservative_fuzzy_reject`** may be included only as an **additional** `reasonCode`, **not** as primary `explanationCode` in this phase.
   - Do **not** introduce new fuzzy scoring or thresholds.

3. **`source_label_too_ambiguous`**
   - Use only with a **deterministic narrow** rule:
     - missing/empty label after trim, **or**
     - extremely short **normalized** label that cannot safely represent a school identity (implementation-defined constant, e.g. normalized length \(\leq 2\)).
   - Do **not** use subjective ambiguity heuristics.
   - Do **not** use this code to change matching behavior.

4. **`explanationCode` limitation**
   - `explanationCode` is only the **primary operator hint**.
   - Full interpretation must use **`reasonCodes` + `identityHintCodes`**.
   - No `explanationCode` may be interpreted as permission to publish, write, or auto-match.

#### 5. Hint policy

- LOSA / slash / multi-location hints come from the **identity semantics helper** (`school-identity-semantics` / pipeline’s existing identity diagnostics path).
- Hints explain **source label semantics** only.
- Hints must **not** affect matching, publishability, or PSA writes.
- `possible_external_delivery_model` is **explanatory only** and does **not** imply Route Engine or product route support.

#### 6. Caps / payload rules

- Cap **`matchingUnmatchedDiagnostics`** at **50** schools (deterministic order; document order in implementation—e.g. sorted by `vilbliSchoolCode` / label).
- **Summary counts** must reflect **all** unmatched schools, not only capped diagnostic rows.
- Compact / truncate labels for operator readability.
- Do **not** dump raw Vilbli or NSR source rows.
- Diagnostics are **operator-facing**, not end-user-facing.

#### 7. Hard constraints

- Diagnostics must **not** select a candidate.
- Diagnostics must **not** lower the matching threshold.
- Diagnostics must **not** change the unmatched count or list semantics.
- Diagnostics must **not** make unmatched counties publishable.
- Diagnostics must **not** write PSA rows.
- Diagnostics must **not** bypass the LOSA unsupported rule.
- Diagnostics must **not** change normal mode output.
- Diagnostics must **not** change readiness output in the **first** implementation.

#### 8. Validation

- `node --check scripts/run-vgs-truth-pipeline.mjs`
- `rm -rf .next && npm run build`
- Dry-run **`56`**: still **abort** and include **`matchingUnmatchedDiagnostics`** (and summary).
- Dry-run **`15` / `18` / `55`**: still **abort** and keep **`matchingAmbiguity*`** diagnostics.
- Dry-run **`03` / `11` / `46` / `50`**: still **succeed**.
- Normal write mode **not** run for validation without explicit approval.

#### 9. Phase 1A.2h.1 implementation result (unmatched-heavy diagnostics)

**Scope completed**

- `matchingUnmatchedSummary`, `matchingUnmatchedDiagnostics`, and optional `matchingUnmatchedWarning` are implemented in **`scripts/run-vgs-truth-pipeline.mjs`** only, on the **dry-run structured abort JSON** path (after dirty matching, before the same ABORT throw).
- Behavior is **generic** for any county/profession with unmatched schools: **no** `countyCode === "56"` (or any county-specific) branching.
- Uses **existing** `unmatchedSchools` from the current matching loop and the same NSR county query; **no** second matching pass; **no** weak-candidate scorer.
- In this phase **`topCandidate` is always `null`** and **`candidateCount` is always `0`**.
- **`source_label_too_ambiguous`** uses the **narrow deterministic** rule documented in **“Clarifications before implementation”**.
- **`unmatched_after_conservative_fuzzy_reject`** appears only in **`reasonCodes`**, **never** as **`explanationCode`**.
- **`countyHasNsrInstitutions`** / **`nsrCountyCatalogCount`** remain **factual** county context even when **`unmatchedSchoolsCount === 0`** (unmatched-specific aggregates are zero; diagnostics array is **`[]`**).
- **Normal mode** output and behavior unchanged (no structured unmatched JSON on dirty matching in normal mode).
- **Matching policy** unchanged; **readiness** script output unchanged; **no** DB writes / **no** normal write run for this validation.

**Validation result**

- `node --check scripts/run-vgs-truth-pipeline.mjs` — OK.
- `node --check scripts/school-identity-semantics.mjs` — OK.
- `rm -rf .next && npm run build` — OK.

**Dry-run matrix snapshot (electrician) — dirty counties (still abort)**

- `56` — still aborts — `unmatched=22`, `countyHasNsr=true`, NSR **`nsrCountyCatalogCount=12`**, `losaHint=17`, `slash=5`, `lowScoreCandidate=0`; **`matchingUnmatchedDiagnostics`** includes **22** rows (under cap **50**, so **`matchingUnmatchedWarning`** is typically **null**); example school code **`203171`**: **`explanationCode=losa_unsupported_hint`**, **`topCandidate=null`**, **`candidateCount=0`**.
- `15` — still aborts — `unmatched=0`, **factual** NSR **`27`**, **`matchingUnmatchedDiagnostics=[]`**; **`matchingAmbiguity*`** diagnostics preserved.
- `18` — still aborts — `unmatched=0`, factual NSR **`28`**, **`matchingUnmatchedDiagnostics=[]`**; ambiguity diagnostics preserved.
- `55` — still aborts — `unmatched=0`, factual NSR **`21`**, **`matchingUnmatchedDiagnostics=[]`**; ambiguity diagnostics preserved.

**Dry-run matrix snapshot (electrician) — green counties (still succeed)**

- `03` / `11` / `46` / `50` — still succeed.

**Operational notes**

1. County **`56`** is now clearer as **unmatched-heavy** with **LOSA / external-delivery–oriented signals** (via identity semantics hints and reason codes)—**not** primarily a fuzzy-threshold tuning problem from operator-facing diagnostics alone.
2. This phase **still does not** make **`56`** (or any unmatched county) **publishable**: abort policy and unsupported LOSA semantics are unchanged at the product/matching boundary.
3. The **next** architectural move should be **school identity / LOSA / external-delivery modelling** (**Phase 2** / **Phase 4** in this plan), **not** ad-hoc matching threshold changes driven by diagnostics output.
4. **Phase 1A.2i** decision is **recorded below** (Phase 1 stays diagnostics-only for LOSA; no PSA / Route Engine escape hatches).

#### 10. Phase 1A.2i — LOSA / external-delivery modelling boundary (decision)

**1. Decision**

- **Option A accepted:** in **Phase 1**, **LOSA / external-delivery** remains **diagnostics-only / unsupported** relative to publishable Vilbli→PSA truth—no new LOSA PSA product model in this phase.
- **No PSA writes** targeting LOSA semantics; existing pipeline **abort-before-write** posture for dirty matching / unsupported identity remains unchanged (see **Phase 1A.2h.1** diagnostics and canonical matching spec **CASE 4**).
- **No LOSA-to-school / LOSA-to-NSR mapping** (no manual pairing, no heuristic “pick an enhet”).
- **No Route Engine** or **family-facing** route option that treats **unsupported LOSA** as ordinary school programme availability truth.
- **No county-specific exception** (including **no `56` allowlist** / no Finnmark-only publish bypass).

**2. Domain statuses**

| Status | Role in Phase 1 |
|--------|-----------------|
| **`unsupported_losa`** | Identified as LOSA-oriented / unsupported for ordinary school matching → **not publishable** as PSA truth. |
| **`external_delivery`** | Non–ordinary-school delivery signal without an approved model → **not publishable until explicitly modelled**. |
| **`remote_or_local_delivery`** | **Future only**; requires **explicit product + data contract** before any PSA or Route Engine surfacing. |
| **`identity_unresolved`** | Cannot resolve to a supported school identity / NSR alignment under current rules → **not publishable**. |
| **`needs_review`** | Operator/review signal only → **not publishable as route truth** for families. |
| **`publishable_school_availability`** | **Only** class allowed for **family-facing PSA truth** under the current VGS contour (ordinary NSR-backed availability when policy allows). |

**3. Route Engine boundary**

- Do **not** present LOSA as an **ordinary school option** on the study route.
- Do **not** choose a **random institution or campus** for LOSA or external-delivery rows.
- Do **not** build a **VG progression step** from **unsupported LOSA** availability as if it were canonical school truth.
- **Later:** **operator / review** surfacing may be considered, but **not family-facing truth** until a **LOSA model** and explicit product rules exist (see **Phase 4 — LOSA model**).

**4. Non-goals (Phase 1 / 1A.2i documentation closure)**

- No fuzzy-threshold tuning to “green” LOSA-heavy counties.
- No manual **internet-derived** lookup tables.
- No **county-specific allowlist** or production exception for **Finnmark (`56`)**.
- No **UI compensation** that implies publishable school truth where the model is unsupported.
- No **PSA write-policy change** for LOSA as part of this documentation decision.
- **No new DB schema** introduced under the **Phase 1A.2i** decision itself (schema work deferred to **Phase 2** / **Phase 4** when contracted).

**5. Exit criteria for a future LOSA model** (not Phase 1 deliverables; checklist for **Phase 4** readiness)

- **Source-backed** provider / delivery identity (what the official source asserts, not inferred labels alone).
- Clear separation of **responsible school/provider** vs **delivery site** / modality where applicable.
- Explicit **programme ↔ stage** relation for how availability is offered.
- **NSR alignment** where applicable—and honest **non-NSR** paths where not.
- **Audit trail** and immutable-enough provenance for operator review.
- **Review status** workflow before any family-facing surfacing.
- **Explicit product decision** on what families may see vs what remains internal/operator-only.

**6. Operational note**

- County **`56` (Finnmark)** remains **non-green** under current truth rules; operator diagnostics now show **unmatched-heavy + LOSA/external-delivery hints**—this remains **not** a matching-threshold bug to patch in Phase 1.
- **Next work** should advance **Phase 2** (school identity vs location) and **Phase 4** (LOSA model) **design and contract**, not incremental matching patches or county exceptions.

### Phase 1A closure decision

**1. Closure decision**

- The **Phase 1A diagnostic/read-safety layer is closed**.

**2. Done criteria (met)**

- All planned **1A.1–1A.2i** code and documentation are committed to `main`.
- The execution plan reflects actual implemented behavior and validation snapshots.
- Dry-run outputs are stable and intentionally additive.
- Green counties remain green (`03` / `11` / `46` / `50`).
- Non-green counties are now diagnostically explained (`15` / `18` / `55` / `56`).
- No write-policy changes were introduced.
- No publishability expansion was introduced.
- No normal mode drift was introduced.
- No Route Engine runtime/UI/billing changes were introduced.

**3. Current county status (electrician)**

| County | Status | Why | Publishable under current gate? | Risk | Next action class |
|--------|--------|-----|----------------------------------|------|-------------------|
| `03` | green | clean matching/readiness | Yes | low | maintain baseline |
| `11` | green | clean matching/readiness | Yes | low | maintain baseline |
| `46` | green | clean matching/readiness; diagnostic multi-location signal present | Yes | low (monitor) | monitor identity signal |
| `50` | green | clean matching/readiness | Yes | low | maintain baseline |
| `15` | non-green | ambiguity / canonical review (UI-correct vs Vilbli) | No | medium | Phase 2 identity/location modelling |
| `18` | non-green | ambiguity + slash-alias context | No | medium | Phase 2 identity/location modelling |
| `55` | non-green | ambiguity + multi-location/campus unresolved context | No | medium | Phase 2 identity/location modelling |
| `56` | non-green | unmatched-heavy + LOSA/external-delivery signals | No | medium-high | Phase 4 LOSA model + Phase 2 identity layer |

**4. Explicit non-goals after closure**

- No matching-threshold tuning.
- No county allowlist expansion.
- No county-specific bypass.
- No LOSA PSA writes.
- No random campus matching.
- No UI compensation to mask unresolved truth semantics.

**5. Next official block**

- **Phase 2 — school identity / location resolution design.**

**6. Phase linkage**

- **Phase 4 — LOSA / external-delivery model contract** must be designed and approved before **`56` Finnmark** can become publishable truth.

**7. Working principle**

- Further progress must model **identity/location/delivery truth**, not tune fuzzy matching to force green status.

---

## Phase 2 — School identity / location model

### Goal

Introduce explicit conceptual separation: **school identity** vs **NSR location / avdeling**.

### Phase 2 architecture spec

- Phase 2 detailed architecture boundary is defined in:
  - `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- That document is the required design baseline for Phase 2 implementation planning.
- DB model proposal artifact (`ACCEPTED WITH NOTES`):
  - `docs/architecture/school-identity-location-resolution-db-model-proposal.md`
- Schema design draft artifact (`ACCEPTED WITH NOTES`):
  - `docs/architecture/school-identity-location-resolution-schema-design-draft.md`
- SQL/migration proposal artifact (`ACCEPTED WITH NOTES`):
  - `docs/architecture/school-identity-location-resolution-sql-migration-proposal.md`
- Phase 2 read-only diagnostics integration contract (ADR):
  - `docs/architecture/phase-2-read-only-diagnostics-contract.md`

### Implementation blocker (Phase 2)

- Phase 2 architecture spec is **accepted with notes**.
- Phase 2 DB model proposal is **accepted with notes**.
- Phase 2 schema design draft is **accepted with notes**.
- SQL/migration proposal is **accepted with notes**.
- Migration draft review decision is **APPROVE WITH CONDITIONS**:
  - `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`
- Security/RLS review decision is **APPROVED FOR ADDITIVE TABLE MIGRATION WITH CONDITIONS**.
- Controlled migration apply to approved test environment is **completed**:
  - `project_ref=egalvhjvdvmoqboxbwzo` (`my-app-test` main DB)
  - migration: `20260506112154_school_identity_location_resolution_phase2.sql`
- Dry-run migration plan is **documented**.
- Dry-run/static validation execution is **passed**.
- pgcrypto environment / platform permission check is **passed**.
- Post-apply read-only smoke in approved test environment is **passed**.
- Test migration cycle is **closed**.
- Separate read-only diagnostics script is **implemented** (`scripts/diagnose-school-identity-phase2-readonly.mjs`).
- Local fail-open smoke is **passed**.
- Remote `my-app-test` smoke from Cursor/sandbox was **attempted** but blocked in that execution environment:
  - `getaddrinfo ENOTFOUND egalvhjvdvmoqboxbwzo.supabase.co`
- Read-only diagnostics smoke from network-enabled local Terminal is **passed** against `my-app-test`:
  - `phase2SchemaAvailable=true`
  - summary counts `0` and no warning (`phase2DiagnosticsWarning=null`)
- Production/main operational rollout remains **NOT approved**.
- Runtime/write integration remains **blocked**.
- Next gate is owner decision between:
  - **review/approve sample data insert/cleanup runbook**;
  - **main Supabase rollout planning**.

### Acceptance gate summary (Phase 2)

- Phase 2 spec acceptance decision (`ACCEPTED WITH NOTES`) is logged.
- Phase 2 DB model proposal acceptance decision (`ACCEPTED WITH NOTES`) is logged.
- Phase 2 schema design draft acceptance decision (`ACCEPTED WITH NOTES`) is logged.
- SQL/migration proposal acceptance decision (`ACCEPTED WITH NOTES`) is logged.
- Migration draft gate status is logged (`APPROVE WITH CONDITIONS`).
- Security/RLS gate status is logged (`APPROVED FOR ADDITIVE TABLE MIGRATION WITH CONDITIONS`).
- Dry-run migration plan documentation is logged.
- Dry-run/static validation execution result is logged (`STATIC VALIDATION PASSED`).
- pgcrypto environment check result is logged (`PASSED`; `installed_version=1.3`).
- Controlled apply result is logged for approved test target:
  - `project_ref=egalvhjvdvmoqboxbwzo` / `my-app-test`
  - applied migration: `20260506112154_school_identity_location_resolution_phase2.sql`
- Post-apply read-only smoke result is logged (`POST-APPLY SMOKE PASSED`) for the same test target.
- Test migration cycle is closed.
- Production/main operational rollout remains blocked pending a separate approval gate.
- Runtime/write integration remains blocked pending a separate Phase 2 integration approval.
- Phase 2 read-only diagnostics ADR/contract is logged (`ACCEPTED FOR PLANNING`):
  - `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- Phase 2 diagnostics sample data runbook is logged (`PROPOSED / NOT EXECUTED`):
  - `docs/architecture/phase-2-read-only-diagnostics-sample-data-runbook.md`
- Read-only diagnostics smoke note is logged:
  - earlier Cursor/sandbox attempt blocked by DNS;
  - network-enabled local Terminal smoke passed for `my-app-test`.
- Read-only simulation plan is reviewed/approved.
- No conflicts remain with locked specs:
  - `docs/architecture/norway-school-identity-matching-spec.md`
  - `docs/architecture/route-engine-master-spec.md`
- No production rollout/schema-write integration starts before:
  - owner gate decision between runbook approval for sample data test and main rollout planning;
  - explicit Phase 2 integration approval;
  - explicit production operational approval.

### Possible approaches

- Derive identity clusters from NSR names (rules-based, reproducible).  
- Import official NSR parent/department relationships **if** available in API and schema.  
- Avoid manual mappings.  
- No internet-derived hardcoded tables.

### Open questions

- Does NSR API expose parent/child enhet relationship?  
- Can institution rows be grouped by official identifiers?  
- Does PSA need a `school_identity_id` later, or can it remain location-based?

### Success criteria

- System can distinguish **one school with multiple locations** from **multiple unrelated schools**.  
- Ambiguity remains **visible**, not hidden.

---

## Phase 3 — Controlled 1:N PSA emission

### Goal

Allow one Vilbli school identity row to produce **multiple** PSA rows when official data supports multiple valid locations.

### Rules

- Only when identity and location set are **officially** supported.  
- Never infer from weak fuzzy.  
- No single random institution selected.  
- UI must clearly show location/campus options.

### Potential files

- `scripts/run-vgs-truth-pipeline.mjs`  
- `scripts/classify-vgs-truth-readiness.mjs`  
- `scripts/cleanup-vgs-truth-contamination.mjs`  
- Route option payload  
- Route UI if location grouping is needed  

### Success criteria

- Multi-location schools produce **complete and honest** options.  
- Saved route and compare still work.  
- No duplicate / noisy PSA rows.

---

## Phase 4 — LOSA model

### Goal

Model LOSA as a **special** delivery/location type, not ordinary school matching.

### Open questions

- Is LOSA a location, delivery model, or partner institution in product UX?  
- Should PSA get a new `availability_scope`?  
- How should UI explain LOSA to parents?

### Success criteria

- LOSA rows are **no longer discarded** if safely modelled.  
- No misleading institution attribution.  
- UI labels LOSA clearly.

---

## Phase 5 — Higher education automation

### Goal

Separate from VGS/Vilbli. **Do not** mix doctor/higher-ed with the VGS Vilbli pipeline.

### Sources to investigate

- Samordna opptak  
- Official institution programme pages  
- Admission realism records  

### Success criteria

- Doctor/higher-ed no longer relies on legacy single-program seed as production truth.  
- Separate ingestion policy exists.

---

## Phase 6 — Legacy cleanup

### Goal

Remove or freeze legacy education layer **only after** canonical truth covers required flows.

### Targets

- `education_programs` runtime dependency  
- `education_institutions` runtime dependency where replaced  
- `profession_program_links` where replaced  
- `child_saved_education_routes` legacy save flow  

### Rules

- Do not remove while route/study-options still require these tables.  
- No UI should show fake/starter education availability as truth.

---

## Validation checklist

- Build passes.  
- Green counties stay green.  
- Unsupported counties fail honestly.  
- Saved routes / dedup unaffected.  
- Compare unaffected.  
- Private school badge unaffected.  
- No route generation regression.

---

## Deletion rule

**Delete this execution plan file** after phases are implemented and validated.

**Do not delete** the canonical spec: `docs/architecture/norway-school-identity-matching-spec.md`.
