# Phase 2 Problem-Contour Activation / Read-Model Map

## 2. Snapshot / status

- **Status:** Architecture map / docs-only
- **Scope:** Clarifies activation and read-model boundaries for Phase 2 problem contour
- **Repository checkpoint:** `7399186 Add Phase 2 staging RLS execution packet`
- **Created at (UTC):** 2026-05-13
- **Not implementation**
- **Not SQL**
- **Not RLS apply**
- **Not schema change**
- **Not DB write approval**
- **Not runtime/write approval**
- **Not admin dashboard integration approval**
- **Not app integration approval**
- **Not PSA approval**
- **Not Route approval**
- **Not Phase 3 approval**
- **Not Phase 4 LOSA execution approval**
- **Not Gate 34B approval**
- **No partial integration authorization**
- **No new canonical statuses / enums / API fields / admin data contracts**
- **Child-information protection principle applies**

**Non-canonicality of this map:** This file is a **crosswalk / map only**. It **must not** become a new canonical status spec, **must not** introduce enums, DB statuses, API fields, route fields, dashboard fields, SQL, schema, endpoints, UI components, wireframes, or data contracts. It **must not** override `norway-school-identity-matching-spec.md`, `school-identity-location-resolution-phase-2-spec.md`, `route-engine-master-spec.md`, or other listed sources. If sources conflict, record under **§10** as **OPEN QUESTION** / **BLOCKED_SPEC_CONFLICT** — **do not** resolve silently here.

## 3. Source basis

| Source path | What it contributes to this map |
|-------------|-----------------------------------|
| `docs/architecture/norway-school-identity-matching-spec.md` | **CASE 1–4** mandatory matching behavior; **Forbidden** shortcuts (no random campus, no first-candidate, no PSA truth when unresolved, alias/LOSA rules). |
| `docs/architecture/school-identity-location-resolution-phase-2-spec.md` | Phase 2 contour purpose; **§9 Decision states** vocabulary; **§11 Publishability contract**; **§12 Route Engine boundary**; **§13 Readiness / diagnostics first**; **§14–§18** pipeline direction, county matrix, source drift, implementation phases, acceptance/success; **§21** Phase 4 relationship. |
| `docs/architecture/route-engine-master-spec.md` | VGS identity rules pointer to matching spec; **internal DB truth / publishable truth** posture for runtime (e.g. §Stage context around Vilbli/NSR and “internal DB truth only”). |
| `docs/architecture/norway-school-identity-matching-execution-plan.md` | Timeline / control context; **hard principles** aligned with matching spec; **explicit** statement that canonical boundaries remain in Phase 2 + Route specs (this plan does not approve integration). |
| `docs/architecture/phase-2-closure-criteria-checklist.md` | Distinct “Phase 2 done” meanings (docs/schema vs standalone diagnostics vs production truth vs runtime/write); **hard gates** vs planning. |
| `docs/architecture/phase-2-to-phase-3-gate-criteria.md` | Phase 3 **not** auto-started from docs/schema/diagnostics alone; aggregates checklist without replacing it. |
| `docs/architecture/phase-2-runtime-write-closure.md` | Runtime/write / PSA / Route consumption remain **not approved** at documentation boundary layer. |
| `docs/architecture/phase-2-production-truth-closure.md` | Separation of evidence, candidates, decisions, publication decisions, PSA, Route; **no hidden production truth** from docs/diagnostics. |
| `docs/architecture/phase-2-read-only-diagnostics-contract.md` | Read-only diagnostics **validated/frozen** scope; **no** writes, readiness/pipeline influence, PSA, Route feed; allowed tables list. |
| `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` | Helper **must not write**; output **must not influence** readiness, writes, PSA publication/publishability, pipeline control. |
| `docs/architecture/phase-2-staging-rls-execution-packet.md` (Gate 34A) | **RLS/security DDL packet only**; explicit non-scope: **not** read-model, admin presentation, Route/PSA publication, full contour readiness (see Gate 34A snapshot non-scope sentence). |
| `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql` | **Schema artifact** for the seven Phase 2 relations names; **does not** imply publishability, operator UX, or Route wiring. |

## 4. Clean path vs problem path

