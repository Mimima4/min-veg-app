# Phase 2 Evidence Model Closure Outline

## Snapshot / status

- **Status:** Docs-only preparatory outline  
- **Classification:** Non-canonical planning artifact  
- **Scope:** Phase 2 evidence model closure preparation  
- **Repository checkpoint:** `8d89aea Add Phase 2 status namespace decisions` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **Not final closure criteria**  
- **Not implementation approval**  
- **Not runtime/write approval**  
- **Not PSA publication approval**  
- **Not Route Engine consumption approval**  
- **Not Phase 3 start approval**  
- **Does not change status namespaces**  

## Purpose

This outline prepares a future **owner-reviewed** Phase 2 evidence model closure criteria document. It identifies **structure** and **unresolved owner decisions** only. It must **not** be cited as Phase 2 evidence model closure, nor as a **canonical status** source. Canonical definitions remain in the sources listed below.

## Source hierarchy

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` is canonical for **`packet_status`**.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` is canonical for **backlog classification**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` is canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/phase-2-status-namespace-decisions.md` records owner-approved namespace decisions and must not override canonical sources.  
5. `docs/architecture/phase-2-closure-criteria-checklist.md` is a **control summary** and must not create new canonical statuses.  
6. `docs/architecture/norway-school-identity-matching-execution-plan.md` is **timeline / control context**.  

If this outline conflicts with a canonical source, the **canonical source wins** and this outline must be revised.

## Namespace guardrails

Authoritative namespace rules live in **`docs/architecture/phase-2-status-namespace-decisions.md`**. **`packet_status`** must remain in the namespace defined by the **packet format** and that decision record (see canonical sources; **no full enum restated here**). **`needs_review`** must always be **namespace-qualified**. **`publishable`** never means PSA publication by itself. **This outline creates no new status strings.**

## Proposed final-document section outline

| Future section | Purpose | Source basis | Must define later | Must not imply | Owner decisions still needed |
|----------------|---------|--------------|---------------------|----------------|------------------------------|
| Evidence model scope | Bound what “evidence model closure” covers vs other gates. | Checklist, Phase 2 spec, execution plan. | Scope boundaries for evidence-only closure. | Runtime/write or PSA already approved. | Exact scope line vs Phase 3 inputs. |
| Evidence object model | Name planning objects (dossiers, candidates, etc.) without final schema. | Packet format, Phase 2 spec. | Object boundaries for final criteria text. | New tables or implementation tasks. | Whether extra object types need owner naming. |
| Evidence sufficiency rules | Frame “enough evidence” without fixing levels. | Phase 2 spec, backlog, checklist. | Sufficiency tests per concern (identity, location, etc.). | Final L1/L2 or numeric levels adopted here. | Whether leveled sufficiency is required (see open decisions). |
| Status namespace usage | Point readers to correct namespaces per token. | Namespace decisions, packet format, backlog. | How prose and criteria reference namespaces. | New canonical statuses or merged tokens. | Style for cross-namespace references in criteria doc. |
| Packet status semantics | Link criteria to planning-only packet states. | Packet format, namespace decisions. | How closure criteria use `packet_status` safely. | `packet_status` absorbs backlog or decision states. | None if sources unchanged; else align with owner. |
| Backlog classification semantics | Link criteria to backlog categories. | Backlog doc, namespace decisions. | How backlog classes inform evidence gaps. | Backlog copied into `packet_status`. | Mapping rules for criteria doc only. |
| Phase 2 decision state semantics | Link criteria to spec decision vocabulary. | Phase 2 spec, namespace decisions. | How decision states relate to evidence sufficiency. | Decision state copied into `packet_status`. | Disambiguation where spec and backlog overlap. |
| Review / governance boundary | Separate review workflow from evidence rules. | Phase 2 spec, checklist. | Who signs what before closure claims. | Operator workflow approved by this file. | Sign-off channel vs packet-only metadata. |
| Publication decision boundary | Keep publication decisions off packet/backlog enums. | Spec, checklist, execution plan. | What a publication decision entity may contain later. | PSA write path approved here. | Whether a separate publication enum is required. |
| PSA materialization boundary | PSA unchanged absent separate publication gate. | Execution plan, spec. | Preconditions before any PSA materialization talk. | PSA publication authorized by evidence closure. | Owner gates already in plan; criteria must reference. |
| Route Engine consumption boundary | Route remains out of evidence closure unless gated. | Spec, checklist, ADRs as cited in checklist. | No Route consumption implied by evidence closure. | Route Engine consumption approved here. | Any future diagnostic-to-Route contract is separate gate. |
| Forbidden shortcuts | List disallowed inference chains for criteria drafting. | Namespace decisions, checklist. | Same list in final doc, expanded if needed. | Shortcuts acceptable without owner text. | Wording only; substance from canonical docs. |
| Owner gates | Enumerate which owner approvals precede closure claims. | Checklist, execution plan. | Exact gate list for final criteria doc. | Gates satisfied by publishing this outline. | Order and packaging of sign-offs. |
| Closure criteria | Placeholder for eventual measurable closure tests. | Checklist rows, spec. | Testable criteria in the final document only. | Phase 2 evidence model closed by this outline. | Full criteria deferred to owner-reviewed doc. |
| Open owner decisions | Track unresolved questions (see below). | This outline, checklist. | Resolution in final criteria or separate records. | Decisions already settled here. | All items in § Required unresolved owner decisions. |
| Non-goals | Explicit exclusions (implementation, SQL, ingestion). | Checklist, execution plan. | Same exclusions in final criteria. | Hidden scope creep into build work. | Any extra non-goals the owner adds later. |

## Required unresolved owner decisions

**Open questions only — not adopted rules:**

- Whether evidence sufficiency should use **levels** (e.g. L1 / L2) or a single bar.  
- Whether **reviewer / audit metadata** belongs in the packet format or a **separate sign-off** artifact.  
- How to **map** `packet_status`, backlog classification, and Phase 2 decision states **without namespace leakage** in prose and criteria.  
- Whether any **publication decision enum** must be defined **separately** from packet/backlog/decision-state namespaces.  
- Whether **source observation / candidate / decision** object boundaries need an **ADR** before final closure criteria are written.  

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
- evidence model outline → evidence model closure  

## Recommended next step

**Recommended next gate after this outline:** owner review of the evidence model closure outline.

This recommendation must be read together with **`docs/architecture/phase-2-closure-criteria-checklist.md`** and does **not** replace its **allowed strategic decisions**. It does **not** authorize drafting final closure criteria unless **explicitly approved**.
