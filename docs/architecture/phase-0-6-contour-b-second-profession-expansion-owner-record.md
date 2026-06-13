# Phase 0–6 Contour B — Second Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — `mechanic` **15/15** fylke PSA + owner E2E **2026-06-13** |
| **Date (UTC)** | 2026-06-10 (opened) · **2026-06-13** (batch closed) |
| **Prerequisite** | Electrician **15/15** fylke PSA + Block C E2E **CLOSED** (`phase-0-6-contour-b-block-c-e2e-batch-owner-record.md`) |

---

## 1. Goal

Add **one** new VGS-backed profession to Contour B pipeline + route `availability_truth`, using the same expansion gate as counties (`VGS_OPERATIONAL_RUNNERS.md` § Expansion gate).

**Not in scope without separate gates:** LOSA contour, Phase 2 apply, global `NOT_READY_FOR_APPLY` clearance.

---

## 2. Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | **Which profession slug?** | **OK — `mechanic`** (2026-06-10) |
| P-2 | **Pilot fylke** for first E2E | **OK — Vestland (`46`)** 2026-06-10 |
| P-3 | **Rollout:** pilot fylke first vs all **15** fylke batch | **OK — pilot first, then batch** 2026-06-10 |

**Signed Vilbli contour:** Teknologi- og industrifag → Kjøretøy → **kolonne-3 next steps** (per fylke). Detail: `phase-0-6-contour-b-mechanic-vilbli-branch-owner-record.md`.

---

## 3. Expansion gate checklist

| Step | Status | Proof |
|------|--------|-------|
| 1–6 | ☑ | Path defs + TS `SUPPORTED_VGS_PROFESSION_SLUGS` includes `mechanic` |
| 7 | ☑ | Build + deploy on main (`d10c8ec`+) |
| 8 | ☑ | Scheduler + relay `--dry-run --profession mechanic`: **11** `dry_run_ok`, **4** `use_contour_a`, **0** failed (2026-06-13) |
| 9 | ☑ | Production PSA: local `run-contour-b-operational-ingest` for **11** Contour B pairs; green **03/11/46/50** via Feb/Aug green refresh |
| 10 | ☑ | Browser E2E — Vestland V-7 (`phase-4-nav-matcher-v7-mechanic-vestland-owner-verify-checklist.md` **CLOSED** 2026-06-10); Contour B spot-check **Møre og Romsdal** Molde (`1506`) 2026-06-13 |

**Note:** Step 9 used home-IP local ingest (same pipeline as scheduler). Full-matrix production relay (`electrician + mechanic × 15`) remains on `ops:scheduled` cadence — not required to close this record.

---

## 4. PSA coverage (`mechanic`, 2026-06-13)

| County | VG1 schools | Total PSA | Contour |
|--------|-------------|-------------|---------|
| `03` Oslo | 6 | 9 | A (green) |
| `11` Rogaland | 28 | 32 | A |
| `15` Møre og Romsdal | 13 | 30 | B |
| `18` Nordland | 24 | 28 | B |
| `31` Østfold | 14 | 20 | B |
| `32` Akershus | 18 | 25 | B |
| `33` Buskerud | 12 | 18 | B |
| `34` Innlandet | 30 | 38 | B |
| `39` Vestfold | 12 | 14 | B |
| `40` Telemark | 16 | 19 | B |
| `42` Agder | 24 | 27 | B |
| `46` Vestland | 28 | 67 | A |
| `50` Trøndelag | 38 | 45 | A |
| `55` Troms | 12 | 16 | B |
| `56` Finnmark | 14 | 17 | B partial (+ **18** LOSA separate) |

Readiness: `verification_ready_after_write` except `34` / `42` / `56` → `canonical_matching_review` (expected Contour B partial).

---

## 5. Owner E2E proof (2026-06-13)

Child **Miya** — home kommune **1506** (Molde, **Møre og Romsdal**).

| Profession | VG1 options (UI) | VG1 schools (DB) | VG2 options (UI) | VG2 schools (DB) |
|------------|------------------|------------------|------------------|------------------|
| electrician | 10 | 10 | 7 | 7 |
| mechanic | 13 | 13 | 4 | 4 |

Session: route entry, recompute, save, remove-saved — all **200**; working drafts retained after cleanup.

**Sign-off:** owner confirmed in chat **2026-06-13**; DB snapshot cross-check **PASS**.

---

## 6. References

- `phase-0-6-contour-a-mechanic-vestland-pilot-e2e-owner-verify-checklist.md` — Vestland Contour A pilot
- `phase-4-nav-matcher-v7-mechanic-vestland-owner-verify-checklist.md` — V-7 **CLOSED**
- `phase-4-green-county-ops-automation-owner-charter.md` — green **8/8** mechanic pairs
