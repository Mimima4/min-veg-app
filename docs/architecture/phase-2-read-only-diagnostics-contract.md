# Phase 2 Read-Only Diagnostics Contract (ADR)

## 1. Status

- Phase 2 **standalone read-only diagnostics tooling:** **validated** and **frozen** (no new approved consumers without a separate owner gate + ADR update).
- Shared read-only helper + diagnostic script: **CLOSED** as **standalone tool** (boundary ADR §19).
- Scope expansion (readiness/pipeline/runtime): **not approved** by this document / remains **gated separately**.
- No runtime integration is approved by this document.
- No write integration is approved by this document.

### Shared read-only helper boundary

- Boundary ADR (helper module scope + closure):
  - `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- Helper: **implemented** (`scripts/lib/phase2-readonly-diagnostics-helper.mjs`); **live-smoke validated** on main (`project_ref=bgmtxyfchtqjuvzuuoon`; boundary ADR §18).
- **Approved consumer (only):** `scripts/diagnose-school-identity-phase2-readonly.mjs`.
- **Not approved** (no helper import / consumption without a **separate owner gate** + ADR/contract update):
  - `scripts/classify-vgs-truth-readiness.mjs`
  - `scripts/run-vgs-truth-pipeline.mjs`
  - Route Engine / application runtime
  - UI / admin
  - billing
  - PSA write / materialization paths
- **Next possible gates** (owner decision only; no work in flight):
  - optional **readiness diagnostics** planning (additive; integration still explicitly gated);
  - optional **pipeline dry-run diagnostics** planning (additive; integration still explicitly gated).

## 2. Decision

- First adopter for Phase 2 read-only diagnostics must be a **separate diagnostic script**.
- The script may read Phase 2 tables only for diagnostics/simulation outputs.
- The script must not perform writes.
- The script must not alter readiness or pipeline status/count behavior.
- The script must not publish PSA.
- The script must not feed Route Engine.

## 3. Scope

Allowed read-only tables:

1. `source_school_observations`
2. `school_identity_candidates`
3. `identity_aliases`
4. `school_locations`
5. `school_identity_resolution_decisions`
6. `programme_availability_publication_decisions`
7. `school_identity_review_events`

Allowed output fields:

- `identityResolutionSummary`
- `identityResolutionBySchoolCode`
- `phase2SchemaAvailable`
- `phase2DiagnosticsWarning`

## 4. Non-goals

- no writes;
- no PSA publication;
- no readiness gate changes;
- no pipeline write behavior changes;
- no Route Engine/runtime consumption;
- no UI/admin/operator workflow;
- no matching threshold tuning;
- no county-specific exceptions;
- no hidden manual truth.

## 5. Fallback / fail-open contract

If Phase 2 tables are unavailable:

1. return empty diagnostics;
2. emit warning;
3. no abort;
4. no status/count change;
5. no write behavior change.

If a read query fails:

1. same fail-open behavior;
2. warning includes short reason;
3. do not throw to caller unless explicitly requested in debug mode.

## 6. Environment boundary

- Phase 2 schema is applied in **`my-app-test`** and **main** (production Supabase — see execution plan Phase 2 closure).
- Diagnostics must remain **fail-open** wherever Phase 2 tables are absent or unreachable from the client perspective.
- Recommended optional feature flag / env gate:
  - `PHASE2_IDENTITY_DIAGNOSTICS_ENABLED=true`
- Default behavior should be disabled outside explicitly approved environments.

## 7. Output contract

Stable JSON shape:

```json
{
  "phase2SchemaAvailable": true,
  "identityResolutionSummary": {
    "observationsCount": 0,
    "resolutionDecisionCount": 0,
    "publicationDecisionCount": 0,
    "publishableCount": 0,
    "needsReviewCount": 0,
    "unsupportedCount": 0,
    "unresolvedCount": 0
  },
  "identityResolutionBySchoolCode": {},
  "phase2DiagnosticsWarning": null
}
```

## 8. Recommended first script

Name suggestion:

- `scripts/diagnose-school-identity-phase2-readonly.mjs`

Planned inputs:

- `profession`
- `county`
- optional `stage`
- optional source snapshot

Planned behavior:

- read-only only;
- optional schema availability check;
- no writes;
- no status changes;
- JSON output only.

## 9. Main rollout dependency

- Read-only diagnostics can be tested in `my-app-test`.
- Broad usage requires either:
  - main schema rollout, or
  - guaranteed fail-open fallback in non-rolled-out environments.
- No runtime dependency is allowed before main rollout approval.

## 10. Risks

- accidental runtime dependency;
- missing table crashes;
- diagnostics interpreted as publication approval;
- hidden manual truth;
- environment drift;
- future mobile/API clients reading internal tables.

## 11. Next gate

- Standalone diagnostic script is **implemented** and validated (`my-app-test` synthetic sample execution + cleanup; see sample data runbook).
- **Shared read-only helper** is **implemented** and **post-refactor live-smoke validated** on main (`project_ref=bgmtxyfchtqjuvzuuoon`); `scripts/diagnose-school-identity-phase2-readonly.mjs` refactored with **CLI flat stdout parity** preserved (boundary ADR §3B, §14, §18).
- **Closure / freeze:** standalone read-only diagnostics tooling is **frozen**; **approved consumer remains** `scripts/diagnose-school-identity-phase2-readonly.mjs` **only** (boundary ADR §19; see §1).
- **Must not** add helper imports into disallowed paths (§1) without a separate explicit owner gate + ADR update.
- Readiness/pipeline additive integration remains **not approved** until explicitly gated.
- **Next possible owner-only gates:** optional readiness diagnostics planning; optional pipeline dry-run diagnostics planning (each requires ADR/contract updates before any new importer).
- Sample data runbook artifact:
  - `docs/architecture/phase-2-read-only-diagnostics-sample-data-runbook.md`

## 12. Smoke test note

Status:

- **PASSED FROM NETWORK-ENABLED LOCAL TERMINAL**

Context:

- Target: `project_ref=egalvhjvdvmoqboxbwzo` / `my-app-test`
- URL used: `https://egalvhjvdvmoqboxbwzo.supabase.co`
- Env gate was enabled.
- Env vars were present in inline run.
- Secret key was not printed; only prefix type was observed (`eyJ`).

