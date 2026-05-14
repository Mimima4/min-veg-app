# Phase 2 RLS/Security Owner Decision Record

## 2. Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security decision record |
| **Scope** | Phase 2 RLS/security model before future policy design |
| **Repository checkpoint** | `3b52136 Add Phase 2 RLS security review plan` |
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
| **Child-information protection principle** | Maximum protection, truthfulness, and data-safety are **non-negotiable**; security and truthful presentation take priority over speed (owner decision). |

This file records owner/security decisions at **documentation level only**. It does **not** implement RLS, create policies, approve writes, approve runtime or app integration, approve PSA/Route/Phase 3, or close the full contour end-to-end.

---

## 3. Source basis

The following repository documents were read for context when authoring this record:

- `docs/architecture/phase-2-rls-security-review-plan.md` (Gate 23)
- `docs/architecture/phase-2-runtime-write-closure.md`
- `docs/architecture/phase-2-production-truth-closure.md`
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md`
- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `supabase/migrations/20260506112154_school_identity_location_resolution_phase2.sql`

---

## 4. Mapping from Gate 23 planning questions

Gate 23 posed **open** planning questions (§7 Read actors, §8 Write actors, §9 RLS/policy design). This section records how **owner-approved decisions** (stated in the Gate 24 execution brief) **answer those areas at documentation level** only. **Nothing here is active implementation.**

| Gate 23 question area | Owner decision recorded here | Still blocked |
|------------------------|-------------------------------|---------------|
| **Internal-only tables** (which tables are internal-only) | All seven Phase 2 tables remain **internal truth-contour** data; they are not exposed for direct client, Route, or PSA consumption of **raw** table access. | Schema exists in some environments; **RLS not enabled**; **no** approved read/write paths; **no** integration. |
| **Roles that must never access directly** | **anon** and **authenticated** direct access to Phase 2 tables are **forbidden**. **Frontend** direct access is **forbidden**. **Route** and **PSA** direct access to **raw** Phase 2 tables are **forbidden**. | Any technical enforcement (RLS, policies, server routes) is **future work** behind separate gates. |
| **Future read access** | Internal backend read may be **considered later** only through a **separate**, **owner-approved**, **server-side**, **audit-friendly** gate. **Not active now.** | No server-side read path is approved or built by this document. |
| **Future write access** | Internal backend write is **currently forbidden**; may be **considered later** only after **write-path design**, **RLS/policy QA**, and **owner/security approval**. **Not active now.** | All writes remain blocked until those gates. |
| **Blocked paths** | **Deny-by-default** is **required** before any Phase 2 write or runtime use. **No partial integration** until the full contour is done. | Every integration and enforcement step remains blocked (see §7). |
| **Owner/security answers before policy design** | **RLS/policy design** must be **approved** before any writes or runtime use. **Tests before implementation** are **mandatory** (anon denied, authenticated denied, writes denied unless explicitly approved, no raw evidence leaks to runtime/PSA/Route, no Phase 2 table becomes a public API). | Policy design, implementation, QA, and approvals are **not** executed by this record. |

---

## 5. Owner/security decisions

Rules applied in this table: **no SQL**, no policy pseudocode, no `USING`/`WITH CHECK`, no final role × table matrix. Any **future** allowance is **not active now** and still requires **separate owner/security approval** and downstream gates.

| Topic | Decision | Meaning | Still blocked |
|--------|----------|---------|----------------|
| **deny-by-default** | **Required** before any Phase 2 write or runtime use. | Default posture is deny; explicit allow paths come only after policy design and approvals. | RLS/policies not applied; no allow paths in force. |
| **anon direct access** | **Forbidden.** | Anonymous principals must not read or write Phase 2 tables directly. | Enforcement via RLS/policies and architecture is **not** done here. |
| **authenticated direct access** | **Forbidden.** | Authenticated end-user principals must not access Phase 2 tables directly. | Same as above. |
| **frontend direct access** | **Forbidden.** | No browser or mobile client may touch Phase 2 tables directly. | Same as above. |
| **Route direct access** | **Forbidden** for **raw** Phase 2 tables. | Route must not consume these tables as a direct SQL/API surface. | Any future boundary must be a **separate** approved design; not active now. |
| **PSA direct access** | **Forbidden** for **raw** Phase 2 tables. | PSA must not read/write these tables directly as a shortcut to publication truth. | Same as above. |
| **internal backend read access** | **Not active now.** May be **considered later** only through a **separate owner-approved server-side, audit-friendly gate.** | Reads, if ever allowed, are server-mediated and gated—never a silent default. | No approved read gate exists; no implementation. |
| **internal backend write access** | **Currently forbidden.** May be **considered later** only after **write-path design**, **RLS/policy QA**, and **owner/security approval.** | Writes remain off until explicit future gates. | All writes and write actors remain blocked. |
| **operator/reviewer access** | **Not** via **direct DB access.** If ever allowed, **only** through an **approved server-side review workflow** (separate gate). | Operators work through controlled surfaces, not ad hoc SQL to production. | No such workflow is approved or built by this document. |
| **service-role usage** | **Not automatically approved** by tooling availability. If **later** needed: **server-side only**, **least-privilege by process**, **audited**, **owner/security-approved**—each as a **separate** decision. | Service role is a high-privilege tool, not an implicit green light. | No process-specific service-role policy is approved here. |
| **RLS before writes/runtime** | **RLS/policy design must be approved** before any writes or runtime use of Phase 2 data paths. | Design and sign-off precede implementation and activation. | RLS not enabled; policies not created; no runtime paths. |
| **policy test requirements** | **Mandatory before implementation:** anon denied; authenticated denied; write denied unless explicitly approved; **no** raw evidence leaks to runtime/PSA/Route; **no** Phase 2 table becomes a **public API**. | QA bar is explicit; no “ship first, test later.” | Tests do not exist until implementation gates run. |
| **no partial integration** | **No** app/runtime/PSA/Route/pipeline/user-facing integration until the **relevant contour** is fully **created, reviewed, security-approved, tested, and owner-approved end-to-end.** | No ripped connections or half-closed slices. | Entire downstream contour remains unexecuted from this document. |
| **child-information protection principle** | Min Veg works with and for information about **children**; **maximum protection**, **truthfulness**, and **data-safety** are **non-negotiable**; security and truthful presentation **take priority over speed.** | Shapes trade-offs for all future design. | Does not, by itself, implement controls or close any technical gate. |

---

## 6. Explicit non-approvals

This record explicitly **does not** approve or execute:

- no RLS enablement  
- no `CREATE POLICY`  
- no migration changes  
- no DB writes  
- no runtime/write  
- no app integration  
- no PSA  
- no Route  
- no Phase 3  
- no partial pipeline/readiness connection  
- no user-facing exposure of raw Phase 2 evidence  

---

## 7. Future implementation gates required

**Ordering intent only.** This list is **not** approval to execute these gates now. Each gate requires its own owner-approved charter and completion criteria.

1. RLS/policy design prompt  
2. RLS/policy design QA  
3. owner/security approval  
4. migration/policy application gate  
5. post-apply verification  
6. write-path design gate  
7. write-path QA  
8. production truth flow QA  
9. publication flow QA  
10. PSA/Route boundary QA  
11. end-to-end contour approval before any app/runtime integration  

---

## 8. Final boundary statement

Phase 2 RLS/security owner decisions are documentation-defined here, but RLS enablement, policy creation, DB writes, runtime/write integration, PSA publication, Route Engine consumption, Phase 3, and any partial app integration remain blocked until separate owner-approved security and implementation gates.
