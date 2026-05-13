# Phase 2 Governance and Review Closure

## Snapshot / status

- **Status:** Documentation-only governance/review closure  
- **Scope:** Phase 2 review boundary before production truth  
- **Repository checkpoint:** `ae9847d Add Phase 2 operational evidence sufficiency standard` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **No execution authority**  
- **Not runtime/write approval**  
- **Not PSA publication approval**  
- **Not Route Engine consumption approval**  
- **Not Phase 3 approval**  
- **Not production truth closure**  
- **Not active operator workflow**  
- **Does not change status namespaces**  
- **Does not create** decision rows  
- **Does not create** publication decisions  
- **Does not create** review status enums  

## Purpose

This document defines **governance/review meaning** before **production truth**: review **boundary**, **conceptual authority principles**, and what **review wording may or may not imply**. It does **not** activate workflow or write truth. **Review wording may inform a future owner-gated decision** only under **separate** gates; it must **not** become a hidden publication decision.

## Source hierarchy / canonical precedence

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical for **`packet_status`** and packet structure.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — canonical for **backlog classifications**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/norway-school-identity-matching-spec.md` — canonical for **school identity matching safety rules**.  
5. `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace decisions; **must not** override 1–4.  
6. `docs/architecture/phase-2-evidence-model-closure-criteria.md` — governance closure boundaries and **open owner decisions**.  
7. `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — **committed** operational sufficiency predicates for future owner-gated review; **must not** override items 1–5 or replace item 6.  
8. `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist for closure levels and hard gates.  
9. `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline / control context.  

**Conflict rule:** if this document conflicts with a canonical source, the **canonical source wins**; revise this document later; **do not** edit canonical sources in this task; **do not** invent a resolution.

**Relationship:** this document **does not amend** `phase-2-evidence-model-closure-criteria.md`, **must not replace** `phase-2-status-namespace-decisions.md`, **must not close** production truth, **must not implement** review workflow. Review semantics **only** at documentation/governance level. Any **future storage** of review results is **implementation** and **owner-gated**.

## Scope: IN / OUT

| IN | OUT |
|----|-----|
| Review boundary; conceptual reviewer authority principles | Active operator workflow implementation |
| Review wording semantics; review-to-decision separation | DB writes; decision/publication row creation |
| Audit/sign-off expectations (governance level only) | PSA materialization; Route Engine consumption |
| Blocked transitions; forbidden shortcuts | Runtime/readiness/pipeline integration; UI/family-facing implementation |
| | Phase 3 implementation; review status enum creation |

## Review authority boundary

- Evidence **may** be reviewed only through a **future owner-approved** role or process (**not** defined or activated here).  
- **Review authority** must be **auditable** before any execution; **reviewer identity / role model** is an **owner-gated implementation detail** (OPEN below).  
- Review **cannot** override the **canonical source hierarchy** above.  
- **Normative claims** here are only **pointers**, **restated locked invariants**, or **OPEN** items—**no** new review statuses or decision enums.  
- **`needs_review`** remains **namespace-qualified**; **`packet_status`** stays closed per packet format; **do not** merge **`blocked_losa`** / **`blocked_external_delivery`** with **`unsupported_losa`** / **`external_delivery`**; **do not** merge **`evidence_incomplete`** with backlog **`insufficient_evidence`**; **`publishable`** does **not** mean PSA publication—per **`phase-2-status-namespace-decisions.md`**.  

## Review wording semantics

**Note:** These are **review wording concepts only**. They are **not** `packet_status`, **not** backlog classifications, **not** Phase 2 decision states, and **not** implementation enums. **No snake_case identifiers.**

| Review wording concept | Meaning | Does it create truth? | Does it publish? | Requires further owner gate? |
|------------------------|---------|------------------------|------------------|------------------------------|
| Evidence appears sufficient to discuss a future decision | May schedule or prepare for **future** owner-gated decision discussion | NO | NO | YES |
| More evidence is needed before decision discussion | Blocks **only** the **discussion readiness** sense here; not a schema status | NO | NO | YES |
| Candidate appears inconsistent with source evidence | Human review judgment; does not delete or rewrite sources | NO | NO | YES |
| LOSA or external-delivery signal requires separate future contour | Aligns with Phase 4 / separate gates; not ordinary-school publication | NO | NO | YES |
| Ambiguity remains unresolved | Visibility preserved per Phase 2 spec / checklist invariants | NO | NO | YES |
| Case should be deferred to a future contour | Explicit deferral; not a hidden publish path | NO | NO | YES |

## Review vs decision boundary

- **Review wording** ≠ **identity decision**; ≠ **location decision**; ≠ **publication decision**.  
- **Review wording** ≠ **PSA write**; ≠ **Route consumption**.  
- **Decision rows** require a **separate owner-gated production truth** path (not this document).  

## Auditability expectations (governance level)

- **Reviewer / approver identity** must be **traceable** before future execution (how stored: **OPEN**).  
- **Evidence basis** and, if decisions are later created, **decision basis version** must be **traceable** (canonical audit rules in Phase 2 spec).  
- **Reason codes / rationale** preserved; **gaps** visible; reasoning for “candidate inconsistent with evidence” remains **auditable**—without defining DB fields or schema here.  

## Blocked transitions

- Review wording → production truth; → publication decision; → PSA materialization; → Route Engine consumption; → Phase 3 readiness.  
- **`packet_status` → Phase 2 decision state** as a merge; **backlog classification → `packet_status`**.  
- **Diagnostics → review wording** without an **owner-defined** process.  

## Forbidden shortcuts

- reviewed → publish  
- review wording → production truth  
- needs_review → operator workflow approved  
- false-match reasoning → DB decision row exists  
- blocked_losa → LOSA solved  
- unsupported_losa → blocked_losa  
- external_delivery → blocked_external_delivery  
- publishable → PSA publication  
- review wording → PSA write  
- review wording → Route consumption  
- governance/review closure document → active workflow  

## Owner gates still required

This document **approves none** of: **active review workflow design**; **reviewer role / authority approval**; **audit/sign-off storage decision**; **identity/location decision workflow**; **publication decision workflow**; **PSA materialization**; **Route Engine consumption**; **runtime/write integration**; **Phase 2 → Phase 3 gate criteria**; **Phase 3 implementation** (each remains **separate owner gate**).

## Open owner decisions carried forward

**OPEN:** who may review evidence in a future workflow; how reviewer authority is represented; where review/audit sign-off is stored; whether review wording should later become stored workflow states; how review labels avoid **namespace leakage**; how reasoning for “candidate inconsistent with evidence” becomes a **future auditable decision** if approved later.

## Final boundary statement

Phase 2 governance and review closure is documentation-defined here, but active review workflow, production truth, runtime/write integration, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved gates.
