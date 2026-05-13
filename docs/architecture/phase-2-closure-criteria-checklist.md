# Phase 2 Closure Criteria Checklist

## Snapshot / version

- **Status:** Docs-only control checklist  
- **Scope:** School identity / location resolution Phase 2  
- **Execution reference:** `docs/architecture/norway-school-identity-matching-execution-plan.md`  
- **Repository checkpoint:** `0bb17f9` (from `git log -1 --oneline` at document creation)  
- **Created from:** Phase 2 closure readiness discussion  
- **This document is not:** implementation approval  
- **This document is not:** runtime/write approval  
- **This document is not:** PSA publication approval  
- **This document is not:** Route Engine consumption approval  
- **This document is not:** Phase 3 start approval  

**Related execution plan:** `docs/architecture/norway-school-identity-matching-execution-plan.md`

## Purpose

This checklist exists to prevent confusion between different kinds of “Phase 2 done”:

| Closure idea | What it actually means |
|--------------|-------------------------|
| Phase 2 docs/schema closure | Accepted architecture plus DDL rollout in a **limited, logged** scope (see execution plan). |
| Phase 2 standalone read-only helper closure | Frozen **standalone** diagnostics tooling; **not** readiness, pipeline, or runtime integration. |
| Phase 2 evidence model closure | Owner-agreed rules for **what counts as sufficient evidence** before resolution or publication work; planning artifacts alone do not close this. |
| Phase 2 governance/review closure | Operational semantics for `needs_review`, operator actions, audit trail, and transitions—not vocabulary alone. |
| Phase 2 production truth closure | **Verifiable** populated resolution and publication truth aligned with contracts—not “tables exist”. |
| Phase 2 runtime/write closure | Explicit approval for writes to Phase 2 tables and any integration with pipeline, readiness, or PSA paths. |

**How to use this checklist:** not every row blocks Phase 3. **Hard gates before Phase 3 implementation** are: items whose **Classification** includes **`MUST_HAVE_BEFORE_PHASE_3`**, and any work that requires **`OWNER_GATE_REQUIRED`** for write, PSA, or runtime integration. Other tags (for example `SHOULD_HAVE_BEFORE_PHASE_3`, `DOCUMENT_ONLY`, `FUTURE_CONTOUR`) refine priority but are not automatic hard gates unless paired with `MUST_HAVE_BEFORE_PHASE_3` or an explicit owner gate for the action in question.

Canonical boundaries remain in:

