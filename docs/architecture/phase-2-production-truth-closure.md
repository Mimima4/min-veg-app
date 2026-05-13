# Phase 2 Production Truth Boundary

## Snapshot / status

- **Status:** Documentation-only production truth boundary  
- **Scope:** Phase 2 path from evidence/review toward future production truth  
- **Repository checkpoint:** `05ddd90 Add Phase 2 governance review closure` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **No execution authority**  
- **Not runtime/write approval**  
- **Not DB write approval**  
- **Not PSA publication approval**  
- **Not Route Engine consumption approval**  
- **Not Phase 3 approval**  
- **Not active production truth**  
- **Operational production truth closure:** **NOT CLOSED**  
- **Does not satisfy** the production truth closure row in `phase-2-closure-criteria-checklist.md`  
- **Does not change status namespaces**  
- **Does not create** decision rows  
- **Does not create** publication decisions  

## Purpose

This document defines the **production truth boundary** before implementation. It separates **evidence**, **candidates**, **review wording**, **decisions**, **publication decisions**, **PSA materialization**, and **Route consumption**. It does **not** write truth. **Production truth path may be defined for future owner-gated execution** only outside this document. It prevents docs, review language, and diagnostics from becoming **hidden production truth**.

## Source hierarchy / canonical precedence

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical for **`packet_status`** and packet structure.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — canonical for **backlog classifications**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/norway-school-identity-matching-spec.md` — canonical for **school identity matching safety rules**.  
5. `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace decisions; **must not** override 1–4.  
6. `docs/architecture/phase-2-evidence-model-closure-criteria.md` — governance closure boundaries and **open owner decisions**.  
7. `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — committed operational evidence sufficiency boundaries.  
8. `docs/architecture/phase-2-governance-review-closure.md` — committed governance/review boundaries.  
9. `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist for closure levels and hard gates.  
10. `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline / control context.  
11. `docs/architecture/route-engine-master-spec.md` — Route Engine truth boundaries.  

**Conflict rule:** if this document conflicts with a canonical source, the **canonical source wins**; revise this document later; **do not** edit canonical sources in this task; **do not** invent a resolution.

**Relationship:** this document **does not amend** items 6–8 above, **must not close operational production truth**, **does not satisfy** the checklist production-truth closure row (**operational closure remains NOT CLOSED**). Boundaries **only** at documentation/governance level. Any **storage, write path, or runtime use** is **implementation** and **owner-gated**.

## Scope: IN / OUT

| IN | OUT |
|----|-----|
| Production truth boundary; path separation | DB writes; SQL/schema; migration design |
| Decision vs publication decision boundary | PSA materialization; PSA publication |
| What may be considered production truth **later** (conceptual) | Route Engine consumption; runtime/readiness/pipeline integration |
| Blocked transitions; forbidden shortcuts | Operator workflow implementation; Phase 3 implementation |

## Production truth object boundary

| Object | Meaning | Can become production truth by itself? | Requires further owner gate? | Source basis |
|--------|---------|----------------------------------------|------------------------------|--------------|
| evidence packet | Planning dossier | NO | YES | `phase-2-read-only-evidence-packet-format.md` — Status/boundary; packet purpose |
| source observation | Source evidence record | NO | YES | `school-identity-location-resolution-phase-2-spec.md` — Hard invariants / observation vs decision |
| NSR candidate | Possible NSR linkage interpretation | NO | YES | `phase-2-validation-contour-data-resolution-backlog.md` — Required evidence / NSR; `norway-school-identity-matching-spec.md` — Candidate rules |
| location candidate | Possible location interpretation | NO | YES | `school-identity-location-resolution-phase-2-spec.md` — Locations/campuses; `norway-school-identity-matching-spec.md` — CASE 2 |
| review wording | Governance review language only | NO | YES | `phase-2-governance-review-closure.md` — Review boundary; review vs decision |
| identity decision | Future durable identity resolution | NO | YES | `school-identity-location-resolution-phase-2-spec.md` — Decision states; decision ownership / audit |
| location decision | Future durable location resolution | NO | YES | `school-identity-location-resolution-phase-2-spec.md` — Phase 2 decision states / location decision boundary |
| publication decision | Future publishability gate | NO | YES | `school-identity-location-resolution-phase-2-spec.md` — Publishability contract |
| PSA materialization | Future PSA write layer | NO | YES | `norway-school-identity-matching-execution-plan.md` — PSA unchanged / blockers; Phase 2 spec — scope |
| Route Engine consumption | Future runtime consumption | NO | YES | `route-engine-master-spec.md` — Published internal truth; `school-identity-location-resolution-phase-2-spec.md` — Route boundary |

## Observation → candidate → decision path

- **Observations** record source evidence; they are **not** decisions. (Source: `school-identity-location-resolution-phase-2-spec.md` — Hard invariants / observation vs decision)  
- **Candidates** represent possible interpretations; they are **not** truth. (Source: `school-identity-location-resolution-phase-2-spec.md` — Decision states / failure behavior)  
- **Review wording** may inform future decision discussion; it does **not** write truth. (Source: `phase-2-governance-review-closure.md` — Review boundary)  
- **Decisions** require a **separate owner-gated** production-truth path—not defined here. (Source: `phase-2-closure-criteria-checklist.md` — Production truth closure row; `norway-school-identity-matching-execution-plan.md` — Runtime blocked)  
- **No** observation, candidate, or review item **writes** production truth by itself. (Source: `phase-2-evidence-model-closure-criteria.md` — Governance boundary; checklist — no schema-implies-truth)  

## Decision vs publication decision

- **Identity/location decision** does **not** automatically publish or PSA-write. (Source: `school-identity-location-resolution-phase-2-spec.md` — Publishability contract; decision vs publication separation)  
- **Publication decision** is a **separate** gate from identity/location decisions. (Source: same — publishability preconditions)  
- **`publishable`** in **`NAMESPACE=phase2_decision_state`** does **not** mean PSA publication. (Source: `phase-2-status-namespace-decisions.md`)  
- **Publication decisions** must be **auditable** when implemented later; rules live in Phase 2 spec audit sections—not table DDL here. (Source: `school-identity-location-resolution-phase-2-spec.md` — Decision ownership / audit)  
- This document does **not** define publication **enum** values. (Source: `phase-2-status-namespace-decisions.md`; OPEN items in evidence criteria)  

## PSA / Route boundary

**Invariant restatement from `route-engine-master-spec.md` and Phase 2 control docs; not a new runtime contract.**

- **PSA materialization** and **PSA publication** are **not** approved here. (Source: `norway-school-identity-matching-execution-plan.md` — Phase 2 implementation blocker; `school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope)  
- **Route Engine consumption** is **not** approved here. (Source: `route-engine-master-spec.md` — Published internal truth only)  
- **Route** must consume **only** future **published internal** truth—not raw evidence, review wording, or diagnostics. (Source: `route-engine-master-spec.md`; `school-identity-location-resolution-phase-2-spec.md` — Route boundary)  
- **No raw Phase 2 evidence** may feed Route runtime without **separate** owner-gated contracts. (Source: `phase-2-closure-criteria-checklist.md` — No diagnostics-implies-publication rule; `norway-school-identity-matching-execution-plan.md` — runtime integration blocked)  

