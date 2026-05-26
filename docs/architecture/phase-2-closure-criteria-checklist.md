# Phase 2 Closure Criteria Checklist

## Snapshot / version

- **Status:** Docs-only control checklist
- **Scope:** School identity / location resolution Phase 2
- **Execution reference:** `docs/architecture/norway-school-identity-matching-execution-plan.md`
- **Repository checkpoint:** `8d780ce Add Phase 2 to Phase 3 gate criteria` (from `git log -1 --oneline` at checklist reference refresh)
- **Checklist reference note:** Checklist reference refreshed after the Phase 2 operational documentation sequence was committed; operational approval states remain unchanged.
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

**Related committed Phase 2 documentation artifacts (docs-only; not execution approval):**

These are **documentation / boundary / criteria** artifacts only. They are **not** production truth execution, **not** runtime/write approval, **not** PSA materialization or publication approval, **not** Route Engine consumption approval, and **not** Phase 3 approval.

- `docs/architecture/phase-2-evidence-model-closure-criteria.md`
- `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md`
- `docs/architecture/phase-2-governance-review-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — owner-adopted evidence sufficiency policy (M0 + 1–8); **docs-only**; **not** execution approval
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — owner-adopted governance/review policy (G0 + G1–G9); **docs-only**; **not** execution approval
- `docs/architecture/phase-2-production-truth-owner-decision-record.md` — owner-adopted production truth boundary policy (P0 + P1–P12); **docs-only**; **not** execution approval; **not** operational production truth closure
- `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — owner-adopted runtime/write boundary policy (R0 + R1–R12); **docs-only**; **not** execution approval; **not** operational runtime/write integration
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — owner-adopted RLS apply readiness policy (Q0 + Q1–Q15); **docs-only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **not** Gate 34B execution, staging apply, main apply, or production apply
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — owner-adopted RLS apply preconditions policy (C0 + C1–C16); **docs-only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; complements readiness record; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — owner-adopted RLS target-map policy (T0 + T1–T11); **docs-only**; private labels only (no secrets in git; **not** `.env`); **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** cleanup/migration approval
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — owner-adopted RLS accountability policy (A0 + A1–A12); **docs-only**; role labels only (no names/emails in git); **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — owner-adopted RLS per-target snapshot **requirements** policy (S0 + S1–S14); **docs-only**; **no** live snapshot collected; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — owner-adopted RLS negative-test **plan** policy (N0 + N1–N16); **docs-only**; **no** tests executed; **no** test pass evidence; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — owner-adopted RLS owner-held snapshot evidence **planning** policy (E0 + E1–E18); **docs-only**; **no** live snapshot collected; **no** Supabase connect; **no** test execution; **MAIN/PROD primary**; **STAGING optional rehearsal only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — owner-adopted RLS diagnostics compatibility **planning** policy (D0 + D1–D20); **docs-only**; **no** diagnostics re-run; **no** compatibility pass; **no** Supabase connect; **MAIN/PROD primary**; **STAGING optional rehearsal only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval; **not** helper/pipeline integration
- `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — owner-adopted RLS FORCE RLS **policy** (F0 + F1–F18); **docs-only**; **first apply: FORCE excluded**; **no** FORCE enabled; **no** SQL/Supabase; **MAIN/PROD primary**; **STAGING optional rehearsal only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` — owner-adopted RLS parity evidence **planning** policy (P0 + P1–P18); **docs-only**; **no** parity evidence collected; **no** evidence transfer approved; **MAIN/PROD primary**; **STAGING optional rehearsal only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** execution packet approval
- `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` — owner-defined RLS live snapshot collection **gate** (SG0 + SG1–SG18); **docs-only**; **gate defined only**; **no** Supabase connect; **no** snapshot collected; **MAIN/PROD primary**; **STAGING optional rehearsal only**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** collection execution approval; **not** apply approval
- `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md` — owner-adopted RLS live snapshot collection **execution** gate (SE0 + SE1–SE20); **MAIN-OWNER-USED** bounded **read-only** connect **approved** for one snapshot capture session; capture + review summarized in safe summary record below; **NOT_READY_FOR_APPLY**; apply/packet/SQL/**still** **EXECUTION_FORBIDDEN**; **not** apply approval
- `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md` — **safe summary** of completed MAIN Tier 1 capture + **OWNER** / **SECURITY_APPROVER** review (PASS_WITH_SECURITY_FINDINGS); detailed evidence **owner-held**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval
- `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-execution-gate-owner-decision-record.md` — owner-adopted MAIN diagnostics **pre-RLS baseline execution** gate (BL0 + BL1–BL20); **MAIN-OWNER-USED** bounded **read-only** diagnostics connect **approved** for one baseline session; baseline + review summarized in safe summary record below; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval
- `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — **safe summary** of completed MAIN pre-RLS diagnostics baseline + **OWNER** / **SECURITY_APPROVER** review (PASS_BASELINE_CAPTURED); detailed output/parameters **owner-held**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** apply approval; **not** post-RLS compatibility pass
- `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` — owner-adopted MAIN **Tranche A read-only exposure inventory** gate (NT0 + NT1–NT21); **Tranche A only** on **MAIN-OWNER-USED**; **no** Tranche B; **no** DML/write attempts/test rows/write-denial tests; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** Q4 pass; **not** N12 pass; **not** apply approval
- `docs/architecture/phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` — **safe summary** of completed MAIN Tranche A read-only exposure inventory + **OWNER** / **SECURITY_APPROVER** review (PASS_WITH_EXPOSURE_FINDINGS); exposure findings all 7 tables; detailed findings **owner-held**; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN**; **EXECUTION_PACKET_DRAFT_FORBIDDEN**; **not** Q4 pass; **not** N12 pass; **not** Tranche B; **not** apply approval
- `docs/architecture/phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md` — MAIN deny-posture **planning** gate (DP0–DP21); **planning only**; **no** SQL/apply; Option A/B review path defined; Tranche B/write-denial **not** approved; **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged
- `docs/architecture/phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` — MAIN deny-posture **apply execution** gate (DA0–DA21); **docs-level adoption only**; Option B bundle + rollback **accepted owner-held** with SQL_REVIEWER **PASS_WITH_NOTES**; filled charter **required before connect**; Tranche B/write-denial/Q4/N12 **not** approved; **NOT_READY_FOR_APPLY** unchanged
- `docs/architecture/phase-2-rls-main-deny-posture-apply-review-summary.md` — **safe summary** of completed MAIN Option B deny-posture apply + post-apply verification (PASS_POST_APPLY_VERIFICATION); RLS on all 7; FORCE off; 14 policies; rows 0; bundle/rollback/charter **owner-held**; **not** Q4/N12/Tranche B/write-denial; **NOT_READY_FOR_APPLY** unchanged
- `docs/architecture/phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md` — MAIN post-RLS diagnostics compatibility **pass execution** gate (PC0–PC21); **one bounded read-only** diagnostics session on **MAIN-OWNER-USED** after U-post; R-post before reference; RLS-path PASS/FAIL/UNCLEAR; Tranche B/Q4/N12 **not** approved; **NOT_READY_FOR_APPLY** unchanged
- `docs/architecture/phase-2-rls-main-diagnostics-post-rls-compatibility-charter-template.md` — **template** for owner-held post-RLS diagnostics session charter (not execution authority alone)

**Checklist reference note (2026-05-26):** **MAIN post-RLS diagnostics compatibility execution gate (Section V)** logged per `phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md` — follows **U-post** + **R-post** + D planning; **one bounded read-only** diagnostics session on **MAIN-OWNER-USED** approved; approved contract consumer only; charter template **owner-held** before connect; **does not** execute diagnostics; **does not** claim RLS-path PASS reviewed; **does not** approve Tranche B, write-denial, Q4, N12, packet, or runtime/write; **NOT_READY_FOR_APPLY** unchanged; **EXECUTION_FORBIDDEN** narrowly allows only chartered post-RLS diagnostics session. Does **not** mean compatibility pass executed or Tranche B approved.

**Checklist reference note (2026-05-26):** **MAIN deny-posture apply review safe summary (U-post)** logged per `phase-2-rls-main-deny-posture-apply-review-summary.md` — bounded MAIN Option B apply session **completed**; post-apply verification **PASS** on all **7** tables; RLS **on**; FORCE **off**; **14** policies (2 per table); rows **all 0**; missing expected policies **0**; rollback **not** invoked; charter `MAIN-DENY-APPLY-2026-05-26-01` **owner-held**; bundle/rollback **not** in git; **does not** approve Tranche B or write-denial tests; **does not** claim Q4 or N12 pass; **does not** approve post-RLS diagnostics pass, execution packet, or runtime/write; **NOT_READY_FOR_APPLY** unchanged; **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged. Does **not** mean RLS is production-safe, deny posture verified for Q4, or apply-ready globally.

**Checklist reference note (2026-05-19):** **MAIN deny-posture apply execution gate (DA adoption)** logged per `phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` — **docs-level adoption only**; follows Section **T** (DP); Option **OPTION_B**; SQL_REVIEWER **PASS_WITH_NOTES** accepted; bundle/rollback **owner-held** (not in git); filled charter **required before connect**; mandatory pre/post checks recorded; **does not** execute SQL; **does not** approve Tranche B or write-denial tests; **does not** claim Q4 or N12 pass; **NOT_READY_FOR_APPLY** unchanged; **EXECUTION_FORBIDDEN** narrowly allows only chartered MAIN deny-posture apply session **after** filled charter; **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged. Does **not** mean apply executed, deny posture verified, or RLS secure.

**Checklist reference note (2026-05-19):** **MAIN deny-posture planning gate** logged per `phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md` — adopted at **docs level**; follows Q-post, R-post, S-post, and Section **S** (NT gate); **planning only**; does **not** apply RLS; does **not** execute SQL; does **not** approve Tranche B; does **not** approve write-denial tests; does **not** claim Q4 or N12 pass; does **not** approve execution packet or apply; **NOT_READY_FOR_APPLY** unchanged; **EXECUTION_FORBIDDEN** unchanged; **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged. Does **not** mean deny posture applied, RLS secure, or apply is ready.

**Checklist reference note (2026-05-19):** **MAIN Tranche A exposure inventory capture + review safe summary (S-post)** logged per `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` — bounded read-only Tranche A **performed** on **MAIN-OWNER-USED**; review **PASS_WITH_EXPOSURE_FINDINGS**; exposure findings on **all 7** Phase 2 tables; rows **all 0**; RLS/FORCE off and **0** policies on all 7; anon/authenticated grants **present** on all 7; read-only only; **no** write attempts/DML/test rows; Route/PSA wiring **not checked**; Q4/N12 pass **not** claimed; Tranche B/write-denial tests **not** approved; charter **owner-held** (not in git); **no** raw evidence/secrets in repo; **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL/deny-posture-apply/Tranche B/writes **EXECUTION_FORBIDDEN** unchanged. Does **not** mean Q4 pass, N12 pass, deny posture applied, RLS secure, or apply is ready.

**Checklist reference note (2026-05-19):** **MAIN Tranche A read-only exposure inventory gate** logged per `phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` — follows Q-post + R-post; current MAIN (RLS off, FORCE off, 0 policies, anon/authenticated grants) → **Tranche A only**; **one bounded read-only** exposure session on **MAIN-OWNER-USED** approved; **Tranche B forbidden** until deny posture + separate gate; **write-denial tests / DML / test rows forbidden**; Tranche A exposure inventory **performed** — see S-post safe summary; **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL/deny-posture-apply/STAGING/Tranche B/writes **EXECUTION_FORBIDDEN** unchanged. Does **not** mean Q4 pass, N12 pass, Tranche B pass, deny posture applied, or apply is ready.

**Checklist reference note (2026-05-19):** **MAIN diagnostics pre-RLS baseline capture + review safe summary** logged per `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — bounded read-only baseline **performed** on **MAIN-OWNER-USED**; review **PASS_BASELINE_CAPTURED**; approved consumer `scripts/diagnose-school-identity-phase2-readonly.mjs`; phase2SchemaAvailable **true**; phase2DiagnosticsWarning **none**; identityResolutionSummary counters **all 0**; identityResolutionBySchoolCode **empty**; command parameter **values** **owner-held** (not in git); sensitive output **none observed**; **no** raw diagnostic JSON/logs/secrets in repo; post-RLS compatibility **pass** still **not** closed; **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL/tests/STAGING **EXECUTION_FORBIDDEN** unchanged. Does **not** approve apply or negative-test execution.

**Checklist reference note (2026-05-19):** **MAIN diagnostics pre-RLS baseline execution gate** logged per `phase-2-rls-main-diagnostics-pre-rls-baseline-execution-gate-owner-decision-record.md` — bounded read-only diagnostics connect **approved** on **MAIN-OWNER-USED** after Tier 1 snapshot + review; approved contract consumer only; **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL/tests/STAGING **EXECUTION_FORBIDDEN** unchanged. Does **not** mean post-RLS compatibility pass; does **not** approve apply.

**Checklist reference note (2026-05-19):** **MAIN Tier 1 snapshot capture + review safe summary** logged per `phase-2-rls-main-snapshot-capture-review-summary.md` — bounded read-only capture **performed** on **MAIN-OWNER-USED**; review **PASS_WITH_SECURITY_FINDINGS**; Tier 1 **complete**; good-restored-state values **recorded owner-held**; diagnostics baseline **not attempted in snapshot session** (SE12 defer); **pre-RLS diagnostics baseline completed separately** per R-post safe summary; security findings: RLS off, FORCE off, 0 policies, anon/authenticated grants present; **no** raw evidence or secrets in repo; **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL/tests/STAGING **EXECUTION_FORBIDDEN** unchanged. Does **not** make RLS apply ready; does **not** approve deny posture apply.

**Checklist reference note (2026-05-18):** Phase 2 evidence model closure logged at **documentation / owner policy** level per `phase-2-evidence-model-owner-decision-record.md`. Phase 2 governance/review closure logged at **documentation / owner policy** level per `phase-2-governance-review-owner-decision-record.md`. Phase 2 production truth closure logged at **documentation / owner policy** level per `phase-2-production-truth-owner-decision-record.md` (**operational** production truth remains **Not closed**). Phase 2 runtime/write closure logged at **documentation / owner policy** level per `phase-2-runtime-write-owner-decision-record.md` (**operational** runtime/write integration remains **Blocked / not approved**). **Gate 34B / main RLS apply readiness** owner/security policy logged at **documentation level only** per `phase-2-rls-apply-readiness-owner-decision-record.md` (**NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN** — staging Gate 34B, main/owner-used RLS policy apply, and production apply remain **separate tracks** and **not approved**). **RLS apply preconditions** owner/security policy logged at **documentation level only** per `phase-2-rls-apply-preconditions-owner-decision-record.md` — complements Section F; does **not** make RLS apply ready. **RLS target-map** owner/security policy logged at **documentation level only** per `phase-2-rls-target-map-owner-decision-record.md` — private labels **ISOLATED-LAB**, **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**; **STAGING-34B** and **MAIN-OWNER-USED** logged as **different physical projects** (provisional); **MAIN-OWNER-USED** **production-like / higher-risk**; **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged; MAIN clutter / cleanup-vs-new-project requires **separate read-only feasibility audit** before any cleanup/migration/delete. **RLS accountability** owner/security policy logged at **documentation level only** per `phase-2-rls-accountability-owner-decision-record.md` — executor/approver/rollback **role labels** logged; exact human identities **owner-held** by default; rollback triggers and good-restored-state **policy** adopted; per-target snapshots, negative tests passing, parity, and rollback SQL artifact remain required before any future execution packet. **RLS snapshot requirements** owner/security policy logged at **documentation level only** per `phase-2-rls-snapshot-requirements-owner-decision-record.md` — Tier 1/Tier 2 field requirements and storage posture adopted (S0–S14); **no** live snapshot was collected. **RLS negative-test plan** owner/security policy logged at **documentation level only** per `phase-2-rls-negative-test-plan-owner-decision-record.md` — denial outcomes, failure handling, and storage posture adopted (N0–N16); **no** tests were executed; **no** test pass evidence. **RLS owner-held snapshot evidence planning** owner/security policy logged at **documentation level only** per `phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — capture/review/storage planning adopted (E0–E18); **MAIN-OWNER-USED** / **PROD** primary safety target; **STAGING-34B** optional rehearsal only (not mandatory before MAIN planning; never substitutes MAIN/PROD); **no** live snapshot was collected; **no** Supabase connect. **RLS diagnostics compatibility planning** owner/security policy logged at **documentation level only** per `phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — post-RLS compatibility planning adopted (D0–D20); fail-open vs fail-safe layers; PASS/FAIL/UNCLEAR on RLS path; **no** diagnostics re-run; **no** compatibility pass executed. **RLS FORCE RLS policy** owner/security policy logged at **documentation level only** per `phase-2-rls-force-rls-owner-decision-record.md` — **first apply: FORCE excluded** (F0–F18); future enablement requires separate gate per target; **no** FORCE enabled. **RLS parity evidence planning** owner/security policy logged at **documentation level only** per `phase-2-rls-parity-evidence-planning-owner-decision-record.md` — C14/Q12 planning side (P0–P18); **no** parity evidence collected; **no** STAGING→MAIN transfer approved. **RLS live snapshot collection gate** owner-defined at **documentation level only** per `phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` — SG0–SG18 gate definition; **no** Supabase connect under definition gate alone. **RLS live snapshot MAIN collection execution gate** owner-adopted per `phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md` — SE0–SE20; **bounded read-only MAIN** connect **approved** for one capture session; **no** evidence values/review closed yet. Per-target snapshot **evidence values**, operational good-restored-state **values**, negative-test **execution/pass**, diagnostics compatibility **pass** (execution), FORCE **enablement** on any target, parity **evidence values**, execution packet, and apply tracks remain **future** gates. Operational approval states for PSA, Route, Phase 3, Phase 4, operator workflow implementation, populated production rows, production resolution loop on main, Phase 2 observation/candidate/decision/publication row writes, helper/pipeline integration, SQL, Supabase apply, Gate 34B execution, staging apply, main apply, and production apply remain unchanged (**blocked / not approved**).

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
| Phase 2 evidence model closure | Agreed sufficiency of evidence (identity, alias, location, NSR candidates) and how planning packets and backlog relate to future decisions—without conflating packet status with publishability. | **Closed** at **documentation / owner policy** level only (`phase-2-evidence-model-owner-decision-record.md`, 2026-05-18). **Not** production truth, runtime, PSA, Route, or decision-row closure. | NSR parent/child API hierarchy: **deferred** with conservative default (unclear → not CASE 1 → block/review) per owner record; does not reopen policy closure unless owner reopens via explicit gate. | **Strongly yes** before treating Phase 3 inputs as non-ambiguous. | **Yes** for policy changes; evidence sufficiency policy is logged. |
| Phase 2 governance/review closure | Operational rules: `needs_review`, operator and review boundaries, audit trail, no silent manual truth. | **Closed** at **documentation / owner policy** level only (`phase-2-governance-review-owner-decision-record.md`, 2026-05-18). **Not** active operator workflow, production truth, runtime, PSA, Route, or decision-row closure. | Reviewer role model, operator UI, DB workflow, and exact sign-off storage channel deferred to **separate** implementation gates; traceability requirement adopted at policy level (G9). | **Yes** before operator-dependent publication paths. | **Yes** for policy changes; governance/review policy is logged. |
| Phase 2 production truth closure | Durable, checkable data path: observations → candidates → decisions → publication decisions, consistent with publishability contract. | **Closed** at **documentation / owner policy** level only (`phase-2-production-truth-owner-decision-record.md`, 2026-05-18). **Operational** production truth **Not closed** (zero production rows per rollout log; no resolution loop on main; no populated decision/publication truth). **Not** runtime, PSA, Route, or decision-row closure. | Populated truth, production resolution loop on main, and execution processes **after** applicable owner gates—not implied by DDL or policy closure; exact supersession/sign-off storage channel deferred per owner record P11. | **Yes** for claiming **operational** “Phase 2 truth layer closed” or feeding Phase 3 emission from Phase 2 tables. | **Yes** for policy changes; production truth boundary policy is logged. |
| Phase 2 runtime/write closure | Explicit approval for writes to Phase 2 tables and any pipeline, readiness, or PSA linkage. | **Closed** at **documentation / owner policy** level only (`phase-2-runtime-write-owner-decision-record.md`, 2026-05-18). **Operational** runtime/write integration **Blocked / not approved** (no Phase 2 table writes; no observation/candidate/decision/publication rows on main; no populated production truth; no production resolution loop on main; no runtime/write implementation; no helper/pipeline/readiness integration; no PSA materialization; no Route consumption; no operator/admin workflow; no Gate 34B / main RLS apply). | Runtime/write **execution** gate, main RLS apply readiness, negative tests, and explicit integration approval per execution plan and ADRs—not implied by policy closure. | **Yes** for any implementation that writes or changes the publish path. | **Yes** for policy changes; runtime/write boundary policy is logged. |

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
| Evidence packet sufficiency | Evidence packets are **dossiers**, not decisions; execution and integration require **separate** owner gate. | Owner-closed policy boundary logged (`phase-2-evidence-model-owner-decision-record.md` decisions M0, 6); packet format remains planning artifact only; **no** execution approval from packet or record. | SHOULD_HAVE_BEFORE_PHASE_3; DOCUMENT_ONLY | Uncontrolled “evidence → write” leaps | `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — Decision 6; `docs/architecture/phase-2-read-only-evidence-packet-format.md` — Status / boundary — planning artifact only |
| NSR candidate evidence | Auditable NSR linkage and candidate rationale; **no** “first candidate wins” by sort order. | Owner-closed sufficiency policy logged (`phase-2-evidence-model-owner-decision-record.md` decisions 1, 7); backlog required evidence types unchanged; NSR API hierarchy deferred with conservative default. | MUST_HAVE_BEFORE_PHASE_3; OWNER_GATE_REQUIRED | False resolution and false PSA rows | `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — Decisions 1, 7; `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — Typed classification / Required evidence — NSR linkage |
| Decision state readiness | Required state vocabulary; failure rule: unresolved or conflicting evidence must never publish. | Vocabulary and failure behavior defined in Phase 2 spec. | MUST_HAVE_BEFORE_PHASE_3 | Silent publication of ambiguity | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — vocabulary; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — failure behavior |
| `needs_review` semantics | Review is **not** publication; not family-facing route truth until policy explicitly allows. | Owner-closed governance/review policy logged (`phase-2-governance-review-owner-decision-record.md` decisions G1, G3, G8); vocabulary in Phase 2 spec unchanged; **no** active operator workflow from this record. | OWNER_GATE_REQUIRED; MUST_HAVE_BEFORE_PHASE_3 | Premature operator workflow or unclear gates for publication | `docs/architecture/phase-2-governance-review-owner-decision-record.md` — Decision G1; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — needs_review |
| `ambiguous_candidates` semantics | Ambiguity remains **visible**; no hidden tie-break. | In required state vocabulary; diagnostics must not resolve ties (pipeline diagnostics contract). | MUST_HAVE_BEFORE_PHASE_3 | Hidden ambiguity and false confidence | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states — ambiguous_candidates; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 Success criteria — ambiguity visible |
| `unsupported` / blocked semantics | `unsupported_losa`, `external_delivery`, and unresolved identity or location paths do not become ordinary-school publishable truth. | Phase 1A LOSA boundary logged; Phase 2 states and Phase 4 relationship documented; Finnmark publishable truth remains Phase 4–dependent. | MUST_HAVE_BEFORE_PHASE_3; FUTURE_CONTOUR | False availability (for example LOSA as ordinary school) | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 1A.2i LOSA boundary — unsupported not publishable; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4 — Finnmark dependency |
| Publishability contract | All publishability preconditions satisfied before `programme_school_availability`; no expansion without auditable evidence. | Owner-closed production truth policy logged (`phase-2-production-truth-owner-decision-record.md` decisions P4–P6, P12); contract in Phase 2 spec; **not** operationalized via populated publication decisions in main. | MUST_HAVE_BEFORE_PHASE_3 | PSA false positives | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decisions P4–P6, P12; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Publishability contract — preconditions list |
| Auditability | Decision-bearing records include actor type, basis version, reason codes, `audit_ref`, supersession; append-only discipline. | Spec rules unchanged; owner-closed supersession/traceability policy logged (`phase-2-production-truth-owner-decision-record.md` decision P11; governance G9); storage channel deferred. | MUST_HAVE_BEFORE_PHASE_3 | Silent manual truth | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decision P11; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision ownership / audit — required fields and rules |
| Operator/review boundary | Operator layer until explicitly modelled for family-facing; no UI masking of unresolved source truth. | Owner-closed policy boundary logged (`phase-2-governance-review-owner-decision-record.md` decisions G4, G7); operator/admin workflow implementation **blocked** / future-only. | SHOULD_HAVE_BEFORE_PHASE_3; OWNER_GATE_REQUIRED | UX leakage of unresolved states into family-facing surfaces | `docs/architecture/phase-2-governance-review-owner-decision-record.md` — Decisions G4, G7; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Route Engine boundary — unresolved remains operator-layer |
| Runtime/write boundary | No writes to Phase 2 tables and no integration until **explicit** Phase 2 runtime or write **execution** approval. | Owner-closed runtime/write **policy** logged (`phase-2-runtime-write-owner-decision-record.md` decisions R0–R12, 2026-05-18); checklist runtime/write closure **Closed** at docs/policy level only; **operational** writes and integration **Blocked / not approved** per execution plan. | BLOCKED for implementation; OWNER_GATE_REQUIRED for execution | Unauthorized DB or pipeline truth mutation | `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — Decisions R0–R12; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 schema rollout closure — runtime integration blocked; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Status — runtime write integration blocked; `docs/architecture/phase-2-runtime-write-closure.md` — Snapshot / status — documentation-only boundary |
| PSA publication boundary | PSA unchanged unless separate publication approval; publishability contract enforced. | Rollout log states PSA publication unchanged after main migration; owner-closed production truth policy (`phase-2-production-truth-owner-decision-record.md` P5–P6, P12): publication decision ≠ PSA materialization. | OWNER_GATE_REQUIRED; MUST_HAVE_BEFORE_PHASE_3 | Unauthorized PSA expansion | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decisions P5–P6, P12; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 implementation blocker — PSA unchanged; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — PSA write expansion before model approval |
| Route Engine consumption boundary | Route Engine uses **published** internal DB truth only; no random campus; unsupported LOSA not as ordinary school option. | Unchanged by Phase 2 rollout; normative rules in Route Engine and Phase 2 specs; owner-closed policy: no auto chain to Route (`phase-2-production-truth-owner-decision-record.md` P10, P12). | MUST_HAVE_BEFORE_PHASE_3 | Unsafe runtime routes | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decisions P10, P12; `docs/architecture/route-engine-master-spec.md` — VGS programme school availability — published internal truth; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Route Engine boundary — published truth only |
| UI/display boundary | Family-facing display policy for identity versus location **not** defined solely by Phase 2 schema closure. | Explicitly out of Phase 2 spec scope for Route and UI changes. | NOT_REQUIRED_FOR_PHASE_3; FUTURE_CONTOUR | N/A for Phase 2 document closure alone; product UI remains separate gate | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — Route Engine UI and family-facing display |
| Future contour separation | Final LOSA and external-delivery **product model** in Phase 4; Phase 2 may expose states but not final LOSA publish model. | Documented dependency for Finnmark and LOSA in execution plan and Phase 2 spec. | FUTURE_CONTOUR; NOT_REQUIRED_FOR_PHASE_3 | Mis-routing LOSA work into Phase 2 “done” claims | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4 — LOSA final model; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase linkage — Phase 4 before Finnmark publishable |
| LOSA exclusion from Phase 2 final model | Phase 2 does **not** deliver the final LOSA model; no ordinary-school publication for unsupported LOSA. | Locked by matching CASE 4, Phase 1A decision, and Phase 2 relation to Phase 4. | MUST_HAVE_BEFORE_PHASE_3; FUTURE_CONTOUR | Ordinary-school false positives from LOSA rows | `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching — CASE 4 LOSA unsupported; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Scope / non-scope — final LOSA in Phase 4 |
| No random campus rule | Never select a random institution or campus for availability truth. | Normative locked rule across matching and execution plan hard principles. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | Wrong campus and wrong routes | `docs/architecture/norway-school-identity-matching-spec.md` — Forbidden — no random campus; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Hard principles — no random campus selection |
| No hidden truth rule | No silent manual mappings; observation is not decision; candidate is not decision. | Hard invariants in Phase 2 spec; owner-closed production truth policy logged (`phase-2-production-truth-owner-decision-record.md` decisions P1–P3). | MUST_HAVE_BEFORE_PHASE_3 | Unauditable “truth” | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decisions P1–P3; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Hard invariants — observation and candidate separation |
| No schema-implies-truth rule | Empty Phase 2 tables or DDL presence alone does **not** mean identity or location resolution is production-true. | Execution plan logs zero rows in all seven Phase 2 tables in main; owner-closed policy (`phase-2-production-truth-owner-decision-record.md` decision P7): docs/policy closure ≠ operational truth. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | False “Phase 2 product closed” claims | `docs/architecture/phase-2-production-truth-owner-decision-record.md` — Decision P7; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 2 implementation blocker — estimated row count zero; schema rollout closure — schema-only not truth layer |
| No diagnostics-implies-publication rule | Readiness, pipeline, and Phase 2 diagnostics JSON and warnings must not become publishability or PSA write drivers unless a **separate** document approves it. | Standalone helper and contracts forbid diagnostics driving gates; owner-closed runtime/write policy (`phase-2-runtime-write-owner-decision-record.md` decisions R2, R12): diagnostics/helper/readiness ≠ writes; helper/pipeline hookup separate gate. | MUST_HAVE_BEFORE_PHASE_3; FORBIDDEN_AS_SHORTCUT | Publication driven only from logs or diagnostics | `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — Decisions R2, R12; `docs/architecture/phase-2-read-only-diagnostics-contract.md` — Decision — no writes and no readiness or PSA changes; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Decision — helper output must not influence PSA or readiness |

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

Phase 2 → Phase 3 gate criteria are now documented in `docs/architecture/phase-2-to-phase-3-gate-criteria.md`; this does not change operational prerequisites or owner-gated execution boundaries.

- **Full family-facing UI or display policy** for identity versus location
- **Full LOSA implementation**
- **All county packets across Norway**
- **Helper integration branch** choices (readiness versus pipeline dry-run planning versus no integration)
- **Route Engine runtime consumption**, as long as it remains **blocked** from unpublished or non-publishable truth

---

## Forbidden shortcuts

The following patterns **must not** be used to claim progress, closure, or publishability:

- **Schema exists → insert rows** without explicit runtime or write approval (logged evidence sufficiency policy does **not** authorize writes).
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

**Strategic documentation snapshot (not a roadmap):** one documentation track from the earlier snapshot is now **completed as a committed artifact only**: `docs/architecture/phase-2-to-phase-3-gate-criteria.md` exists as **documentation-only transition gate criteria**. That document does **not** mean the Phase 2 → Phase 3 **gate has passed**, does **not** approve Phase 3 implementation, controlled 1:N PSA emission, runtime/write integration, PSA materialization, PSA publication, Route Engine consumption, or DB writes—all remain **blocked** until **separate** owner-approved execution gates. This checklist update does **not** create a new roadmap decision.

Remaining **docs-first** emphasis in this snapshot:

**A. Phase 2 evidence model closure (documentation / owner policy — logged at docs/policy level 2026-05-18)**
Owner-adopted sufficiency policy (M0 + decisions 1–8) is logged in `docs/architecture/phase-2-evidence-model-owner-decision-record.md`. Checklist closure level **Closed** at docs/policy level only. Does **not** mean running extraction scripts, writing SQL, integrating helpers into pipeline or readiness, production truth closure, runtime/write, PSA, Route, decision rows, Phase 3, or Phase 4 execution.

**C. Phase 2 governance/review closure (documentation / owner policy — logged at docs/policy level 2026-05-18)**
Owner-adopted governance/review policy (G0 + decisions G1–G9) is logged in `docs/architecture/phase-2-governance-review-owner-decision-record.md`. Checklist closure level **Closed** at docs/policy level only. Does **not** mean operator UI, admin workflow, DB workflow, live review process, operational production truth closure, runtime/write, PSA, Route, decision rows, Phase 3, or Phase 4 execution.

**D. Phase 2 production truth closure (documentation / owner policy — logged at docs/policy level 2026-05-18)**
Owner-adopted production truth boundary policy (P0 + decisions P1–P12) is logged in `docs/architecture/phase-2-production-truth-owner-decision-record.md`. Checklist closure level **Closed** at docs/policy level only. **Operational** production truth remains **Not closed**. Does **not** mean populated rows, production resolution loop on main, Phase 2 decision row writes, runtime/write, PSA materialization, PSA publication, Route consumption, operator workflow, Phase 3, or Phase 4 execution.

**E. Phase 2 runtime/write closure (documentation / owner policy — logged at docs/policy level 2026-05-18)**
Owner-adopted runtime/write boundary policy (R0 + decisions R1–R12) is logged in `docs/architecture/phase-2-runtime-write-owner-decision-record.md`. Checklist closure level **Closed** at docs/policy level only. **Operational** runtime/write integration remains **Blocked / not approved**. Does **not** mean Phase 2 table writes, observation/candidate/decision/publication rows on main, populated production truth, production resolution loop on main, runtime/write implementation, helper/pipeline/readiness integration, PSA materialization, PSA publication, Route consumption, operator workflow, operational production truth closure, Phase 3, Phase 4 execution, Gate 34B, or main RLS apply.

**F. Gate 34B / main RLS apply readiness (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS apply readiness policy (Q0 + decisions Q1–Q15) is logged in `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md`. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. Does **not** mean RLS apply readiness is achieved, does **not** approve SQL or Supabase apply, Gate 34B execution, staging apply, main / owner-used RLS policy apply, or production apply. **Gate 34A approves nothing.** **Gate 34B** in artifacts is **staging manual RLS/policy DDL** only — **not** main apply by default. Main **schema-only** tables existing does **not** mean RLS locks installed. Isolated/staging evidence does **not** prove main readiness. **FORCE RLS** remains **deferred** pending separate decision. Negative tests, rollback, executor/approver, diagnostics compatibility, and parity remain **required** before any future apply execution gate. Does **not** approve runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, or Phase 4.

**G. RLS apply preconditions (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS apply preconditions policy (C0 + decisions C1–C16) is logged in `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md`. **Complements** Section F readiness policy; does **not** replace Q0–Q15. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Does **not** mean operational preconditions are satisfied (executor/approver/rollback owner naming, passing negative tests on real target, per-target snapshots, parity evidence). Staging / main / production tracks remain **separate**. Target, executor, approver, rollback owner, rollback triggers, good restored state, negative-test plan/pass, diagnostics post-RLS compatibility, high-privilege boundary, FORCE RLS (deferred), and parity remain **required** before any future execution packet. Does **not** approve SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, or Phase 4.

**H. RLS target map (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS target-map policy (T0 + decisions T1–T11) is logged in `docs/architecture/phase-2-rls-target-map-owner-decision-record.md`. **Complements** Sections F and G. Private documentation labels only (**ISOLATED-LAB**, **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**); **no** `project_ref`, secrets, or `.env` in git. **STAGING-34B** and **MAIN-OWNER-USED** logged as **different physical Supabase projects** (provisional per owner). **MAIN-OWNER-USED** **production-like / higher-risk**. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Does **not** make RLS apply ready or satisfy remaining operational preconditions. MAIN Supabase **clutter** / cleanup-vs-new-project **not** decided — requires **separate read-only migration/cleanup feasibility audit** before any cleanup/migration/delete. Does **not** approve SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, cleanup, migration, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, or Phase 4.

**I. RLS accountability (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS accountability policy (A0 + decisions A1–A12) is logged in `docs/architecture/phase-2-rls-accountability-owner-decision-record.md`. **Complements** Sections F, G, and H. **Role labels only** in git (**TECH_EXECUTOR**, **OWNER**, **ROLLBACK_OWNER** per target); real names/emails **owner-held outside repo** by default. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Partially satisfies C4/C5/T10 naming at **label** level only; does **not** make RLS apply ready. Rollback trigger list and good-restored-state **policy** adopted; per-target snapshots, operational good-state values, negative-test plan/pass, and rollback SQL artifact remain **future** gates. Does **not** approve SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, execution packet, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, or Phase 4.

**J. RLS snapshot requirements (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS per-target snapshot **requirements** policy (S0 + decisions S1–S14) is logged in `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`. **Complements** Sections F, G, H, and I. **Requirements only** — **no** live snapshot was collected; does **not** satisfy per-target snapshot **evidence**. Private labels **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**; **ISOLATED-LAB** historical only (must **not** be copied as baseline). **MAIN-OWNER-USED** stricter than **STAGING-34B**. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Satisfies snapshot **requirements** side of C2/C7/C9 planning prerequisites at **policy** level only; operational good-restored-state **values**, owner-held snapshot captures, negative-test execution/pass, diagnostics post-RLS compatibility pass, FORCE decision, parity, rollback SQL artifact, execution packet, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, live snapshot collection, Gate 34B execution, staging apply, main apply, production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4, or cleanup/migration/new project.

**K. RLS negative-test plan (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS negative-test **plan** policy (N0 + decisions N1–N16) is logged in `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md`. **Complements** Sections F–J. **Plan only** — **no** tests were executed; **no** test pass evidence; does **not** collect live snapshot evidence. Private labels **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**; **ISOLATED-LAB** historical only (lab results do **not** count as STAGING or MAIN pass). **MAIN-OWNER-USED** stricter than **STAGING-34B**. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Satisfies C9/C10 **plan** side at **policy** level only; partially operationalizes preconditions negative-test **plan** requirement; negative-test **execution** and **pass** on real targets, per-target snapshot **evidence**, diagnostics compatibility **pass**, FORCE decision, parity **evidence**, rollback SQL artifact, execution packet, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, test execution, test pass claims, live snapshot collection, Gate 34B execution, staging apply, main apply, production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4, or cleanup/migration/new project.

**L. RLS owner-held snapshot evidence planning (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS owner-held snapshot evidence **planning** policy (E0 + decisions E1–E18) is logged in `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`. **Complements** Sections F–K. **Planning only** — **no** live snapshot was collected; **no** Supabase connect occurred; **no** test execution occurred; **no** test pass evidence exists; **no** execution packet is approved. **MAIN-OWNER-USED** / **PROD = MAIN-OWNER-USED for now** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** (not mandatory before MAIN planning; **STAGING** evidence does **not** substitute **MAIN/PROD** evidence or approval). Private labels only; **ISOLATED-LAB** historical only (must **not** be reused). **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Satisfies owner-held evidence **planning** side at **policy** level only; per-target snapshot **evidence values**, operational good-restored-state **values**, negative-test **execution/pass**, diagnostics compatibility **pass**, FORCE decision, parity **evidence**, redacted evidence artifact, rollback SQL artifact, execution packet, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, live snapshot collection, test execution, test pass claims, Gate 34B execution, staging apply, main apply, production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4, or cleanup/migration/new project.

**M. RLS diagnostics compatibility planning (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS diagnostics compatibility **planning** policy (D0 + decisions D1–D20) is logged in `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md`. **Complements** Sections F–L and canonical diagnostics contract/helper ADR. **Planning only** — **no** diagnostics/helper re-run occurred; **no** post-RLS compatibility **pass** exists; **no** Supabase connect; **no** test execution. **MAIN-OWNER-USED** / **PROD = MAIN-OWNER-USED for now** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** (**STAGING** compatibility does **not** substitute **MAIN/PROD**). Satisfies C11/Q7/N9 **planning** side at **policy** level (fail-open tool vs fail-safe RLS path; before/after RLS re-test rule; PASS/FAIL/UNCLEAR; warnings ≠ product states; single approved consumer unchanged). **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Post-RLS compatibility **pass** (execution), live snapshot evidence, negative-test **execution/pass**, FORCE **enablement**, parity **evidence**, execution packet, helper/pipeline integration, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, diagnostics re-run, compatibility pass claims, live snapshot collection, test execution, Gate 34B, staging/main/production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, new helper consumers, Phase 3, Phase 4, or cleanup/migration/new project.

**N. RLS FORCE RLS policy (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS **FORCE ROW LEVEL SECURITY** policy (F0 + decisions F1–F18) is logged in `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md`. **Complements** Sections F–M; operationalizes C13/Q5 at **policy** level. **First apply bundle excludes FORCE** on **STAGING-34B** (if used) and **MAIN-OWNER-USED** / **PROD** — **no** `ALTER TABLE ... FORCE ROW LEVEL SECURITY` in first apply. **No** FORCE enabled on any target. **MAIN-OWNER-USED** / **PROD = MAIN-OWNER-USED for now** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** (**STAGING** FORCE posture does **not** substitute **MAIN/PROD**). Future FORCE **enablement** requires **separate gate per target** after owner-held bypass/table-owner analysis and F17 threshold prerequisites. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. FORCE **enablement**, live snapshot evidence, negative-test **execution/pass**, diagnostics compatibility **pass** (execution), parity **evidence values**, execution packet, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, FORCE DDL, live snapshot collection, test execution, Gate 34B, staging/main/production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4, cleanup/migration/new project, or execution of `phase-2-rls-policy-sql-draft.md` FORCE review lines.

**O. RLS parity evidence planning (owner/security policy — logged at docs level 2026-05-18)**
Owner-adopted RLS parity evidence **planning** policy (P0 + decisions P1–P18) is logged in `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md`. **Complements** Sections F–N; operationalizes C14/Q12 at **planning** level (N16, E15, D16, F12 aligned). **Planning only** — **no** parity evidence was collected; **no** STAGING→MAIN evidence **transfer** is approved; **no** Supabase connect. **MAIN-OWNER-USED** / **PROD = MAIN-OWNER-USED for now** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** (not mandatory before MAIN; **STAGING** pass/snapshots/diagnostics/FORCE never substitute **MAIN/PROD** without parity **evidence** and separate MAIN decision per bundle). **ISOLATED-LAB** historical only. Physical DB sameness remains **unresolved** until owner-held target-map — reuse blocker at operational level (P8). **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN**. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Parity **evidence values**, live snapshot **collection execution**, negative-test **execution/pass**, diagnostics compatibility **pass** (execution), FORCE **enablement**, execution packet, and apply remain **not** closed. Does **not** approve SQL, Supabase connect, parity evidence collection, evidence reuse, test execution, Gate 34B, staging/main/production apply, execution packet draft, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4, or cleanup/migration/new project.

**P. RLS live snapshot collection gate (owner/security gate definition — logged at docs level 2026-05-18)**
Owner-defined RLS live per-target snapshot collection **gate** (SG0 + decisions SG1–SG18) is logged in `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md`. **Complements** Sections F–O; depends on S0–S14 and E0–E18. **Gate definition only** — **no** Supabase connect under this definition record alone; **no** live snapshot was collected. **Read-only** capture posture for execution layer (no DDL/DML/RLS apply during capture). **MAIN-OWNER-USED** / **PROD = MAIN-OWNER-USED for now** primary; **STAGING-34B** optional rehearsal only. **ISOLATED-LAB** not a target. MAIN clutter (T9) does **not** block gate definition. **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN** (for apply/SQL/non-snapshot connect). **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Does **not** alone approve collection execution or connect — see Section Q.

**Q. RLS live snapshot collection execution (owner/security execution gate — logged at docs level 2026-05-18)**
Owner-adopted RLS live snapshot collection **execution** gate (SE0 + decisions SE1–SE20) is logged in `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md`. **Implements** Section P (SG) on **MAIN-OWNER-USED** only. **Approves** **one bounded read-only** Supabase session for Tier 1 capture (+ optional Tier 2 same session) per S/E/SG — **no** DDL/DML/RLS apply in session. **Operational (2026-05-19):** bounded read-only MAIN Tier 1 capture **performed**; **OWNER** / **SECURITY_APPROVER** review **PASS_WITH_SECURITY_FINDINGS**; safe summary in `phase-2-rls-main-snapshot-capture-review-summary.md`; good-restored-state values **recorded owner-held**; detailed evidence **owner-held** only. **SE17:** git stores **role labels** only; executor/reviewer real names/emails **owner-held**; **does not** restrict user emails in **product database**. **NOT_READY_FOR_APPLY** unchanged. **EXECUTION_FORBIDDEN** unchanged for SQL apply, Gate 34B, staging/main/production apply, STAGING connect, negative-test execution, packet draft, runtime/write, PSA, Route, Phase 3/4. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Diagnostics baseline, diagnostics **pass**, negative-test **execution/pass**, FORCE **enablement**, packet, and apply remain **not** closed.

**Q-post. MAIN Tier 1 capture + review safe summary (logged at docs level 2026-05-19)**

Safe summary of completed **MAIN-OWNER-USED** / **PROD** Tier 1 bounded read-only capture and **OWNER** / **SECURITY_APPROVER** review is logged in `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md`.

| Item | Status |
|------|--------|
| MAIN Tier 1 capture performed | yes |
| OWNER / SECURITY_APPROVER review | PASS_WITH_SECURITY_FINDINGS |
| Tier 1 complete | yes |
| Good-restored-state values | recorded **owner-held** |
| Diagnostics baseline (pre-RLS) | captured + reviewed — see R-post; Tier 1 snapshot session had **not attempted** |
| Security findings | RLS off; FORCE off; 0 policies; anon/authenticated grants present |
| Raw evidence / secrets in repo | **no** |
| NOT_READY_FOR_APPLY | unchanged |
| EXECUTION_FORBIDDEN (apply / SQL / packet / tests / STAGING) | unchanged |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged |

Does **not** mean RLS is secure, deny posture is applied, or Phase 2 RLS is ready for apply.

**R. RLS MAIN diagnostics pre-RLS baseline execution (owner/security execution gate — logged at docs level 2026-05-19)**

Owner-adopted RLS **MAIN diagnostics pre-RLS baseline execution** gate (BL0 + decisions BL1–BL20) is logged in `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-execution-gate-owner-decision-record.md`. **Follows** Q-post safe summary (Tier 1 capture + review complete; diagnostics baseline was **not attempted** in snapshot session per SE12 defer). **Approves** **one bounded read-only** diagnostics session on **MAIN-OWNER-USED** only — approved contract consumer per `phase-2-read-only-diagnostics-contract.md`; **no** DDL/DML/RLS apply; **no** new helper consumers. **Operational (2026-05-19):** bounded read-only MAIN pre-RLS baseline **performed**; **OWNER** / **SECURITY_APPROVER** review **PASS_BASELINE_CAPTURED**; safe summary in `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`; detailed output/parameters **owner-held** only. **BL17:** git stores **role labels** only; executor/reviewer real names/emails **owner-held**. **NOT_READY_FOR_APPLY** unchanged. **EXECUTION_FORBIDDEN** unchanged for SQL apply, Gate 34B, staging/main/production apply, STAGING connect, negative-test execution, post-RLS compatibility pass execution, packet draft, runtime/write, PSA, Route, Phase 3/4. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Post-RLS compatibility **pass**, negative-test **execution/pass**, Tier 2 completion if incomplete, packet, and apply remain **not** closed.

**R-post. MAIN diagnostics pre-RLS baseline capture + review safe summary (logged at docs level 2026-05-19)**

Safe summary of completed **MAIN-OWNER-USED** / **PROD** pre-RLS diagnostics/helper baseline and **OWNER** / **SECURITY_APPROVER** review is logged in `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`.

| Item | Status |
|------|--------|
| MAIN pre-RLS baseline performed | yes |
| OWNER / SECURITY_APPROVER review | PASS_BASELINE_CAPTURED |
| Approved consumer only | yes |
| phase2SchemaAvailable | true |
| phase2DiagnosticsWarning | none |
| identityResolutionSummary counters | all **0** (named fields in safe summary) |
| identityResolutionBySchoolCode | empty |
| Command parameter values | **owner-held** (not in git) |
| Sensitive output | none observed |
| Raw diagnostic JSON / logs / secrets in repo | **no** |
| Post-RLS compatibility pass | **no** (pre-RLS only) |
| NOT_READY_FOR_APPLY | unchanged |
| EXECUTION_FORBIDDEN (apply / SQL / packet / tests / STAGING) | unchanged |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged |

Does **not** mean RLS is secure, deny posture is applied, or Phase 2 RLS is ready for apply. **Tranche A** exposure inventory on MAIN **completed** — see Section **S** + **S-post**; remains separate from Tranche B / write-denial tests.

**S. RLS MAIN Tranche A read-only exposure inventory (owner/security execution gate — logged at docs level 2026-05-19)**

Owner-adopted RLS **MAIN Tranche A read-only exposure inventory** gate (NT0 + decisions NT1–NT21) is logged in `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md`. **Follows** Q-post and R-post. **Depends on** negative-test **plan** (N0–N16) for policy context only. **Approves** **one bounded read-only** Tranche A exposure inventory session on **MAIN-OWNER-USED** — **no** Tranche B; **no** DML; **no** write attempts; **no** test rows; **no** write-denial tests. **Operational (2026-05-19):** bounded read-only Tranche A **performed**; **OWNER** / **SECURITY_APPROVER** review **PASS_WITH_EXPOSURE_FINDINGS**; safe summary in `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md`; detailed findings **owner-held** only. **Tranche A** does **not** satisfy Q4 or N12. **Tranche B** and write-denial tests are **future-only**. **NOT_READY_FOR_APPLY** unchanged. **EXECUTION_FORBIDDEN** unchanged for apply, SQL, packet, deny posture apply, Tranche B, writes, write-denial tests, STAGING, post-RLS pass execution, runtime/write, PSA, Route, Phase 3/4. **EXECUTION_PACKET_DRAFT_FORBIDDEN**. Tranche B approval, Q4 pass, N12 pass, write-denial tests, packet, and apply remain **not** closed.

**S-post. MAIN Tranche A exposure inventory capture + review safe summary (logged at docs level 2026-05-19)**

Safe summary of completed **MAIN-OWNER-USED** / **PROD** Tranche A read-only exposure inventory and **OWNER** / **SECURITY_APPROVER** review is logged in `docs/architecture/phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md`.

| Item | Status |
|------|--------|
| MAIN Tranche A exposure inventory performed | yes |
| OWNER / SECURITY_APPROVER review | PASS_WITH_EXPOSURE_FINDINGS |
| Tranche A complete | yes |
| Exposure findings | yes — all 7 Phase 2 tables |
| Row counts | all **0** |
| RLS / FORCE | off on all 7; **0** policies |
| anon/authenticated grants | present on all 7 |
| Read-only only; write attempts | yes / **no** |
| Q4 pass claimed | **no** |
| N12 packet pass claimed | **no** |
| Tranche B approved | **no** |
| Write attempts approved | **no** |
| Raw evidence / secrets in repo | **no** |
| NOT_READY_FOR_APPLY | unchanged |
| EXECUTION_FORBIDDEN | unchanged |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged |

Does **not** mean deny posture is applied, RLS is secure, negative tests passed, Tranche B may run, or Phase 2 RLS is ready for apply.

**T. RLS MAIN deny-posture planning gate (owner/security planning gate — logged at docs level 2026-05-19)**

Owner-adopted RLS **MAIN deny-posture planning** gate (DP0 + decisions DP1–DP21) is logged in `docs/architecture/phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md`. **Follows** Q-post, R-post, S-post, and Section **S** (NT gate). **Depends on** negative-test **plan** (N0–N16), apply readiness (Q4 context), apply preconditions (C7/C9–C12), FORCE policy (F0–F18), and policy SQL draft (**reference only**). **Approves** **bounded owner-held planning only** on **MAIN-OWNER-USED** — Option A/B review path, rollback/good-restored-state planning, grants posture planning, Tier 2 labeling, and future deny-posture **apply execution** gate outline. **Does not** run draft SQL; **does not** allow Supabase apply; **does not** allow GRANT/REVOKE; **does not** allow RLS enablement or policy creation; **does not** approve Tranche B or write-denial tests; **does not** approve runtime/write, PSA, Route, Phase 3, or Phase 4. **NOT_READY_FOR_APPLY** unchanged. **EXECUTION_FORBIDDEN** unchanged. **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged.

| Field | Status |
|-------|--------|
| Gate | MAIN deny-posture planning gate adopted |
| Record | `phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md` |
| Scope | planning only on **MAIN-OWNER-USED** / **PROD** |
| Prerequisites | Q-post, R-post, S-post complete |
| Option A/B | review path defined; **not** executed |
| FORCE | excluded from first apply; future gate only |
| Tier 2 | explicit label required before future apply/packet discussion |
| Tranche B | future-only; **not** approved |
| Write-denial tests | future-only; **not** approved |
| SQL/apply | **not** approved |
| Execution packet | **forbidden** |
| Q4/N12 | **not** claimed |
| Postures | **NOT_READY_FOR_APPLY** unchanged / **EXECUTION_FORBIDDEN** unchanged / **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged |

Section **T** alone did **not** mean deny posture was applied; **U-post** records the later completed Option B apply session separately. Does **not** mean RLS is secure, negative tests passed, Tranche B may run, write-denial tests may run, or Phase 2 RLS is ready for apply.

**U. RLS MAIN deny-posture apply execution gate (owner/security apply execution gate — logged at docs level 2026-05-19)**

Owner-adopted RLS **MAIN deny-posture apply execution** gate (DA0 + decisions DA1–DA21) is logged in `docs/architecture/phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md`. **Follows** Section **T** (DP planning gate), Q-post, R-post, S-post, and Section **S** (NT / Tranche A). **Docs-level adoption only** — **does not** execute SQL; **does not** store bundle, rollback SQL, or filled charter in git. **OPTION_B**; SQL_REVIEWER **PASS_WITH_NOTES** accepted by OWNER / SECURITY_APPROVER; owner-held bundle and rollback **accepted with notes**; **filled owner-held charter required before connect**; mandatory pre-apply and post-apply verification recorded. **Does not** approve Tranche B or write-denial tests; **does not** claim Q4 or N12 pass; **does not** approve execution packet or runtime/write/PSA/Route/Phase 3/4. **U-post** safe summary logged per `phase-2-rls-main-deny-posture-apply-review-summary.md` (2026-05-26) — apply session **completed**; post-apply verification **PASS**. **Post-RLS diagnostics pass** remains a **separate future gate** (before Tranche B). **NOT_READY_FOR_APPLY** unchanged.

| Field | Status |
|-------|--------|
| Gate | MAIN deny-posture apply execution gate adopted at **docs level** |
| Record | `phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` |
| Target | **MAIN-OWNER-USED** / **PROD** |
| Option | **OPTION_B** |
| SQL_REVIEWER | **PASS_WITH_NOTES** accepted |
| Bundle | owner-held accepted; **not in git** |
| Rollback | owner-held accepted; **not in git** |
| Filled charter | **owner-held**; required before connect and completed for the reviewed session; **not in git** |
| FORCE | excluded |
| GRANT/REVOKE | not in first bundle |
| DML/test rows | not approved |
| Tranche B | not approved |
| Write-denial tests | not approved |
| Post-apply verification | **completed** — see U-post |
| Post-RLS diagnostics pass | separate future gate |
| Q4/N12 | not claimed |
| Packet/runtime/write | blocked |
| Postures | **NOT_READY_FOR_APPLY** unchanged / **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged |

#### U-post — MAIN deny-posture apply session (logged 2026-05-26)

Safe summary: `phase-2-rls-main-deny-posture-apply-review-summary.md`.

| U-post field | Status |
|--------------|--------|
| Apply session | **completed** (OPTION_B) |
| Post-apply verification | **PASS** all 7 |
| RLS | **on** all 7 |
| FORCE | **off** all 7 |
| Policies | **14** total (2 per table) |
| Rows | **all 0** |
| Missing expected policies | **0** all 7 |
| Rollback invoked | **no** |
| Bundle / rollback / charter | **owner-held** only |
| Q4 / N12 | **not** claimed |
| Tranche B | **not** approved |
| Write-denial | **not** approved |
| NOT_READY_FOR_APPLY | **unchanged** |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | **unchanged** |

**Closed at docs level (Section U):** DA0–DA21 adopted at docs level; SQL_REVIEWER **PASS_WITH_NOTES** accepted; **OPTION_B** selected; bundle/rollback accepted owner-held; **MAIN Option B apply session completed**; **post-apply verification PASS**; **U-post** safe summary recorded; RLS on all 7; FORCE off; 14 policies; rows 0; Tranche B/write-denial remain blocked.

**Explicitly not closed (Section U + U-post):** filled charter in repo; post-RLS diagnostics pass (execution); Tranche B approval/execution; write-denial tests; Q4/N12 pass; execution packet; Gate 34B/staging/production apply; runtime/write; PSA/Route; Phase 3/4; deny posture **verified for Q4**; RLS **production-safe** claim.

Does **not** mean RLS is production-safe, Q4 pass, N12 pass, Tranche B approved, packet ready, apply-ready globally, or post-RLS diagnostics pass completed.

**V. RLS MAIN diagnostics post-RLS compatibility execution gate (owner/security execution gate — logged at docs level 2026-05-26)**

Owner-adopted RLS **MAIN diagnostics post-RLS compatibility pass execution** gate (PC0 + decisions PC1–PC21) is logged in `docs/architecture/phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md`. **Follows** Section **U** / **U-post**, Section **R** / **R-post**, and diagnostics compatibility planning (D0–D20). **Approves** **one bounded read-only** post-RLS diagnostics session on **MAIN-OWNER-USED** — approved contract consumer only; mandatory before/after comparison with **R-post**; RLS-path **PASS** / **FAIL** / **UNCLEAR** assigned at review. **Does not** approve Tranche B, write-denial tests, Q4 or N12 pass, execution packet, or runtime/write/PSA/Route/Phase 3/4. **V-post** safe summary required after session review **if** a chartered session occurs. **NOT_READY_FOR_APPLY** unchanged.

| Field | Status |
|-------|--------|
| Gate | MAIN post-RLS diagnostics compatibility execution gate adopted at **docs level** |
| Record | `phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md` |
| Target | **MAIN-OWNER-USED** / **PROD** |
| Prerequisites | **U-post** complete; **R-post** PASS_BASELINE_CAPTURED |
| Consumer | single approved script per diagnostics contract |
| Charter | owner-held template before connect |
| RLS-path verdict | **not** reviewed until **V-post** |
| Tranche B | **not** approved (even if future PASS) |
| Write-denial tests | **not** approved |
| Q4/N12 | **not** claimed |
| Postures | **NOT_READY_FOR_APPLY** unchanged / **EXECUTION_FORBIDDEN** narrowly allows only chartered post-RLS diagnostics session / **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged |
| Bounded connect | **BOUNDED_MAIN_DIAGNOSTICS_POST_RLS_READ_ONLY_CONNECT_APPROVED** (this gate only) |

**Closed at docs level (Section V):** PC0–PC21 adopted at docs level; one MAIN bounded read-only post-RLS diagnostics session **approved**; before reference **R-post**; sequencing before Tranche B recorded; charter template in repo; session **not** performed until operational charter + connect.

**Explicitly not closed (Section V):** filled charter in repo; post-RLS session executed; RLS-path PASS/FAIL/UNCLEAR reviewed; **V-post** safe summary; Tranche B approval/execution; write-denial tests; Q4/N12 pass; execution packet; runtime/write; deny posture verified for Q4; RLS production-safe claim.

Does **not** mean compatibility pass executed, RLS-path PASS reviewed, Tranche B approved, packet ready, or apply-ready globally.

**B. Phase 2 → Phase 3 gate criteria (documentation artifact — already committed)**
Prerequisites are documented in `docs/architecture/phase-2-to-phase-3-gate-criteria.md` (aligned with this checklist and the execution plan). This is **not** Phase 3 approval, **not** “gate passed,” and **not** permission to start Phase 3 coding, change PSA, change Route Engine, or perform DB writes.

---

## Current recommended next gate

**Current recommended next gate from this checklist snapshot:** Next checklist-priority item requires **separate read-only selection** among remaining **Not closed**, **Partial**, or **Blocked** operational/execution gates. This update does **not** select or approve the next gate.

**Context:** Phase 2 evidence model closure, Phase 2 governance/review closure, Phase 2 production truth closure, and Phase 2 runtime/write closure are **Closed** at documentation / owner policy level only (`phase-2-evidence-model-owner-decision-record.md`, `phase-2-governance-review-owner-decision-record.md`, `phase-2-production-truth-owner-decision-record.md`, and `phase-2-runtime-write-owner-decision-record.md`, 2026-05-18). **Gate 34B / main RLS apply readiness** owner/security policy is logged (`phase-2-rls-apply-readiness-owner-decision-record.md`, 2026-05-18) with **NOT_READY_FOR_APPLY** and **EXECUTION_FORBIDDEN**. **RLS apply preconditions**, **RLS target-map**, **RLS accountability**, **RLS snapshot requirements**, **RLS negative-test plan**, **RLS owner-held snapshot evidence planning**, **RLS diagnostics compatibility planning**, **RLS FORCE RLS policy**, and **RLS parity evidence planning**, and **RLS live snapshot collection gate**, **RLS live snapshot MAIN collection execution gate**, **MAIN Tier 1 capture + review safe summary**, **MAIN diagnostics pre-RLS baseline execution gate**, **MAIN diagnostics pre-RLS baseline capture + review safe summary**, and **MAIN Tranche A read-only exposure inventory gate**, and **MAIN deny-posture planning gate**, and **MAIN deny-posture apply execution gate**, and **MAIN post-RLS diagnostics compatibility execution gate** (Section **V**) are logged (`phase-2-rls-apply-preconditions-owner-decision-record.md`, `phase-2-rls-target-map-owner-decision-record.md`, `phase-2-rls-accountability-owner-decision-record.md`, `phase-2-rls-snapshot-requirements-owner-decision-record.md`, `phase-2-rls-negative-test-plan-owner-decision-record.md`, `phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`, `phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md`, `phase-2-rls-force-rls-owner-decision-record.md`, `phase-2-rls-parity-evidence-planning-owner-decision-record.md`, `phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md`, `phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md`, `phase-2-rls-main-snapshot-capture-review-summary.md`, `phase-2-rls-main-diagnostics-pre-rls-baseline-execution-gate-owner-decision-record.md`, `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`, `phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md`, `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md`, `phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md`, `phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md`, `phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md`, 2026-05-18–2026-05-26) — do **not** make RLS apply ready. **MAIN deny-posture apply execution gate** adopted at **docs level** (DA0–DA21; Section **U**); **OPTION_B** apply session **completed**; **U-post** PASS (RLS on all 7; FORCE off; 14 policies; rows 0). **MAIN post-RLS diagnostics compatibility execution gate** adopted at **docs level** (PC0–PC21; Section **V**); session **not** performed until chartered connect. **NOT_READY_FOR_APPLY** unchanged. **Post-RLS diagnostics session execution** (operational), **write-denial tests**, **packet**, **runtime/write**, PSA, Route, Phase 3/4 remain **blocked**. **Operational** production truth and runtime/write remain **Not closed** / **Blocked**. **Operational next step:** **post-RLS diagnostics compatibility pass** — Section **V** gate adopted at docs level; next: owner-held charter + **one bounded read-only** session on **MAIN-OWNER-USED** + **V-post** review; then future **Tranche B** gate (separate) — not Tranche B before **V-post** PASS.

**Closed at docs level by MAIN diagnostics pre-RLS baseline capture + review safe summary (2026-05-19):** bounded read-only MAIN pre-RLS baseline performed; OWNER / SECURITY_APPROVER review PASS_BASELINE_CAPTURED; approved consumer used; phase2SchemaAvailable true; phase2DiagnosticsWarning none; identityResolutionSummary counters all 0; identityResolutionBySchoolCode empty; command parameter values owner-held; sensitive output none observed; no raw diagnostic JSON/logs/secrets in repo.

**Closed at docs level by MAIN diagnostics pre-RLS baseline execution gate (2026-05-19):** BL0–BL20; one MAIN-OWNER-USED bounded read-only diagnostics session approved; approved contract consumer only; pre-RLS only (not post-RLS pass); BL17 role labels in git / humans owner-held.

**Closed at docs level by MAIN Tranche A read-only exposure inventory gate (2026-05-19):** NT0–NT21; one MAIN-OWNER-USED **Tranche A read-only** session approved; Tranche B **not** approved; write attempts/DML/test rows/write-denial tests **not** approved; N4 snapshot + R-post prerequisites; NT17 role labels in git / humans owner-held.

**Closed at docs level by MAIN Tranche A exposure inventory capture + review safe summary (2026-05-19):** bounded read-only Tranche A performed; OWNER / SECURITY_APPROVER review PASS_WITH_EXPOSURE_FINDINGS; exposure findings on all 7 Phase 2 tables; rows all 0; RLS/FORCE off; 0 policies; anon/authenticated grants present; read-only only; no write attempts; Q4/N12 pass not claimed; charter owner-held; no raw evidence/secrets in repo.

**Closed at docs level by MAIN deny-posture planning gate (2026-05-19):** DP0–DP21; bounded owner-held planning approved; follows Q-post + R-post + S-post; Option A/B review path defined; FORCE excluded from first apply confirmed; Tier 2 explicit label requirement recorded; Tranche B/write-denial future-only; no SQL/apply; Q4/N12 pass not claimed.

**Closed at docs level by MAIN deny-posture apply execution gate (2026-05-19):** DA0–DA21; docs-level adoption only; follows Section **T**; **OPTION_B**; SQL_REVIEWER **PASS_WITH_NOTES** accepted; bundle/rollback accepted owner-held; filled charter required before connect; mandatory pre/post checks; Tranche B/write-denial/Q4/N12 not approved.

**Closed at docs level by MAIN deny-posture apply review safe summary (U-post) (2026-05-26):** bounded MAIN Option B apply session completed; post-apply verification PASS on all 7; RLS on; FORCE off; 14 policies; rows 0; rollback not invoked; charter/bundle/rollback owner-held; Q4/N12/Tranche B/write-denial not approved; NOT_READY_FOR_APPLY unchanged.

**Closed at docs level by MAIN post-RLS diagnostics compatibility execution gate (2026-05-26):** PC0–PC21; one MAIN-OWNER-USED bounded read-only post-RLS diagnostics session approved; follows U-post + R-post; approved contract consumer only; RLS-path PASS/FAIL/UNCLEAR at review; Tranche B/write-denial/Q4/N12 not approved; charter template owner-held before connect.

**Closed at docs level by MAIN Tier 1 capture + review safe summary (2026-05-19):** bounded read-only MAIN capture performed; OWNER / SECURITY_APPROVER review PASS_WITH_SECURITY_FINDINGS; Tier 1 complete; good-restored-state values recorded owner-held; security findings logged safely; no raw evidence in repo.

**Closed at docs level by RLS live snapshot collection execution gate (execution gate — MAIN bounded read-only connect approved):** SE0–SE20; one MAIN-OWNER-USED read-only session approved; Tier 1 success criteria; owner-held storage; SE17 role labels in git / humans owner-held / product DB emails not restricted by RLS git rule.

**Closed at docs level by RLS accountability record (role labels only):** executor / approver / rollback owner **role labels** per **STAGING-34B** and **MAIN-OWNER-USED**; rollback trigger policy; good-restored-state policy requirements.

**Closed at docs level by RLS snapshot requirements record (requirements only):** S0–S14 per-target snapshot field requirements; Tier 1/Tier 2 tables; storage posture; diagnostics baseline requirement; good-state dependency on per-target snapshot; no ISOLATED-LAB baseline reuse.

**Closed at docs level by RLS negative-test plan record (plan only):** N0–N16 negative-test plan policy; required denial outcomes; high-privilege interpretation rules; failure handling (fail/unclear = stop); test result storage posture; ISOLATED-LAB exclusion; STAGING → MAIN parity rule at plan level.

**Closed at docs level by RLS owner-held snapshot evidence planning record (planning only):** E0–E18 evidence planning policy; MAIN/PROD primary safety target framing; STAGING optional rehearsal only (not mandatory before MAIN planning); owner-held default; safe summary / prohibited storage posture; future role-label capture/review planning; diagnostics baseline requirement in future capture; good-state dependency on evidence + review; STAGING does not substitute MAIN/PROD rule.

**Closed at docs level by RLS diagnostics compatibility planning record (planning only):** D0–D20 compatibility planning policy; fail-open tool vs fail-safe RLS path; PASS/FAIL/UNCLEAR on RLS path; before/after RLS re-test planning rule; warnings ≠ product states; single approved consumer unchanged; STAGING does not substitute MAIN/PROD compatibility; good-state includes diagnostics behavior restored (policy); rollback trigger on FAIL/UNCLEAR (policy).

**Closed at docs level by RLS FORCE RLS policy record (policy only):** F0–F18 FORCE policy; **first apply: FORCE excluded**; future enablement separate gate per target; owner-held bypass/table-owner analysis required before enablement; enablement threshold (F17) at policy level; MAIN/PROD primary; STAGING optional; STAGING does not substitute MAIN/PROD for FORCE; draft SQL FORCE lines = review only.

**Closed at docs level by RLS parity evidence planning record (planning only):** P0–P18 parity planning policy; C14/Q12 planning side; parity dimension catalog; STAGING→MAIN transfer rules (plan); ISOLATED-LAB exclusion; MAIN→future PROD separate parity rule; owner-held parity evidence posture; physical sameness unresolved = operational reuse blocker; MAIN/PROD primary; STAGING optional; STAGING does not substitute MAIN/PROD for any evidence domain.

**Closed at docs level by RLS live snapshot collection gate record (gate definition only):** SG0–SG18 gate definition; two-gate model (definition vs collection execution); read-only capture posture; Tier 1/Tier 2 alignment with S/E; MAIN primary first collection target; STAGING optional; ISOLATED-LAB excluded; owner-held values + prohibited storage; diagnostics baseline in capture plan; review before downstream use; MAIN clutter does not block gate definition (T9).

**Explicitly not closed by RLS readiness, preconditions, target-map, accountability, snapshot-requirements, negative-test-plan, snapshot-evidence-planning, diagnostics-compatibility-planning, force-rls, parity-evidence-planning, live-snapshot-collection-gate, live-snapshot-collection-execution-gate, MAIN capture + review safe summary, MAIN diagnostics pre-RLS baseline execution gate, MAIN diagnostics pre-RLS baseline capture + review safe summary, MAIN Tranche A read-only exposure inventory gate, MAIN Tranche A exposure inventory capture + review safe summary, MAIN deny-posture planning gate records, MAIN deny-posture apply execution gate record, MAIN deny-posture apply review safe summary (U-post), or MAIN post-RLS diagnostics compatibility execution gate record (Section V — gate only): filled charter in repo; **post-RLS diagnostics session executed**; **RLS-path PASS/FAIL/UNCLEAR reviewed**; **V-post** safe summary; Tier 2 snapshot completion if incomplete (non-diagnostics fields); Gate 34B execution; staging RLS apply; production RLS apply; GRANT/REVOKE execution; Supabase connect for **post-RLS diagnostics pass execution**; diagnostics **post-RLS compatibility pass** on MAIN (execution); redacted evidence **artifact**; negative-test **execution** on real targets; negative-test **pass** evidence on real targets; Tranche B approval/pass; write-denial tests; execution packet approval or draft; Q4 pass; N12 pass; cleanup/migration/delete or new Supabase project; exact human identities for executor/approver/rollback (owner-held unless later approved for git); FORCE RLS **enablement** on any target; parity **evidence values**; operational production truth (populated rows, production resolution loop on main); operational runtime/write implementation; Phase 2 observation/candidate/decision/publication row writes; PSA publication; PSA materialization; Route Engine consumption; **active** operator/admin workflow implementation; Phase 3; Phase 4 LOSA implementation; helper/pipeline/readiness integration; deny posture **verified for Q4**; RLS **production-safe** claim.

The Phase 2 → Phase 3 gate criteria document exists but the **gate has not passed** and does not approve Phase 3 or replace remaining owner-gated operational/execution work.

**Clarification:** this recommendation is **snapshot-bound** and may be changed by an explicit owner decision. It is **not** implementation approval. This section does **not** invent a new roadmap over the checklist.