- `docs/architecture/school-identity-location-resolution-phase-2-spec.md`  
- `docs/architecture/norway-school-identity-matching-spec.md`  
- `docs/architecture/norway-school-identity-matching-execution-plan.md`  
- `docs/architecture/route-engine-master-spec.md`  
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`  
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`  
- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`  
- `docs/architecture/phase-2-read-only-evidence-packet-format.md`  
- `docs/architecture/phase-2-read-only-evidence-report-design.md`  
- `docs/product-principles.md`  

Planning artifacts (evidence packet, report design, validation backlog) do not, by themselves, approve execution or integration.

---

## Important correction: helper branch is not the whole Phase 2 roadmap

The options around **readiness diagnostics planning**, **pipeline dry-run diagnostics planning**, or **no further helper integration** apply **only** to the **frozen standalone helper integration branch**. They must not be interpreted as the entire Min Veg roadmap or the full Phase 2 closure path.

Full Phase 2 closure is a **stack** of levels (see [Closure levels](#closure-levels)); schema rollout and standalone helper closure are **necessary but not sufficient** for “Phase 2 as production truth layer” or for Phase 3 readiness.

---

## Closure levels

| Closure level | Meaning | Current status | Missing conditions | Required before Phase 3? | Owner gate required? |
|---------------|---------|----------------|---------------------|---------------------------|------------------------|
| Phase 2 docs/schema closure | Accepted Phase 2 spec and related artifacts; migration applied; **schema-only** closure logged. | **Closed** in limited scope (**with notes** on follow-up spec revisions). | Resolution of non-blocking notes in the Phase 2 spec (state-to-runtime table, minimal acceptance ADR, provider vs delivery site, `needs_review` governance, publish decision audit fields). | **Yes** as design baseline; notes completion recommended before implementation if ambiguity would affect builds. | **Yes** for any change to accepted scope; notes are architecture or owner decisions. |
| Phase 2 read-only tooling closure | Standalone read-only helper plus single approved consumer; no writes; output does not drive matching, readiness, writes, PSA, or Route. | **Closed** in **standalone** scope (validated, frozen). | Any new consumer (readiness, pipeline, runtime, UI) requires **separate** contract or ADR update and owner approval. | **No** for Phase 3 **gate definition** alone; **Yes** if Phase 3 work assumes integrated diagnostics in those systems. | **Yes** for any expansion beyond the standalone tool. |
| Phase 2 evidence model closure | Agreed sufficiency of evidence (identity, alias, location, NSR candidates) and how planning packets and backlog relate to future decisions—without conflating packet status with publishability. | **Not closed** (planning docs exist; operational closure and owner sign-off on evidence rules **not** logged). | Owner-approved criteria for sufficient evidence; alignment with open NSR or API questions where they affect evidence requirements. | **Strongly yes** before treating Phase 3 inputs as non-ambiguous. | **Yes.** |
| Phase 2 governance/review closure | Operational rules: `needs_review`, operator and review boundaries, audit trail, no silent manual truth. | **Partial** (vocabulary and principles in spec); **not operationally closed** (governance notes still open in spec). | Documented transition rules, roles, and audit requirements for operator-mediated paths. | **Yes** before operator-dependent publication paths. | **Yes.** |
| Phase 2 production truth closure | Durable, checkable data path: observations → candidates → decisions → publication decisions, consistent with publishability contract. | **Not closed** (Phase 2 tables deployed with **zero** production rows per rollout log; no resolution loop in production). | Populated truth and processes **after** applicable owner gates—not implied by DDL. | **Yes** for claiming “Phase 2 truth layer closed” or feeding Phase 3 emission from Phase 2 tables. | **Yes.** |
| Phase 2 runtime/write closure | Explicit approval for writes to Phase 2 tables and any pipeline, readiness, or PSA linkage. | **Blocked / not approved** (logged separately from schema closure). | Explicit Phase 2 integration approval per execution plan and ADRs. | **Yes** for any implementation that writes or changes the publish path. | **Yes.** |

---

## Classification syntax (checklist table)

Each **Classification** cell uses at most two tags in this form:

`PRIMARY_TAG; SECONDARY_TAG`

When a single tag is enough, use only `PRIMARY_TAG` (no semicolon). Allowed tags:

`MUST_HAVE_BEFORE_PHASE_3`, `SHOULD_HAVE_BEFORE_PHASE_3`, `NOT_REQUIRED_FOR_PHASE_3`, `FUTURE_CONTOUR`, `OWNER_GATE_REQUIRED`, `FORBIDDEN_AS_SHORTCUT`, `DOCUMENT_ONLY`, `BLOCKED`, `CLOSED_LIMITED_SCOPE`

## Source basis style

In **Source basis**, use a **file path**, a **section or nearby heading name**, and a **short basis phrase**. Do **not** use paragraph numbers like “§” unless the target document uses stable explicit numbering (these architecture files do not).

---

## Phase 2 checklist

**Definition of done for this table:** every row has all columns filled; no bare “TBD”; unresolved items use “Unresolved — owner gate required” or “Future contour — not Phase 2 closure” in **Current status** where applicable; no placeholder claims.

| Checklist item | Required condition | Current status | Classification | Blocks what? | Source basis |
|----------------|-------------------|----------------|------------------|----------------|---------------|
| Identity model readiness | Clear separation of school **identity** versus **NSR location / avdeling**; consistent with locked matching spec. | Spec accepted with notes; DDL matches model artifacts per execution plan. | MUST_HAVE_BEFORE_PHASE_3; CLOSED_LIMITED_SCOPE | Phase 3 wrong identity semantics or contradiction with locked matching | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Purpose / Nationwide scope — identity versus location layer; `docs/architecture/norway-school-identity-matching-spec.md` — Core model — school identity definition |
| Alias / bilingual naming readiness | Slash-separated labels are **one** identity; Sámi and Norwegian variants are not split into false separate schools. | Locked in matching spec; in Phase 2 nationwide scope. | MUST_HAVE_BEFORE_PHASE_3 | False splits and unsafe 1:N assumptions | `docs/architecture/norway-school-identity-matching-spec.md` — Aliases — slash and bilingual aliases; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Nationwide scope — aliases and slash aliases |
| Location / avdeling readiness | Explicit locations; **no** single random campus when multiple valid NSR locations exist without a campus signal. | Conceptual model in Phase 2 spec; **no** populated production resolution in main per execution plan rollout log. | MUST_HAVE_BEFORE_PHASE_3 | Unsafe 1:N PSA and CASE 2 violations | `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching — CASE 2 multi-location; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Proposed conceptual domain — school_locations / campuses |
| Evidence packet sufficiency | Evidence packets are **dossiers**, not decisions; execution and integration require **separate** owner gate. | Packet format exists as planning artifact only; no execution approval from that artifact. | SHOULD_HAVE_BEFORE_PHASE_3; DOCUMENT_ONLY | Uncontrolled “evidence → write” leaps without owner-closed rules | `docs/architecture/phase-2-read-only-evidence-packet-format.md` — Status / boundary — planning artifact only; `docs/architecture/phase-2-read-only-evidence-packet-format.md` — Packet purpose — not a decision row |
| NSR candidate evidence | Auditable NSR linkage and candidate rationale; **no** “first candidate wins” by sort order. | Backlog defines required evidence types; operational sufficiency rules **not** owner-closed as a logged standard. | MUST_HAVE_BEFORE_PHASE_3; OWNER_GATE_REQUIRED | False resolution and false PSA rows | `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — Typed classification / Required evidence — NSR linkage; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 Open questions — NSR grouping and API |
| Decision state readiness | Required state vocabulary; failure rule: unresolved or conflicting evidence must never publish. | Vocabulary and failure behavior defined in Phase 2 spec. | MUST_HAVE_BEFORE_PHASE_3 | Silent publication of ambiguity | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — vocabulary; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — failure behavior |
| `needs_review` semantics | Review is **not** publication; not family-facing route truth until policy explicitly allows. | State name exists; governance detail marked as follow-up in Phase 2 spec acceptance notes. | OWNER_GATE_REQUIRED; MUST_HAVE_BEFORE_PHASE_3 | Premature operator workflow or unclear gates for publication | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — needs_review; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Acceptance status / Notes for next revision — needs_review governance |
| `ambiguous_candidates` semantics | Ambiguity remains **visible**; no hidden tie-break. | In required state vocabulary; diagnostics must not resolve ties (pipeline diagnostics contract). | MUST_HAVE_BEFORE_PHASE_3 | Hidden ambiguity and false confidence | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — ambiguous_candidates; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 Success criteria — ambiguity visible |
| `unsupported` / blocked semantics | `unsupported_losa`, `external_delivery`, and unresolved identity or location paths do not become ordinary-school publishable truth. | Phase 1A LOSA boundary logged; Phase 2 states and Phase 4 relationship documented; Finnmark publishable truth remains Phase 4–dependent. | MUST_HAVE_BEFORE_PHASE_3; FUTURE_CONTOUR | False availability (for example LOSA as ordinary school) | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 1A.2i LOSA boundary — unsupported not publishable; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4 — Finnmark dependency |
| Publishability contract | All publishability preconditions satisfied before `programme_school_availability`; no expansion without auditable evidence. | Contract documented in Phase 2 spec; not operationalized via populated publication decisions in main. | MUST_HAVE_BEFORE_PHASE_3 | PSA false positives | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Publishability contract — preconditions list |
| Auditability | Decision-bearing records include actor type, basis version, reason codes, `audit_ref`, supersession; append-only discipline. | Rules in Phase 2 spec Decision ownership / audit section. | MUST_HAVE_BEFORE_PHASE_3 | Silent manual truth | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision ownership / audit — required fields and rules |
| Operator/review boundary | Operator layer until explicitly modelled for family-facing; no UI masking of unresolved source truth. | Principles in Phase 2 spec; no approved operator workflow rollout captured in this checklist snapshot. | SHOULD_HAVE_BEFORE_PHASE_3; OWNER_GATE_REQUIRED | UX leakage of unresolved states into family-facing surfaces | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — no family-facing display changes; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Route Engine boundary — unresolved remains operator-layer |
| Runtime/write boundary | No writes to Phase 2 tables and no integration until **explicit** Phase 2 runtime or write approval. | Blocked and not approved per execution plan Phase 2 closure entries. | BLOCKED; OWNER_GATE_REQUIRED | Unauthorized DB or pipeline truth mutation | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 schema rollout closure — runtime integration blocked; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Status — runtime write integration blocked |
| PSA publication boundary | PSA unchanged unless separate publication approval; publishability contract enforced. | Rollout log states PSA publication unchanged after main migration. | OWNER_GATE_REQUIRED; MUST_HAVE_BEFORE_PHASE_3 | Unauthorized PSA expansion | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 implementation blocker — PSA unchanged; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — PSA write expansion before model approval |
| Route Engine consumption boundary | Route Engine uses **published** internal DB truth only; no random campus; unsupported LOSA not as ordinary school option. | Unchanged by Phase 2 rollout; normative rules in Route Engine and Phase 2 specs. | MUST_HAVE_BEFORE_PHASE_3 | Unsafe runtime routes | `docs/architecture/route-engine-master-spec.md` — VGS programme school availability — published internal truth; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Route Engine boundary — published truth only |
| UI/display boundary | Family-facing display policy for identity versus location **not** defined solely by Phase 2 schema closure. | Explicitly out of Phase 2 spec scope for Route and UI changes. | NOT_REQUIRED_FOR_PHASE_3; FUTURE_CONTOUR | N/A for Phase 2 document closure alone; product UI remains separate gate | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — Route Engine UI and family-facing display |
| Future contour separation | Final LOSA and external-delivery **product model** in Phase 4; Phase 2 may expose states but not final LOSA publish model. | Documented dependency for Finnmark and LOSA in execution plan and Phase 2 spec. | FUTURE_CONTOUR; NOT_REQUIRED_FOR_PHASE_3 | Mis-routing LOSA work into Phase 2 “done” claims | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4 — LOSA final model; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase linkage — Phase 4 before Finnmark publishable |
| LOSA exclusion from Phase 2 final model | Phase 2 does **not** deliver the final LOSA model; no ordinary-school publication for unsupported LOSA. | Locked by matching CASE 4, Phase 1A decision, and Phase 2 relation to Phase 4. | MUST_HAVE_BEFORE_PHASE_3; FUTURE_CONTOUR | Ordinary-school false positives from LOSA rows | `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching — CASE 4 LOSA unsupported; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — final LOSA in Phase 4 |
| No random campus rule | Never select a random institution or campus for availability truth. | Normative locked rule across matching and execution plan hard principles. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | Wrong campus and wrong routes | `docs/architecture/norway-school-identity-matching-spec.md` — Forbidden — no random campus; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Hard principles — no random campus selection |
| No hidden truth rule | No silent manual mappings; observation is not decision; candidate is not decision. | Hard invariants in Phase 2 spec. | MUST_HAVE_BEFORE_PHASE_3 | Unauditable “truth” | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Hard invariants — observation and candidate separation |
| No schema-implies-truth rule | Empty Phase 2 tables or DDL presence alone does **not** mean identity or location resolution is production-true. | Execution plan logs zero rows in all seven Phase 2 tables in main after rollout. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | False “Phase 2 product closed” claims | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 implementation blocker — estimated row count zero; schema rollout closure — schema-only not truth layer |
| No diagnostics-implies-publication rule | Readiness, pipeline, and Phase 2 diagnostics JSON and warnings must not become publishability or PSA write drivers unless a **separate** document approves it. | Standalone helper and contracts forbid diagnostics driving gates. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | Publication driven only from logs or diagnostics | `docs/architecture/phase-2-read-only-diagnostics-contract.md` — Decision — no writes and no readiness or PSA changes; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Decision — helper output must not influence PSA or readiness |

