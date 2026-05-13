# Phase 2 Evidence Model Closure Criteria

## Snapshot / status

- **Status:** Docs-only governance criteria v1  
- **Scope:** Phase 2 evidence model documentation closure  
- **Repository checkpoint:** `9d45de3 Add Phase 2 evidence model closure outline` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **Not Phase 2 production truth closure**  
- **Not implementation approval**  
- **Not runtime/write approval**  
- **Not PSA publication approval**  
- **Not Route Engine consumption approval**  
- **Not Phase 3 start approval**  
- **Does not change status namespaces**  
- **Does not replace** canonical packet / backlog / Phase 2 decision-state sources  

## Purpose

This document defines **documentation / governance** closure criteria for the Phase 2 evidence model. It reduces ambiguity before any future evidence execution, write path, Phase 3 gate, PSA publication, or Route Engine consumption. It **does not** execute or approve any of those actions. It **must not** be cited as **production truth** closure.

## Source hierarchy

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` is canonical for **`packet_status`**.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` is canonical for **backlog classification**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` is canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/phase-2-status-namespace-decisions.md` records owner-approved namespace decisions and must not override canonical sources.  
5. `docs/architecture/phase-2-closure-criteria-checklist.md` is a **control summary** and must not create new canonical statuses.  
6. `docs/architecture/phase-2-evidence-model-closure-outline.md` is **preparatory** and **non-canonical**.  
7. `docs/architecture/norway-school-identity-matching-execution-plan.md` is **timeline / control context**.  

If this document conflicts with a canonical source, the **canonical source wins** and this document must be revised.

## Evidence model scope

| IN (governance criteria only) | OUT (explicitly excluded) |
|------------------------------|---------------------------|
| Evidence object boundaries | Runtime / write |
| Minimum sufficiency semantics (governance level) | PSA publication |
| Status namespace guardrails | Route Engine consumption |
| Decision boundary (docs framing) | Operator workflow implementation |
| Publication boundary (docs framing) | Source fetch jobs |
| Owner gates (visibility) | County/case packet execution |
| Forbidden shortcuts | Full LOSA implementation |
| | Phase 3 implementation |
| | Final reviewer workflow |
| | Publication enum definition |

## Evidence object boundary

| Object | Governance role in this document | Execution allowed here? | Blocked until separate owner gate? |
|--------|----------------------------------|-------------------------|-------------------------------------|
| Evidence packet | DOCS_BOUNDARY_ONLY | NO | NO (planning artifact; execution paths still gated elsewhere) |
| Source observation | DOCS_BOUNDARY_ONLY | NO | NO |
| NSR candidate | DOCS_BOUNDARY_ONLY | NO | NO |
| Location candidate | DOCS_BOUNDARY_ONLY | NO | NO |
| Identity decision | DOCS_BOUNDARY_ONLY | NO | YES |
| Location decision | DOCS_BOUNDARY_ONLY | NO | YES |
| Publication decision | DOCS_BOUNDARY_ONLY | NO | YES |
| PSA materialization | DOCS_BOUNDARY_ONLY | NO | YES |
| Route Engine consumption | DOCS_BOUNDARY_ONLY | NO | YES |

## Minimum evidence sufficiency semantics (governance level)

A future **review-ready** packet (terminology at governance level only) must have evidence **categories** **traceable** to canonical packet / backlog / Phase 2 spec sources—not invented here—for: source snapshot/reference; source observation date when available; raw source label; source system; programme/stage context; county/fylke context (dimension only, no examples); NSR candidate evidence or explicit gap; alias/language evidence when relevant; location/avdeling evidence when relevant; ambiguity/conflict rationale; unsupported/LOSA/external-delivery signal when relevant; source limitations; gap list; **audit/sign-off metadata** remains an **open owner decision** (see §13).

**Review-ready** does **not** mean publishable; does **not** approve operator workflow; missing evidence must **not** be treated silently as truth. If packet format, backlog doc, or Phase 2 spec are more specific, **they win**. No field schema; no new enum values.

## Status namespace usage

