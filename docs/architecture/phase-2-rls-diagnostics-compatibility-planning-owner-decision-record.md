# Phase 2 RLS Diagnostics Compatibility Planning Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security diagnostics compatibility **planning** decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_DIAGNOSTICS_COMPATIBILITY_PLANNING_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Post-RLS diagnostics/helper compatibility **planning** policy only (D0–D20) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `ef5459e Add Phase 2 RLS snapshot evidence planning owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section M (RLS diagnostics compatibility planning policy) |

This file records **owner-agreed planning policy** for how **future** read-only diagnostics/helper compatibility with RLS must be **interpreted**, **re-tested** (only after a later gate), **stored**, **reviewed**, and **used** on **STAGING-34B** and **MAIN-OWNER-USED**. It defines **when** checks apply, **pass/fail/unclear** meaning on the RLS path, **fail-open vs fail-safe** layers, and **who** (role labels) — at **documentation level only**.

It does **not** run diagnostics/helper. It does **not** connect to Supabase. It does **not** prove post-RLS compatibility **pass**. It does **not** make RLS apply ready. It does **not** allow execution packet drafting. It does **not** approve helper/pipeline/readiness integration or new helper consumers.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

**Planning adopted ≠ compatibility pass executed ≠ tests run ≠ apply approved.** Prior standalone helper validation on a target **before** RLS does **not** substitute post-RLS compatibility **pass**.

**Primary safety target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) is the **primary** safety target for compatibility planning and future review.

