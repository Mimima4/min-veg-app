# Phase 2 RLS Snapshot Requirements Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security snapshot requirements decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_SNAPSHOT_REQUIREMENTS_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Per-target snapshot **requirements** policy only (S0–S14) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `d732d98 Add Phase 2 RLS accountability owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section J (RLS snapshot requirements policy) |

This file records **owner-agreed requirements** for **future** per-target RLS snapshot evidence at **documentation level only**. It defines **what must be captured** before negative-test planning, operational good-restored-state values, or execution packet **discussion** — it does **not** collect snapshot evidence, does **not** satisfy snapshot evidence, does **not** make RLS apply ready, and does **not** allow execution packet drafting.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw child/school table rows, screenshots with secrets, or other prohibited items listed in Decision S7. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — live per-target snapshots, passing negative tests, parity, FORCE decision, and other operational preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gate after requirements **and** per-target evidence exist |
| **RLS_SNAPSHOT_REQUIREMENTS_POLICY_ADOPTED_DOCS_ONLY** | Tier 1/Tier 2 field requirements and storage posture logged on paper only; does **not** mean apply is safe or ready |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (A10 good-restored-state policy, A11 naming ≠ execution approval).
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C2 re-snapshot, C7 good restored state, C9–C10 negative tests, C11 diagnostics, C13 FORCE deferred, C14 parity).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T8 per-target snapshots, T10 operational preconditions, private labels).
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q-record), `docs/architecture/phase-2-rls-security-owner-decision-record.md`.
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md`, `docs/architecture/phase-2-staging-rls-execution-packet.md` (packet §5 is a **template** only), `docs/architecture/phase-2-isolated-test-rls-evidence-record.md`, `docs/architecture/phase-2-main-supabase-rollout-checklist.md`, `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`.
- **Uses private target labels:** **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **ISOLATED-LAB** (historical only — **must not** be copied as baseline).
- **MAIN-OWNER-USED** is **production-like / higher-risk**; snapshot requirements for MAIN are **stricter** than for STAGING-34B (Decision S3).
- **Does not** reopen prior owner records unless an explicit owner gate says so.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase connect or apply approval
- live snapshot collection or evidence satisfaction
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- proof that operational preconditions are satisfied
- execution packet approval or drafting permission
- runtime/write integration approval
- Phase 2 observation / candidate / decision / publication row write approval
- operational production truth closure
- PSA publication or materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- helper / pipeline / readiness integration approval
- Phase 3 start or implementation approval
- Phase 4 LOSA execution approval
- `.env` configuration or runtime environment-variable work
- cleanup, migration, deletion, or new-project creation approval
- storage of secrets, connection strings, raw child/school evidence rows, or security-sensitive grant dumps in git

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — accountability policy (complementary)
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — preconditions policy (complementary)
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — target-map policy (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — readiness policy (complementary)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — Gate 32 staging decision (reference)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — packet template (reference; **not** permission)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated lab evidence (historical; not reusable baseline)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main schema-only rollout context
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule S0

All **Yes** decisions in this record (S1–S14) mean **snapshot requirements policy on paper only**.

None of S1–S14 authorizes SQL, Supabase connect or apply, live snapshot collection, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (S14)

If a stricter rule exists in the evidence model, governance/review, production truth, or runtime/write owner records; the RLS apply readiness, preconditions, target-map, accountability, or security owner records; canonical specs; or the controlling checklist, the **stricter safety rule wins**.

No snapshot requirements record may weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.

---

## Owner/security snapshot requirements decisions (S0–S14)

### Decision S0 — Scope / non-execution

**Owner decision:** **Yes**.

This session adopts **snapshot requirements policy only** — what future per-target evidence must contain and how it may be stored. It does **not** schedule, approve, or execute any database change, live read-only capture, or product integration.

**What remains blocked:** SQL, Supabase connect, live snapshots, execution packet, Gate 34B, all apply tracks, runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, Phase 4.

### Decision S1 — Requirements before next RLS gates

**Owner decision:** **Yes**.

Adopted snapshot **requirements** are **required before** negative-test **planning**, before operational good-restored-state **values**, and before execution packet **discussion**.

**What remains blocked:** Negative-test implementation, operational good-state closure, execution packet draft, all apply.

### Decision S2 — Targets

**Owner decision:** **Yes**.

Snapshot requirements apply to **STAGING-34B** and **MAIN-OWNER-USED**. **ISOLATED-LAB** is **historical only** and must **not** be used as a baseline template. **PROD = MAIN-OWNER-USED for now** for planning (same requirements as MAIN until a separate production project is validated).

Staging table presence must **not** be assumed from MAIN; each target is captured separately in a **future** evidence gate.

**What remains blocked:** Treating ISOLATED-LAB, staging-only evidence, or schema rollout logs as MAIN/STAGING snapshot satisfaction.

### Decision S3 — MAIN stricter than STAGING

**Owner decision:** **Yes**.

**MAIN-OWNER-USED** snapshot requirements are **stricter** than **STAGING-34B** (more fields enforced at owner-held sign-off, no shortcuts, slower gates).

**What remains blocked:** MAIN stricter requirements ≠ permission to change MAIN; STAGING evidence ≠ MAIN approval without parity (C14).

### Decision S4 — Tier 1 mandatory fields

**Owner decision:** **Yes**.

Tier 1 mandatory fields in the table below are **required** for every future per-target snapshot on **STAGING-34B** and **MAIN-OWNER-USED**.

**What remains blocked:** Tier 1 requirements ≠ snapshot collected; apply; packet.

### Decision S5 — Tier 2 mandatory fields

**Owner decision:** **Yes**.

Tier 2 mandatory fields are **required before** execution packet **discussion** and before treating failed security checks on a **real** target as meaningful for apply planning.

**What remains blocked:** Tier 2 requirements ≠ FORCE decision adopted; packet draft; apply.

### Decision S6 — Storage posture

**Owner decision:** **Yes**.

Git may store **safe private labels** and **safe aggregates** only (for example: table count, row counts as numbers, on/off per table, policy counts). Target-specific capture details default to **owner-held** or a **future redacted evidence artifact** gate explicitly approved for git.

**What remains blocked:** Pasting live capture dumps, secrets, or raw evidence into git without a later gate.

### Decision S7 — Never store in git

**Owner decision:** **Yes**.

The following must **not** be stored in this record or routine git documentation for snapshot evidence: API keys; service keys; connection strings; raw child/school table rows; screenshots containing secrets or raw evidence; full grant matrices if security-sensitive; sensitive role details if risky; dashboard URLs; **new** `project_ref` entries in this artifact (historical docs elsewhere are not a license to copy forward).

**What remains blocked:** N/A (hygiene rule); does not authorize git storage elsewhere without explicit gate.

### Decision S8 — Diagnostics / helper baseline

**Owner decision:** **Yes**.

Diagnostics/helper behavior must be **recorded at baseline** on each target **before** any RLS change on that target and **re-checked after** any RLS change. Diagnostics/helper output must **not** drive publication, readiness, writes, PSA, or Route truth.

**What remains blocked:** Diagnostics success ≠ families protected; helper/pipeline integration.

### Decision S9 — Good restored state

**Owner decision:** **Yes**.

Operational good-restored-state **values** remain **unresolved** until a per-target snapshot exists for that same target. Good-state **policy** from accountability (A10) is adopted; **values** are not.

**What remains blocked:** Declaring rollback-ready good state without per-target snapshot evidence.

### Decision S10 — Isolated lab not reusable

**Owner decision:** **Yes**.

**ISOLATED-LAB** baseline must **not** be copied to **STAGING-34B** or **MAIN-OWNER-USED** for snapshot or good-state purposes.

**What remains blocked:** Lab → staging/main shortcut; lab negative tests counting for real targets.

### Decision S11 — Relationship to negative tests

**Owner decision:** **Yes**.

Negative-test **planning** may start only **after** snapshot requirements are adopted (this record). Negative-test **implementation** on real targets requires a **later** gate and per-target snapshot **evidence** (not requirements alone). **ISOLATED-LAB** tests do **not** count for **STAGING-34B** or **MAIN-OWNER-USED**.

**What remains blocked:** Negative-test pass; apply; packet.

### Decision S12 — Relationship to execution packet

**Owner decision:** **Yes**.

Execution packet **draft** remains **forbidden** until (1) snapshot requirements are adopted (this record) **and** (2) per-target snapshot **evidence** exists (owner-held or future approved artifact) for the relevant target. Staging packet templates remain **templates only**.

**What remains blocked:** Gate 34B execution; staging apply; packet draft; apply.

### Decision S13 — FORCE / bypass

**Owner decision:** **Yes**.

**FORCE RLS** remains a **separate** owner decision (C13 deferred). Snapshot fields capture bypass/table-owner/service_role **facts** to **inform** a future FORCE decision only. Owner or high-privilege sessions are **not** proof that family-facing paths are safe.

**What remains blocked:** FORCE in first apply bundle without separate gate.

### Decision S14 — Stricter safety rule wins

**Owner decision:** **Yes**.

If this session conflicts with a stricter rule in existing owner records or the checklist, the **stricter safety rule wins**.

**What remains blocked:** Unchanged global posture (NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, EXECUTION_PACKET_DRAFT_FORBIDDEN).

---

## Tier 1 mandatory fields

| Field | Owner-friendly meaning | STAGING-34B? | MAIN-OWNER-USED? | Storage posture | Why required | Blocker if missing |
|-------|------------------------|--------------|------------------|-----------------|--------------|-------------------|
| Physical/private target label | Which environment this describes | Yes | Yes | Safe docs-level label | Prevents wrong-target apply | Wrong-target planning |
| Production-like risk level | How careful gates must be | Yes | Yes (higher) | Safe docs-level label | MAIN is production-like | Underestimated MAIN risk |
| Phase 2 tables present / absent | Seven tables exist or not on this target | Yes | Yes | Safe aggregate (list/count) | Schema-only ≠ locks; staging ≠ main | Blind DDL/RLS planning |
| Aggregate row counts per table | How many rows per table (no row content) | Yes | Yes | Safe aggregate values | Empty tables ≠ safe by themselves | False “no data risk” |
| RLS / protection on or off per table | Whether row protection is enabled | Yes | Yes | Safe aggregate per table | Locks may exist without deny rules | Unknown exposure |
| Policy / rule count per table | How many access rules exist | Yes | Yes | Safe aggregate per table | Zero vs partial vs full coverage | Unknown deny layer |
| Policy / rule names or collision posture | Whether planned rule names already exist | Yes | Yes | Owner-held or safe name list if approved | Avoid 34B-style collisions | Unsafe manual DDL |
| Table ownership / owner role | Who owns tables; bypass surprises | Yes | Yes | Owner-held summary | BYPASSRLS / owner paths | Hidden bypass |
| Grants / role posture | Who can access via DB roles | Yes | Yes | Owner-held summary (not full matrix in git) | Broad grants need explicit deny | False “RLS enough” |
| Normal app-role access posture | How app/API roles reach data | Yes | Yes | Owner-held summary | PostgREST/JWT path relevance | App path leaks |
| Family-facing / production-like character | Whether target affects real family data | Yes | Yes (stricter sign-off) | Safe docs-level label | Gate speed and review depth | Wrong urgency on MAIN |

---

## Tier 2 mandatory fields

| Field | Owner-friendly meaning | STAGING-34B? | MAIN-OWNER-USED? | Storage posture | Why required | Blocker if missing |
|-------|------------------------|--------------|------------------|-----------------|--------------|-------------------|
| FORCE RLS posture | Whether forced protection applies (inform only) | Yes | Yes | Owner-held | Separate FORCE gate (C13) | Premature FORCE bundle |
| BYPASSRLS / table-owner / high-privilege posture | Can admins bypass without app? | Yes | Yes | Owner-held facts | Not family-security proof | Hidden bypass |
| service_role posture (no keys) | Internal maintenance role facts only | Yes | Yes | Owner-held label/facts; **no keys** | High-privilege boundary | Key leakage if stored in git |
| Diagnostics / helper baseline | Read-only tool behavior before change | Yes | Yes | Owner-held summary | C11 compatibility | False diagnostics trust |
| App / API / browser path relevance | How product reaches DB (not SQL editor only) | Yes | Yes | Owner-held summary | Real attack surface | SQL-editor-only fantasy |
| Raw evidence leak posture | Risk of child/school data in logs/UI | Yes | Yes | Owner-held assessment | Child-data protection | Leak into family surfaces |
| PostgreSQL major version / compatibility | DB version for manual DDL | Yes | Yes | Safe aggregate if non-sensitive | DDL compatibility | Broken policies |
| Migration / schema-only context | What migration added vs did not (e.g. no RLS from migration on MAIN) | Yes | Yes | Safe docs-level summary | Schema-only ≠ security baseline | False readiness from DDL |
| Existing RLS / policy baseline | Live protection state (not assumed) | Yes | Yes | Owner-held capture | C2 re-snapshot; not from lab | Blind apply |

---

## Storage posture classification

| Class | Examples | Git? |
|-------|----------|------|
| Safe docs-level labels | STAGING-34B, MAIN-OWNER-USED, production-like risk | Yes |
| Safe aggregate values | Table count 7; row count 0 per table; policy count 0; RLS on/off per table | Yes |
| Owner-held values | Full capture notes; grant summaries; bypass facts; diagnostics run output | No (default) |
| Future redacted evidence artifact | Per-target snapshot packet approved for limited git | Only after explicit gate |
| Do not store in git | See Decision S7 list | **Never** |

**Explicit do-not-store items (never in git for snapshot artifacts):**

| Item | Storage |
|------|---------|
| project_ref | Do not store (unless later explicit gate for a specific artifact) |
| dashboard URL | Do not store |
| API keys | Do not store |
| service keys | Do not store |
| connection strings | Do not store |
| raw child/school rows | Do not store |
| secret screenshots | Do not store |
| full grant matrices (if security-sensitive) | Do not store |
| exact physical target identifiers beyond private labels | Do not store |
| policy names (if treated sensitive) | Owner-held default |
| grants detail (if security-sensitive) | Owner-held default |

---

## Good restored state

- Operational good-restored-state **values** cannot be closed until a **per-target snapshot** exists for that target.
- **ISOLATED-LAB** baseline must **not** be copied to **STAGING-34B** or **MAIN-OWNER-USED**.
- **STAGING-34B** and **MAIN-OWNER-USED** require **separate** baselines and separate good-state values.
- **MAIN-OWNER-USED** requires **stricter** owner sign-off because it is **production-like**.
- This record adopts **requirements** only — not operational values.

---

## Relationship to negative tests

- Negative-test **planning** requires adopted snapshot requirements (this record).
- Negative-test **implementation** requires a **later** gate and per-target snapshot **evidence**.
- **ISOLATED-LAB** negative or SQL-only tests do **not** satisfy C9–C10 for **STAGING-34B** or **MAIN-OWNER-USED**.

---

## Relationship to execution packet

- Execution packet **draft** remains **EXECUTION_PACKET_DRAFT_FORBIDDEN**.
- Packet **discussion** requires adopted requirements (this record) **and** per-target snapshot **evidence** — not requirements alone.
- `phase-2-staging-rls-execution-packet.md` remains a **template** only; it does **not** approve execution.

---

## Relationship to diagnostics / helper

- Baseline diagnostics/helper behavior is **required before** any RLS change on a target.
- Re-check is **required after** any RLS change on that target.
- Diagnostics/helper must **never** drive publication, write, PSA, Route, or readiness gates.

---

## Relationship to FORCE / bypass

- **FORCE RLS** remains a **separate** owner decision.
- Snapshot Tier 2 fields **inform** a future FORCE decision only.
- Bypass, table-owner, and service_role facts are **not** family-facing security proof.

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| S0–S14 snapshot requirements policy | Live per-target snapshots |
| Tier 1 / Tier 2 field requirements | Owner-held snapshot evidence values |
| Storage posture rules | Operational good-restored-state values |
| Diagnostics baseline requirement (policy) | Negative-test plan finalization |
| Good-state dependency on per-target snapshot (policy) | Negative-test implementation / pass |
| No ISOLATED-LAB baseline reuse rule | Diagnostics post-RLS compatibility **pass** |
| | FORCE RLS decision |
| | Parity evidence (staging → main) |
| | Rollback SQL artifact |
| | Execution packet |
| | Gate 34B |
| | Staging / main / production apply |
| | Runtime/write |
| | Phase 2 row writes |
| | PSA / Route |
| | Operator workflow |
| | Helper/pipeline integration |
| | Phase 3 / Phase 4 |
| | Cleanup / migration / new project decision |

---

## Archive table (S0–S14)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| S0 | Scope: requirements only; no live snapshot/SQL/apply | Yes | Adopted | Non-execution |
| S1 | Requirements before negative-test plan, good state, packet talk | Yes | Adopted | Not evidence |
| S2 | STAGING-34B + MAIN; lab historical; PROD=MAIN | Yes | Adopted | Separate captures |
| S3 | MAIN stricter than STAGING | Yes | Adopted | Pinned |
| S4 | Tier 1 mandatory fields | Yes | Adopted | See table |
| S5 | Tier 2 mandatory fields | Yes | Adopted | Before packet talk |
| S6 | Git: labels/aggregates; details owner-held | Yes | Adopted | S7 list |
| S7 | Never store secrets/raw rows/refs in git | Yes | Adopted | Hygiene |
| S8 | Diagnostics baseline before/after RLS change | Yes | Adopted | Not publication driver |
| S9 | Good state values open until per-target snapshot | Yes | Adopted | Complements A10/C7 |
| S10 | ISOLATED-LAB not reusable baseline | Yes | Adopted | Complements A10 |
| S11 | Negative-test plan after requirements; impl later | Yes | Adopted | Lab tests ≠ real target |
| S12 | Packet forbidden until requirements + evidence | Yes | Adopted | Template only |
| S13 | FORCE separate; bypass informs only | Yes | Adopted | C13 deferred |
| S14 | Stricter safety rule wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

This record logs **RLS snapshot requirements policy** at documentation level only. It does **not** select an execution gate, live snapshot collection, negative-test **implementation**, FORCE **decision**, parity work, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: diagnostics compatibility planning; FORCE RLS separate decision; parity planning; redacted evidence artifact planning; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS negative-test plan (N0–N16) per `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — plan only; no test execution, no pass evidence, no execution packet, no apply; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS owner-held snapshot evidence planning (E0–E18) per `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — planning only; no live snapshot, no Supabase connect, no test execution, no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS diagnostics compatibility planning (D0–D20) per `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — planning only; no diagnostics re-run, no compatibility pass, no Supabase connect, no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS FORCE RLS policy (F0–F18) per `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — first apply: FORCE excluded; no FORCE enabled; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS per-target snapshot **requirements** policy is owner-adopted in this record at documentation level only (S0–S14). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_SNAPSHOT_REQUIREMENTS_POLICY_ADOPTED_DOCS_ONLY** does **not** mean apply is ready or safe, does **not** collect snapshot evidence, and does **not** permit execution packet drafting. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