**Default / volume:** Clean **CASE 1**-style resolution and **publishability contract satisfied** remain the **normal, high-volume path**. Phase 2 is a **tail / problem contour** only — **not** every row.

| Stage | Clean/default path behavior | Problem-tail behavior | Output | Must not happen | Source basis |
|-------|-----------------------------|------------------------|--------|------------------|--------------|
| Data extraction / source observation | Immutable source-backed observation ingested per Phase 2 hard invariants | Observation remains tied to ambiguous identity/location/LOSA/external signals | Clean: observation supports resolution; Problem: observation feeds explicit non-publishable states | Silent promotion to truth without auditable decision | `school-identity-location-resolution-phase-2-spec.md` — Hard invariants / observation vs decision; `norway-school-identity-matching-execution-plan.md` — Hard principles |
| Matching / identity–location resolution | **CASE 1:** one Vilbli row → one identity + one NSR location (allowed) | **CASE 2–4:** abort / ambiguous / unsupported per matching spec; Phase 2 states capture unresolved/unsupported | Clean: resolved match path; Problem: explicit `identity_unresolved` / `location_unresolved` / `ambiguous_candidates` / `unsupported_losa` / `external_delivery` etc. | Random campus; first-candidate; split slash aliases; ordinary match for LOSA | `norway-school-identity-matching-spec.md` — **Mandatory matching behavior** + **Forbidden**; `school-identity-location-resolution-phase-2-spec.md` — **§9**, county matrix **§15** |
| Publishability evaluation | **§11** preconditions met → may approach `publishable` / publication gate (still separate approval for writes) | Preconditions fail → remain non-publishable / review / unsupported per **§9** failure behavior | Clean: deterministic publishability path; Problem: blocked publication with reason codes | Publish without auditable evidence; expand publishability silently | `school-identity-location-resolution-phase-2-spec.md` — **§11 Publishability contract**, **§9** failure behavior |
| Published internal truth | PSA/programme materialization path **only** after explicit future approval (not here) | Unresolved / review / unsupported **not** published | Clean: published truth matches contracts | PSA truth while identity/location unresolved | `norway-school-identity-matching-spec.md` — **Forbidden**; `school-identity-location-resolution-phase-2-spec.md` — **§11**, **§21** |
| Route Engine consumption | Consumes **published internal DB truth** only (per Route + Phase 2 boundaries) | Unresolved/review remain **operator-layer** until modelled | Clean: Route reads snapshot truth; Problem: no Route consumption of raw Phase 2 contour | Random campus in Route; LOSA as ordinary option; live external source as route truth | `school-identity-location-resolution-phase-2-spec.md` — **§12 Route Engine boundary**; `route-engine-master-spec.md` — internal DB truth / matching spec normativity |
| Phase 2 contour activation | Not entered when CASE 1 + publishability OK | Entered when matching CASE 2–4 or decision states require explicit audit/review | Problem records, decisions, publication decisions **as separate objects** | Phase 2 as default happy path for all counties | `school-identity-location-resolution-phase-2-spec.md` — **§9**, **§15**; `norway-school-identity-matching-spec.md` — CASE 2–4 |
| Owner/admin review path (**future**) | No dashboard contract here | **Later** processed, action-oriented problematic cases only (see §7) | Decision-support, not raw table UX | All-row dumps; raw JSON stream; diagnostics UI as admin | `school-identity-location-resolution-phase-2-spec.md` — **§12** (no family-facing defined); Gate 34A non-scope; **§7 below** |
| Return-to-truth | Only via auditable decision + publication boundary | Stays in operator/review layer until gates passed | Published truth after **separate** approved materialization | Auto-return from Phase 2 to Route without publication gate | `school-identity-location-resolution-phase-2-spec.md` — **§11**, **§12**; `phase-2-production-truth-closure.md` — decision vs publication |

## 5. Activation triggers

