# Phase 4 LOSA Evidence Refresh Implementation Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **LOSA evidence refresh implementation** execution gate — **docs-level gate adoption only** — **NOT_READY_FOR_APPLY** unchanged |
| **Closure label** | `PHASE_4_LOSA_EVIDENCE_REFRESH_IMPLEMENTATION_GATE_ADOPTED_BOUNDED` |
| **Scope** | **First bounded pilot** of headless official-source evidence refresh for **Finnmark `56` reference case** (LRI0–LRI24); **not** full semiannual production automation |
| **Date (UTC)** | 2026-05-31 |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-REFRESH-IMPL** |
| **Agreement basis** | **P4-LOSA-FM-post** contract §7; `phase-4-losa-official-source-evidence-refresh-design.md`; `phase-4-losa-official-source-registry.md` |

This gate authorizes **one bounded pilot refresh session** that may perform **controlled network fetch** of **registry-documented Tier 1 canonical base URLs** and produce **owner-held draft evidence snapshots** only.

It does **not** authorize PSA writes, Phase 2 table writes, Route/UI integration, permission **#3**, permission **#2** write on `56`, cron deployment, or treating refresh outcomes as runtime truth.

**Adopting this gate does NOT change NOT_READY_FOR_APPLY** globally.

**Gate adopted ≠ charter filled ≠ pilot session run ≠ Finnmark operational closure.**

**Primary target:** **MAIN-OWNER-USED** context for planning/evidence storage discipline; pilot fetches are **external official URLs** (not Supabase writes).

**Session error rule (binding):** fetch outside charter URL list, invented deep URLs, DB write, PSA write, Phase 2 DML, secrets in git, or unparsed fatal tool error ⇒ **STOP (N11)**; no self-heal in same session.

---

## This document is not

- not Finnmark **operational resolution** or publishability closure
- not Contour **A** write or **A.3** substitute
- not full semiannual refresh automation approval
- not per-school URL invention at scale in this pilot
- not LOSA-as-ordinary-school publication approval

---

## Meta-rule LRI0

All **Yes** decisions (LRI1–LRI24) adopt **bounded LOSA refresh implementation pilot** gate only.

---

## Owner/security decisions (LRI0–LRI24)

### Decision LRI0 — Scope

**Owner/security decision:** **Yes.** **Pilot 1** — Tier 1 registry fetches + owner-held snapshot manifest for **`56` reference** — not nationwide rollout.

### Decision LRI1 — Prerequisites

**Owner/security decision:** **Yes.** **P4-LOSA-FM-post**, **A3-CONTOUR-A-56-post**, **B-GREEN-#2-post**, **P06-CONTOUR-B-post**, **Z-OV-post**, refresh-design + registry adopted.

### Decision LRI2 — Pilot fetch surface (binding)

**Owner/security decision:** **Yes.** Charter must list **only** registry `source_id` rows approved for pilot, default maximum:

- `T1_LOVDATA`
- `T1_REGJERINGEN`
- `T1_STORTINGET`
- `T1_UDIR`

**No** invented school/kommune URLs in pilot unless explicitly added in charter with owner rationale.

### Decision LRI3 — Claim classes in pilot

**Owner/security decision:** **Yes.** Pilot may extract **candidate** claims for `legal_status` and `fjernundervisning_rules` only — **not** full §9 checklist closure.

### Decision LRI4 — No runtime truth mutation

**Owner/security decision:** **Yes.** Refresh outcomes **must not** update Route, PSA, or Phase 2 product tables.

### Decision LRI5 — No PSA / #2 for `56`

**Owner/security decision:** **Yes.**

### Decision LRI6 — No UI / #3

**Owner/security decision:** **Yes.**

### Decision LRI7 — Owner-held evidence only in git

**Owner/security decision:** **Yes.** Git gets safe summary only; snapshots/hashes/raw HTML owner-held.

### Decision LRI8 — Outcome labeling per refresh-design §12

**Owner/security decision:** **Yes.** Pilot must map to refresh outcome states (e.g. `refresh_blocked_source_coverage_missing`, `refresh_review_required`) — informational only.

### Decision LRI9 — ABORT on `56` unchanged

**Owner/security decision:** **Yes.** Pilot **does not** expect Contour **A** green; **22** unmatched baseline remains valid until separate gates.

### Decision LRI10 — One bounded pilot session

**Owner/security decision:** **Yes.** After filled charter + QA **PASS** + execution prompt.

### Decision LRI11 — Owner-held charter required

**Owner/security decision:** **Yes.**

### Decision LRI12 — Separate execution prompt required

**Owner/security decision:** **Yes.**

### Decision LRI13 — Network fetch permitted (pilot only)

**Owner/security decision:** **Yes.** Headless HTTP fetch to charter-listed Tier 1 URLs only.

### Decision LRI14 — No cron / no production scheduler

**Owner/security decision:** **Yes.** Pilot is **manual-trigger** session, not deployed job.

### Decision LRI15 — Stale tolerance unchanged

**Owner/security decision:** **Yes.** No stale-tolerance policy adoption in this gate.

### Decision LRI16 — NOT_READY unchanged

**Owner/security decision:** **Yes.**

### Decision LRI17 — Tier 2 fetch deferred

**Owner/security decision:** **Yes.** Tier 2 operational URLs **not** in **Pilot 1** unless separate charter amendment.

### Decision LRI18 — Compare to A3 baseline (informational)

**Owner/security decision:** **Yes.** Summary notes whether pilot adds legal-policy evidence beyond **ABORT** diagnostics — does not claim matcher unblock.

### Decision LRI19 — No secrets in git

**Owner/security decision:** **Yes.**

### Decision LRI20 — Role labels only in git

**Owner/security decision:** **Yes.**

### Decision LRI21 — Outcome codes (informational)

| Code | Meaning |
|------|---------|
| `LOSA_REFRESH_PILOT_PASS` | Pilot snapshots captured; coverage gaps documented |
| `LOSA_REFRESH_PILOT_PASS_WITH_GAPS` | Partial capture; blockers listed |
| `LOSA_REFRESH_PILOT_NOT_READY_STOP` | STOP (N11); unreliable pilot |

### Decision LRI22 — Next gate after pilot (informational)

**Owner/security decision:** **Yes.** **Pilot 2** (Tier 2 pattern / per-school evidence) or Contour **B** evidence update — **separate** charters; **not** auto.

### Decision LRI23 — Priority rules

**Owner/security decision:** **Yes.** Refresh-design > registry > Finnmark contract on conflict.

### Decision LRI24 — Final boundary

**Owner/security decision:** **Yes.** Pilot collects **official-source evidence**; it does **not** publish truth.

---

## Relationship to prior records

- **Depends on:** `phase-4-losa-finnmark-publishability-contract-acceptance-owner-decision-record.md`
- **Depends on:** `phase-2-contour-a-finnmark-56-baseline-execution-review-summary.md`
- **Charter template:** `phase-4-losa-evidence-refresh-implementation-execution-charter-template.md`
- **Review template:** `phase-4-losa-evidence-refresh-implementation-execution-review-summary-template.md`

---

## Final boundary statement

Section **P4-LOSA-REFRESH-IMPL** adopts a bounded **LOSA evidence refresh implementation pilot** gate. It permits **controlled Tier 1 fetches** and **owner-held draft snapshots** for the Finnmark reference case without authorizing publication, PSA, UI, or full automation rollout.
