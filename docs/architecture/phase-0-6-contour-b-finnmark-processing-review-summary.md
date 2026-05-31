# Phase 0–6 Contour B — Finnmark Processing Review Safe Summary

| Field | Value |
|-------|--------|
| **Document type** | Repo-safe summary after bounded **Contour B** processing session (**P06-CONTOUR-B-post**) |
| **Section** | **P06-CONTOUR-B-post** (Finnmark `56` reference case) |
| **Status code** | `CONTOUR_B_PROCESSING_PASS_PACKET_READY_FOR_REVIEW` |
| **Date (UTC)** | 2026-05-31 |
| **Policy** | `phase-0-6-processing-contour-owner-decision-record.md` (P06-0–P06-8) |
| **Owner track** | **A → B → C** — this summary closes **step A** (Contour B) at **#1** permission level only |
| **Case ID (owner-held)** | `P06-CASE-FINNMARK-56-2026-05-31-01` |
| **Packet ID (owner-held)** | `P06-PACKET-FINNMARK-56-2026-05-31-01` |
| **Charter ID (owner-held)** | `P06-CONTOUR-B-EXEC-FINNMARK-56-2026-05-31-01` |

**Forbidden in this summary:** secrets, raw Vilbli HTML, raw diagnostic JSON dumps, per-school label strings, packet SQL, PII, connection strings, project identifiers, service keys, owner-held charter/prompt/packet full body.

**Binding:** Contour **B** is **request-only** and **non-product** until separate gates. See P06. Contour **A** (operational main matcher → PSA → app) remains the only path for **green** counties without an open Contour **B** request.

---

## This document is not

- not Finnmark **resolved** or publishable in Route/UI
- not permission stack **#2** operational truth write approval for county `56`
- not permission stack **#3** UI / app integration approval
- not Phase 2 decision-row writes or Phase 2 table population approval
- not Phase 4 LOSA **execution** (fetch, refresh job, parser, cron)
- not PSA publication or `programme_school_availability` writes for `56`
- not authorization to re-run `run-vgs-truth-pipeline` in write mode on `56`
- not proof that green counties (`03`, `11`, `15`, `46`, `50`) are updated
- not `NOT_READY_FOR_APPLY` clearance or RLS apply approval

---

## 1. Why this session existed (Contour B vs Contour A)

### 1.1 Contour A (operational main matcher) — what green counties use

Contour **A** is the default nationwide VGS path:

1. Vilbli extract for county + profession  
2. Conservative Vilbli → NSR **1:1** school match  
3. On success → gated writes to **`programme_school_availability`**  
4. Application Route/UI reads **PSA only** (not Phase 2 tables)

Oslo-class counties (`03`, `11`, `15`, `46`, `50` in product allowlist) use Contour **A** when readiness is green and matching is clean.

### 1.2 Contour B (Phase 0–6 processor) — why Finnmark needed it

Contour **B** runs **only** after an explicit **case request** (P06 §5.1). It processes **non-green** / **pipeline-abort** material when Contour **A** must **stop** rather than publish false availability.

**Finnmark `56`** is the reference **problem-class** county in P06 and backlog **Case C**. Operational matcher **must not** fake-publish when schools are unmatched or LOSA-shaped.

### 1.3 What “ABORT” means (plain language)

`run-vgs-truth-pipeline` **ABORT** means: the script refused to continue toward PSA writes because **school matching was not clean** — at least one Vilbli school row could not be matched to exactly one safe NSR identity for publication.

For `56` / `electrician` baseline:

- **`unmatched=22`** — twenty-two Vilbli school rows failed 1:1 match  
- **`ambiguous=0`** — no separate ambiguity bucket in this abort (failure is **unmatched-heavy**, not campus tie-break)  
- **`dbWritesExecuted=false`** — no PSA side effects in dry-run  

This is **correct safety behaviour**, not a tooling bug to bypass.

---

## 2. Session identification

| Field | Value |
|-------|------|
| Summary ID | `P06-CONTOUR-B-POST-FINNMARK-56-2026-05-31-01` |
| Session date (UTC) | 2026-05-31 |
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) |
| Permission stack | **#1** read/process only |
| **OWNER** / **SECURITY_APPROVER** | role labels only (identities **owner-held**) |