**STAGING-34B** remains an **optional rehearsal / safety track** only. **STAGING-34B** is **not mandatory** before MAIN compatibility planning. **STAGING-34B** compatibility results **never** substitute **MAIN-OWNER-USED** / **PROD** results or approval.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw diagnostic JSON dumps, per-school resolution maps with row-level detail, screenshots with secrets, token or session dumps, or exact SQL dumps. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — post-RLS compatibility **pass**, live snapshots, negative-test pass, parity evidence, FORCE decision, and other operational preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase connect/apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gates after planning, evidence, review, compatibility pass, and negative-test pass |
| **RLS_DIAGNOSTICS_COMPATIBILITY_PLANNING_POLICY_ADOPTED_DOCS_ONLY** | Compatibility **planning** policy on paper only; does **not** mean diagnostics were re-run, passed, or apply is safe |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline/readiness integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C11 diagnostics re-test; C7 good restored state includes diagnostics behavior; C12 high-privilege; C14 parity includes diagnostics behavior).
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q7 diagnostics compatibility posture).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N9 observe only; N11 fail/unclear = stop).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E11 diagnostics/helper baseline before and after RLS change; owner-held output default).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S8 diagnostics baseline in snapshot requirements).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (rollback triggers include diagnostics/helper failure).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6 separate projects; MAIN production-like).
- **Canonical (must not be weakened):** `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` (frozen standalone tool; single approved consumer).
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md`, `docs/architecture/phase-2-staging-rls-execution-packet.md` (template only — **not** permission), `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` (historical — **not** reusable).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **STAGING-34B** (optional rehearsal only), **ISOLATED-LAB** (historical only — **must not** be reused).
- **Does not** reopen prior owner records unless an explicit owner gate says so.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase connect or apply approval
- diagnostics/helper **execution** or live re-run approval
- post-RLS diagnostics compatibility **pass** evidence or proof
- negative-test **execution** or **pass** approval
- live snapshot collection or evidence satisfaction
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- execution packet approval or drafting permission
- runtime/write integration approval
- Phase 2 row write approval
- PSA publication or materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- helper / pipeline / readiness integration approval or new helper consumer approval
- Phase 3 start or implementation approval
- Phase 4 LOSA execution approval
- `.env` configuration or runtime environment-variable work
- cleanup, migration, deletion, or new-project creation approval
- storage of secrets, raw diagnostic dumps, or security-sensitive logs in git

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — C11, C7, C12, C14
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — Q7
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — N9, N11
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — E11
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — S8
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — rollback triggers
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — target labels
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary (canonical)
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary (canonical)
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — gate not passed

**Conflict rule:** canonical diagnostics contract and helper ADR win over this record if in conflict; this record must be revised.

---

## Meta-rule D0

All **Yes** decisions in this record (D1–D20) mean **diagnostics compatibility planning policy on paper only**.

None of D1–D20 authorizes SQL, Supabase connect or apply, diagnostics/helper live execution, compatibility pass claims, live snapshot collection, negative-test execution, negative-test pass claims, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline/readiness hookup, new helper consumers, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (D20)

If a stricter rule exists in canonical diagnostics contract/helper ADR, evidence model, governance, production truth, runtime/write, RLS readiness, preconditions, target-map, accountability, snapshot-requirements, negative-test-plan, snapshot-evidence-planning, security owner records, or the controlling checklist, the **stricter safety rule wins**.

---

## Owner/security diagnostics compatibility planning decisions (D0–D20)

### Decision D0 — Scope / non-execution

**Owner decision:** **Yes**.

**Policy meaning:** This session adopts **planning policy only** for post-RLS diagnostics/helper compatibility. It does **not** run the tool, connect to Supabase, execute SQL, run negative tests, draft an execution packet, or approve apply.

**What remains blocked:** Live diagnostics re-run; Supabase connect; test execution; Gate 34B; all apply tracks; execution packet draft.

---

### Decision D1 — Planning adopted does not mean compatibility pass

**Owner decision:** **Yes**.

**Policy meaning:** Adopting D0–D20 does **not** mean post-RLS compatibility **pass** exists or diagnostics are trusted for apply. Prior standalone helper validation **before** RLS on any target does **not** substitute post-RLS pass.

**What remains blocked:** Claims that diagnostics compatibility is done; apply readiness from diagnostics success.

---

### Decision D2 — Separate planning per real target

**Owner decision:** **Yes**.

**Policy meaning:** Compatibility planning and future results are **separate per target label** (**STAGING-34B**, **MAIN-OWNER-USED**). One target’s result does not cover the other.

**What remains blocked:** Merged STAGING+MAIN compatibility sign-off.

---

### Decision D3 — MAIN-OWNER-USED / PROD stricter than STAGING-34B

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** requires **stricter** review, owner authorization before future runs, and slower gates than **STAGING-34B**.

**What remains blocked:** STAGING posture treated as sufficient for MAIN.

---

### Decision D4 — MAIN/PROD primary; STAGING optional rehearsal only

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** is the **primary safety target**. **STAGING-34B** is **optional rehearsal** only — **not mandatory** before MAIN compatibility planning. STAGING results are **support only** and **never** substitute MAIN/PROD pass or approval.

**What remains blocked:** STAGING-first mandatory path to MAIN approval; STAGING pass = MAIN ready.

---

### Decision D5 — Future run role labels (capture/check execution)

**Owner decision:** **Yes**.

**Policy meaning (role labels only — no real names in git):**

| Role label | Future diagnostics/helper run (if later gate approves) |
|------------|------------------------------------------------------|
| **TECH_EXECUTOR** | May run read-only diagnostics/helper on either target |
| **OWNER** | Authorizes run on **MAIN-OWNER-USED** |
| **EXTERNAL_SECURITY_REVIEWER** | Optional second pair of eyes on **MAIN** |
| **ROLLBACK_OWNER** | Does **not** run baseline compatibility checks |
| **not assigned yet** | No run until assigned at later gate; real names **owner-held** |

**What remains blocked:** Run now; unsupervised agent Supabase connect; real names/emails in git.

---

### Decision D6 — Future review role labels

**Owner decision:** **Yes**.

**Policy meaning:**

| Role label | Future review |
|------------|---------------|
| **OWNER** | Reviews compatibility results for **both** targets before they inform packet **discussion** or apply planning |
| **SECURITY_APPROVER** | Same function as **OWNER** unless later split |
| **EXTERNAL_SECURITY_REVIEWER** | Optional on **MAIN** stricter path |
| **TECH_EXECUTOR** | Must **not** be sole reviewer on **MAIN** |
| **not assigned yet** | No sign-off until assigned; real names **owner-held** |

**What remains blocked:** Self-review on MAIN by executor alone; sign-off without captured results.

---

### Decision D7 — Owner-held detailed output by default

**Owner decision:** **Yes**.

**Policy meaning:** Full diagnostics/helper output (stdout JSON, warning payloads, per-school maps) stays **owner-held by default**, not in git.

**What remains blocked:** Routine git storage of full diagnostic dumps.

---

### Decision D8 — Git safe summaries only

**Owner decision:** **Yes**.

**Policy meaning:** Git may store **safe summaries** only: target label; date; **PASS** / **FAIL** / **UNCLEAR**; warning **codes** (not full messages with sensitive detail); `phase2SchemaAvailable` boolean; aggregate counts from summary fields only; explicit blocked / not apply statement.

**What remains blocked:** Row-level or full JSON dumps in git.

---

### Decision D9 — Prohibited data never stored in git

**Owner decision:** **Yes**.

**Policy meaning:** Git must **never** store: `project_ref`; dashboard URLs; API keys; service keys; connection strings; raw diagnostic JSON dumps; detailed `identityResolutionBySchoolCode` payloads; screenshots with secrets; token/session dumps.

**What remains blocked:** Secret or row-level diagnostic leakage in repo.

---

### Decision D10 — Fail-open tool vs fail-safe RLS path

**Owner decision:** **Yes**.

**Policy meaning — two layers:**

| Layer | Source | Behavior |
|-------|--------|----------|
| **Tool fail-open** | Diagnostics contract §5 | Empty payload + warning; no crash; no readiness/write change from tool alone |
| **RLS-path fail-safe** | C11, Q7, this record | After any RLS change on a target, compatibility **FAIL** or **UNCLEAR** on the RLS path = **stop** for scheduling, packet discussion, and apply planning — **no** silent continue |

Tool fail-open does **not** override RLS-path stop.

**What remains blocked:** Treating empty warnings-only output after RLS as apply-safe without explicit PASS on RLS path.

---

### Decision D11 — When re-test is required

**Owner decision:** **Yes**.

**Policy meaning:** Future compatibility work (when a later gate approves execution) must include:

1. **Baseline** diagnostics/helper behavior on that target **before** any RLS change (aligns with E11 / snapshot evidence).
2. **Mandatory re-check** on the **same** target **after** any RLS change.

Observe only — never drive publication, write, readiness, PSA, Route, or family-facing truth.

**What remains blocked:** Skipping post-RLS re-check; using pre-RLS smoke as post-RLS pass.

---

### Decision D12 — Warnings are not product states

**Owner decision:** **Yes**.

**Policy meaning:** Warning codes (`phase2_identity_diagnostics_disabled`, `phase2_schema_unavailable`, `phase2_query_failed`, `phase2_result_truncated`, etc.) are **operational diagnostics only** — not PSA truth, not readiness gates, not publication states, not family-facing status. Operators must **not** treat `phase2_schema_unavailable` as proof schema is absent without separate evidence.

**What remains blocked:** Warning → go-live; warning → readiness change.

---

### Decision D13 — Single approved consumer unchanged

**Owner decision:** **Yes**.

**Policy meaning:** This planning record does **not** approve new helper importers (readiness, pipeline, Route, UI, billing, PSA paths). **Approved consumer remains** `scripts/diagnose-school-identity-phase2-readonly.mjs` only per contract/ADR until a **separate** owner gate + ADR/contract update.

**What remains blocked:** Helper/pipeline/readiness integration; new consumers.

---

### Decision D14 — Elevated read path ≠ family protection proof

**Owner decision:** **Yes**.

**Policy meaning:** Diagnostics/helper running with service key or other elevated read (per contract/ADR) is **internal maintenance/observe only** — **not** proof that families are protected via product paths (C12, N8). Product denial proof remains **negative-test pass** on the real target.

**What remains blocked:** Diagnostics success = family safety proof.

---

### Decision D15 — Dependencies unchanged

**Owner decision:** **Yes**.

**Policy meaning:** Planning adoption does **not** unblock: live snapshot evidence; negative-test execution/pass; execution packet; apply; runtime/write; PSA; Route; Phase 3/4. Post-RLS compatibility **pass** remains a **separate future gate** after planning and (typically) per-target evidence and an RLS change event.

**What remains blocked:** Skipping chain via planning alone.

---

### Decision D16 — STAGING compatibility never substitutes MAIN

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** compatibility results never replace **MAIN-OWNER-USED** / **PROD** pass without **parity evidence** (C14) and a **separate MAIN** decision. Diagnostics behavior is part of parity checks.

**What remains blocked:** STAGING compatibility → MAIN approval shortcut.

---

### Decision D17 — Good restored state includes diagnostics behavior

**Owner decision:** **Yes**.

**Policy meaning:** Operational **good restored state** (C7) must include **diagnostics restored to prior behavior** on that **same target**. Operational values remain **open** until per-target evidence exists, compatibility results are reviewed where applicable, and values are recorded owner-held.

**What remains blocked:** Closing good-state values without diagnostics behavior criterion.

---

### Decision D18 — Rollback trigger on diagnostics failure

**Owner decision:** **Yes**.

**Policy meaning:** Post-RLS diagnostics/helper **FAIL** or **UNCLEAR** on the RLS path is a **rollback trigger candidate** and **scheduling stop** (aligns with C6 accountability rollback list). Fail/unclear = stop (N11).

**What remains blocked:** Warning-only continue after RLS when RLS-path is UNCLEAR/FAIL.

---

### Decision D19 — FORCE / bypass / cleanup unchanged

**Owner decision:** **Yes**.

**Policy meaning:** This record does **not** adopt FORCE RLS (C13 deferred), bypass posture, cleanup, migration, or new Supabase project. It **informs** those topics only.

**What remains blocked:** FORCE/bypass/cleanup approval via this gate.

---

### Decision D20 — Stricter safety rule wins

**Owner decision:** **Yes**.

**Policy meaning:** Stricter checklist, canonical contract/ADR, or prior owner record wins on conflict.

**What remains blocked:** Weakening child-data or no-execution rules.

---

## Target compatibility planning table

| Target label | Target role | Check required now? | Future run allowed by this record? | Compatibility pass required later? | Reviewer requirement | Storage default | Can substitute MAIN/PROD? | Execution/apply approved? |
|--------------|-------------|---------------------|-------------------------------------|-----------------------------------|----------------------|-----------------|---------------------------|---------------------------|
| **MAIN-OWNER-USED** / **PROD** | **Primary safety target** | **No** | **No** (separate future gate) | **Yes** — stricter | **OWNER**; optional **EXTERNAL_SECURITY_REVIEWER**; **TECH_EXECUTOR** not sole reviewer | Owner-held detail; git summaries only | N/A | **No** |
| **STAGING-34B** | Optional rehearsal | **No** | **No** (separate future gate) | **Yes** if rehearsal used | **OWNER** review; lighter than MAIN | Owner-held detail; git summaries only | **No** | **No** |
| **ISOLATED-LAB** | Historical only | **No** | **No** | **No** for real targets | N/A | Historical only | **No** | **No** |

---

## RLS-path result interpretation table

| Result | On RLS path after RLS change | Scheduling / packet / apply planning |
|--------|------------------------------|--------------------------------------|
| **PASS** | Compatibility acceptable for **discussion** of next gates on that target | Does **not** approve apply or packet draft |
| **FAIL** | **Stop**; rollback trigger candidate | Blocked |
| **UNCLEAR** | **Stop**; treat as unresolved (N11) | Blocked |

**Unclear examples:** Route/PSA not wired — outcomes for those rows unclear → **UNCLEAR**, not pass by omission (N11).

---

## Future run / review role table

| Role label | Future run allowed by this record? | Future review allowed? | MAIN-specific | Forbidden interpretation | Real names in git? |
|------------|-----------------------------------|------------------------|---------------|--------------------------|-------------------|
| **TECH_EXECUTOR** | **No** — later gate only | **No** as sole MAIN reviewer | May run if later approved | “Ran tool → approved” | **No** |
| **OWNER** | **No** — later gate only | **Yes** — both targets | Authorizes MAIN run | Label = human name | **No** |
| **EXTERNAL_SECURITY_REVIEWER** | **No** | Optional on MAIN | Second review | Mandatory everywhere | **No** |
| **ROLLBACK_OWNER** | **No** | **No** for baseline sign-off | Rollback only | Baseline runner | **No** |
| **SECURITY_APPROVER** | **No** | **Yes** (= OWNER unless split) | Alias | Shadow approval chain | **No** |
| **not assigned yet** | **No** | **No** | Assign later | Default OK | **No** |

---

## Storage posture table

| Storage class | Allowed content | Git? |
|---------------|-----------------|------|
| **Safe summaries in git** | Target label; date; PASS/FAIL/UNCLEAR; warning codes only; schema-available boolean; aggregate counts; blocked statement | **Yes** (summaries) |
| **Owner-held detailed output** | Full JSON, maps, long warnings | **No** (default) |
| **Future redacted artifact** | Shareable summary without D9 items | **Only after separate gate** |
| **Prohibited in git** | project_ref, URLs, keys, connection strings, raw dumps, detailed per-school maps, tokens | **Never** |
| **.env / runtime config** | Secrets, env gates | **Never** via this record |

---

## Fail-open vs fail-safe (binding)

```text
[Tool layer — contract fail-open]
  tables missing / query failed → empty diagnostics + warning
  MUST NOT change readiness, writes, PSA, Route by itself

