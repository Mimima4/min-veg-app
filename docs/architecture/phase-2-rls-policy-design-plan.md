# Phase 2 RLS/Policy Design Plan

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Documentation-only RLS/policy design planning |
| **Scope** | Phase 2 RLS/policy intent before any future implementation |
| **Repository checkpoint** | `c59db6b Add Phase 2 RLS security owner decisions` |
| **Created at (UTC)** | 2026-05-13 |
| **CONTEXT_WARN** | None — `git log -1 --oneline` matches expected checkpoint. |
| **No SQL** | Yes |
| **No RLS enablement** | Yes |
| **No policy creation** | Yes |
| **No DB writes** | Yes |
| **No runtime/write approval** | Yes |
| **No app integration approval** | Yes |
| **No PSA approval** | Yes |
| **No Route approval** | Yes |
| **No Phase 3 approval** | Yes |
| **No partial integration approval** | Yes |
| **Child-information protection principle** | Applies — maximum protection, truthfulness, and data-safety over speed (per Gate 24 owner record). |

This document translates **owner/security posture** into **design intent** only. It does **not** implement RLS, create policies, approve access, approve writes, or unlock integration.

---

## 3. Source basis

The following repository documents were read for context when authoring this plan:

- `docs/architecture/phase-2-rls-security-review-plan.md` (Gate 23)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` (Gate 24)
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

**This file does not modify** any of the above sources.

---

## 4. Gate 24 traceability

| Gate 24 owner/security decision | This design-plan area | Still blocked |
|----------------------------------|----------------------|---------------|
| **deny-by-default** required | §5 Design principles; §6 default posture for every table | RLS/policies not applied; no allow paths in force |
| **anon** direct access forbidden | §5; §7 actor row **anon** | Enforcement not implemented |
| **authenticated** direct access forbidden | §5; §7 actor row **authenticated user** | Enforcement not implemented |
| **frontend** direct access forbidden | §5; §7 actor row **frontend** | Enforcement not implemented |
| **Route** raw-table direct access forbidden | §5; §7 actor row **Route Engine**; §8 tests | No Route SQL/API surface to raw tables |
| **PSA** raw-table direct access forbidden | §5; §7 actor row **PSA**; §8 tests | No PSA shortcut reads/writes |
| **internal backend read** only later by gate | §6 future read intent column (all tables); §7 internal backend read path | No approved server-side read gate |
| **internal backend write** currently forbidden | §6 future write intent column (all tables); §7 internal backend write path | All writes blocked |
| **operator/reviewer** no direct DB access | §7 operator/reviewer workflow row | No approved workflow implementation |
| **service role** not automatically approved | §7 service role row | No process-specific approval |
| **RLS/policy design before writes/runtime** | §9 implementation gates; overall document scope | Design-only; no activation |
| **tests mandatory** before implementation | §8 required future tests | Tests not written or run by this doc |
| **no partial integration** | §5; §7; §10 forbidden shortcuts | Full contour unexecuted |
| **child-information protection** principle | §5; sensitivity column emphasis in §6 | Principle does not implement controls |

---

## 5. Design principles

- **Deny-by-default** for every Phase 2 table under future RLS/policy work.  
- **No** anonymous direct access to Phase 2 tables.  
- **No** authenticated end-user direct access to Phase 2 tables.  
- **No** frontend direct access to Phase 2 tables.  
- **No** Route Engine direct access to **raw** Phase 2 tables.  
- **No** PSA direct access to **raw** Phase 2 tables.  
- **Future server-side access** (if any) is only a **possible gated design area**, not active access.  
- **Least privilege** for any future allow paths (none defined here).  
- **Auditability** required for any future operational path.  
- **No raw evidence leakage** to family-facing runtime, PSA publication surfaces, or Route consumption paths.  
- **No partial integration** before the relevant contour is fully created, reviewed, security-approved, tested, and owner-approved end-to-end.  
- **Child-information protection over speed** — security and truthful presentation take priority.  
- **Minimize exposure** of child-related and school-related truth-contour data outside approved, explicit publication flows.  

---

## 6. Table-level policy intent

Table names match `CREATE TABLE` identifiers in `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`. **No** final grants. **No** role × table matrix. **No** access approval.

| Table | Sensitivity | Default posture | Future read intent | Future write intent | Required tests before implementation | Still blocked |
|--------|-------------|------------------|--------------------|--------------------|--------------------------------------|---------------|
| `source_school_observations` | Immutable source evidence; child/school context | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads | RLS off; policies absent; integration absent |
| `school_identity_candidates` | Generated candidates; ambiguity signals | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads | RLS off; policies absent; integration absent |
| `identity_aliases` | Identity linking evidence | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads | RLS off; policies absent; integration absent |
| `school_locations` | Location/identity correlation | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads | RLS off; policies absent; integration absent |
| `school_identity_resolution_decisions` | Authoritative internal decisions | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads; supersession/rollback integrity if ever implemented | RLS off; policies absent; integration absent |
| `programme_availability_publication_decisions` | Adjacent to publication gate; high impact | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads; no PSA conflation; no silent mutation | RLS off; policies absent; integration absent |
| `school_identity_review_events` | Operator audit trail | deny-by-default | Not active. Not approved. Separate owner/security + implementation gates required. | Not active. Not approved. Separate owner/security + implementation gates required. | Deny anon/auth/frontend/Route/PSA raw access; contract-bounded diagnostics must not widen; no publication truth from raw reads; tamper/evidence integrity if ever modeled | RLS off; policies absent; integration absent |

---

## 7. Actor intent

| Actor / path | Design intent | Direct DB access? | Still blocked? |
|--------------|---------------|-------------------|----------------|
| **anon** | No path to Phase 2 data; deny-by-default under future policy work. | **NO** | Yes — policies/RLS not applied |
| **authenticated user** | No end-user path to raw Phase 2 tables. | **NO** | Yes |
| **frontend** | No browser/mobile direct DB to Phase 2 tables. | **NO** | Yes |
| **Route Engine** | Must not read **raw** Phase 2 tables; any future boundary is a separate approved design. | **NO** | Yes |
| **PSA** | Must not read/write **raw** Phase 2 tables as publication shortcut. | **NO** | Yes |
| **diagnostics/helper** | **Only** within the **frozen** standalone scope of `phase-2-read-only-diagnostics-contract.md` and `phase-2-read-only-diagnostics-helper-boundary-adr.md`; outputs **must not** become publication truth; widening consumers requires **separate owner gate + ADR/contract update** (per those docs). | **NO** for product/runtime/PSA/Route surfaces; contract-bounded standalone tooling is **not** expanded or re-approved here | Yes — any expansion, new consumers, or policy relaxation remains gated |
| **internal backend read path** | Placeholder for a possible future **server-side, audit-friendly** gate only. | **NO** (not active) | Yes |
| **internal backend write path** | **Forbidden** until write-path design, RLS/policy QA, and owner/security approval. | **NO** | Yes |
| **operator/reviewer workflow** | No **direct DB** access; any future surface is server-mediated workflow only. | **NO** | Yes |
| **service role** | **Not** automatically approved by tooling availability; if ever used per process, requires explicit owner/security approval, least privilege, audit. | **NO** as a default or implied product path | Yes |

---

## 8. Required future tests

Before any RLS/policy **implementation** can be accepted, the following **future QA specifications** must be satisfied (they are **not** claimed by this document):

- **anon** denied access to Phase 2 tables  
- **authenticated** denied access to Phase 2 tables  
- **frontend** direct DB denied  
- **Route** cannot read **raw** Phase 2 tables  
- **PSA** cannot read **raw** Phase 2 tables  
- **writes** denied unless explicitly approved by a future gate  
- **diagnostics** cannot become **publication truth**  
- **no raw evidence** leaks to runtime / PSA / Route  
- **service role** usage audited **if** later approved per process  
- **rollback/supersession** protected **if** later implemented  

These tests are future QA specifications only; this document does not claim the tests exist, have run, or have passed.

---

## 9. Implementation gates still required

This document **approves none** of the following gates. This list **aligns with** the Gate 24 future-gate **intent** for the SQL/RLS slice but **does not execute or unlock** any gate; **broader** ordered gates (design QA, write-path QA, production/publication flows, PSA/Route boundary QA, full E2E) remain in **Gate 24 §7**.

1. RLS/policy SQL draft gate  
2. SQL review gate  
3. security approval gate  
4. staging application gate  
5. post-apply read-only verification  
6. negative access tests  
7. write-path design gate  
8. end-to-end contour approval before app/runtime integration  

---

## 10. Forbidden shortcuts

The following are **invalid inferences** — **not** allowed behavior:

- policy design exists → policies created  
- policy design exists → RLS enabled  
- deny-by-default documented → security complete  
- service role available → service role approved  
- backend path imagined → backend access approved  
- tests listed → tests passed  
- RLS plan exists → DB writes approved  
- RLS plan exists → runtime/write approved  
- RLS plan exists → PSA/Route/Phase 3 approved  
- RLS plan exists → partial app integration allowed  

---

## 11. Final boundary statement

Phase 2 RLS/policy design is documentation-defined here, but RLS enablement, policy creation, DB writes, runtime/write integration, PSA publication, Route Engine consumption, Phase 3, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
