# Phase 2 Operational Evidence Sufficiency Standard

## Snapshot / status

- **Status:** Documentation-only operational sufficiency standard  
- **Scope:** Phase 2 evidence sufficiency before future owner-gated review  
- **Repository checkpoint:** `de261a6 Add Phase 2 evidence model closure criteria` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **No execution authority**  
- **Not runtime/write approval**  
- **Not PSA publication approval**  
- **Not Route Engine consumption approval**  
- **Not Phase 3 approval**  
- **Not production truth closure**  
- **Does not change status namespaces**  
- **Does not reopen** Phase 2 evidence model governance/docs  
- **Does not replace** packet / backlog / Phase 2 decision-state canonical sources  

## Purpose

This document defines **evidence sufficiency predicates** so a case **may be considered for future owner-gated review** when canonical evidence requirements are met. It does **not** define or activate any review workflow. It does **not** make cases publishable or write truth. It reduces silent promotion of weak, ambiguous, or incomplete evidence.

## Source hierarchy / canonical precedence

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical for **`packet_status`** and packet structure.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — canonical for **backlog classifications**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/norway-school-identity-matching-spec.md` — canonical for **school identity matching safety rules**.  
5. `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace decisions; **must not** override 1–4.  
6. `docs/architecture/phase-2-evidence-model-closure-criteria.md` — governance closure boundaries and **open owner decisions**.  
7. `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist for closure levels and hard gates.  
8. `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline / control context.  

**Conflict rule:** if this document conflicts with a canonical source, the **canonical source wins**; revise this document later; **do not** edit canonical sources in this task; **do not** invent a resolution.

**Relationship:** this document **does not amend** `phase-2-evidence-model-closure-criteria.md`. It **operationalizes** sufficiency interpretation only where **non-contradictory**. Open items there stay **OPEN** unless explicitly listed as OPEN here; **no** closure by implication.

## Scope: IN / OUT

| IN | OUT |
|----|-----|
| Sufficiency predicates for evidence review readiness | Packet schema changes |
| NSR / alias / location / ambiguity / LOSA–external boundaries at predicate level | New statuses or enums |
| Forbidden shortcut reinforcement | Runtime/write, PSA publication, Route consumption |
| | Operator workflow implementation, decision/publication row creation |
| | Production truth implementation, county/case execution, Phase 3 implementation |

## Evidence sufficiency mode

| Mode | Meaning | Allowed here? |
|------|---------|----------------|
| Canonical pointer | Cite canonical doc section for the rule | YES |
| Locked invariant restatement | Same rule, same meaning, no new detail | YES |
| OPEN owner decision | Explicitly unresolved; no hidden answer | YES |
| New packet field definition | Would extend packet format | NO |
| New status / enum | Would change namespaces | NO |
| Workflow transition | Would define activation | NO |
| Production truth decision | Would assert DB/publication truth | NO |

## NSR candidate sufficiency

High-level predicates only (see backlog **required evidence** / NSR linkage; packet format for dossier shape). A case **may be considered for future owner-gated review** only if:

- **Source label traceability** to canonical packet/backlog/spec sources.  
- **NSR candidate traceability** (linkage or explicit documented gap).  
- **Reason codes or rationale** where canonical docs require them; no silent gaps.  
- **Explicit gap** when candidate evidence is absent (must not infer a winner).  
- **No first-candidate shortcut**; **no sort-order win**; **no weak fuzzy tie-break** as acceptance (matching spec invariants).  
- **Unresolved / ambiguous candidates** remain **visible**; diagnostics explain, not resolve (Phase 2 spec / diagnostics contracts).  

No field schema; no DB fields; **no** approval of candidate selection.

## Alias / bilingual identity sufficiency

