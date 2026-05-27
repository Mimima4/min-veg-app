# Phase 2 RLS MAIN Execution Packet Draft Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **execution packet draft** gate — **NOT_READY_FOR_APPLY** / **no** packet execution / **no** git SQL |
| **Closure label** | `RLS_MAIN_EXECUTION_PACKET_DRAFT_GATE_ADOPTED_BOUNDED` |
| **Scope** | **Draft gate framework only** — bounded permission to prepare an **owner-held** MAIN execution packet **draft** (EPD0–EPD25); **not** packet execution |
| **Date (UTC)** | 2026-05-27 |
| **Repository checkpoint** | `cf0f7b1` (Z-planning-outcome — **Z-planning-outcome**) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **Z-D** (RLS MAIN execution packet draft gate) |

This record adopts the **execution packet draft gate** on **MAIN-OWNER-USED** after **Z-planning-outcome** (`DRAFT_PLANNING_READY_WITH_DOCUMENTED_GAPS`), Section **Z**, and **Y-N12-outcome**.

It authorizes **bounded owner-held drafting only** per filled charter — **not** committing packet SQL to git, **not** Supabase execution, **not** U-post deny bundle re-apply by default.

**Critical MAIN state (U-post):** Option B deny posture is **already applied** (RLS on **7**; **14** policies; FORCE off; rows **0**). The owner-held packet draft must be scoped as **post-apply** documentation / verification / controlled-change outline — **not** as implicit permission to repeat U-post DDL.

**Adopting this record does NOT change NOT_READY_FOR_APPLY** globally. **Packet execution** remains forbidden until a **separate** execution gate.

**Draft gate adopted ≠ owner-held draft completed ≠ packet executed ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (= MAIN) only.

**STAGING-34A/34B** artifacts remain **reference only** — no STAGING→MAIN proof transfer without parity and separate owner decision.

This record does **not** store secrets, executable SQL bundles, rollback SQL, or PII in git.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged globally |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL execution, packet execution, apply, runtime/write — except **no new** connect path opened by this gate |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN (git)** | **Unchanged** — no execution packet SQL or draft text in repository |
| **EXECUTION_PACKET_DRAFT_OWNER_HELD_PERMITTED_BOUNDED** | After filled owner-held charter, **OWNER** / **SECURITY_APPROVER** may prepare **one** bounded owner-held MAIN packet draft — **not** in git |
| **EXECUTION_PACKET_DRAFT_NOT_COMPLETE_AT_ADOPTION** | No owner-held draft claimed complete at gate adoption |

---

## This document is not

- not proof that an owner-held packet draft already exists
- not execution packet **execution** approval
- not U-post re-apply approval (default)
- not `N12_PASS_CLAIMED`
- not **NOT_READY_FOR_APPLY** clearance
- not git commit of SQL, rollback, or packet body

---

## Meta-rule EPD0

All **Yes** decisions (EPD1–EPD25) adopt **MAIN execution packet draft gate** framework and permit **bounded owner-held draft preparation** per charter template only.

EPD1–EPD25 do **not** authorize Supabase connect, packet SQL execution, apply, git SQL commit, U-post bundle re-run (default), runtime/write, PSA/Route activation, or Phase 3/4.

---

## Owner/security execution packet draft decisions (EPD0–EPD25)

### Decision EPD0 — Scope

**Owner decision:** **Yes.** **Draft gate** only — owner-held draft preparation framework; not execution.

### Decision EPD1 — Prerequisites

**Owner decision:** **Yes.** **Z-planning-outcome**, Section **Z**, **Y-N12-outcome**, **U-post**, **V-post**, **W-post**, **X-post**, **W-Q4F-post**.

### Decision EPD2 — U-post already applied (default packet scope)

**Owner decision:** **Yes.** Default owner-held packet draft scope is **post-apply** verification / gap register / rollback reference / execution prerequisites — **not** repeat Option B deny apply. Any DDL in owner-held draft requires **explicit** separate owner approval per section.

### Decision EPD3 — Partial N12 accepted for draft gate

**Owner decision:** **Yes.** `N12_PASS_WITH_DOCUMENTED_GAPS` is sufficient to open **owner-held draft preparation** with **documented gaps** — **not** `N12_PASS_CLAIMED` required for this gate adoption.

### Decision EPD4 — Documented gaps must appear in owner-held draft

**Owner decision:** **Yes.** Draft must carry forward: app/browser **NOT_TESTED**; diagnostics N6 **NOT_TESTED**; Route/PSA re-review rule; partial N12; **NOT_READY_FOR_APPLY** unchanged.

### Decision EPD5 — Owner-held draft permitted; git draft forbidden

**Owner decision:** **Yes.** **EXECUTION_PACKET_DRAFT_FORBIDDEN** for **git** remains. Owner-held draft preparation is **permitted** only under filled charter after this gate adoption.