Read-only probe result (earlier Cursor/sandbox attempt):

- Probes attempted (read-only `select id limit 1`) against:
  - `source_school_observations`
  - `school_identity_resolution_decisions`
  - `programme_availability_publication_decisions`
- All probes failed with:
  - `getaddrinfo ENOTFOUND egalvhjvdvmoqboxbwzo.supabase.co`

Interpretation:

- Likely cause: DNS/network resolution issue in current execution environment.
- Not a table-not-found / schema-cache issue.
- Not a permission/RLS/JWT issue.

Script behavior confirmation:

- Script returned stable fail-open output:
  - `phase2SchemaAvailable=false`
  - `phase2DiagnosticsWarning="phase2_schema_unavailable"`
  - exit code `0`
- No writes were executed.
- No `INSERT`/`UPDATE`/`DELETE`/`UPSERT`/`RPC` were executed.
- No migration or schema changes were executed.

Successful local Terminal smoke result:

- Executed from network-enabled local Terminal against:
  - `project_ref=egalvhjvdvmoqboxbwzo` / `my-app-test`
- Local environment used service-role credentials without printing secret values.
- Output:
  - `phase2SchemaAvailable=true`
  - `identityResolutionSummary.observationsCount=0`
  - `identityResolutionSummary.resolutionDecisionCount=0`
  - `identityResolutionSummary.publicationDecisionCount=0`
  - `identityResolutionSummary.publishableCount=0`
  - `identityResolutionSummary.needsReviewCount=0`
  - `identityResolutionSummary.unsupportedCount=0`
  - `identityResolutionSummary.unresolvedCount=0`
  - `identityResolutionBySchoolCode={}`
  - `phase2DiagnosticsWarning=null`

Interpretation:

- Phase 2 schema is reachable from network-enabled local environment.
- Script can read Phase 2 tables.
- Tables are empty as expected after migration with no backfill.
- Read-only diagnostics path works.
- No runtime/write integration was enabled.
- No PSA publication was changed.

Next action:

- Commit smoke result, then owner decision between:
  - read-only diagnostics sample data planning;
  - main Supabase rollout planning.

Runbook status update:

- Controlled synthetic sample data runbook is proposed and not executed:
  - `docs/architecture/phase-2-read-only-diagnostics-sample-data-runbook.md`

Sample data validation status update:

- Controlled sample execution in `my-app-test` passed.
- `scripts/diagnose-school-identity-phase2-readonly.mjs` is validated against synthetic sample rows.
- Cleanup is verified (marker rows returned to zero).