---

## Hard gates before Phase 3 implementation

Before **Phase 3 implementation** or **controlled 1:N PSA emission** (per execution plan Phase 3 goal and rules), the following are **hard gates**. They must be satisfied or explicitly governed by an **OWNER_GATE_REQUIRED** decision that does not violate locked specs:

- **Identity model readiness** — consistent with `norway-school-identity-matching-spec.md` and the Phase 2 architecture spec.  
- **Location / avdeling readiness** — honest handling of multi-location; no random campus.  
- **NSR candidate evidence rules** — auditable candidate rationale; no sort-order or heuristic “win” as proxy for truth.  
- **Decision state semantics** — including unresolved, ambiguous, unsupported, and publishable paths.  
- **Publishability contract** — preconditions in the Phase 2 spec publishability section.  
- **Auditability** — no silent manual truth; decision records as specified.  
- **No hidden truth** — invariants on observation, decision, and publication separation (`docs/product-principles.md` — Truth over completeness — aligns with no false assumed information).  
- **No random campus** — normative matching and Route boundary.  
- **No diagnostics-implies-truth** — diagnostics and schema artifacts do not substitute for published, audited availability truth.  
- **Explicit owner gate** for any **runtime, write, or PSA** action affecting truth or publication.  

This section does **not** approve Phase 3; it states what this checklist treats as non-negotiable before Phase 3 **implementation** work.