| Trigger / condition | Canonical token? | Source basis | Meaning | Output / handling | Must not happen |
|---------------------|------------------|--------------|---------|-------------------|-----------------|
| Multi-location / campus ambiguity without explicit campus | **NON-CANONICAL DESCRIPTOR** (maps to **CASE 2** behavior) | `norway-school-identity-matching-spec.md` — **CASE 2**; `school-identity-location-resolution-phase-2-spec.md` — **§15** county `55` | Do not choose one campus; mark ambiguous / unresolved | Problem-tail; `location_unresolved` / `ambiguous_candidates` as per spec vocabulary | Random campus; first candidate |
| Slash / Sami–Norwegian alias split risk | **NON-CANONICAL DESCRIPTOR** (maps to **CASE 3**) | `norway-school-identity-matching-spec.md` — **CASE 3** + **Forbidden** (Sámi/Norwegian) | Single identity; aliases must not become false multi-school | Problem-tail if not safely resolved; alias-aware resolution per spec | Split aliases into multiple schools |
| LOSA / unsupported external-delivery | **NON-CANONICAL DESCRIPTOR** (maps to **CASE 4** + states) | `norway-school-identity-matching-spec.md` — **CASE 4**; `school-identity-location-resolution-phase-2-spec.md` — **`unsupported_losa`**, **`external_delivery`**, **§21** | Not ordinary 1:1 match; Phase 4 for final LOSA model | `unsupported_losa` / `external_delivery` states; no ordinary publish | LOSA publish bypass |
| `identity_unresolved` | **yes** | `school-identity-location-resolution-phase-2-spec.md` — **§9 Decision states** | Identity not canonically resolved for publishability | Problem-tail; review / further resolution | Silent publish |
| `location_unresolved` | **yes** | same — **§9** | Location/campus ambiguity not resolved | Problem-tail | Random campus selection |
| `ambiguous_candidates` | **yes** | same — **§9** | Multiple candidates without safe tie-break | Problem-tail | First-candidate / sort-order pick |
| `unsupported_losa` | **yes** | same — **§9**, **§21** | LOSA not modelled as publishable ordinary school | Expose state; Phase 4 contour | Publish as ordinary |
| `external_delivery` | **yes** | same — **§9**, **§21** | External delivery not publishable under current contract | Expose state; Phase 4 | Publish bypass |
| `needs_review` | **yes** | same — **§9**; governance note in **§18** success list | Operator-visible review-needed | Review workflow **later**; diagnostics first per **§13** | Hidden manual truth |
| Evidence incomplete or conflicting | **NON-CANONICAL DESCRIPTOR** (paraphrase of **§9 Failure behavior**) | `school-identity-location-resolution-phase-2-spec.md` — **§9** (“missing or conflicting”) | Must become unresolved/review/unsupported; never publish | Problem-tail states | Publish anyway |
| `rejected_false_match` | **yes** | `school-identity-location-resolution-phase-2-spec.md` — **§9** | False match rejected | Problem-tail; audit path | Treat as publishable |
| Source drift / stale decision | **NON-CANONICAL DESCRIPTOR** | `school-identity-location-resolution-phase-2-spec.md` — **§16 Source drift handling** | Stale cannot auto-publish; revalidation/review | Review/revalidation state | Silent publication on drift |
| No auditable decision | **NON-CANONICAL DESCRIPTOR** | `school-identity-location-resolution-phase-2-spec.md` — **§8 Decision ownership / audit**; **§11** (auditable decision required) | Silent mapping forbidden | Block publishability | Manual truth without decision object |
| Publishability preconditions not met | **NON-CANONICAL DESCRIPTOR** (contrapositive of **§11**) | `school-identity-location-resolution-phase-2-spec.md` — **§11 Publishability contract** | Observation cannot become `programme_school_availability` | Remain non-publishable | Expand publishability without evidence |
| First-candidate / random-campus risk | **NON-CANONICAL DESCRIPTOR** | `norway-school-identity-matching-spec.md` — **Forbidden**; `school-identity-location-resolution-phase-2-spec.md` — **§15** | Same as matching spec hard bans | Abort / explicit states | Any tie-break by sort order |
| Diagnostics or review mistaken for publication truth | **NON-CANONICAL DESCRIPTOR** | `phase-2-read-only-diagnostics-contract.md` — **§2 Decision**; `phase-2-read-only-diagnostics-helper-boundary-adr.md` — **§2** (output must not influence publishability); `phase-2-production-truth-closure.md` — purpose | Diagnostics inform operators only | Read-only simulation before integration per **§13** | Readiness/pipeline control from helper output |