### Decision EPD6 — STAGING packet reference only

**Owner decision:** **Yes.** `phase-2-staging-rls-execution-packet.md` is structural reference only; **not** MAIN execution proof.

### Decision EPD7 — SQL shape references owner-held only

**Owner decision:** **Yes.** `phase-2-rls-policy-sql-draft.md` and human review packet may inform owner-held draft only — **not** git commit.

### Decision EPD8 — Packet execution forbidden

**Owner decision:** **Yes.** Unchanged at gate adoption.

### Decision EPD9 — NOT_READY_FOR_APPLY unchanged

**Owner decision:** **Yes.** Unchanged at gate adoption.

### Decision EPD10 — Runtime/write and PSA/Route blocked

**Owner decision:** **Yes.** Unchanged.

### Decision EPD11 — Filled charter required before draft work

**Owner decision:** **Yes.** Charter from `phase-2-rls-main-execution-packet-draft-charter-template.md` is **owner-held** and required before draft preparation.

### Decision EPD12 — Mandatory owner-held draft sections (safe outline)

**Owner decision:** **Yes.** Owner-held draft must include at minimum:

- target verification block (**MAIN-OWNER-USED**)
- current posture summary (U-post facts by reference)
- gap / open-items register
- rollback reference (owner-held bundle ID; no rollback SQL in git)
- verification / stop blocks for any future execution gate
- explicit **forbidden without separate gate** list (execution, apply, re-apply U-post default)
- accountability placeholders (roles owner-held)

### Decision EPD13 — No Supabase connect at draft gate

**Owner decision:** **Yes.** Draft gate does **not** authorize connect or SQL execution.

### Decision EPD14 — Two verdicts: repo vs charter

**Owner decision:** **Yes.** **Safe to continue (repo)** vs **Draft preparation authorized (charter)** are distinct; charter authorization **≠** packet executed.

### Decision EPD15 — Charter §6 execution-approval labels immutable

**Owner decision:** **Yes.** Filled charter §6 must keep execution-approval selections **`no` (fixed)** until a **separate** execution gate.

### Decision EPD16 — Candidate draft completeness ≠ execution permission

**Owner decision:** **Yes.** Owner-held “draft ready” candidate notes are **not** permission to execute SQL without a **separate** execution gate prompt.

### Decision EPD17 — Post-draft grep verification (owner-held)

**Owner decision:** **Yes.** After owner-held draft preparation, verify via **grep only** (no full draft print): no git paths; boundaries; §6 execution labels **no**.

### Decision EPD18 — Allowed future outcomes after draft (informational)

**Owner decision:** **Yes.** After owner-held draft + review, owner may record **one** code via **separate** outcome/review record:

| Code | Meaning |
|------|---------|
| `DRAFT_NOT_READY_STOP` | Draft blockers — stop (N11) |
| `DRAFT_COMPLETE_WITH_DOCUMENTED_GAPS` | Owner-held draft complete; gaps explicit; **not** execution |
| `DRAFT_COMPLETE_READY_FOR_EXECUTION_GATE_DISCUSSION` | Draft complete for **separate** execution gate discussion only |

**At gate adoption:** none selected in this file.

### Decision EPD19 — Next gate after draft (informational)

**Owner decision:** **Yes.** Next step is **execution packet execution gate** (separate) **or** gap-closure tests — **not** automatic.

### Decision EPD20 — SQL reviewer path (if draft contains DDL)

**Owner decision:** **Yes.** If owner-held draft includes DDL sections, **SQL_REVIEWER** human review is required **owner-held** before any future execution gate — **not** satisfied by this gate adoption.

### Decision EPD21 — What this gate closes

**Owner decision:** **Yes.** Closes: draft gate framework; owner-held draft permission path; mandatory draft sections; charter template linked.

### Decision EPD22 — What remains open at adoption

**Owner decision:** **Yes.** Open: owner-held draft prepared; draft review; packet **execution**; apply; NOT_READY_FOR_APPLY clearance.

### Decision EPD23 — Priority rule

**Owner decision:** **Yes.** Stricter checklist, N12, U-post state, Z-planning-outcome, N11 win.

### Decision EPD24 — Fail/unclear = stop

**Owner decision:** **Yes.** N11 applies to draft and future execution chain.

### Decision EPD25 — Conflict rule

**Owner decision:** **Yes.** Stricter safety rule wins.

---

## Final boundary statement

Phase 2 RLS **MAIN execution packet draft gate** is owner-adopted (EPD0–EPD25). **`RLS_MAIN_EXECUTION_PACKET_DRAFT_GATE_ADOPTED_BOUNDED`** permits **bounded owner-held packet draft preparation only**. **Git packet draft remains forbidden.** **Packet execution is not approved.** **NOT_READY_FOR_APPLY** remains unchanged at gate adoption.
