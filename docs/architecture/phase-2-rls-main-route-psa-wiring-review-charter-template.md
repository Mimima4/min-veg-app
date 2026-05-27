# Phase 2 RLS MAIN Route/PSA Wiring Review — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before review |
| **Review type** | Route/PSA **wiring review** (read-only) |
| **Gate** | `phase-2-rls-main-route-psa-wiring-review-gate-owner-decision-record.md` (XR0–XR21; Section **X**) |
| **Basis checkpoint** | `75108ca` (or HEAD after Section **X** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** Supabase negative tests (unless owner later adopts a **separate** execution gate); DML; test rows; RLS/policy changes; claiming full Q4/N12 pass; storing secrets or raw rows in git.

**Allowed (bounded):** repo/docs/spec search; owner-held architecture notes; optional **read-only** live metadata checks **owner-held** only.

---

## 1. Charter approval (owner-held)

| Field | Fill before review |
|-------|---------------------|
| Charter ID | e.g. `MAIN-RP-WIRING-YYYY-MM-DD-01` |
| **OWNER** / **SECURITY_APPROVER** | yes — names **owner-held** |
| W-post / W-Q4 cited | yes |

---

## 2. Preconditions

| Prerequisite | Confirmed? |
|--------------|------------|
| W-post — client-role denial PASS; Route/PSA UNCLEAR at Tranche B | yes / no |
| W-Q4 — reviewed-with-limitation | yes / no |
| U-post — RLS on all 7; 14 policies; rows 0 | yes / no |
| V-post — RLS-path PASS | yes / no |
| XR gate adopted | yes / no |

---

## 3. Seven Phase 2 tables (check each for Route and PSA)

| Table | Route touches? (yes/no/unclear) | PSA touches? (yes/no/unclear) | Notes owner-held |
|-------|--------------------------------|-------------------------------|------------------|
| source_school_observations | | | |
| school_identity_candidates | | | |
| identity_aliases | | | |
| school_locations | | | |
| school_identity_resolution_decisions | | | |
| programme_availability_publication_decisions | | | |
| school_identity_review_events | | | |

---

## 4. Review checklist (owner-held detail)

| Check | Done? | Finding (safe label) |
|-------|-------|----------------------|
| App/repo search for table names | | |
| Supabase client usage in Route paths | | |
| Supabase client usage in PSA/publication paths | | |
| Published-truth tables only (no raw Phase 2)? | | |
| service_role / batch jobs touching Phase 2? | | |
| Diagnostics/helper ≠ Route/PSA proof | | |
| MAIN vs STAGING/LAB scope respected | | |

---

## 5. Outcome labels (for X-post)

| Layer | Label (pick one) |
|-------|------------------|
| Route | `ROUTE_NO_TOUCH_PHASE2_TABLES_CONFIRMED` / `ROUTE_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` / `ROUTE_WIRING_UNCLEAR_STOP` |
| PSA | `PSA_NO_TOUCH_PHASE2_TABLES_CONFIRMED` / `PSA_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` / `PSA_WIRING_UNCLEAR_STOP` |

---

## 6. Verdict (after owner review)

| Field | Value |
|-------|--------|
| Wiring review performed | yes / no |
| Limitation narrowed vs W-post | yes / no / partial |
| Negative-test execution gate needed | yes / no |
| Full Q4 pass claimed | **no** (default until separate decision) |
| N12 packet pass | **no** |
| NOT_READY_FOR_APPLY | **unchanged** (default) |

---

## 7. Sign-off (owner-held)

| Role | Approved? | Date |
|------|-----------|------|
| OWNER | | |
| SECURITY_APPROVER | | |
