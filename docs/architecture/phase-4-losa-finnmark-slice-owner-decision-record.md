# Phase 4 LOSA — Finnmark Slice Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner **Phase 4 LOSA Finnmark slice** adopted at **docs level** — **PLANNING / DESIGN SLICE ONLY** |
| **Closure label** | `PHASE_4_LOSA_FINNMARK_SLICE_ADOPTED_DOCS_ONLY` |
| **Scope** | Close the **LOSA / external-delivery** blocker class identified by **P06-CONTOUR-B-post** for county **`56`** (Finnmark) |
| **Date (UTC)** | 2026-05-31 |
| **Entry trigger** | `phase-0-6-contour-b-finnmark-processing-review-summary.md` — owner selects **option 2: Phase 4 LOSA slice** |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-FM** |

This record **opens** the next step in owner track **A → B → C** after Contour **B** baseline. It does **not** close Finnmark operationally and does **not** authorize implementation.

---

## 1. Problem statement (from Contour B baseline)

Finnmark `56` / `electrician` cannot use Contour **A** (Vilbli → NSR → PSA) because:

1. Pipeline **ABORT**: **22** unmatched Vilbli schools; **17** LOSA hints in unmatched diagnostics.  
2. Readiness **`missing_programme_rows`** for electrician path nodes.  
3. Matching spec **CASE 4** / Phase 2 states: **LOSA is not an ordinary publishable school** without a Phase 4 contract.  
4. Backlog **Case C** classification: `unsupported_losa` + `external_delivery` + **`phase4_blocked`**.

**Phase 4 LOSA slice** exists to define **what “current official LOSA reality” means** for publication gates — not to push Finnmark into UI early.

---

## 2. Controlling artifacts (read-first)

| Document | Role in this slice |
|----------|-------------------|
| `phase-4-losa-official-source-evidence-refresh-design.md` | Tiers, claim classes, refresh outcomes, publication boundaries — **prevails** on risk/diff |
| `phase-4-losa-official-source-registry.md` | Source inputs only |
| `phase-4-source-truth-contour-map.md` | LOSA vs VGS vs Phase 2 vs Route relationships |
| `school-identity-location-resolution-phase-2-spec.md` | §21 Phase 4 dependency; publishability |
| `norway-school-identity-matching-spec.md` | CASE 4 LOSA abort rules |
| `phase-0-6-contour-b-finnmark-processing-review-summary.md` | **P06-CONTOUR-B-post** baseline counts |

---

## 3. Slice objective (what “done” means for this slice)

**Slice complete** when repo holds a **Finnmark LOSA publishability contract draft** that:

1. Defines **provider school** vs **delivery site/municipality** vs **gathering location** semantics for LOSA rows.  
2. Maps **claim classes** (registry matrix) to **Phase 2 conceptual states** (`unsupported_losa`, `external_delivery`, `needs_review`) without inventing new canonical enums in this record.  
3. States **explicit blocked publication rules** for county `56` until which gates pass.  
4. Lists **minimum evidence** required before Contour **A** may retry dry-run on `56` (still separate session/gate).  
5. References **automation contour** (headless refresh) as **future** — separate execution gate.

**Not slice-complete:** PSA rows for `56`, Route/UI truth, fetch jobs, SQL migrations.

---

## 4. Explicit non-scope

- not source fetch / scraping / cron execution  
- not registry row URL invention beyond existing registry rules  
- not Phase 2 table writes  
- not PSA / `programme_school_availability` writes  
- not Route/product wiring  
- not permission **#2** / **#3**  
- not `NOT_READY_FOR_APPLY` clearance  
- not substituting Vilbli as Tier 1 legal truth for LOSA  

---

## 5. Owner decisions (P4LFM-0–P4LFM-8)

### P4LFM-0 — Adopt slice

**Decision:** **Yes.** Phase 4 LOSA **Finnmark slice** is the **active** step-A.2 workstream after P06-CONTOUR-B-post.

### P4LFM-1 — County scope

**Decision:** **Yes.** Primary reference county **`56`** (Finnmark); slice patterns must remain **nationwide-applicable** (no production rule “only Finnmark”).

### P4LFM-2 — Docs-only slice

**Decision:** **Yes.** Deliverables are **documentation / contract drafts** only until a separate implementation gate.

### P4LFM-3 — Refresh design precedence

**Decision:** **Yes.** `phase-4-losa-official-source-evidence-refresh-design.md` prevails over registry on conflict.

### P4LFM-4 — Phase 2 boundary

**Decision:** **Yes.** Phase 2 exposes states; Phase 4 owns **LOSA legal/operational source-evidence semantics** (per phase-2-spec §21).

### P4LFM-5 — Defer green-county #2 bulk

**Decision:** **Yes.** Owner track **A→B→C**: **step B** (green operational truth refresh) stays **after** this slice reaches **reviewable contract** — avoids UI expansion before LOSA contract exists.

### P4LFM-6 — No UI truth for `56`

**Decision:** **Yes.** Finnmark must **not** appear as ordinary school availability in app until published-internal truth path is explicitly gated.

### P4LFM-7 — Next artifact

**Decision:** **Yes.** Repo artifact **`phase-4-losa-finnmark-publishability-contract-draft.md`** created; acceptance recorded **`ACCEPTED WITH NOTES`** in **`phase-4-losa-finnmark-publishability-contract-acceptance-owner-decision-record.md`** (**P4-LOSA-FM-post**).

### P4LFM-8 — NOT_READY_FOR_APPLY

**Decision:** **Yes.** Unchanged; this slice does not clear apply.

---

## 6. Ordered slice work plan (informational)

| Step | Deliverable | Gate |
|------|-------------|------|
| 1 | Read controlling Phase 4 + Phase 2 + matching + P06-CONTOUR-B-post | none |
| 2 | Draft `phase-4-losa-finnmark-publishability-contract-draft.md` | this record |
| 3 | Owner review: contract draft → `ACCEPTED` / `ACCEPTED WITH NOTES` | owner |
| 4 | Update P06-CONTOUR-B-post / checklist: LOSA blocker **narrowed** (not removed) | docs |
| 5 | Only then: optional Contour **A** dry-run retry charter for `56` | separate |
| 6 | Then owner track **step B** green counties #2 | separate #2 gate |

---

## Final statement

**Phase 4 LOSA Finnmark slice** is **adopted** as the **active** owner workstream to address the **LOSA / external-delivery** blocker for county `56` identified by Contour **B**. It is **planning/design only** and does **not** authorize execution, PSA, Route, or UI.
