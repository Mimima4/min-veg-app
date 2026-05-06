# Phase 2 Shared Read-Only Diagnostics Helper — Boundary ADR

## 1. Status

- Status: **ACCEPTED FOR PLANNING**
- No code implementation approved yet.
- No readiness/pipeline integration approved yet.
- No runtime/write integration approved.

Context:

- Phase 2 schema rollout is **CLOSED / COMPLETE** (test + main).
- Migration `20260506112154_school_identity_location_resolution_phase2.sql` applied to test and main.
- Main post-apply read-only smoke **passed**.
- Standalone diagnostic script exists: `scripts/diagnose-school-identity-phase2-readonly.mjs`, validated in `my-app-test` with synthetic sample data and cleanup.

Planning recommendation:

- **PLAN SHARED HELPER FIRST**

## 2. Decision

- Introduce a **shared read-only diagnostics helper** as the **first technical step** before any optional integration into readiness classification or pipeline tooling.
- The helper **centralizes**:
  - env gate (`PHASE2_IDENTITY_DIAGNOSTICS_ENABLED`);
  - schema availability probe;
  - fail-open behavior and warning codes;
  - read-only aggregation over Phase 2 tables allowed by `docs/architecture/phase-2-read-only-diagnostics-contract.md`;
  - stable internal output shape;
  - **`MAX_OBSERVATIONS = 5000`** (must live in the helper so every caller inherits the same cap).
- The helper **must not write**.
- The helper output **must not influence** readiness, writes, PSA publication/publishability decisions, or pipeline control flow.

## 3. Output format split

Explicitly separate two shapes:

### A) Helper internal return value

```json
{
  "phase2ReadOnlyDiagnostics": {
    "phase2SchemaAvailable": false,
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
}
```

Future readiness/pipeline consumers MUST merge **only** this additive nested field without altering existing fields.

### B) Standalone CLI stdout (`diagnose-school-identity-phase2-readonly.mjs`)

Must remain the **current flat JSON document**:

```json
{
  "phase2SchemaAvailable": false,
  "identityResolutionSummary": {},
  "identityResolutionBySchoolCode": {},
  "phase2DiagnosticsWarning": null
}
```

Rules:

- Helper may expose **nested** `{ phase2ReadOnlyDiagnostics: ... }` for internal use and future integration.
- Standalone script **prints flat shape on stdout** (backward-compatible contract).
- Semantic payload must match the inner object of `{ phase2ReadOnlyDiagnostics }` (same field values).

## 4. Warning semantics

Warning codes are **operational diagnostics**, not PSA truth or product readiness states.

Allowed codes:

- `phase2_identity_diagnostics_disabled`
- `phase2_identity_diagnostics_env_missing`
- `phase2_schema_unavailable`
- `phase2_query_failed`
- `phase2_unexpected_error`
- `phase2_result_truncated`

Clarifications:

- `phase2_schema_unavailable` MAY be used when the implementation cannot safely distinguish missing schema/tables from PostgREST/access/connectivity/network failures (bucketed operational failure).
- Operators **must not** treat `phase2_schema_unavailable` as proof that schema is absent in the target project.
- Warnings **must not** drive publication/readiness gates or automated decisions unless a separate document explicitly approves it.
- If a future implementation can **safely** distinguish DNS/network vs schema, a **new** warning code requires a **separate ADR change**.

## 5. Proposed helper name / path

Suggested module:

- `scripts/lib/phase2-readonly-diagnostics-helper.mjs`

Conceptual exports:

- `getPhase2ReadOnlyDiagnostics(...)`
- `createEmptyPhase2DiagnosticsPayload(...)`
- `isPhase2DiagnosticsEnabled()`
- `probePhase2SchemaAvailability(...)`

## 6. Allowed readers / imports

**Initially allowed importer only:**

- `scripts/diagnose-school-identity-phase2-readonly.mjs`

**Forbidden without separate owner gate + ADR update:**

- `scripts/classify-vgs-truth-readiness.mjs`
- `scripts/run-vgs-truth-pipeline.mjs`
- Route Engine / runtime application code
- UI / admin code
- billing code
- PSA write / materialization paths

**Technical review rule:**

Any new static import (or equivalent load) of `scripts/lib/phase2-readonly-diagnostics-helper.mjs` from outside `scripts/diagnose-school-identity-phase2-readonly.mjs` MUST fail review unless backed by an explicit separate ADR / gate documenting additive-only integration.

## 7. Hard non-goals

