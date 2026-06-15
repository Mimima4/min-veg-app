# Phase 0–6 Contour B — Third Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — `carpenter` **15/15** fylke PSA + Nordland E2E **2026-06-15** |
| **Date (UTC)** | 2026-06-10 (opened) · **2026-06-15** (batch closed) |
| **Prerequisite** | Electrician + mechanic **15/15** PSA closed (`phase-0-6-contour-b-second-profession-expansion-owner-record.md`) |

---

## 1. Goal

Add **`carpenter`** (catalog: **Tømrer**) as the third VGS-backed profession — primarily to create a **visible product precedent** for regional delivery research (Nordland `18`, Steigen/veksling fit analysis), not only Contour B county coverage.

**Research anchor:** same fylke (`18`), different Vilbli area (`V.BA` Bygg og anlegg → Tømrerfaget) vs electrician (`V.EL`) / mechanic (`V.TP`).

**Not in scope without separate gates:** LOSA reuse, Phase 2 apply, `NOT_READY_FOR_APPLY` clearance, Innlandet veksling product slice.

---

## 2. Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | **Profession slug?** | **OK — `carpenter`** (2026-06-10) |
| P-2 | **Pilot fylke** | **OK — Nordland (`18`)** — regional compare vs electrician on same county |
| P-3 | **Rollout** | **OK — pilot first, then batch 15** (mirror mechanic gate) |
| P-4 | **Why not Vestland?** | Mechanic already proved green-county E2E on `46`; `18` gives Nord-Salten slash + distinct school set for carpenter chain |

**Signed Vilbli contour:** Bygg- og anleggsteknikk → **Tømrerfaget** (not full `V.BA` sibling catalogue). Detail: `phase-0-6-contour-b-carpenter-vilbli-branch-owner-record.md`.

---

## 3. Nordland scout (read-only, 2026-06-10)

| Profession | Vilbli chain | Nordland `18` schools (VG1/VG2) | Identity signals |
|------------|--------------|-------------------------------|------------------|
| electrician | `v.el` | 13 / 8 | **1 slash** — `Nuortta-Sálto / Nord-Salten` |
| mechanic | `v.tp` kjøretøy | 12 / 4 | clean on `18` |
| **carpenter** | `v.ba` tømrer (`BATMF2`) | **7 / 5** | clean on `18`; **different school set** (Bodø, Fauske, Mosjøen, …) |

→ Product can show **side-by-side** route truth for two professions in the same home fylke without guessing regional models.

---

## 4. Expansion gate checklist

| Step | Status | Proof |
|------|--------|-------|
| 1 | ☑ | Vilbli branch owner record |
| 2 | ☑ | `vgs-path-definitions.mjs` + materialization planner |
| 3 | ☑ | TS `SUPPORTED_VGS_PROFESSION_SLUGS` includes `carpenter` |
| 4 | ☑ | `professions` catalog row (`slug=carpenter`, display Tømrer) — `scripts/sql/seed-profession-carpenter-catalog.sql` |
| 5 | ☑ | Build + deploy (VG1 display fix pending commit) |
| 6 | ☑ | Scheduler `--dry-run --profession carpenter`: **15** `dry_run_ok`, **0** failed (2026-06-15) |
| 7 | ☑ | Pilot production ingest **18** (home IP) |
| 8 | ☑ | Browser E2E Nordland — owner **2026-06-15** |
| 9 | ☑ | Batch **14** remaining counties via `run-contour-b-operational-ingest` (2026-06-15) |
| 10 | ☐ | Optional: add `carpenter` to green-county charter (`03`/`11`/`46`/`50`) |

---

## 5. PSA coverage (`carpenter`, 2026-06-15)

| County | PSA inserted (batch) | Readiness after write | Contour |
|--------|----------------------|------------------------|---------|
| `03` Oslo | 9 | `verification_ready_after_write` | B |
| `11` Rogaland | 38 | `verification_ready_after_write` | B |
| `15` Møre og Romsdal | 19 | `verification_ready_after_write` | B |
| `18` Nordland | 19 | `verification_ready_after_write` | B (pilot) |
| `31` Østfold | 25 | `verification_ready_after_write` | B |
| `32` Akershus | 24 | `verification_ready_after_write` | B |
| `33` Buskerud | 18 | `verification_ready_after_write` | B |
| `34` Innlandet | 33 | `canonical_matching_review` | B partial |
| `39` Vestfold | 12 | `verification_ready_after_write` | B |
| `40` Telemark | 12 | `verification_ready_after_write` | B |
| `42` Agder | 41 | `canonical_matching_review` | B partial |
| `46` Vestland | 53 | `verification_ready_after_write` | B |
| `50` Trøndelag | 64 | `verification_ready_after_write` | B |
| `55` Troms | 11 | `verification_ready_after_write` | B |
| `56` Finnmark | 15 | `canonical_matching_review` | B partial |

**Note:** Carpenter has no Contour A green-county set — all **15** pairs use Contour B partial ingest (unlike electrician/mechanic `03`/`11`/`46`/`50`).

---

## 6. References

- `phase-4-losa-regional-delivery-models-fit-analysis.md` — Steigen / Nordland decision rule
- `phase-2-validation-contour-data-resolution-backlog.md` — Case A (`18` Nordland)
- `phase-0-6-contour-b-carpenter-vilbli-branch-owner-record.md`
- `phase-0-6-contour-b-carpenter-nordland-pilot-e2e-owner-verify-checklist.md`
