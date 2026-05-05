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

---

## Phase 2 — School identity / location model

### Goal

Introduce explicit conceptual separation: **school identity** vs **NSR location / avdeling**.

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
