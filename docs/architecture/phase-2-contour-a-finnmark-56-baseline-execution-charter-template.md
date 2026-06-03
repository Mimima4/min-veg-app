# Contour A Finnmark `56` Baseline — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** |
| **Gate** | `phase-2-contour-a-finnmark-56-baseline-execution-gate-owner-decision-record.md` (Section **A3-CONTOUR-A-56**) |
| **Target** | **MAIN-OWNER-USED** / **PROD** |
| **Permission stack** | **#1 read-only** — not **#2** / **#3** |

**Expected:** dry-run **ABORT** on `56` is **OK** if structured diagnostics captured.

**Forbidden:** write mode; other counties; Contour **B**; LOSA fetch; UI changes; `--dry-run=true`.

---

## 1. Charter approval

| Field | Fill |
|-------|------|
| Charter ID | e.g. `MAIN-CONTOUR-A-56-BASELINE-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| **TECH_EXECUTOR** | yes / no |
| **P4-LOSA-FM-post** cited | yes / no |
| **P06-CONTOUR-B-post** cited | yes / no |
| **B-GREEN-#2-post** cited | yes / no |

---

## 2. Scope

| Field | Value |
|-------|--------|
| County | **`56` only** |
| Profession | `electrician` |
| Commands | classify + pipeline `--dry-run` |
| Expected matcher | **ABORT** acceptable |
| Reference baseline (P06-CONTOUR-B-post) | 22 unmatched / 17 LOSA-hint class |

---

## 3. Preconditions

| Check | yes / no |
|-------|----------|
| MAIN `.env.local` loaded | |
| N11 STOP rule | |
| No `--dry-run=true` | |
| Output saved owner-held (full JSON to file) | |

---

## 4. Success criteria

| Criterion | Pass |
|-----------|------|
| Classify completed for `56` | |
| Dry-run output captured (file) | |
| Safe aggregates recordable (unmatched/ambiguous/readiness) | |
| No production write attempted | |

---

## Final statement

Read-only **A.3** baseline for **`56`** only. **ABORT** is not failure for this charter.
