# Phase 0–6 — Anleggsteknikk P-8 sparse VG2 + relocation pilot owner record

| Field | Value |
|-------|--------|
| **Section** | **P-8** (extends P-6 / P-7 family) |
| **Status** | **CLOSED** — code live; owner UI sign-off 2026-07-20; agent verification 2026-07-20 |
| **Date (UTC)** | Chartered 2026-07-15 · Closed 2026-07-20 |
| **Profession** | `anleggsteknikk` (Anleggsmaskinfører) |
| **Contour** | **C-VGS-YRKESFAG only** |
| **Parent** | `phase-0-6-contour-b-anleggsteknikk-vilbli-branch-owner-record.md`; `phase-4-relocation-geography-contract-owner-decision-record.md` |
| **Commits** | `a125eba`, `f76a474` (implementation); this closure docs 2026-07-20 |

---

## 1. Problem

Vilbli strukturkart for Anleggsteknikfaget (`BAANL2`) shows **national sparse VG2** schools (Finnmark VG1 column + multi-fylke VG2 column on owner reference screenshot 2026-07-15).

Contour B ingest materializes PSA **per fylke**. Runtime today reads **home county** only → families see local VG2 (e.g. Kirkenes) but not other national PSA-backed VG2 schools unless we add a governed alternative path.

**Must not:** Merge national PSA into every VGS profession or into primary route card for all relocation settings.

---

## 2. Owner decisions

| # | Question | Decision |
|---|----------|----------|
| P8-1 | Activate relocation for VGS schools now? | **Yes — pilot only** for `anleggsteknikk` via P-8; other professions unchanged |
| P8-2 | Primary when home P-6 eligible? | **Keep** home-chain primary; widen **primary school picker** only on **north zone** (see P8-4) |
| P8-3 | National VG2 outside primary scope? | **Alternative route only** — label nb: **«Anleggsteknikk — VG2 andre steder»** |
| P8-4 | North regional rule | Home `55`/`56`: primary picker scope = home fylke + **`18` Nordland** (historisk nabosamarbeid). **Not** Agder/Rogaland/Vestland in primary. |
| P8-5 | Non-north homes | Primary = home fylke only; P-8 alternative per relocation contract §4.2 |
| P8-6 | Oslo `03` (VG2=0) | Primary empty (P-6); P-8 alternative when relocation `maybe`/`yes` |
| P8-7 | Sparse eligibility | **PSA-derived** at ingest/read: `national_vg2_psa_count(anleggsteknikk) ≤ 50`. **No static school list.** |
| P8-8 | Slug canonicalization | Neighbor/national VG2 rows → `anleggsteknikk-vg2-anleggsteknikk-nasjonalt` before step build (painter P-7 precedent) |
| P8-9 | Implementation gate | **Opus 4.8+** model review required before merge |
| P8-10 | Home VG1 when anlegg VG1 missing | **V.BA shared VG1** via `carpenter-vg1-bygg-{county}` (same pattern as painter P-7) — required for Oslo `03` ABORT counties |
| P8-11 | Current-year tilbud only | **CRITICAL** — VG2 schools must match Vilbli «Skoler som tilbyr dette» (6 nationally as of 2026-07-18), not county structure-map PSA. See `phase-4-current-year-programme-offering-owner-decision-record.md` |

---

## 3. UI contract

| Surface | Behaviour |
|---------|-----------|
| **Primary** | Unchanged empty/copy when P-6 blocked; otherwise existing anlegg chain |
| **Alternative** | One card «Anleggsteknikk — VG2 andre steder» when P-8 eligible + relocation `maybe`/`yes` + schools outside primary scope exist |
| **VG2 step in alternative** | Dropdown of PSA-backed schools; grouped/sorted by transport (TR-1…TR-3) |
| **relocation `no`** | No P-8 alternative card |
| **Test id** | `anleggsteknikk-sparse-vg2-alternative-route` |

---

## 4. Implementation map (landed)

| Piece | Path / pattern | Status |
|-------|----------------|--------|
| Sparse gate | `src/lib/vgs/sparse-vg2-alternative-eligibility.ts` | Live |
| Geography scope | `src/lib/planning/school-geography-scope.ts` | Live |
| Distance / maybe filter | `src/lib/regional-delivery/anleggsteknikk-sparse-vg2-distance-rank.ts` | Live (haversine ≤400 km v1; PT-reach upgrade → separate maybe record) |
| Step build | `src/server/children/routes/build-anleggsteknikk-sparse-vg2-alternative-route-steps.ts` | Live |
| Sync | `src/server/children/routes/sync-study-route-curated-regional-alternatives.ts` | Live |
| North-zone primary | `src/server/children/routes/enrich-anleggsteknikk-north-zone-primary-truth.ts` | Live |
| Smokes | `npm run smoke:anleggsteknikk-sparse-vg2`, `npm run smoke:school-geography-scope` | PASS 2026-07-20 |
| E2E | `e2e/route-anleggsteknikk-smoke.spec.ts` | Present |

**Precedents:** `painter-north-cross-fylke-*` (alternative sync), `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` P-7.

---

## 5. Scout reference (PSA, 2026-07-10 batch)

National sparse VG2 — not dense. Gate `≤50` passes; carpenter/electrician fail.

| Fylke | VG2 PSA (anlegg) |
|-------|------------------|
| `56` Finnmark | 1 |
| `55` Troms | 1 |
| `18` Nordland | 1 |
| `46` Vestland | 4 |
| `11` Rogaland | 5 |
| … | … |

**Post current-year reconcile (2026-07-18 / re-verified 2026-07-20):** active anlegg VG2 PSA = **6** nationwide (see current-year offering record).

---

## 6. Closure checklist

| Step | Status |
|------|--------|
| Owner record P-8 | ☑ |
| Relocation geography contract | ☑ |
| Multi-contour U-10 | ☑ |
| Shared geography module | ☑ `school-geography-scope.ts` |
| Alternative builder + sync | ☑ landed `a125eba` / `f76a474` |
| Smokes + QA build | ☑ `smoke:anleggsteknikk-sparse-vg2` + `smoke:school-geography-scope` PASS 2026-07-20 |
| Prod UI sign-off | ☑ owner 2026-07-20 |
| Current-year tilbud (P8-11) | ☑ data=6 + live offering smoke PASS 2026-07-20 (durable gate ON; next full-matrix relay keeps it without stopgap) |

---

## 7. References

- Vilbli national strukturkart: https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANL2----&side=p2
- `phase-0-6-contour-b-sixth-profession-expansion-owner-record.md` §3 classify matrix
- `phase-4-relocation-geography-contract-owner-decision-record.md`
- `phase-4-current-year-programme-offering-owner-decision-record.md`
- `phase-4-relocation-maybe-public-transport-reach-owner-draft.md` — next upgrade of `maybe` admit (bus+rail)
