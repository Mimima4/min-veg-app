# Phase 2 Governance/Review Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner decision record — governance/review policy adopted |
| **Closure label** | `GOVERNANCE_REVIEW_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Phase 2 governance/review policy (G0 + decisions G1–G9) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `b2f5a7e Add Phase 2 evidence model owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 governance/review closure |

This file records **owner-agreed governance/review policy** at **documentation level only**. It closes **Phase 2 governance/review closure** only at **documentation / owner policy** level per the controlling checklist. It does **not** close Phase 2 as a whole, production truth, runtime/write, active operator workflow, PSA, Route, Phase 3, or Phase 4 execution.

## Relationship to evidence model owner record

- **Complements:** `docs/architecture/phase-2-evidence-model-owner-decision-record.md` (2026-05-18).
- **Does not** replace, weaken, or reinterpret evidence model decisions M0 + 1–8.
- **Conflict rule:** if this record conflicts with the evidence model owner record or a canonical source, the **stricter safety rule wins**; canonical sources (packet format, backlog, Phase 2 spec, matching spec, namespace decisions) win over both owner records if they conflict with either.

## This document is not

- implementation approval
- SQL approval or execution
- Supabase apply approval
- PSA publication approval
- Route Engine consumption approval
- Phase 2 decision row write approval
- production truth closure
- runtime/write integration approval
- operator/admin workflow activation approval
- Phase 3 start approval
- Phase 4 LOSA execution approval
- Gate 34B approval
- main / owner-used Supabase RLS apply approval
- helper / pipeline / readiness integration approval

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist; closure level definition
- `docs/architecture/phase-2-governance-review-closure.md` — governance/review boundary documentation
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence sufficiency policy (complementary)
- `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace rules
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 conceptual / decision states; Route boundary
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-production-truth-closure.md` — production truth boundary
- `docs/architecture/phase-2-runtime-write-closure.md` — runtime/write boundary
- `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical `packet_status`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary
- `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` — clean vs problem path; future admin boundary
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 LOSA / external-delivery relationship crosswalk (docs-only)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule G0

All **Yes** decisions in this record (G1–G9) mean **governance/review policy only**.

None of G1–G9 authorizes implementation or execution. They do **not** authorize:

- code
- SQL
- Supabase apply
- Phase 2 decision row writes
- production truth
- runtime/write integration
- PSA publication
- Route Engine consumption
- operator/admin workflow implementation
- helper / pipeline / readiness integration
- Phase 3 implementation or start
- Phase 4 LOSA execution
- Gate 34B or main / owner-used Supabase RLS apply

---

## Priority rule

If any of the following trigger, they **override** “human reviewed”:

- **G3** source conflict rule
- **G6** safety / block rule
- **LOSA / external-delivery guard** (this record and evidence model decision 3)
- **Phase 2 evidence model owner decision** safety rules from 2026-05-18 (decisions 2–7 and M0)
- forbidden first-match / weak-fuzzy / random-campus rules

**Human reviewed** never overrides safety by itself.

---

## Decision G1 — `needs_review` blocks family-facing truth

**Owner decision:** **Yes**.

If a case is in **`needs_review`**, it must remain **blocked** from **family-facing finalized school/route truth** until a **separate publication decision path** exists and approves publication.

**Namespace guard — `needs_review` may only be used with qualification:**

- `NAMESPACE=phase2_decision_state`
- `NAMESPACE=backlog_classification`
- optionally `NAMESPACE=packet_conceptual_recommendation` as **dossier prose only**

**`needs_review` must NOT be treated as:**

- `packet_status`
- Route/VGS verification status as **family-facing finalized truth**
- PSA permission
- Route truth
- publication approval

If Route/VGS uses verification status or runtime wording that resembles review, it must **NOT** be read as Phase 2 publication approval or family-facing finalized route truth.

**`packet_status=ready_for_review`:**

- dossier / planning readiness only
- does **not** mean family-facing truth, `publishable`, PSA publication, Route consumption, or runtime truth

---

## Decision G2 — Human review does not publish by itself

**Owner decision:** **Yes**.

Human review may **discuss**, **prepare**, or **support** a **future publication decision path**.

Human review does **NOT** create by itself:

- DB truth
- Phase 2 decision rows
- PSA updates
- Route truth
- production truth
- runtime truth

**Explicit negations:**

- Human reviewed ≠ published
- Human reviewed ≠ decision row created
- Human reviewed ≠ PSA materialized
- Human reviewed ≠ Route consumption approved

Any future decision row, publication path, or materialization path requires a **separate approved gate**.

---

## Decision G3 — Source conflict requires stronger evidence or logged owner exception

**Owner decision:** **Yes**.

If sources conflict, publication may proceed **only** after **stronger evidence** or an **explicit logged owner exception**.

- This does **not** change or weaken the Phase 2 evidence model owner policy from **2026-05-18**.
- Source conflict remains **blocked** by default.
- `needs_review` may allow a human to **examine** the case; it does **not** allow publication.
- An exception must be **explicit**, **owner-approved**, **logged**, and **separate** from ordinary review wording.
- Utdanning or other **verified display naming** is **not** publication proof.

---

## Decision G4 — Operator/admin workflow is future-only

**Owner decision:** **Yes**.

Closing governance/review at **docs / policy** level means **no** operator UI, **no** admin workflow, **no** DB workflow, **no** live review process, and **no** role implementation **now**.

This gate records **rules only**. Implementation of review workflow, storage, and UI is a **later separate gate**.

---

## Decision G5 — Diagnostics / packets / helper inform, not decide

**Owner decision:** **Yes**.

Diagnostics, helper output, and evidence packets may **inform** human review but must **never** decide, approve, publish, or materialize truth.

- Diagnostics are **explanation tools**
- Evidence packets are **dossiers**
- Helper output is **read-only support**

**Forbidden shortcuts (owner-confirmed):**

- diagnostics → resolved truth
- helper output → approval
- packet exists → publish
- `ready_for_review` → publish
- review wording → PSA / Route / runtime

---

## Decision G6 — Better blocked than false route governs review

**Owner decision:** **Yes**.

If review remains **unclear** or **unsafe**, the default is **blocked**, not released to families or Route.

Review does **not** exist to force unblock. Review exists to **prevent false route truth**.

**Concrete block/review triggers include:**

- unclear evidence
- source conflict
- multi-location / multi-campus without campus signal
- LOSA / external-delivery
- weak fuzzy match as **winner**
- first-match / sort-order temptation
- competing plausible NSR/campus candidate
- unclear NSR parent/child or API hierarchy

---

## Decision G7 — Owner exceptions now; routine delegation later

**Owner decision:** **Yes**.

Until a **separate delegation model** is approved, **exceptions** and **override policy** are **owner-only**.

**Owner-only now applies to:**

- exceptions after source conflict
- override of conservative block
- approval to **consider** an ambiguous case for a **later gate**

This does **NOT** mean the owner must manually review every ordinary clean case forever.

Routine review delegation, reviewer roles, operator permissions, and admin workflow may be designed **later** only through a **separate gate**.

---

## Decision G8 — `publishable` decision is not PSA publication

**Owner decision:** **Yes**.

Future decision-state **`publishable`** does **NOT** equal PSA publication.

`publishable` in Phase 2 decision language means a case may be **eligible** for a **later publication flow**. It does **NOT** mean:

- PSA row written
- Route consumes it
- family sees it
- runtime truth changed

---

## Decision G9 — Review/sign-off must be traceable

**Owner decision:** **Yes**.

Before any **future publication path**, review/sign-off must be **traceable**:

- **who**
- **when**
- **basis / evidence**

**Exact storage** may be deferred to a later gate (packet vs separate log; DB model; UI/workflow), but the **traceability requirement** is adopted **now**.

---

## LOSA / external-delivery guard

Human review **cannot** convert LOSA or external-delivery into **ordinary-school publication**.

LOSA and external-delivery remain **blocked** from ordinary publication until a **separate Phase 4 LOSA model** and **execution gate** exist.

**Namespace tokens (do not merge across namespaces):**

| Meaning | `NAMESPACE=packet_status` | `NAMESPACE=phase2_decision_state` / backlog |
|---------|---------------------------|---------------------------------------------|
| LOSA | `blocked_losa` | `unsupported_losa` |
| External delivery | `blocked_external_delivery` | `external_delivery` |

`docs/architecture/phase-4-source-truth-contour-map.md` is **docs-only relationship guidance** — **not** publication or connector approval.

---

## Namespace guardrails

- Do **not** introduce `publishable_candidate`, `not_publishable`, or `review_only` as canonical statuses (per `phase-2-status-namespace-decisions.md`).
- **`publishable`** in `NAMESPACE=phase2_decision_state` is **not** PSA publication.
- **`needs_review`** must always be **namespace-qualified** in prose.
- Do **not** merge `blocked_losa` / `blocked_external_delivery` with `unsupported_losa` / `external_delivery`.

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Phase 2 **governance/review closure** at checklist closure-level (review policy logged) | Phase 2 **production truth** closure |
| Owner-adopted review vs publication boundaries (G0–G9) | Phase 2 **runtime/write** closure |
| `needs_review` ≠ family-facing truth; human review ≠ publish (policy) | **Active** operator/admin workflow implementation |
| Traceability requirement before future publication path (storage design deferred) | **PSA** publication / materialization |
| Owner-only exceptions until delegation gate | **Route Engine** consumption approval |
| Complements evidence model policy without weakening it | **Phase 3** implementation |
| | **Phase 4 LOSA** execution |
| | **Gate 34B** / main RLS apply |
| | **Helper/pipeline** integration |
| | Populated Phase 2 decision/publication rows on main |

**Implementation OPEN (deferred):** reviewer role model; operator UI; DB workflow tables; exact sign-off storage channel — separate gates only.

---

## Archive table (G0 + G1–G9)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| G0 | Governance/review policy only; no execution | Block implementation leaps |
| G1 | `needs_review` blocks family-facing truth until publication path | Block / review |
| G2 | Human review ≠ publish / decision rows / PSA / Route | No truth from review alone |
| G3 | Source conflict → stronger evidence or logged owner exception | Block |
| G4 | Operator/admin workflow future-only | No UI/DB workflow now |
| G5 | Diagnostics/packet/helper inform only | No auto-approve |
| G6 | Unclear review → blocked (false route prevention) | Block |
| G7 | Exceptions/override owner-only until delegation gate | Owner for exceptions only |
| G8 | Decision `publishable` ≠ PSA publication | Separate publication gates |
| G9 | Sign-off traceability required; storage deferred | Require who/when/basis later |

---

## Recommended next gate (informational only)

This record supports closing **Phase 2 governance/review closure** at **documentation / owner policy** level only in `phase-2-closure-criteria-checklist.md`.

It does **not** select or approve implementation, production truth, runtime/write, PSA, Route, operator UI, Phase 3, Phase 4, Gate 34B, main RLS, or helper/pipeline integration.

Any next checklist-priority item must still follow the controlling checklist. Remaining **Not closed** or **Blocked** closure levels (for example **production truth** — **Not closed**; **runtime/write** — **Blocked**) are unchanged by this record.

---

## Final boundary statement

Phase 2 governance/review policy is owner-adopted in this record at documentation level only. Active review workflow, production truth, runtime/write integration, PSA publication, Route Engine consumption, Phase 2 decision row writes, Phase 3, Phase 4 LOSA execution, Gate 34B, main RLS apply, and helper/pipeline integration remain **blocked** until **separate** owner-approved gates.
