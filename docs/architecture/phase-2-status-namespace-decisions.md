# Phase 2 Status Namespace Decisions

## Snapshot / status

- **Status:** Docs-only owner decision record  
- **Scope:** Phase 2 evidence / status terminology  
- **Execution reference:** `docs/architecture/phase-2-closure-criteria-checklist.md`  
- **Repository checkpoint:** `d5c7544 Add Phase 2 closure criteria checklist` (from `git log -1 --oneline` at document creation)  
- **Created at (UTC):** 2026-05-13  
- **This document is not:** implementation approval  
- **This document is not:** runtime/write approval  
- **This document is not:** PSA publication approval  
- **This document is not:** Route Engine consumption approval  
- **This document is not:** Phase 3 start approval  
- **This document is not:** evidence model closure approval  

## Purpose

This document records **owner-approved** namespace rules so the same English tokens are not reused across different meanings. It is intended to prevent confusion between:

- **`packet_status`** — planning-only state on an evidence packet (closed enum in the packet format doc).  
- **Backlog classification** — typed categories in the nationwide validation backlog.  
- **Phase 2 conceptual / decision state** — vocabulary in the Phase 2 architecture spec.  
- **Publication decision state** — publishability gate entities (separate from packet planning state).  
- **Future operator / review workflow state** — not defined here; must not be inferred from packet or backlog tokens alone.  
- **Runtime verification status** — e.g. Route Engine / app verification vocabulary; not `packet_status`.  

This record **does not** replace or override canonical source documents. If anything here appears to disagree with them, the canonical docs win; this file must be revised to align.

