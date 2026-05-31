# Phase 2 Operational Truth Write (Green Counties) — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before #2 session |
| **Gate** | `phase-2-operational-truth-write-green-counties-execution-gate-owner-decision-record.md` (TW2G0–TW2G25; Section **B-GREEN-#2**) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) primary |
| **Permission stack** | **#2** operational truth write — **not** #1 verification-only, **not** #3 UI integration |

**Forbidden:** Finnmark `56` and non-green counties; Phase 2 seven-table writes; Route/PSA product wiring changes; UI truth from Phase 2 rows; Contour **B** in this session; apply; packet SQL; `NOT_READY_FOR_APPLY` clearance; secrets in git.

**Binding owner rulings:** Phase 0–6 **request-only**; Contour **A** for green counties; session error/unexpected write/out-of-scope county ⇒ **STOP** (no self-heal in same session). See `phase-0-6-processing-contour-owner-decision-record.md`.

**Pipeline CLI:**

- Pre-flight per county: `run-vgs-truth-pipeline` with **`--dry-run`** only (not `--dry-run=true`).
- Production write per county: same command **without** `--dry-run` only when dry-run for that county passed in this session.

---

## 1. Charter approval (owner-held)

| Field | Fill before session |
|-------|---------------------|
| Charter ID | e.g. `MAIN-TRUTH-WRITE-GREEN-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| **TECH_EXECUTOR** | yes / no |
| Charter prepared (UTC) | YYYY-MM-DD |
| Section **B-GREEN-#2** gate cited | yes / no |
| **Z-OV-post** cited (`OPERATIONAL_VERIFICATION_PASS`) | yes / no |
| **P4-LOSA-FM-post** cited | yes / no |
| Three-permission stack: **#2 only** for this session | yes / no |

---

## 2. County scope (check explicitly — default excludes Oslo)

| County code | Name (ref) | Pre-flight dry-run | Production write | Notes (owner-held) |
|-------------|------------|--------------------|------------------|-------------------|
| `03` | Oslo | yes / no | yes / no | **Default: no** — include only with explicit owner rationale |
| `11` | Rogaland | yes / no | yes / no | |
| `15` | Møre og Romsdal | yes / no | yes / no | **Default: no** — pipeline ABORT (`ambiguous=1`); app may stay Vilbli-aligned |
| `46` | Vestland | yes / no | yes / no | |
| `50` | Trøndelag | yes / no | yes / no | |
| `56` | Finnmark | **no** | **no** | **always out of scope** |

| Field | Value |
|-------|--------|
| Profession | `electrician` (default) / other: _____ |
| Order of counties (if sequential) | e.g. `11 → 46 → 50` (default excludes `03` / `15`) |
| Stop after first county ABORT? | yes / no |

---

## 3. Preconditions

| Check | Confirmed? |
|-------|------------|
| Target = MAIN-OWNER-USED (primary) | yes / no |
| **U-post** / **V-post** / **W-post** cited | yes / no |
| **X-post** Route/PSA **NO_TOUCH** (seven Phase 2 tables) | yes / no |
| **Z-CLRD-post** / **Z-APPISS-post** boundaries unchanged | yes / no |
| **P06** Contour **A** only; Contour **B** not in scope | yes / no |
| Diagnostics ≠ publication truth (N9) | yes / no |
| N11 stop rule accepted | yes / no |
| No `--dry-run=true` on any command | yes / no |
| Oslo PSA baseline captured if `03` in scope (count only) | yes / no / n/a |
| Rollback / abort criteria defined (owner-held) | yes / no |

---

## 4. Per-county success criteria (fill before session)

| County | Readiness must be | Dry-run must | Write must | Post-write verify (safe) |
|--------|-------------------|--------------|------------|---------------------------|
| | `verification_ready_after_write` | pass, no ABORT | `dbWritesExecuted=true` | e.g. active PSA count delta bounded |
| | | | | |
| | | | | |

---

## 5. Out of scope (must remain no)

| Item | Confirmed out of scope? |
|------|-------------------------|
| Finnmark `56` or readiness `missing_programme_rows` counties | yes |
| Contour **B** case processing | yes |
| Phase 2 table DML | yes |
| UI / Route product path changes | yes |
| LOSA fetch / Phase 4 implementation | yes |
| Apply / SQL packet execution | yes |

---

## 6. Posture statement

| Field | Value |
|-------|--------|
| Clears `NOT_READY_FOR_APPLY` | **no** |
| Permission **#3** UI integration | **not** authorized |
| Contour **B** / `56` resolution | **not** authorized |
| Publication beyond operational PSA | **not** authorized |

---

## Final charter statement

This owner-held charter authorizes **one bounded operational truth write session** (permission stack **#2**) on MAIN for explicitly listed **green** counties via Contour **A**. It is **not** apply approval, **not** `NOT_READY_FOR_APPLY` clearance, **not** permission to integrate data into the application UI (**#3**), and **not** permission to process Finnmark via Contour **B** or bulk-write `56`.
