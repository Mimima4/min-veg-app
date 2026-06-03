# Phase 4 LOSA Evidence Refresh — Pre-Session QA (Template)

| Field | Value |
|-------|--------|
| **Gate** | `phase-4-losa-evidence-refresh-implementation-execution-gate-owner-decision-record.md` |
| **Charter ID** | _(owner-held)_ |
| **Pilot** | 1 / 2 / 2b |

**Rule:** **FAIL** or **UNCLEAR** on any blocking row ⇒ **no** execution prompt / `run-pilot-*.sh`. **PASS** required (LRI10–LRI12).

---

## A. Charter and approvals

| # | Check | Result |
|---|-------|--------|
| A1 | Charter ID filled; reference county `56` | |
| A2 | **OWNER** = yes | |
| A3 | **SECURITY_APPROVER** = yes | |
| A4 | **TECH_EXECUTOR** = yes (local terminal) | |
| A5 | Curated URL record adopted (Pilot 2+) or Tier 1 list only (Pilot 1) | |

## B. Scope and hosts

| # | Check | Result |
|---|-------|--------|
| B1 | Every URL in `run-pilot-*.sh` matches charter table exactly | |
| B2 | No hosts outside charter (N11 if violated) | |
| B3 | No invented school/kommune **deep** URLs (Pilot 2b: each URL has owner rationale) | |
| B4 | Tier 3 rows labeled supporting-only in charter | |

## C. Forbidden actions

| # | Check | Result |
|---|-------|--------|
| C1 | No PSA / Phase 2 DML / Supabase / pipeline write `56` | |
| C2 | No UI / Route / cron / production scheduler | |
| C3 | No secrets or raw snapshots committed to git | |
| C4 | `NOT_READY_FOR_APPLY` not treated as cleared | |

## D. Prerequisites

| # | Check | Result |
|---|-------|--------|
| D1 | **P4-LOSA-FM-post** recorded | |
| D2 | Prior pilot post recorded if Pilot 2+ (Pilot 1 → **P4-LOSA-REFRESH-IMPL-post**) | |
| D3 | **A3-CONTOUR-A-56-post** recorded; ABORT baseline not reinterpreted as failure | |

## E. Execution mechanics

| # | Check | Result |
|---|-------|--------|
| E1 | `run-pilot-*.sh` exists; `curl` only; snapshot dir owner-held | |
| E2 | Reachability spot-check: chartered URLs return HTTP 2xx/3xx (optional) | |
| E3 | Session log + prompt paths documented | |

## F. Overall

| Field | Value |
|-------|--------|
| **Overall** | PASS / FAIL / UNCLEAR |
| Date (UTC) | |
| Authorized | yes only if **PASS** |