[RLS path layer — this record fail-safe]
  AFTER any RLS change on target:
    PASS   → may inform future gate discussion only
    FAIL   → stop + rollback trigger candidate
    UNCLEAR → stop (no silent OK)
```

---

## Compatibility-use boundary

| Statement | Binding |
|-----------|---------|
| Planning adopted | ≠ compatibility pass executed |
| Compatibility pass later | ≠ negative-test pass |
| Compatibility pass later | ≠ apply readiness |
| Compatibility pass later | ≠ execution packet approval |
| STAGING result | ≠ MAIN/PROD result |
| Tool success pre-RLS | ≠ post-RLS pass |
| Diagnostics output | ≠ publication / readiness / family truth |

---

## Relationship to negative tests / packet / evidence

- **Negative-test plan** (N9): diagnostics **observe only**; denial proof = negative tests, not diagnostics.
- **Snapshot evidence planning** (E11): baseline before RLS; re-check after RLS recorded in owner-held evidence when captured.
- **Execution packet:** requires planning + evidence + negative-test pass + compatibility **pass** + separate gates — not satisfied by this record.
- **Negative-test execution:** separate gate; not approved here.

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| D0–D20 diagnostics compatibility **planning** policy | Post-RLS compatibility **pass** (execution) |
| MAIN/PROD primary; STAGING optional framing | Live diagnostics re-run on real targets |
| Fail-open vs fail-safe two-layer rule | Live snapshot evidence values |
| PASS/FAIL/UNCLEAR interpretation on RLS path | Negative-test execution/pass |
| Before/after RLS re-test planning rule | Execution packet |
| Owner-held default; safe summary storage | Gate 34B / apply tracks |
| Single consumer unchanged; no pipeline integration | FORCE **enablement** |
| STAGING ≠ MAIN substitution rule | Parity evidence |
| Good-state diagnostics behavior criterion (policy) | Operational good-state **values** |
| Rollback trigger on FAIL/UNCLEAR (policy) | Helper/pipeline integration |
| | Runtime/write, rows, PSA, Route, Phase 3/4 |
| | Cleanup/migration/new project |

---

## Archive table (D0–D20)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| D0 | Scope: planning only | Yes | Adopted | Non-execution |
| D1 | Planning ≠ compatibility pass | Yes | Adopted | Pre-RLS smoke ≠ pass |
| D2 | Separate per target | Yes | Adopted | T6 |
| D3 | MAIN stricter | Yes | Adopted | Production-like |
| D4 | MAIN primary; STAGING optional | Yes | Adopted | E4 aligned |
| D5 | Run roles: TECH_EXECUTOR; OWNER auth MAIN | Yes | Adopted | Labels only |
| D6 | Review: OWNER; executor not sole on MAIN | Yes | Adopted | SECURITY_APPROVER = OWNER |
| D7 | Owner-held detail default | Yes | Adopted | No dumps in git |
| D8 | Git safe summaries only | Yes | Adopted | PASS/FAIL/UNCLEAR |
| D9 | Prohibited data never in git | Yes | Adopted | No secrets |
| D10 | Fail-open tool; fail-safe RLS path | Yes | Adopted | Two layers |
| D11 | Baseline before + re-check after RLS | Yes | Adopted | E11/C11 |
| D12 | Warnings ≠ product states | Yes | Adopted | ADR §4 |
| D13 | Single consumer; no new importers | Yes | Adopted | Contract freeze |
| D14 | Elevated read ≠ family proof | Yes | Adopted | C12/N8 |
| D15 | Dependencies unchanged | Yes | Adopted | Chain intact |
| D16 | STAGING ≠ MAIN pass | Yes | Adopted | C14 |
| D17 | Good state includes diagnostics restored | Yes | Adopted | C7 policy |
| D18 | FAIL/UNCLEAR = stop + rollback trigger | Yes | Adopted | N11 |
| D19 | FORCE/bypass/cleanup separate | Yes | Adopted | C13 deferred |
| D20 | Stricter wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

This record logs **RLS diagnostics compatibility planning policy** at documentation level only. It does **not** select an execution gate, live diagnostics re-run, compatibility **pass** claims, live snapshot collection, negative-test **execution**, FORCE **decision**, parity **evidence**, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: negative-test **execution** planning (separate gate); redacted evidence artifact planning; live snapshot collection gate; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, live snapshot collection, diagnostics re-run execution, test execution, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS FORCE RLS policy (F0–F18) per `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — first apply: FORCE excluded; no FORCE enabled; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS parity evidence planning (P0–P18) per `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` — planning only; no parity evidence collected; no STAGING→MAIN transfer approved; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS diagnostics compatibility **planning** policy is owner-adopted in this record at documentation level only (D0–D20). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_DIAGNOSTICS_COMPATIBILITY_PLANNING_POLICY_ADOPTED_DOCS_ONLY** does **not** mean diagnostics were re-run, passed, or apply is ready. **Planning adopted ≠ compatibility pass ≠ tests run ≠ apply approved.** **MAIN-OWNER-USED** / **PROD** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** and **never** substitutes MAIN/PROD compatibility results or approval. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