**Prerequisite chain:** P06 policy adopted (`119c5a3`); Z-OV-post `4083418` (**#1** verification PASS for green-path tooling); explicit case request opened for `56`.

---

## 3. Baseline evidence (safe aggregates only)

| Source | Safe result | Interpretation |
|--------|-------------|----------------|
| `classify-vgs-truth-readiness` (`56`, `electrician`) | `status=missing_programme_rows` | Electrician VGS **programme nodes** for this county are not readiness-green; distinct from match abort but **also** blocks Contour A |
| `run-vgs-truth-pipeline --dry-run` | **ABORT**; `mode=dry_run`; `dbWritesExecuted=false` | Main matcher **stop**; no publication path |
| `matchingUnmatchedSummary` | `unmatchedSchoolsCount=22`; `losaHintCount=17`; `slashHintCount=5`; `nsrCountyCatalogCount=12` | Majority of unmatched rows carry **LOSA-shaped** hints; county **has** NSR institutions but Vilbli rows did not map 1:1 |
| Phase 2 read-only diagnostics | `phase2SchemaAvailable=true`; all contract counters **0** | Phase 2 tables **empty** on MAIN; packet is **planning/evidence**, not populated decision history |

**CLI rule observed:** `--dry-run` flag only; **`--dry-run=true` not used**.

---

## 4. Processed output (Contour B response)

| Deliverable | Status | Location |
|-------------|--------|----------|
| Evidence packet | `packet_status=ready_for_review` | owner-held `P06-PACKET-FINNMARK-56-2026-05-31-01` |
| Operator bucket table | complete (counts only in git) | §5 below |
| Blocker list for Contour A retry | recorded | §6 below |
| Main matcher retry approval | **not granted** | §7 |

Contour **B** fulfilled P06 §5.2 **maximum** for **#1**: processed, structured, non-product artifact — **not** UI truth.

---

## 5. School-level failure buckets (aggregate — no per-school labels in git)

| Bucket | Count | Meaning for product |
|--------|-------|---------------------|
| **Unmatched (pipeline abort driver)** | **22** | Cannot assign ordinary NSR-linked school identity for Vilbli row → **no PSA row** |
| **LOSA hints (within unmatched diagnostics)** | **17** | Labels/signals consistent with **LOSA / non-ordinary delivery** — matcher CASE 4 class; not ordinary VGS school |
| **Slash hints** | **5** | Alias/campus language risk — secondary; not the dominant Finnmark failure mode in this baseline |
| **NSR catalog presence** | **12** institutions in county | NSR is not “empty”; problem is **Vilbli↔NSR 1:1** + **LOSA semantics**, not missing registry |

**Alignment with backlog Case C (`56` Finnmark):** conceptual classification **`unsupported_losa` + `external_delivery` + `phase4_blocked`** for any publication attempt under current contracts.

---

## 6. Blockers before Contour A may retry on `56`

Ordered by dependency (checklist/logic, not execution approval):

| # | Blocker | Owner of fix | Contour |
|---|---------|--------------|---------|
| 1 | **LOSA / external-delivery** has no approved **publishability model** | **Phase 4 LOSA slice** (docs/design) → later gates | **B** then **A** |
| 2 | **22 unmatched** schools need identity/location resolution policy applied per matching spec (no random campus, no first-candidate) | Phase 2 + Phase 4 semantics | **B** |
| 3 | **`missing_programme_rows`** for electrician path nodes | Programme materialization / path planner (operational) | **A** prerequisite |
| 4 | **Phase 2 tables empty** | Separate **#2** gate if decision rows required | not **#1** |
| 5 | **UI / Route** | **#3** gate only after published internal truth exists | product |

**Critical rule:** Phase 4 LOSA model **precedes** treating LOSA Vilbli rows as ordinary `programme_school_availability` (per `school-identity-location-resolution-phase-2-spec.md` §21 and matching spec CASE 4).

---

## 7. Main matcher retry and publication posture

| Question | Answer |
|----------|--------|
| May `run-vgs-truth-pipeline` write to PSA for `56` now? | **No** |
| May Route/UI show Finnmark electrician availability from this session? | **No** |
| May Contour A dry-run “pass” be assumed after this post? | **No** — abort expected until blockers §6 addressed |
| Owner-selected next step (2026-05-31) | **Phase 4 LOSA slice** for Finnmark dependency (see `phase-4-losa-finnmark-slice-owner-decision-record.md`) |

---

## 8. Relationship to other contours (no scope expansion)

| Contour | Relationship to this post |
|---------|---------------------------|
| **Z-OV (#1)** | Proved green-path tooling; **did not** resolve `56` |
| **P06 policy** | Defined **when** Contour B runs; this post is **first** Contour B execution outcome |
| **Phase 2** | States/evidence shape; **no** row writes in this session |
| **Phase 4 LOSA** | **Required** for LOSA publishability; **next slice** per owner |
| **Phase 3 scaffold** | Unchanged; **X-post NO_TOUCH** on product Phase 2 tables |
| **App (Oslo etc.)** | Unchanged; operational PSA path preserved |

---

## 9. Success criteria disposition (CB-CRIT)

| Criterion | Result |
|-----------|--------|
| **CB-CRIT-01** Case request complete | **pass** |
| **CB-CRIT-02** Baseline captured | **pass** |
| **CB-CRIT-03** Evidence packet `ready_for_review` | **pass** |
| **CB-CRIT-04** No writes / N11 absent | **pass** |
| **CB-CRIT-05** Main matcher retry not auto-approved | **pass** |

**Outcome code:** `CONTOUR_B_PROCESSING_PASS_PACKET_READY_FOR_REVIEW`

---

## 10. Owner disposition after this summary (recorded direction)

| Decision | Value (2026-05-31) |
|----------|-------------------|
| Accept Contour B packet as baseline for `56`? | **yes** (proceed on aggregate evidence in this post) |
| Next workstream | **Phase 4 LOSA slice** (Finnmark dependency) — **not** green-county #2 bulk refresh yet (**step B** in A→B→C remains **after** LOSA slice progress) |
| Open #2 truth writes for `56`? | **no** |
| Open #3 UI for Finnmark? | **no** |

---

## 11. Recommended next actions (informational)

1. Execute **Phase 4 LOSA Finnmark slice** per `phase-4-losa-finnmark-slice-owner-decision-record.md` (docs-only; registry + refresh design + crosswalk as inputs).  
2. Produce **Finnmark LOSA publishability contract draft** (provider vs delivery site; blocked states linkage to Phase 2 vocabulary).  
3. Only after LOSA contract + programme-row readiness: reconsider Contour **A** dry-run on `56`.  
4. **Step B** (green counties operational #2) remains valid **after** slice **A.2** (LOSA) reaches reviewable contract — preserves order **A→B→C**.

---

## Final summary statement

This safe summary records that **Contour B** processed Finnmark `56` under an explicit P06 case request at **#1** only: the operational main matcher **correctly aborts** on **22** unmatched schools with **LOSA-heavy** hints; **publication and UI truth remain forbidden**; the processed output is a **ready-for-review evidence packet** (owner-held detail). Owner direction: proceed to **Phase 4 LOSA slice** before green-county operational refresh or Finnmark PSA writes.
