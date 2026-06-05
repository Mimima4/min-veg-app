# Phase 2 Evidence Model Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner decision record — evidence sufficiency policy adopted |
| **Closure label** | `EVIDENCE_SUFFICIENCY_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Phase 2 evidence sufficiency / planning readiness policy (M0 + decisions 1–8) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `6c61463 Add Phase 4 LOSA relationship crosswalk` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 evidence model closure |

This file records **owner-agreed evidence sufficiency policy** at **documentation level only**. It closes **Phase 2 evidence model closure** only at **documentation / owner policy** level per the controlling checklist. It does **not** close Phase 2 as a whole, production truth, runtime/write, governance/review workflow, PSA, Route, Phase 3, or Phase 4 execution.

## This document is not

- implementation approval
- SQL approval or execution
- Supabase apply approval
- PSA publication approval
- Route Engine consumption approval
- Phase 2 decision row write approval
- production truth closure
- runtime/write integration approval
- operator workflow activation approval
- Phase 3 start approval
- Phase 4 LOSA execution approval
- Gate 34B approval
- main / owner-used Supabase RLS apply approval
- helper / pipeline / readiness integration approval

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist; closure level definition
- `docs/architecture/phase-2-evidence-model-closure-criteria.md` — governance closure boundaries
- `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — operational sufficiency predicates
- `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace rules
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 conceptual / decision states
- `docs/architecture/norway-school-identity-matching-spec.md` — matcher CASE 1–4 and forbidden shortcuts
- `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical `packet_status`
- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — backlog classifications
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary
- `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` — clean vs problem path
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 LOSA / external-delivery relationship crosswalk (docs-only)

**Conflict rule:** if this record conflicts with a canonical source (packet format, backlog, Phase 2 spec, matching spec, namespace decisions), the **canonical source wins** and this record must be revised.

---

## Meta-rule M0

All **Yes** decisions in this record mean **evidence sufficiency / planning readiness only**.

They do **not** authorize:

- PSA publication
- Route Engine consumption
- Phase 2 decision row writes
- production truth
- runtime/write integration
- operator workflow activation
- Phase 3 implementation or start
- Phase 4 LOSA execution
- Gate 34B or main / owner-used Supabase RLS apply
- helper / pipeline / readiness integration beyond the frozen standalone helper scope

---

## Priority rule

If decisions **2, 3, 4, 5, or 7** trigger, they **override** decision **1** even if a matcher superficially labels the case as CASE 1.

Safety and ambiguity rules beat speed.

Decision **5** (*better blocked than false route*) is the default umbrella for ambiguous school identity / location cases.

---

## Decision 1 — Strict CASE 1 sufficiency only

**Owner decision:** **Yes**, with strict boundaries.

Strict **CASE 1** may be considered **sufficiently evidenced** only for **future owner-gated review** and/or planning **packet readiness** (`packet_status` such as `ready_for_review` per packet format rules). It does **not** mean PSA publish, `publishable` as publication, decision row creation, Route truth changes, or `programme_school_availability` changes through the Phase 2 layer.

**Strict CASE 1 requires all of:**

- one Vilbli row → one school identity → one NSR institution/location
- slash-separated names and Sámi/Norwegian naming are treated as **one** school identity when evidence supports that (matching spec CASE 3)
- fylke/county aligns with the case context
- campus/location is **explicit** in the source and **not** guessed
- no second plausible NSR/campus candidate
- no weak fuzzy winner
- no LOSA / external-delivery signal
- no source conflict (decision 4)
- no first-match / sort-order shortcut (decision 7)

**If NSR parent/child or API hierarchy is unclear:** treat as **not** CASE 1 → **block / review** conservatively (do not assume hierarchy).

---

## Decision 2 — Multi-location without campus signal

**Owner decision:** **Yes** — **block** per-campus programme publication without evidence.

When one school identity has multiple locations / avdelinger and the source does **not** specify which campus offers the programme, the system **must not** publish **per-`avd` programme availability** or choose a campus by heuristic as programme truth.

**Amendment (2026-06-05, production Contour B):** Matching spec **CASE 2** allows `multi_avd_identity` matcher linkage (1:N NSR `avd` rows) with **1:1** Vilbli / VIGO school-brand PSA emission and route display (`pickInstitutionsForPsaEmission`, commit `db67b40`). This is **not** a per-campus programme claim; emission anchor is deterministic and documented in `norway-school-identity-matching-spec.md`.

**Exceptions** to per-campus publication still require a **separate explicit owner gate** with logged decision and Tier 2+ evidence.

---

## Decision 3 — LOSA / external-delivery

**Owner decision:** **Yes** — block ordinary-school publication.

LOSA and external-delivery block **ordinary-school publication** until a **separately approved** Phase 4 LOSA model exists (matching spec CASE 4; Phase 2 vs Phase 4 relationship).

**Namespace (do not merge tokens):**

| Meaning | `NAMESPACE=packet_status` | `NAMESPACE=phase2_decision_state` / backlog |
|---------|---------------------------|---------------------------------------------|
| LOSA | `blocked_losa` | `unsupported_losa` |
| External delivery | `blocked_external_delivery` | `external_delivery` |

`docs/architecture/phase-4-source-truth-contour-map.md` is **docs-only relationship guidance** — **not** publication or connector approval.