## 6. Phase responsibility map

| Phase / contour | Responsibility | Output | Explicit non-responsibility | Source basis |
|-----------------|----------------|--------|----------------------------|--------------|
| Normal extraction / matching layer | Vilbli→NSR conservative matching; CASE rules | Clean match signals or safe abort flags | Not publication; not Route construction | `norway-school-identity-matching-spec.md`; `norway-school-identity-matching-execution-plan.md` |
| Phase 2 problem contour | Identity/location/evidence/review/**publishability decision** records; auditable states | Explicit states + reason codes; **no silent truth** | Not PSA writer; not Route engine; not admin UI | `school-identity-location-resolution-phase-2-spec.md` — scope + **§7–§12** |
| Diagnostics / read-only simulation | Standalone script + helper; capped read-only aggregation | Diagnostic text/JSON for operators | Not publication truth; not pipeline control | `phase-2-read-only-diagnostics-contract.md`; `phase-2-read-only-diagnostics-helper-boundary-adr.md` |
| Owner/admin processed review view (**future**) | Action-oriented problematic cases | **NON-CANONICAL DESCRIPTOR** — “processed cards” concept only (§7) | Not raw DB; not all rows | `school-identity-location-resolution-phase-2-spec.md` — **§12**; this map **§7** |
| Publication decision boundary | `programme_availability_publication_decisions` purpose | Deterministic publishability gate record (**future implementation**) | Not raw matching logic inside publication table | `school-identity-location-resolution-phase-2-spec.md` — **§7.6** |
| Route Engine | Consumes published internal snapshot truth | Routes for families from **approved** internal truth | Not Phase 2 table reader; not diagnostics consumer | `school-identity-location-resolution-phase-2-spec.md` — **§12**; `route-engine-master-spec.md` |
| PSA | Future materialization / publication | Published programme availability (**separate gate**) | Not in this map’s approval | `school-identity-location-resolution-phase-2-spec.md` — **§14**; `phase-2-runtime-write-closure.md` |
| Phase 3 / controlled expansion | **Later** 1:N / controlled emission | N/A here | **Not opened** by this map | `phase-2-to-phase-3-gate-criteria.md`; `phase-2-closure-criteria-checklist.md` |
| Phase 4 LOSA / external-delivery final model | Final LOSA contract & publishability for county `56`/etc. | N/A here | **Not opened** by this map | `school-identity-location-resolution-phase-2-spec.md` — **§21** |
| Gate 34A execution packet | Staging **RLS/policy DDL** preparation only | SQL/rollback packets for **future** 34B | **Not** read-model, admin, Route, PSA | `phase-2-staging-rls-execution-packet.md` — snapshot + non-scope sentence |

**Rules (sourced):** Do **not** duplicate Route Engine logic inside Phase 2 (`school-identity-location-resolution-phase-2-spec.md` — **§12**). Do **not** duplicate PSA truth inside Phase 2 (same + production truth closure). Do **not** make diagnostics a publication path (`phase-2-read-only-diagnostics-helper-boundary-adr.md` — **§2**). Do **not** imply Phase 3 / Phase 4 opened (`phase-2-to-phase-3-gate-criteria.md`; `school-identity-location-resolution-phase-2-spec.md` — **§21**).

## 7. Owner/admin processed view boundary

**Future posture (documentation only — not approved integration):**

- A **future** owner/admin dashboard may show **only** processed, readable, **action-oriented** problematic cases that need review or approval — aligned with **not** exposing raw streams (`school-identity-location-resolution-phase-2-spec.md` — **§12** “operator-layer”; no family-facing display defined in Phase 2 spec).
- **No** all-row dump; **no** raw JSON as final owner/admin UX; **no** raw evidence dump; **no** raw candidates stream; **no** clean happy-path stream — clean cases stay out unless they become problematic / risky / review-needed.
- **No** direct DB/Supabase access as an approved pattern here; **no** new server routes approved; **no** UI reads from Phase 2 approved; **no** admin dashboard integration approved by this map.
- **No** wireframes, routes, components, endpoints, API fields, or data contracts are approved here.

**Conceptual example dimensions only — NON-CANONICAL DESCRIPTOR (not fields/schema):**

- why this case surfaced  
- problem type  
- affected source / county / profession / stage (**descriptor**, not a column contract)  
- evidence summary (**aggregated**, not raw dump)
- risk  
- required owner action  
- blocked reason  
- possible decision options  

## 8. Return-to-truth boundary

| Rule | Source basis |
|------|----------------|
| Phase 2 does **not** automatically return data to Route truth | `school-identity-location-resolution-phase-2-spec.md` — **§12** (“consumes only published DB truth” implies prior publication boundary); `phase-2-production-truth-closure.md` — observation/candidate vs publication |
| Data may return **only** through auditable decision + publication decision boundary | `school-identity-location-resolution-phase-2-spec.md` — **§8**, **§11**; `phase-2-production-truth-closure.md` — decision vs publication decision |
| Route consumes **published internal DB truth** only | `school-identity-location-resolution-phase-2-spec.md` — **§12**; `route-engine-master-spec.md` — internal DB truth / Vilbli+NSR normative block |
| `unresolved` / `review` / `unsupported` states stay operator-layer until explicitly modelled and approved | `school-identity-location-resolution-phase-2-spec.md` — **§12** |
| No PSA publication/materialization approved here | `phase-2-runtime-write-closure.md`; `school-identity-location-resolution-phase-2-spec.md` — **§14** |
| No Route Engine consumption approved here | `phase-2-runtime-write-closure.md`; `school-identity-location-resolution-phase-2-spec.md` — **§12** |
| Diagnostics may inform operator judgment only; diagnostics are **not** publication truth | `phase-2-read-only-diagnostics-contract.md` — **§2**; `phase-2-read-only-diagnostics-helper-boundary-adr.md` — **§2** |

## 9. Non-overload / no-duplication rules

Cross-cutting norms (see **`school-identity-location-resolution-phase-2-spec.md` §12–§14**, **`norway-school-identity-matching-spec.md` Forbidden**, **`phase-2-read-only-diagnostics-contract.md`**, **helper ADR §2**):

- Do not send all cases to Phase 2.
- Do not duplicate Route Engine logic inside Phase 2.
- Do not use admin dashboard as raw diagnostics UI.
- Do not treat diagnostics as publication truth.
- Do not create parallel PSA truth.
- Do not let Phase 2 become the normal happy-path.
- Do not bypass the publishability contract.
- Do not use Phase 2 to compensate for missing Route/UI design.
- Do not open Phase 3 by implication.
- Do not open Phase 4 by implication.
- Do not open Gate 34B by implication.

## 10. Open questions / conflicts

No source conflicts were found in this docs-only mapping pass.

**Scope note (not a conflict):** `norway-school-identity-matching-execution-plan.md` self-describes as a **temporary planning artifact**; canonical matching rules remain in **`norway-school-identity-matching-spec.md`**. Additional production-truth hierarchy docs referenced from **`phase-2-production-truth-closure.md`** (e.g. evidence packet format) were **not** part of the Gate 34A.1 required read list — **do not** treat their absence in §3 as an override of those closures.

## 11. What remains blocked

- SQL execution  
- RLS enablement  
- Policy creation in DB  
- DB writes  
- Runtime/write integration  
- Admin dashboard integration  
- App integration  
- Pipeline/readiness integration  
- PSA publication/materialization  
- Route Engine consumption  
- Phase 3  
- Phase 4 LOSA final execution  
- Production apply  
- Gate 34B execution  
- Partial integration  

## 12. Map outcome

**PROBLEM_CONTOUR_ACTIVATION_MAP_CREATED_DOCS_ONLY**

This means the activation/read-model boundary is documented. It does **not** implement the contour. It does **not** approve dashboard integration. It does **not** approve Route/PSA/runtime/write. It does **not** approve SQL/RLS/34B execution. It does **not** approve schema changes. It does **not** create canonical statuses or API contracts.

## 13. Final boundary statement

Phase 2 problem-contour activation and read-model boundaries are documented here, but SQL execution, RLS enablement, DB writes, runtime/write integration, admin dashboard integration, PSA publication, Route Engine consumption, Phase 3, Phase 4 LOSA execution, production apply, Gate 34B execution, and any partial app integration remain blocked until separate owner-approved gates.