Authoritative rules: `docs/architecture/phase-2-status-namespace-decisions.md` (does not override items 1–3). **`packet_status`** is **closed** and owned by packet format + that record—**no full enum restated here**. Backlog classifications are **not** `packet_status`. Phase 2 decision states are **not** `packet_status`. **`needs_review`** must be **namespace-qualified**. **`publishable`** does **not** mean PSA publication. This document **creates no new status strings**.

## Decision boundary

- Evidence packet does **not** decide truth.  
- Source observation does **not** decide truth.  
- Candidate does **not** decide truth.  
- Diagnostics do **not** decide truth.  
- Review-readiness does **not** publish truth.  
- Identity/location decisions require **owner-gated** workflow.  
- Publication decision requires **separate owner-gated** workflow.  
- PSA materialization is **outside** evidence model closure.  
- Route Engine consumption is **outside** evidence model closure.  

## Closure criteria (documentation governance)

| Criteria | Docs governance condition | Docs status | Production/runtime status |
|----------|---------------------------|-------------|---------------------------|
| Scope clarity | IN/OUT scope stated | DOCS_CRITERIA_DEFINED | PRODUCTION_TRUTH_NOT_CLOSED |
| Object boundary clarity | Object table complete | DOCS_CRITERIA_DEFINED | EXECUTION_NOT_APPROVED |
| Evidence sufficiency clarity | Traceability rule stated | DOCS_CRITERIA_DEFINED | EXECUTION_NOT_APPROVED |
| Namespace safety | Deferral to namespace decisions + packet format | DOCS_CRITERIA_DEFINED | RUNTIME_NOT_APPROVED |
| Decision boundary clarity | Decision bullets present | DOCS_CRITERIA_DEFINED | EXECUTION_NOT_APPROVED |
| Non-publishability guarantee | Review-ready ≠ publishable | DOCS_CRITERIA_DEFINED | PSA_NOT_APPROVED |
| Auditability | Gap/limitation framing required at governance level | DOCS_REFERENCE_ONLY | EXECUTION_NOT_APPROVED |
| Owner-gate visibility | Gates listed, none approved here | DOCS_CRITERIA_DEFINED | EXECUTION_NOT_APPROVED |
| Future contour separation | Execution/PSA/Route/Phase3 outside scope | DOCS_CRITERIA_DEFINED | PHASE3_NOT_APPROVED |
| Forbidden shortcut coverage | Forbidden list present | DOCS_CRITERIA_DEFINED | EXECUTION_NOT_APPROVED |

## Owner gates (not approved here)

Before execution: evidence extraction/report execution; writing Phase 2 tables; operator/review workflow; identity/location decision rows; publication decisions; PSA materialization; Route Engine consumption; Phase 2 → Phase 3 gate criteria; Phase 3 implementation. **This document does not approve any of these gates.**

## Forbidden shortcuts

- packet exists → publish  
- ready_for_review → publish  
- needs_review → operator workflow approved  
- publishable → PSA publication  
- helper diagnostics → publication truth  
- first candidate wins  
- multi-location → publishable  
- LOSA → ordinary school availability  
- schema exists → insert rows  
- criteria document → production truth closure  
- criteria document → runtime/write approval  
- criteria document → Phase 3 start  

## Open owner decisions

Unresolved (not adopted here): whether evidence sufficiency uses levels (e.g. L1/L2); whether reviewer/audit metadata belongs in packet format or separate sign-off; whether publication decision enum values need a separate document; whether source observation/candidate/decision boundaries need an ADR before execution; how future operator workflow represents review states without namespace leakage.

If any earlier section would **resolve** these by implication, the question remains **OPEN** and must **not** be treated as adopted.

## What this document allows next

This document does not select or approve the next product or implementation step.  
It only allows the team to stop expanding Phase 2 evidence model terminology/governance documentation unless a later owner decision reopens it.

Next owner-selected docs or product gates must be chosen separately and may include:

- Phase 2 → Phase 3 gate criteria drafting;  
- Phase 2 evidence execution planning under a separate owner gate;  
- app/runtime work outside this evidence-model closure document, subject to existing specs and separate approval.

No next step is automatically approved by this document.

## Final boundary statement

Phase 2 evidence model closure is documentation-defined here, but production truth, runtime/write integration, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved gates.