## Blocked transitions

- `packet_status` → production truth  
- backlog classification → production truth  
- review wording → production truth  
- source observation → production truth  
- candidate → production truth  
- diagnostics → production truth  
- identity/location decision → publication decision **automatically**  
- publication decision → PSA materialization **automatically**  
- PSA materialization → Route consumption **automatically**  
- documentation closure → production truth  

## Forbidden shortcuts

Forbidden examples (**not** allowed behavior):

- evidence exists → truth  
- observation exists → truth  
- candidate exists → truth  
- review wording exists → truth  
- decision exists → publication  
- publishable → PSA publication  
- publication decision → Route consumption  
- PSA row exists → Route truth  
- diagnostics → production truth  
- docs closed → production truth closed  
- production truth boundary document → runtime/write approval  

## Owner gates still required

This document **approves none** of: **production truth execution design**; **identity/location decision workflow**; **publication decision workflow**; **DB write path**; **PSA materialization**; **Route Engine consumption**; **runtime/readiness/pipeline integration**; **Phase 2 → Phase 3 gate criteria**; **Phase 3 implementation** (each a **separate owner gate**).

## Open owner decisions carried forward

**OPEN only** (not answered above): where production truth decisions are stored; how decision basis versions are represented; how publication decisions are represented; how supersession/revocation works; how PSA materialization consumes publication decisions; how Route consumes only published internal truth; how audit trail is exposed to operators later.

## Final boundary statement

Phase 2 production truth boundary is documentation-defined here, but operational production truth closure, production truth execution, runtime/write integration, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved gates.