- Slash **/** alias must **not** split one identity into multiple schools **without** evidence aligned with matching spec + Phase 2 spec.  
- Sámi / Norwegian naming must **not** default to two schools (same specs).  
- **User-facing display** requires **verified** source evidence **later**, under **separate** gates—not proven here.  
- Language/display proof is **separate** from **publication** proof (`publishable` in **`NAMESPACE=phase2_decision_state`** does **not** mean PSA publication per namespace decisions).  
- **Raw label alone** is not final display truth.  

## Location / avdeling sufficiency

- Location / avdeling evidence must be **explicit** per canonical models; missing evidence = **gap**.  
- **Random campus** and **first matching campus** are **forbidden** (matching spec + execution plan hard principles).  
- **Multi-location** does **not** mean publishable (CASE 2 framing in matching spec).  
- **Route-relevant** location choice requires **later owner-gated** decision/workflow—not this document.  

## Ambiguity / conflict sufficiency

- **Ambiguity** must remain **visible**; conflicting candidates must **not** be collapsed (Phase 2 spec decision states).  
- **Unresolved** conflicts must **block** the publication path conceptually; no publication claim here.  
- **Diagnostics** may explain conflict; they **must not** resolve it as truth (diagnostics contracts / checklist).  
- **No threshold tuning** to force green or hide ambiguity (execution plan / product principles alignment).  

## LOSA / external delivery handling

- **LOSA** is **not** ordinary school availability; **external delivery** is **not** a normal 1:1 ordinary match (matching CASE 4 / backlog / Phase 2 vs Phase 4 docs).  
- Such cases stay **blocked** from **ordinary** publication framing; **Phase 4** or **separate owner-gated** model applies.  
- Evidence may **document** LOSA / external-delivery **signals** per backlog/namespace rules; it must **not** be treated as **ordinary-school publication truth**.  
- Use **`NAMESPACE=packet_status`** vs **`NAMESPACE=phase2_decision_state` / backlog** per **`phase-2-status-namespace-decisions.md`**—**no merging** `blocked_losa` with `unsupported_losa`, etc.  

## Review-ready vs publishable boundary

- **Sufficient evidence for future review** does **not** mean **publishable** or PSA publication.  
- **May be considered for future owner-gated review** does **not** approve operator workflow, **does not** create decision rows, **does not** allow PSA materialization or Route Engine consumption.  
- **`ready_for_review`** (`NAMESPACE=packet_status`) is **planning-only**; it does **not** authorize publication (packet format + namespace decisions).  
- needs_review must always be namespace-qualified and must never be used as packet_status without the canonical namespace context.  
- **Publication** requires a **separate owner-gated publication decision** path.  
- **No new `packet_status` values** in this document.  

## Forbidden shortcuts

- evidence exists → truth  
- packet exists → publish  
- ready_for_review → publish  
- needs_review → operator workflow approved  
- publishable → PSA publication (unguarded)  
- first candidate wins  
- sort order wins  
- weak fuzzy tie-break accepted  
- multi-location → publishable  
- LOSA → ordinary school availability  
- diagnostics → publication truth  
- schema exists → insert rows  
- sufficiency standard → runtime/write approval  

## Owner gates still required

This document **approves none** of: evidence extraction/report execution; **future owner review workflow**; identity/location decision rows; publication decisions; PSA materialization; Route Engine consumption; runtime/write integration; **Phase 2 → Phase 3 gate criteria** and **Phase 3 implementation** (separate owner gates each).

## Open owner decisions carried forward

**OPEN** (not resolved here): whether sufficiency **levels** (e.g. L1/L2) are needed; where **reviewer/audit sign-off metadata** belongs; whether **source observation / candidate / decision** boundaries need an **ADR** before execution; how **future owner review workflow** represents states **without namespace leakage**; how **verified user-facing display labels** are approved; how **LOSA/external-delivery** evidence transitions **into Phase 4**.

## Final boundary statement

Phase 2 operational evidence sufficiency is documentation-defined here, but review workflow, production truth, runtime/write integration, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved gates.
