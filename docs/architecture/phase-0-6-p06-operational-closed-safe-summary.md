# Phase 0–6 Contour B — Operational Closed Safe Summary

| Field | Value |
|--------|--------|
| **Document type** | Repo-safe summary — **P06-OPERATIONAL-CLOSED** |
| **Section** | **P06-OPERATIONAL-CLOSED-post** |
| **Status code** | `P06_OPERATIONAL_CLOSED_PARTIAL_D` |
| **Date (UTC)** | 2026-06-05 |
| **Checklist** | `phase-0-6-contour-b-operational-closure-checklist.md` |
| **Policy** | `phase-0-6-processing-contour-owner-decision-record.md` §12, §13 |
| **Head commit (reference)** | `834b2e0` |

**Forbidden in this summary:** secrets, raw JSON dumps, per-school labels, packet SQL, PII, project identifiers.

---

## This document is

- Formal **operational closure** of Phase 0–6 Contour **B** (automation → PSA → route options).
- **Partial Block D** closure: ordinary VGS Vilbli parity achieved on pilot counties; **18 Finnmark LOSA** rows remain **OUT_OF_SCOPE** until **Phase 4** implementation gate.

## This document is not

- Full Vilbli parity including LOSA publication in PSA.
- `NOT_READY_FOR_APPLY` clearance for Phase 2 RLS / production truth apply.
- Permission to reopen Contour **B** design or add Vilbli-mirror UI panels.

---

## 1. Block closure matrix

| Block | Status | Notes |
|-------|--------|-------|
| **A** Policy | **CLOSED** | P06 §12 sole product rule |
| **B** Automation | **CLOSED** | Scheduler + home-IP relay; 6-month cadence |
| **C** MAIN write + E2E | **CLOSED** | Pilots **56/15/18/55**; green **03/11/46/50** unchanged |
| **D** Vilbli parity | **CLOSED (PARTIAL)** | CASE 2/3 done; **18 LOSA** → Phase 4 |
| **E** Coverage | **CLOSED** | County matrix; Møre **15** `10/0/0`; Akershus **32** `12/0/0` |
| **F** Regression | **CLOSED** | `npm run smoke:contour-b`; CLI `--contour-b-partial` guard |
| **G** Sign-off | **CLOSED** | This summary + non-return rule |

---

## 2. Automation health

| Item | Value |
|------|--------|
| Scheduler | `run-contour-b-operational-scheduler.mjs` + Vercel internal API |
| Production ingest path | Home-IP `relay-contour-b-vilbli-to-production.mjs` |
| Cadence | 6 months (launchd + relay) |
| Route page load | **No** ingest on recompute |
| Regression smoke | `npm run smoke:contour-b` — guard + Finnmark **56** ingest dry-run exit 0 |

---

## 3. Pilot counties (`electrician`)

| Code | Contour | Dry-run (2026-06-05) | Production PSA |
|------|---------|----------------------|----------------|
| **15** Møre | B | 10/0/0 OK | Active (owner E2E verified) |
| **18** Nordland | B | 13/0/0 OK | Active |
| **55** Troms | B | 5/0/0 OK | Active; VG1=5 / VG2=4 (CASE 2 1:1) |
| **56** Finnmark | B partial | 6/18/0 ABORT (expected) | **12** active PSA; 6 ordinary VG1 schools (CASE 3) |
| **03/11/46/50** | A green | OK | Contour A only; B relay skips |

**Block D partial tail:** Finnmark **18** Vilbli LOSA municipality rows — auditable exclude; Contour B partial skips `isLosa`. See `phase-4-losa-finnmark-publishability-contract-draft.md`.

---

## 4. Block D metrics (safe aggregates)

| Metric | Finnmark **56** ordinary | Finnmark **56** LOSA |
|--------|--------------------------|----------------------|
| Vilbli extract (VG1 sample) | 6 matched school-brands | 18 excluded |
| PSA active (post ingest) | 12 rows | 0 ordinary PSA |
| Full dry-run | ABORT on unmatched=18 | Expected; not matcher defect |

---

## 5. Owner non-return statement (§13)

After **P06-OPERATIONAL-CLOSED**:

1. **No further P0–6 contour rework** — Contour **B** design is frozen at §12.
2. **Allowed operations:** scheduled relay/ingest, new `(profession, county)` via Expansion gate (`VGS_OPERATIONAL_RUNNERS.md`), new problem classes via separate gates.
3. **Not allowed without new gate:** Vilbli-mirror UI; ordinary PSA for LOSA rows; reopening matcher 1:1 / multi-`avd` policy.
4. **LOSA publication:** Phase 4 implementation gate only — not P06 backlog.

---

## 6. Recommended next gate

**Phase 4 LOSA Finnmark implementation gate** — when owner approves publishability execution beyond planning evidence. Operational Contour B does **not** block on this for non-LOSA counties.
