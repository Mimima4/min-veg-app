# Phase 2 RLS MAIN Deny-Posture Apply — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** storage before session; **do not** commit secrets, bundle SQL, or rollback SQL to git |
| **Posture** | **OPTION_B** — RLS on + explicit deny policies for `anon` / `authenticated` |
| **Gate** | `docs/architecture/phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` (DA0–DA21; Section **U** when adopted) |
| **Planning gate** | `docs/architecture/phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md` (DP0–DP21; Section **T**) |
| **Basis checkpoint** | `4dabff8` (or current HEAD after DA gate commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**This template does not authorize the session by itself.** Session requires adopted **DA0–DA21**, **OWNER** / **SECURITY_APPROVER** charter approval (owner-held), **PASS_REVIEWED** or **PASS_WITH_NOTES** human SQL review, **owner-held approved SQL bundle**, and **owner-held rollback SQL artifact**.

**Forbidden under this charter:** Tranche B; write-denial tests; **INSERT** / **UPDATE** / **DELETE** / any **DML**; test rows; **FORCE ROW LEVEL SECURITY**; **GRANT** / **REVOKE** (first apply = deny-only); schema changes outside the **seven** Phase 2 tables; SQL not in the approved bundle.

---

## 1. Charter approval (owner-held)

| Field | Fill before connect |
|-------|---------------------|
| Charter ID (optional) | e.g. `MAIN-DENY-APPLY-YYYY-MM-DD-01` |
| Charter date (UTC) | |
| **OWNER** approval | yes / no — name/email **owner-held** |
| **SECURITY_APPROVER** approval | yes / no — name/email **owner-held** |
| DA gate record cited | `phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` |
| Selected option | **OPTION_B** (fixed for this charter) |
| Approved bundle ID / version (owner-held) | e.g. `MAIN-OPTION-B-BUNDLE-v1` |
| Rollback artifact ID / version (owner-held) | e.g. `MAIN-DENY-ROLLBACK-v1` |

---

## 2. Roles (labels in charter; humans owner-held)

| Role label | Assigned? | Real name/email storage |
|------------|-----------|-------------------------|
| **TECH_EXECUTOR** | yes / no | **owner-held** |
| **SQL_REVIEWER** (bundle review) | yes / no | **owner-held** |
| **ROLLBACK_OWNER** | yes / no | **owner-held** |
| **OWNER** (post-apply review) | yes / no | **owner-held** |
| **SECURITY_APPROVER** (post-apply review) | yes / no | **owner-held** |

---

## 3. Preconditions confirmed

| Prerequisite | Confirmed? | Reference / label |
|--------------|------------|-------------------|
| MAIN Tier 1 snapshot + review | yes / no | Q-post — PASS_WITH_SECURITY_FINDINGS |
| MAIN pre-RLS diagnostics baseline + review | yes / no | R-post — PASS_BASELINE_CAPTURED |
| MAIN Tranche A exposure + review | yes / no | S-post — PASS_WITH_EXPOSURE_FINDINGS |
| DP planning gate adopted | yes / no | Section **T** / DP0–DP21 |
| **DA apply execution gate adopted** | yes / no | DA0–DA21 |
| Option **OPTION_B** closed owner-held | yes / no | Required **yes** |
| Human SQL review | yes / no | `PASS_REVIEWED` / `PASS_WITH_NOTES` / **OPEN** |
| **Owner-held approved SQL bundle** ready | yes / no | Required **yes** before connect |
| **Owner-held rollback SQL** ready | yes / no | Required **yes** before connect |
| Tier 2 label | yes / no | `TIER2_DEFERRED_WITH_BOUNDED_RATIONALE` (expected) |
| Tranche B **not** in this session | yes / no | Required **yes** |
| Write-denial tests **not** in scope | yes / no | Required **yes** |
| Grants: **no GRANT/REVOKE** in bundle | yes / no | Required **yes** (deny-only first apply) |

---

## 4. Planning decisions (owner-held summary)

| Decision | Value |
|----------|--------|
| Selected option | **OPTION_B** |
| Grants first apply | **Deny-only** — no GRANT/REVOKE in bundle |
| FORCE | **Excluded** |
| Tier 2 | **TIER2_DEFERRED_WITH_BOUNDED_RATIONALE** — apply locks empty Phase 2 tables only; Tier 2 required before packet / Tranche B / Route / PSA / runtime-write |
| Bypass / high-privilege | **PASS_WITH_NOTES** (details owner-held) |
| Route / PSA label | **WIRED_READ_PATH_UNCHECKED** (unless separately verified **NOT_WIRED**) |
| Good restored state (rollback target) | Q-post baseline — RLS off, FORCE off, 0 policies, grants present |

---

## 5. Session scope (deny-posture DDL only)

### 5.1 Tables in scope (seven only)

1. `source_school_observations`
2. `school_identity_candidates`
3. `identity_aliases`
4. `school_locations`
5. `school_identity_resolution_decisions`
6. `programme_availability_publication_decisions`
7. `school_identity_review_events`

**No other tables.** Bundle must match this list exactly.

### 5.2 Permitted actions (in approved bundle only)

| # | Action | Allowed? |
|---|--------|----------|
| 1 | `ENABLE ROW LEVEL SECURITY` per in-scope table | yes |
| 2 | `CREATE POLICY` deny policies for `anon` and `authenticated` (OPTION_B) | yes |
| 3 | Post-apply **read-only** catalog verification (RLS on, policy counts) | yes |
| 4 | **GRANT** / **REVOKE** | **no** (this charter) |
| 5 | **FORCE ROW LEVEL SECURITY** | **no** |
| 6 | Any **DML** / test rows | **no** |

**Execution rule:** Run statements **in order** per owner-held bundle; **no ad-hoc** SQL; any deviation → **STOP** and invoke rollback.

### 5.3 Explicitly out of scope

| Out of scope | Reason |
|--------------|--------|
| Tranche B / Q4 pass claim | Separate gates after deny verify + post-RLS diagnostics pass |
| N12 / execution packet | Not satisfied by apply |
| Write-denial tests | Future gate |
| Post-RLS diagnostics **pass** execution | Separate gate after this review |
| Runtime/write, PSA publish, Route consumption | Separate gates |

---

## 6. Post-apply verification (owner-held; read-only)

Complete after bundle execution, **before** declaring success.

| # | Check | Safe label (owner-held log) |
|---|-------|-----------------------------|
| 1 | All **7** tables: RLS **on** | Y/N |
| 2 | All **7** tables: FORCE **off** | Y/N |
| 3 | Policy count matches OPTION_B expectation (per table) | count labels only |
| 4 | Aggregate row counts still **0** (if checked) | Y/N / not checked |
| 5 | No apply errors requiring rollback | Y/N |
| 6 | Session stayed within bundle (no extra statements) | Y/N |

**No** row samples, grant matrices, or full SQL transcripts in charter or git.

---

## 7. Rollback (owner-held)

| Field | Value |
|-------|--------|
| **ROLLBACK_OWNER** | (owner-held identity) |
| Rollback artifact | (owner-held path/ID — not in git) |
| Triggers to rollback | failed verification; unexpected error; leak signal; **OWNER** / **SECURITY_APPROVER** stop; failed downstream test (future) |
| Restored state target | Q-post good-restored-state (RLS off, FORCE off, 0 policies, grants present) |

---

## 8. Stop rules

Stop session and consider rollback if:

- Any statement outside the approved bundle would be needed
- **INSERT** / **UPDATE** / **DELETE** or write test seems necessary → **STOP** (future gate)
- Suspected raw child/school data in logs/UI
- VERIFY checks fail materially
- **OWNER** or **SECURITY_APPROVER** directs stop

---

## 9. Session completion sign-off (owner-held)

| Field | After session |
|-------|----------------|
| Session completed | yes / no |
| Bundle executed as approved | yes / no |
| Post-apply verification | pass / fail / partial |
| Rollback invoked | yes / no |
| Ready for DA apply review | yes / no |
| **OWNER** review | pending / PASS / FAIL |
| **SECURITY_APPROVER** review | pending / PASS / FAIL |

**Does not** mean Q4 pass, N12 pass, Tranche B approved, or apply-ready.

---

## 10. Related records (reference)

- `docs/architecture/phase-2-rls-main-deny-posture-planning-gate-owner-decision-record.md` — Section **T**
- `docs/architecture/phase-2-rls-policy-sql-draft.md` — **reference only** (not execution authority)
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` — review process
- `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **U** (when adopted)

---

**Owner-held only by default.** Do **not** commit this filled charter with secrets, bundle text, or connection details.