## Canonical source precedence

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` is canonical for **`packet_status`**.  
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` is canonical for **backlog classification**.  
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` is canonical for **Phase 2 conceptual / decision states**.  
4. `docs/architecture/phase-2-closure-criteria-checklist.md` is a **control summary** and does not create canonical statuses.  
5. `docs/architecture/norway-school-identity-matching-execution-plan.md` is **timeline / control context** and does not create status namespaces unless it explicitly defines a state.  

**Revision rule:** this decision record must be updated if it ever conflicts with items 1–3 after they change; it must not silently override them.

## Owner-approved namespace decisions

The following are **fixed** for Min Veg Phase 2 planning and documentation until changed by an explicit owner gate:

1. **`packet_status` remains a closed enum** (see packet format doc for full rules). Allowed values only:  
   - `draft`  
   - `ready_for_review`  
   - `evidence_incomplete`  
   - `blocked_losa`  
   - `blocked_external_delivery`  
   - `archived`  

2. **`needs_review` must always be namespace-qualified** in prose and in tables when ambiguity is possible (use `NAMESPACE=<...>` in structured notes; never rely on bare `needs_review` alone when more than one namespace could apply).

3. **`blocked_losa` and `blocked_external_delivery`** are **`packet_status` values only**. They **must not** be merged or aliased with Phase 2 / backlog tokens **`unsupported_losa`** and **`external_delivery`** (different strings, different canonical homes).

4. **`evidence_incomplete`** is a **`packet_status` value**. It **must not** be merged with backlog classification **`insufficient_evidence`** (different string and canonical namespace).

5. **`publishable_candidate`**, **`not_publishable`**, and **`review_only`** are **forbidden as canonical status tokens** in Min Veg Phase 2 documentation and planning enums **unless** a later owner gate explicitly defines and approves them.

6. **`publishable`** (Phase 2 decision / conceptual vocabulary) **does not** mean PSA publication. PSA publication requires a **separate publication decision** path and **separate owner gates** per existing architecture; packet conceptual “publishable” recommendations are not active publishability.

## Status namespace table

| Term | Canonical namespace | Allowed as `packet_status`? | Notes |
|------|----------------------|----------------------------|--------|
| `draft` | `packet_status` | Y | `NAMESPACE=packet_status` |
| `ready_for_review` | `packet_status` | Y | `NAMESPACE=packet_status`; not publishable; see packet format “ready_for_review” rules |
| `evidence_incomplete` | `packet_status` | Y | `NAMESPACE=packet_status`; must not be conflated with `NAMESPACE=backlog_classification` value `insufficient_evidence` |
| `blocked_losa` | `packet_status` | Y | `NAMESPACE=packet_status`; do not merge with `NAMESPACE=phase2_decision_state` `unsupported_losa` |
| `blocked_external_delivery` | `packet_status` | Y | `NAMESPACE=packet_status`; do not merge with `NAMESPACE=phase2_decision_state` `external_delivery` |
| `archived` | `packet_status` | Y | `NAMESPACE=packet_status` |
| `needs_review` | **Multiple** (see Notes) | **N** | `NAMESPACE=phase2_decision_state` AND `NAMESPACE=backlog_classification` AND `NAMESPACE=packet_conceptual_recommendation` (packet format §12) AND `NAMESPACE=runtime_verification_status` (e.g. Route Engine); **never** `NAMESPACE=packet_status`; never bare `needs_review` without qualifier |
| `unsupported_losa` | `phase2_decision_state`; backlog classification | **N** | `NAMESPACE=phase2_decision_state` / `NAMESPACE=backlog_classification`; not a `packet_status` string — use `blocked_losa` on packets for LOSA-related packet blocking |
| `external_delivery` | `phase2_decision_state`; backlog classification | **N** | `NAMESPACE=phase2_decision_state` / `NAMESPACE=backlog_classification`; not `packet_status` — use `blocked_external_delivery` on packets when appropriate |
| `insufficient_evidence` | `backlog_classification` | **N** | `NAMESPACE=backlog_classification`; not `packet_status`; packet ambiguity uses different token `insufficient_source_evidence` where applicable |
| `publishable` | `phase2_decision_state`; packet conceptual recommendation only | **N** | `NAMESPACE=phase2_decision_state` and optional `NAMESPACE=packet_conceptual_recommendation`; **not** `packet_status`; **not** PSA publication; publication requires separate publication decision + owner gate |
| `publishable_candidate` | *none (forbidden)* | **N** | Forbidden as canonical status unless a later owner gate defines it |
| `not_publishable` | *none (forbidden)* | **N** | Forbidden as canonical status unless a later owner gate defines it |
| `review_only` | *none (forbidden)* | **N** | Forbidden as canonical status unless a later owner gate defines it |
| `identity_unresolved` | `phase2_decision_state`; packet conceptual recommendation | **N** | `NAMESPACE=phase2_decision_state`; not `packet_status` |
| `location_unresolved` | `phase2_decision_state`; packet conceptual recommendation | **N** | `NAMESPACE=phase2_decision_state`; not `packet_status` |
| `ambiguous_candidates` | `phase2_decision_state`; packet conceptual recommendation | **N** | `NAMESPACE=phase2_decision_state`; not `packet_status` |
| `rejected_false_match` | `phase2_decision_state`; packet conceptual recommendation | **N** | `NAMESPACE=phase2_decision_state`; not `packet_status` |

## Forbidden implications

The following implications are **false** and must not be used to justify work or “green” states:

- `ready_for_review` → publishable product or PSA truth  
- `needs_review` → operator workflow approved or activated  
- `publishable` (decision or conceptual recommendation) → PSA publication without a publication decision and owner gate  
- Packet exists or packet status set → publication decision made  
- Backlog classification → may be copied into `packet_status`  
- Phase 2 decision state → may be copied into `packet_status`  
- Helper diagnostics → publication truth  
- This status namespace decision record → runtime/write approval  
- This status namespace decision record → Phase 2 evidence model closure approval  

## Related documents

- `docs/architecture/phase-2-closure-criteria-checklist.md` — Phase 2 closure control checklist (link back for navigation).  
- Canonical sources listed under **Canonical source precedence** above.