---

## Non-blocking or future-contour items

The following **do not**, by themselves, block **defining** Phase 2 → Phase 3 **gate criteria** or documenting Phase 3 preconditions—provided hard gates above are not pretended satisfied:

- **Full family-facing UI or display policy** for identity versus location  
- **Full LOSA implementation**  
- **All county packets across Norway**  
- **Helper integration branch** choices (readiness versus pipeline dry-run planning versus no integration)  
- **Route Engine runtime consumption**, as long as it remains **blocked** from unpublished or non-publishable truth  

---

## Forbidden shortcuts

The following patterns **must not** be used to claim progress, closure, or publishability:

- **Schema exists → insert rows** without explicit runtime or write approval and evidence model closure.  
- **Helper diagnostics → publication truth** — diagnostics are not PSA or readiness gates unless separately approved.  
- **Multi-location → publishable** — multiple valid locations without resolution does not imply publication (matching CASE 2).  
- **First candidate wins** — forbidden by matching spec, including sort-order tie-break.  
- **LOSA → ordinary school availability** — unsupported until explicitly modelled (Phase 4).  
- **Empty Phase 2 tables → Phase 2 product closure** — schema-only closure is logged; production truth closure is not.  
- **Phase 2 docs → runtime approval** — planning artifacts disclaim execution, runtime, PSA, and Route approvals.  
- **Diagnostics JSON → publishability** — same boundary as helper and readiness additive outputs.  
- **County hacks / threshold tuning to green** — explicit non-goals across execution plan and Phase 2 spec.  

