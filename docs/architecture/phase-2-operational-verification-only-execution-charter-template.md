# Phase 2 Operational Verification-Only — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before verification session |
| **Gate** | `phase-2-operational-verification-only-execution-gate-owner-decision-record.md` (OVE0–OVE21; Section **Z-OV**) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) primary |
| **Permission stack** | **#1 verification-only** — not #2 truth write, not #3 UI integration |

**Forbidden:** user-facing UI truth from unconfirmed Phase 2 data; PSA publication; Route/PSA product wiring changes; packet SQL; apply; `NOT_READY_FOR_APPLY` clearance; secrets in git.

**Binding owner rulings (2026-05-29):** see `docs/architecture/phase-0-6-processing-contour-owner-decision-record.md` — Phase 0–6 **request-only** (no request ⇒ no response); **must not** change the application; green county (Oslo-class) = operational matcher only; session error/unexpected write ⇒ **STOP** (no self-heal in same session).

**Pipeline dry-run CLI:** use **`--dry-run`** only. Do **not** use `--dry-run=true` (parser treats it as a different key and may run real writes).

---

## 1. Charter approval (owner-held)

| Field | Fill before session |
|-------|---------------------|
| Charter ID | e.g. `MAIN-OP-VERIFY-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| **TECH_EXECUTOR** | yes / no |
| Charter prepared (UTC) | YYYY-MM-DD |
| Section **Z-OV** gate cited | yes / no |
| Three-permission stack acknowledged (#1 only) | yes / no |

---

## 2. Scope — select exact verification activities (check all in scope)

| Activity | In scope? | Notes (owner-held) |
|----------|-----------|-------------------|
| Read-only Phase 2 diagnostics (approved script/helper path) | yes / no | |
| Pipeline dry-run / rehearsal (no production writes) | yes / no | CLI: `--dry-run` only (not `--dry-run=true`) |
| Spot-check post-RLS compatibility evidence | yes / no | |
| Bounded negative-test re-check (read/deny only) | yes / no | |
| **Z-G1** app/browser gap session (if not already closed) | yes / no | |
| **Z-G2** diagnostics N6 gap session (if not already closed) | yes / no | |
| Repo/docs/spec verification sign-off items | yes / no | list IDs |

**Out of scope (must remain no):**

| Item | Confirmed out of scope? |
|------|-------------------------|
| Any UI surface showing Phase 2 / unconfirmed data as truth | yes |
| Writes to Phase 2 truth tables (permission #2) | yes |
| PSA publication / materialization | yes |
| Route/PSA product wiring to seven Phase 2 tables | yes |
| Apply / SQL / packet execution | yes |

---

## 3. Preconditions

| Check | Confirmed? |
|-------|------------|
| Target = MAIN-OWNER-USED (primary) | yes / no |
| **U-post** / **V-post** / **W-post** cited | yes / no |
| **X-post** Route/PSA **NO_TOUCH** acknowledged | yes / no |
| **Z-CLRD-post** / **Z-APPISS-post** cited (boundaries unchanged) | yes / no |
| Diagnostics ≠ publication truth (N9) | yes / no |
| Stop rule (N11) accepted | yes / no |
| Phase 0–6 contour: no app/UI/product path mutation | yes / no |
| Session error rule: STOP — no self-heal in same session | yes / no |
| Rollback / abort criteria defined (owner-held) | yes / no |

---

## 4. UI and truth boundaries (binding)

| Rule | Acknowledged? |
|------|---------------|
| Unprocessed / unconfirmed / unformatted data **must not** appear in app UI as truth | yes / no |
| Current product paths remain on operational published surfaces only | yes / no |
| No `phase3-operationalization` import into `src/app` or product server paths | yes / no |
| Verification evidence stays non-product (scripts/diagnostics/owner-held) | yes / no |

---

## 5. Gaps and posture

| Item | Status |
|------|--------|
| `NOT_READY_FOR_APPLY` | unchanged by this charter |
| Apply approval | not issued |
| Permission #2 truth write | not authorized |
| Permission #3 UI integration | not authorized |
| `N12_PASS_CLAIMED` | not claimed by this charter |

---

## 6. Posture statement

| Field | Value |
|-------|--------|
| Clears `NOT_READY_FOR_APPLY` | **no** |
| Apply / SQL / packet approved | **no** |
| UI truth integration approved | **no** |
| Publication / PSA / Route activation approved | **no** |

---

## 7. Success criteria (fill before session)

| Criterion | Pass threshold (owner-held) |
|-----------|----------------------------|
| | |
| | |
| | |

---

## Final charter statement

This owner-held charter authorizes **one bounded operational verification-only session** (permission stack **#1**) on MAIN. It is **not** apply approval, **not** `NOT_READY_FOR_APPLY` clearance, **not** permission to write operational production truth (#2), and **not** permission to connect unconfirmed data to the application UI (#3).
