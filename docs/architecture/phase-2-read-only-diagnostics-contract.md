# Phase 2 Read-Only Diagnostics Contract (ADR)

## 1. Status

- Status: **ACCEPTED FOR PLANNING**
- No code implementation is approved by this document.
- No runtime integration is approved by this document.
- No write integration is approved by this document.

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

- Phase 2 schema is currently applied in `my-app-test` only.
- Main rollout is not approved.
- Any implementation must be safe in environments where Phase 2 tables do not exist.
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

- Implement separate read-only diagnostic script only after this ADR is accepted.
- First implementation target: `my-app-test` only.
- No integration into readiness/pipeline until script behavior is validated.
