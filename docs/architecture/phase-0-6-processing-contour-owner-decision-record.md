# Phase 0–6 Processing Contour — Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **binding policy** — **docs-level adoption** — **NOT_READY_FOR_APPLY** unchanged |
| **Closure label** | `PHASE_0_6_PROCESSING_CONTOUR_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | When the **Phase 0–6 processing contour** may run, what it may return, and how it relates to the **operational main matcher** (Vilbli→NSR→PSA) and product UI |
| **Date (UTC)** | 2026-05-29 |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **Z-OV**; `phase-2-operational-verification-only-execution-gate-owner-decision-record.md` |
| **Incident anchor** | Z-OV session `MAIN-OP-VERIFY-2026-05-29-01` — verification contour must not substitute for green-county operational truth writes (Oslo `03` class) |

**Canonical location:** this file in `docs/architecture/`. Owner-held copies (if any) are **non-canonical** session convenience only.

This record adopts **request-only** rules for the Phase 0–6 processing contour. It does **not** approve Phase 2 table writes, PSA publication, Route product consumption, UI integration, apply, or clearance.

---

## 1. Purpose

**Phase 0–6 processing contour** means the **non-product**, **on-demand** stack that processes **ambiguous or non-green** Vilbli/identity material when the **operational main matcher** cannot safely produce publishable availability truth.

It exists so that:

- **Green counties** (Oslo-class) stay on the **operational path only** — parser + `run-vgs-truth-pipeline` + `programme_school_availability` → app reads via operational surfaces (e.g. `getAvailabilityTruth`).
- **Non-green counties** (Finnmark-class) get a **bounded processor** that accepts an **explicit request**, consumes **raw + diagnostic** inputs, and returns **verified processed output** for a **later** main-matcher retry — **not** direct UI truth.

**One sentence rule:** Phase 0–6 **answers requests**; it does **not** self-start route building, UI rendering, or verification sessions.

---

## 2. Two contours (normative)

| | **A — Operational main matcher** (default) | **B — Phase 0–6 processing** (exception) |
|---|---------------------------------------------|------------------------------------------|
| **Role** | Vilbli extract → NSR school match → PSA operational truth | Identity/location/evidence/decision processing for **unresolvable** raw input |
| **Typical counties** | `03`, `11`, `15`, `46`, `50` (`verification_ready_after_write`) | `18`, `55`, `56` and any county with pipeline **ABORT** or readiness **not green** |
| **Trigger** | Owner charter for **permission stack #2** (truth write), or bounded dry-run under **#1** | **Explicit request only** (see §5) |
| **Output** | `programme_school_availability` rows (gated) | Processed evidence / resolution artifact via **non-product** channels |
| **Product UI** | Yes — via published PSA + Route reads | **No** — until separate **#3** UI gate |
| **Auto on route load / recompute** | Uses existing operational truth reads | **Forbidden** |

**Separation:** Contour **B** must **never** be wired as a silent fallback inside Contour **A** or inside Route/PSA product paths (`src/` today has **no** Phase 2 table reads for routes — preserve until explicit **#3** gate).

---

## 3. Reference cases (evidence-backed, non-exhaustive)

These counties illustrate activation rules only; they are **not** production rule definitions (see `norway-school-identity-matching-execution-plan.md`).

### 3.1 Case A — Oslo `03` (green / Oslo-class)

| Check | Observed posture (execution plan + pipeline contract) |
|-------|--------------------------------------------------------|
| `classify-vgs-truth-readiness` | `verification_ready_after_write` |
| `run-vgs-truth-pipeline --dry-run` | Succeeds; matching clean (`5/0/0` matched/unmatched/ambiguous baseline) |
| Phase 0–6 contour | **Must remain inactive** for route/UI build |
| Correct operational action | Operational pipeline repopulate/write for `03` under **separate** permission **#2** charter — **not** “enable Phase 0–6 in product” |

**Lesson (2026-05-29):** Treating verification (**#1**) or Phase 0–6 diagnostics as license to **write PSA** or to **repair** Oslo without a **#2** charter was a **contour violation**, not evidence that Oslo needs Contour **B**.

### 3.2 Case B — Finnmark `56` (non-green / Finnmark-class)

| Check | Observed posture (execution plan + pipeline contract) |
|-------|--------------------------------------------------------|
| `classify-vgs-truth-readiness` | `missing_programme_rows` |
| `run-vgs-truth-pipeline --dry-run` | **`ABORT`** — `School matching not clean. unmatched=22, ambiguous=0` |
| Identity semantics | LOSA-heavy (`losa=18`, `unsupported=18` in plan baseline); operator-facing diagnostics are **long and non-publishable** |
| Phase 0–6 contour | **Eligible only after explicit request** — process raw + semantics → confirmed processed output → **then** (separate gates) main matcher may retry |

**Lesson:** Main matcher **correctly stops**; Contour **B** is the **request-driven** processor for that stop — **not** a bypass into UI.

---

## 4. Activation matrix

| Condition | Operational contour **A** | Phase 0–6 contour **B** |
|-----------|---------------------------|-------------------------|
| Readiness `verification_ready_after_write` + pipeline dry-run clean | **Allowed** (under #1 dry-run or #2 write charter) | **Forbidden** (no request needed) |
| Readiness not green | **Must not** fake-write PSA | **Allowed only** with explicit request |
| Pipeline `ABORT` (unmatched/ambiguous) | **Stop** — no silent PSA publish | **Allowed only** with explicit request |
| Route page load / Route recompute | Read operational PSA only | **Forbidden** auto-invoke |
| Z-OV verification session (#1) | Read-only diagnostics / dry-run per charter | **No** product mutation; **no** substitute for #2 |
| No open request / case ID | Run **A** only if green + gated | **Silent** — **no output**, **no writes** |

---

## 5. Request → response contract (minimum)

### 5.1 Request (required before Contour **B** work)

Owner or security must issue a **written request** (owner-held case packet or charter section) containing at minimum:

| Field | Required |
|-------|----------|
| `request_id` / `case_id` | yes |
| `county_code` | yes |
| `profession` | yes |
| `trigger` | one of: `pipeline_abort`, `readiness_not_green`, `operator_case`, `identity_semantics_blocked` |
| `reason_summary` | yes (e.g. `unmatched=22`, `missing_programme_rows`) |
| `input_artifacts` | yes (Vilbli extract refs, `classify-vgs-truth-readiness` output, diagnostics/semantics paths) |
| `requested_outcome` | yes (e.g. identity/location resolution packet for main-matcher retry) |
| `permission_stack` | **#1** read/process only unless separate **#2** gate explicitly includes Phase 2 writes |

**No request ⇒ no Contour **B** work and no Contour **B** response.**

### 5.2 Response (maximum without further gates)

| Allowed in response | Forbidden in response |
|---------------------|------------------------|
| Processed evidence packet (owner-held / approved non-product channel) | User-facing UI truth |
| Confirmed resolution **decisions** (future Phase 2 tables — only with **#2** write gate) | Direct Route/PSA publication |
| “Main matcher may retry” flag **after** owner acceptance | Auto-retry pipeline without new charter |
| Structured operator-readable summary | Raw dump as final UX |

---

## 6. Forbidden auto-triggers (binding)

Phase 0–6 contour **must not** start because of:

1. Route build, route recompute, or dashboard load.
2. Default Z-OV or verification checklist steps on a **green** county.
3. Pipeline failure alone (abort must **stop** Contour **A**; Contour **B** needs a **separate request**).
4. Diagnostics helper output (`phase-2-read-only-diagnostics-helper-boundary-adr.md` — must not influence readiness/pipeline control).
5. Incident “self-heal” in the **same** session after error or unexpected write (**STOP** per Z-OV N11).
6. Import/wiring of `phase3-operationalization` or Phase 2 tables into `src/app` / product server paths without **#3**.

---

## 7. Permission stack alignment

| Stack | Contour **A** (operational) | Contour **B** (Phase 0–6) |
|-------|------------------------------|---------------------------|
| **#1** Verification-only | Dry-run, classify, read-only diagnostics | Process/read raw inputs; return non-product processed artifact |
| **#2** Truth write | PSA writes for **green** counties when chartered | Phase 2 decision-row writes only when **explicitly** in charter — **not** default |
| **#3** UI integration | Operational PSA → Route/UI | Phase 0–6 outputs → UI **blocked** until separate gate |

Phase 0–6 is **not** a fourth permission; it is **machinery inside #1→#2** for non-green cases.

---

## 8. Relationship to other architecture docs

| Document | Relationship |
|----------|----------------|
| `norway-school-identity-matching-spec.md` | Normative CASE 1–4; Contour **A** must obey abort rules |
| `school-identity-location-resolution-phase-2-spec.md` | Contour **B** target semantics (future tables; gated writes) |
| `phase-2-problem-contour-activation-read-model-map.md` | Clean vs problem path; Contour **B** = problem tail **on request** |
| `phase-2-read-only-diagnostics-contract.md` / helper ADR | Inform operators; **not** publication truth; **not** auto-activate Contour **B** |
| `phase-2-operational-verification-only-execution-gate-owner-decision-record.md` | Z-OV **#1**; cites this record |
| `norway-school-identity-matching-execution-plan.md` | County matrix evidence (`03` green, `56` abort) |
| `route-engine-master-spec.md` | Route reads **published internal** truth only |

**Conflict rule:** canonical matching + Phase 2 spec + Route master spec win over this record on matching semantics; this record wins on **activation / request-only** product boundary.

---

## 9. Owner/security decisions (P06-0–P06-8)

### P06-0 — Scope

**Decision:** **Yes.** Adopt Phase 0–6 processing contour policy at docs level only.

### P06-1 — Request-only activation

**Decision:** **Yes.** Contour **B** runs **only** on explicit request with §5.1 fields.

### P06-2 — No silent product participation

**Decision:** **Yes.** Contour **B** must **not** auto-participate in route construction, UI display, or verification-default workflows.

### P06-3 — Green-county default

**Decision:** **Yes.** Counties with `verification_ready_after_write` and clean pipeline matching use Contour **A** only unless a **separate** Contour **B** request is opened for a **scoped** sub-problem.

### P06-4 — Non-green / abort stop rule

**Decision:** **Yes.** Pipeline **ABORT** or non-green readiness **stops** Contour **A** writes; Contour **B** requires a **new** request — no auto-continue.

### P06-5 — Output boundary

**Decision:** **Yes.** Contour **B** returns processed non-product artifacts; **not** UI truth; **not** PSA/Route publication without **#2** / **#3** gates.

### P06-6 — Verification session boundary

**Decision:** **Yes.** Z-OV (**#1**) may **read** diagnostics; it does **not** authorize Contour **B** to mutate app/PSA or substitute for Oslo-class operational repopulate.

### P06-7 — Session error discipline

**Decision:** **Yes.** Any error, unexpected write, or CLI dry-run ambiguity ⇒ **STOP**; no Contour **B** “repair” in the same session.

### P06-8 — NOT_READY_FOR_APPLY

**Decision:** **Yes.** This record does **not** change global **NOT_READY_FOR_APPLY** or apply/clearance posture.

---

## 10. This document is not

- not implementation approval for Phase 2 writes
- not PSA publication or Route product consumption approval
- not UI integration approval (permission **#3**)
- not operational truth write approval for green counties (permission **#2** — separate charter)
- not proof that Finnmark `56` is resolved
- not permission to run `run-vgs-truth-pipeline` without `--dry-run` on non-green counties
- not a county-specific production rule table (examples in §3 only)

---

## 11. Operational CLI note (Contour **A**)

For pipeline dry-run under verification or truth charters, use **`--dry-run`** only. Do **not** pass `--dry-run=true` (parser key mismatch → real writes risk). See Z-OV Section and incident log `MAIN-OP-VERIFY-2026-05-29-01`.