- No `INSERT` / `UPDATE` / `DELETE` / `UPSERT`, no mutating RPC (or any RPC from this module).
- No writes of any kind.
- No PSA publication semantics changes from helper output.
- No reads from PSA truth / publication materialization tables intended for authoritative PSA state (Phase 2 allowlist tables only — see diagnostics contract).
- No Route Engine consumption / coupling.
- No readiness **status**, **counts**, or **gates** derived or changed by helper output without separate approval.
- No pipeline **write behavior** changes.
- No UI / admin / operator workflow triggered by helper.
- No hidden manual truth.
- No matching threshold changes.
- No county/fylke allowlist coupling inside helper logic.
- No county-specific exceptions.
- No runtime (Next.js / API route) dependency: helper stays **scripts-only** unless a future ADR expands scope.

## 8. Fail-open contract

| Condition | Behavior |
|-----------|----------|
| Diagnostics disabled | Stable empty-compatible payload inside nested contract; warning `phase2_identity_diagnostics_disabled`; **caller success semantics unchanged**. |
| Env missing (`NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`) | Stable payload; warning `phase2_identity_diagnostics_env_missing`. |
| Schema / query failures | Stable payload; warning `phase2_schema_unavailable` OR `phase2_query_failed`. |
| Unexpected throw inside helper boundary | Prefer mapping to stable payload + `phase2_unexpected_error` without crashing parent processes (standalone script retains exit `0` for operational failures unless debug mode approved later). |

No abort / non-zero crash loop for readiness/pipeline parents unless **explicit debug mode** is approved later in a separate contract.

## 9. Read limits

- **`MAX_OBSERVATIONS = 5000`** is defined **in the helper**.
- CLI must not be the sole owner of the cap — every future caller inherits helper defaults.
- If aggregation is capped / truncated: warning **`phase2_result_truncated`** (per diagnostics contract semantics).
- Raising/lowering caps requires a **separate ADR / gate**.

## 10. Output contract

- Helper returns additive diagnostics keyed under **`phase2ReadOnlyDiagnostics`** internally (§3A).
- **Must not** rename/remove/repurpose existing readiness/pipeline output fields when merged later.
- **Must not** be interpreted as **`ready`** / **`publishability`** / gate outcome without separate approval.

## 11. Env gate

- `PHASE2_IDENTITY_DIAGNOSTICS_ENABLED=true` required for live reads.
- Default **off** outside explicitly approved diagnostic contexts.

## 12. Safety guardrails

- **SELECT-only** interaction patterns via Supabase client reads from this module — no mutation API surface exported.
- **No RPC** from helper.
- No shared client wrapper that exposes write methods to consumers of diagnostics.
- Pre-merge grep checklist on helper + refactored script: `insert`, `update`, `upsert`, `delete`, `rpc`.
- Secrets must never be logged or embedded in JSON output (no keys, connection strings).

## 13. Environment compatibility

- Works when Phase 2 tables exist (test/main).
- **Fails open** when tables unreachable or absent from the client’s perspective — no parent abort, no readiness/status change.
- No **hard** Next.js runtime dependency on Phase 2 schema presence.
- Missing schema must not change readiness classification behavior or abort pipelines when integrated later (unless a future ADR explicitly violates this — not in scope).

## 14. Refactor parity criteria

Before accepting helper extraction + standalone script refactor:

- Same **flat** CLI stdout JSON shape (§3B).
- Same warning code mapping behavior (including operational bucketing for `phase2_schema_unavailable`).
- Same summary counts for equivalent inputs.
- Same `identityResolutionBySchoolCode` keys and latest-state logic.
- Same fail-open posture and **exit code `0`** for operational failures (current script contract).
- Same **`MAX_OBSERVATIONS`** behavior and `phase2_result_truncated` when applicable.
- **No writes**, no pipeline/readiness/runtime changes in the same PR set.

## 15. Integration sequence

1. Implement helper + refactor `scripts/diagnose-school-identity-phase2-readonly.mjs` only.
2. Validate output parity vs pre-refactor script (including synthetic scenario if re-run in test).
3. Owner gate:
   - **a)** freeze as separate tool;
   - **b)** optional readiness diagnostics (additive);
   - **c)** optional pipeline dry-run diagnostics (additive).

## 16. Risks

- Helper imported into a write path.
- Diagnostics interpreted as publication approval / green-light.
- Wrong Supabase URL / credential drift (`my-app-test` vs main).
- Large reads causing latency (mitigate via cap).
- Hidden manual overrides via future fields.
- Accidental bundle/runtime import from `src/`.
- Warning confusion (flat CLI vs nested merge field).
- `phase2_schema_unavailable` misunderstood as deterministic schema absence.

## 17. Next gate

- Implement shared helper **and** refactor standalone diagnostic script **only** — **same change intent, no classify/pipeline integration**.
- Validate **parity** with current standalone behavior (§14).
- Readiness/pipeline integration stays **not approved** until Step 3 (b)/(c) is explicitly gated.

---

## Related

- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/norway-school-identity-matching-execution-plan.md`