---

## Decision 4 — Source conflict

**Owner decision:** **Yes** — block until resolved.

Source conflict blocks the **ordinary publication path** until **stronger evidence** or an **explicit logged owner exception** (separate gate).

- `needs_review` (`NAMESPACE=phase2_decision_state` / backlog) means **human review** — **not** permission to publish.
- Utdanning **verified display** is **not** publication proof.
- The system **must not** pick the convenient source when sources disagree.

---

## Decision 5 — Better blocked than false route

**Owner decision:** **Yes** — default safety rule.

For ambiguous school identity / location cases, **better blocked than false route** is the **default** Phase 2 safety rule.

Future exceptions require a **separate owner gate** and **logged** decision.

---

## Decision 6 — Diagnostics / packets / helper are not truth

**Owner decision:** **Yes**.

Diagnostics output, helper output, and evidence packets are **reports / dossiers** only. They do **not** auto-approve publication, PSA updates, Route consumption, or production truth.

**Forbidden shortcuts (owner-confirmed):**

- evidence exists → truth
- packet exists → publish
- `ready_for_review` → publish
- diagnostics → resolved truth

Standalone helper closure does **not** expand to readiness, pipeline, runtime, or UI without separate ADR and owner gate.

---

## Decision 7 — No first-match / sort-order / weak fuzzy / random campus

**Owner decision:** **Yes** — forbidden.

The following are **forbidden** for NSR/campus selection:

- first match
- sort order as winner
- weak fuzzy as winner
- random campus selection

Only **evidence-backed** matching under CASE 1–3 **without** a competing candidate may progress toward sufficiency / review readiness.

---

## Decision 8 — VGS availability ≠ Phase 2 evidence model closure

**Owner decision:** **Yes** — contours remain separate.

Working VGS / Route **availability** in the operational pipeline does **not** close Phase 2 evidence model closure and does **not** authorize Phase 2 decision row writes.

- **Today (operational):** Vilbli-oriented VGS path → `programme_school_availability` (VGS contour).
- **Phase 2 layer:** evidence / decision / publication boundary — **separate**; not wired as production truth loop on main per execution plan rollout.

---

## Namespace guardrails

- Do **not** introduce `publishable_candidate`, `not_publishable`, or `review_only` as canonical statuses (per `phase-2-status-namespace-decisions.md`).
- `publishable` in `NAMESPACE=phase2_decision_state` is **not** PSA publication.
- `blocked_losa` / `blocked_external_delivery` are **`packet_status` only** — do not merge with `unsupported_losa` / `external_delivery`.
- `needs_review` must always be **namespace-qualified** in prose.

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Phase 2 **evidence model closure** at checklist closure-level (sufficiency policy logged) | Phase 2 **production truth** closure |
| Owner-adopted sufficiency rules for identity, alias, location, NSR candidates (M0 + 1–8) | Phase 2 **runtime/write** closure |
| Logged policy for packet vs publishability boundary (planning) | Phase 2 **governance/review** operational workflow (checklist: **Partial**) |
| NSR “no first-match” and conflict/LOSA block policy at owner level | **PSA** publication / materialization |
| | **Route Engine** consumption approval |
| | **Operator** workflow activation |
| | **Phase 3** implementation |
| | **Phase 4 LOSA** execution |
| | **Gate 34B** / main RLS apply |
| | **Helper/pipeline** integration |
| | Populated Phase 2 decision/publication rows on main |

**NSR API / parent-child open questions:** deferred with **conservative default** (unclear hierarchy → not CASE 1 → block/review). Does **not** require reopening evidence model policy closure unless owner reopens via explicit gate.

---

## Archive table (M0 + 1–8)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| M0 | Sufficiency / planning readiness only; no execution approvals | Block implementation leaps |
| 1 | Auto sufficiency only **strict CASE 1**; not publish/runtime | Block / review |
| 2 | Multi-location without campus → **block** | Block |
| 3 | LOSA/external → ordinary publish **blocked** | Use namespace tokens per table above |
| 4 | Source conflict → **block** until evidence or logged exception | Block |
| 5 | Better blocked than false route | Block |
| 6 | Diagnostics/packet/helper ≠ truth | No auto-publish |
| 7 | No first-match / sort / weak fuzzy / random campus | Evidence-backed only |
| 8 | VGS operational path ≠ Phase 2 closure | Contours separate |

---

## Recommended next gate (informational only)

This record supports closing **Phase 2 evidence model closure** at **documentation / owner policy** level only in `phase-2-closure-criteria-checklist.md`.

It does **not** select or approve the next **implementation** gate.

Any next checklist-priority item must still follow the controlling checklist. Remaining **Not closed**, **Partial**, or **Blocked** closure levels (for example governance/review — **Partial**; production truth — **Not closed**; runtime/write — **Blocked**) are unchanged by this record.

---

## Final boundary statement

Phase 2 evidence sufficiency policy is owner-adopted in this record at documentation level only. Production truth, runtime/write integration, PSA publication, Route Engine consumption, Phase 2 decision row writes, operator workflow, Phase 3, Phase 4 LOSA execution, Gate 34B, main RLS apply, and helper/pipeline integration remain **blocked** until **separate** owner-approved gates.
