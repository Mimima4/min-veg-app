# Phase 2 Operational Truth Write (Green Counties) Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **operational truth write (#2)** execution gate — **docs-level gate adoption only** — **NOT_READY_FOR_APPLY** unchanged |
| **Closure label** | `PHASE_2_OPERATIONAL_TRUTH_WRITE_GREEN_COUNTIES_GATE_ADOPTED_BOUNDED` |
| **Scope** | **Permission stack #2** — bounded **operational** `programme_school_availability` refresh via Contour **A** (`run-vgs-truth-pipeline`) for **green** electrician counties on **MAIN-OWNER-USED** (TW2G0–TW2G25); **no UI integration** |
| **Date (UTC)** | 2026-05-31 |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **B-GREEN-#2** (owner track step **B**) |
| **Agreement basis** | Owner track **A→B→C** after **P4-LOSA-FM-post**; follows **Z-OV-post** (`OPERATIONAL_VERIFICATION_PASS`) and three-permission stack separation |

This record adopts a **bounded execution gate** for **operational production truth write without UI** (permission stack **#2**) on green counties after verification-only work (**#1**) and Finnmark LOSA contract acceptance (**A.2**).

It does **not** clear `NOT_READY_FOR_APPLY`, does **not** issue apply approval, does **not** authorize permission stack **#3** (UI / app integration), does **not** authorize Phase 2 seven-table writes or Route/PSA **product** wiring to those tables, does **not** authorize Finnmark `56` bulk PSA, Contour **B** processing, or LOSA fetch implementation.

**Adopting this gate does NOT change NOT_READY_FOR_APPLY** globally.

**Gate adopted ≠ charter filled ≠ session run ≠ truth refresh closed.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (= MAIN) only unless a filled owner-held charter explicitly lists an additional bounded rehearsal target (e.g. STAGING) and only for pre-write dry-run — never as substitute for MAIN write results.

**Phase 0–6 processing contour (binding):** Contour **A** only for counties in charter; Contour **B** **forbidden** in #2 sessions; Phase 0–6 **must not** change application UI, product server paths, or Route reads from Phase 2 tables. See `docs/architecture/phase-0-6-processing-contour-owner-decision-record.md`.

**Session error rule (binding):** **any** command error, unexpected output, unexpected write outside charter county scope, parser ambiguity (e.g. CLI flag not recognized as dry-run), pipeline **ABORT** on a county chartered for write, or boundary breach ⇒ **STOP (N11)** immediately; **no** autonomous repair, corrective re-run, or continuation in the **same** session.

**Pipeline CLI (binding):**

- Rehearsal / pre-flight: **`--dry-run`** flag only — **not** `--dry-run=true`.
- Production write: run **without** `--dry-run` only for counties explicitly listed in the filled charter for write.

**Green county reference set (electrician, operational):** `03` Oslo, `11` Rogaland, `15` Møre og Romsdal, `46` Vestland, `50` Trøndelag — aligned with `TRUTH_READY_ELECTRICIAN_COUNTIES` in `src/server/children/routes/apply-route-selection-boundary.ts`.

**Default charter county scope:** `11`, `46`, `50` (pipeline dry-run **clean**). County **`03` (Oslo)** and **`15` (Møre og Romsdal)** — **charter-explicit only**; **`03`** to preserve working Oslo truth unless owner directs refresh; **`15`** excluded from default because Contour **A** dry-run **ABORT**s (`ambiguous=1`) while app display may remain Vilbli-aligned (execution plan — not a UI defect).

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged globally |
| **EXECUTION_FORBIDDEN** | Unchanged except bounded #2 session(s) after filled owner-held charter + separate execution prompt |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged for git packet SQL/body |
| **PHASE_2_OPERATIONAL_TRUTH_WRITE_GREEN_COUNTIES_GATE_ADOPTED_BOUNDED** | Bounded #2 green-county PSA refresh path approved at gate level |
| **TRUTH_WRITE_SESSION_NOT_RUN_AT_ADOPTION** | Session is not completed at gate adoption |
| **UI_TRUTH_INTEGRATION_BLOCKED** | Permission stack **#3** remains separate |
| **FINNMARK_56_BULK_PSA_BLOCKED** | County `56` and non-green readiness counties **out of scope** for this gate |

---

## This document is not

- not `NOT_READY_FOR_APPLY` clearance grant or denial
- not apply approval or apply execution approval
- not permission stack **#3** UI / app integration approval
- not Phase 2 decision-table population or runtime/write **product** integration on seven Phase 2 tables
- not Route Engine **product** consumption approval on Phase 2 tables (**X-post** **NO_TOUCH** preserved)
- not Finnmark `56` operational resolution, Contour **B** case closure, or LOSA refresh **execution**
- not proof that all green counties were refreshed (until **B-GREEN-#2-post** safe summary)
- not authorization to wire `src/lib/phase3-operationalization/**` into product paths
- not Z-OV verification substitute — **#1** remains closed at **Z-OV-post**; this gate opens **#2** only

---

## Meta-rule TW2G0

All **Yes** decisions (TW2G1–TW2G25) adopt **operational truth write (#2) green counties** execution gate and approve bounded operational PSA refresh session path(s) only.

TW2G1–TW2G25 do **not** authorize apply, clearance issuance, UI integration (#3), Phase 2 table writes, Route/PSA product wiring changes, Finnmark bulk PSA, Contour **B** auto-processing, or LOSA fetch jobs.

---

## Owner/security operational truth write decisions (TW2G0–TW2G25)

### Decision TW2G0 — Scope

**Owner/security decision:** **Yes.** Operational truth write (permission stack **#2**) for **green** electrician counties via Contour **A** only — **no UI**.

### Decision TW2G1 — Prerequisites

**Owner/security decision:** **Yes.** Inputs include at minimum: **Z-OV-post** (`OPERATIONAL_VERIFICATION_PASS`), **P4-LOSA-FM-post** (contract **`ACCEPTED WITH NOTES`**), **P06** policy adopted, **U-post**, **V-post**, **W-post**, **X-post** (Route/PSA **NO_TOUCH** on seven Phase 2 tables), **Z-CLRD-post**, **Z-APPISS-post**, and three-permission stack separation acknowledged.

### Decision TW2G2 — Target

**Owner/security decision:** **Yes.** **MAIN-OWNER-USED** / **PROD** primary for writes and verification.

### Decision TW2G3 — STAGING optional rehearsal only

**Owner/security decision:** **Yes.** STAGING may appear in a filled charter only for optional **dry-run** rehearsal; it does **not** substitute MAIN write results.

### Decision TW2G4 — Bounded session(s) after charter

**Owner/security decision:** **Yes.** One or more bounded #2 sessions may run after filled owner-held charter and separate execution prompt per session (or per charter tranche if charter defines tranches).

### Decision TW2G5 — In-scope write surface (binding)

**Owner/security decision:** **Yes.** In-scope production writes are limited to **operational** materialization via approved pipeline path:

- `classify-vgs-truth-readiness` (pre-check per county)
- `run-vgs-truth-pipeline` **without** `--dry-run` for counties explicitly chartered for write
- resulting updates to **`programme_school_availability`** and related operational matcher side effects defined by the pipeline contract

Charter must list **exact** counties and profession (`electrician` default unless charter states otherwise). Gate adoption does not approve all green counties by default.

### Decision TW2G6 — Default county scope vs Oslo `03`

**Owner/security decision:** **Yes.** Default approved charter candidates: **`11`, `46`, `50`**. County **`03`** only when charter explicitly includes Oslo refresh with owner rationale (Z-OV preserved Oslo PSA **10/10** without pipeline run). County **`15`** only when charter explicitly includes it **and** pre-flight dry-run for `15` is **clean** in the same session (otherwise **STOP**); default **excludes** `15` because pipeline currently **ABORT**s on `ambiguous=1` while Vilbli-aligned display may remain correct.

### Decision TW2G7 — Excluded counties and contours

**Owner/security decision:** **Yes.** **Forbidden** in #2 sessions: Finnmark **`56`**, any county with readiness not `verification_ready_after_write`, any county where chartered pre-flight dry-run **ABORT**s, Contour **B** processing, Phase 2 seven-table DML.

### Decision TW2G8 — UI and product path prohibition (binding)

**Owner/security decision:** **Yes.** No changes to user-facing Route/UI wiring, no `phase3-operationalization` import into product paths, no presentation of Phase 2 table rows as application truth. PSA refresh is **backend operational truth** only until **#3**.

### Decision TW2G9 — Phase 2 tables NO_TOUCH

**Owner/security decision:** **Yes.** **X-post** **NO_TOUCH** for product runtime on seven Phase 2 tables remains binding; #2 does not authorize population or product reads of those tables.

### Decision TW2G10 — No publication beyond operational PSA

**Owner/security decision:** **Yes.** No new publication surfaces, no marketing/content truth, no end-user-facing “published” labels beyond existing operational PSA consumption paths already in production.

### Decision TW2G11 — No persistent test pollution

**Owner/security decision:** **Yes.** No durable test rows; pipeline must not leave charter scope.

### Decision TW2G12 — No policy/DDL/packet SQL in git

**Owner/security decision:** **Yes.** No schema, policy, GRANT/REVOKE, or execution-packet SQL in git.

### Decision TW2G13 — Owner-held charter required

**Owner/security decision:** **Yes.** Filled owner-held charter required before any connect or write prompt.

### Decision TW2G14 — Separate execution prompt required

**Owner/security decision:** **Yes.** Pre-session QA **PASS** and explicit #2 execution prompt required before session.

### Decision TW2G15 — Owner-held evidence storage

**Owner/security decision:** **Yes.** Detailed evidence owner-held; git gets safe summary only (**B-GREEN-#2-post**).

### Decision TW2G16 — Fail/abort/error/unexpected write = stop

**Owner/security decision:** **Yes.** `FAIL/ABORT/UNCLEAR/ERROR/UNEXPECTED_WRITE/PARSER_AMBIGUITY/OUT_OF_SCOPE_COUNTY => STOP (N11)` applies. Executor **must not** self-heal in the same session.

### Decision TW2G17 — Truth write pass does not clear NOT_READY

**Owner/security decision:** **Yes.** Positive #2 session does not clear `NOT_READY_FOR_APPLY` and does not issue apply approval.

### Decision TW2G18 — Truth write pass does not authorize UI integration

**Owner/security decision:** **Yes.** Permission stack **#3** requires a **separate** owner gate after data sign-off.

### Decision TW2G19 — Truth write pass does not close Finnmark / Contour B

**Owner/security decision:** **Yes.** Finnmark operational resolution, LOSA refresh execution, and Contour **B** case closure remain **open**.

### Decision TW2G20 — Dry-run vs write CLI discipline

**Owner/security decision:** **Yes.** Pre-write rehearsal uses **`--dry-run`** only. Chartered production write runs **must not** pass `--dry-run`. **`--dry-run=true` is forbidden** (parser hazard).

### Decision TW2G21 — Readiness gate per county

**Owner/security decision:** **Yes.** Each chartered write county must show `verification_ready_after_write` (or successor green status in execution plan) immediately before write attempt.

### Decision TW2G22 — Pipeline clean match required for write

**Owner/security decision:** **Yes.** For each write county, chartered pre-flight `run-vgs-truth-pipeline --dry-run` must succeed without **ABORT** (unmatched/ambiguous thresholds per pipeline contract) in the **same** session before non-dry-run run for that county.

### Decision TW2G23 — No secrets / PII in git

**Owner/security decision:** **Yes.**

### Decision TW2G24 — Role labels only in git

**Owner/security decision:** **Yes.** **OWNER**, **SECURITY_APPROVER**, **TECH_EXECUTOR** — no real names/emails in git.

### Decision TW2G25 — Outcome codes (informational)

**Owner/security decision:** **Yes.** Separate safe summary may use:

| Code | Meaning |
|------|---------|
| `OPERATIONAL_TRUTH_WRITE_NOT_READY_STOP` | Blockers; stop; do not proceed to #3 |
| `OPERATIONAL_TRUTH_WRITE_PASS` | Chartered counties refreshed; may **consider** separate #3 gate only |
| `OPERATIONAL_TRUTH_WRITE_PASS_WITH_LIMITATIONS` | Partial pass; limitations block #3 until resolved |

---

## Relationship to prior records

- **Depends on:** `phase-2-operational-verification-only-execution-review-summary.md` (**Z-OV-post**).
- **Depends on:** `phase-4-losa-finnmark-publishability-contract-acceptance-owner-decision-record.md` (**P4-LOSA-FM-post**).
- **Depends on:** `phase-0-6-processing-contour-owner-decision-record.md` (**P06**).
- **Depends on:** `phase-2-rls-main-route-psa-wiring-review-summary.md` (**X-post** **NO_TOUCH**).
- **Complements:** `phase-0-6-contour-b-finnmark-processing-review-summary.md` — Finnmark **not** in #2 scope.
- **Charter template:** `phase-2-operational-truth-write-green-counties-execution-charter-template.md` — owner-held only.
- **Review summary template:** `phase-2-operational-truth-write-green-counties-execution-review-summary-template.md`.

---

## Final boundary statement

Section **B-GREEN-#2** adopts a bounded **operational truth write (#2)** execution gate (TW2G0–TW2G25). It permits owner-chartered refresh of **green-county** operational PSA truth via Contour **A** without UI integration. It does **not** clear `NOT_READY_FOR_APPLY`, does **not** approve apply, does **not** authorize permission stack **#3**, and does **not** authorize Finnmark `56` or Phase 2 table product paths.