---

## Allowed next strategic decisions

Related namespace decision record: [`docs/architecture/phase-2-status-namespace-decisions.md`](./phase-2-status-namespace-decisions.md) defines the owner-approved namespace rules for `packet_status`, backlog classifications, Phase 2 decision states, and forbidden canonical status names. It must be consulted before drafting or updating Phase 2 evidence model closure criteria.

Only **two** allowed strategic next decisions **from this snapshot** (both are **docs or gate** work first, **not** implementation):

**A. Phase 2 evidence model closure**  
Owner and architecture agree what counts as **sufficient evidence** for identity, alias, location, and NSR candidates; how evidence packets and backlog classifications relate to future decisions; and what remains explicitly **unsupported** until Phase 4. Does **not** mean running extraction scripts, writing SQL, or integrating helpers into pipeline or readiness.

**B. Phase 2 → Phase 3 gate criteria**  
A documented checklist of prerequisites before **any** Phase 3 implementation or controlled 1:N PSA emission begins, aligned with execution plan Phase 3 rules and locked specs. Does **not** mean starting Phase 3 coding, changing PSA, or changing Route Engine.

---

## Current recommended next gate

**Current recommended next gate from this checklist snapshot:** Phase 2 evidence model closure.

**Reason:** Phase 2 → Phase 3 criteria depend on a **clear evidence model**. Without this, Phase 3 may inherit hidden assumptions (for example treating diagnostics or schema presence as proof of resolvable truth), which conflicts with the publishability contract and hard invariants in `docs/architecture/school-identity-location-resolution-phase-2-spec.md`.

**Clarification:** this recommendation is **snapshot-bound** and may be changed by an explicit owner decision. It is **not** implementation approval.
