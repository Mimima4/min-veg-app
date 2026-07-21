# Phase 0–6 Contour B — Seventh Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **IN PROGRESS** — scaffolding 2026-07-21 (owner signed KEM) |
| **Date (UTC)** | 2026-07-21 |
| **Prerequisite** | Six professions closed (`electrician`, `mechanic`, `carpenter`, `plumber`, `painter`, `anleggsteknikk`); template `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Profession slug** | `klima` (catalog: **Ventilasjons- og blikkenslager** / Klima, energi og miljøteknikk) |

---

## 1. Goal

Add **`klima`** as the seventh VGS catalogue profession on the **V.BA** Bygg chain — VG2 **Klima, energi og miljøteknikk** (`BAKEM2`), reusing shared VG1 + VG2 cross-profession switch.

---

## 2. Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Profession slug + catalog label | **Signed — `klima`** · catalog **Ventilasjons- og blikkenslager** |
| P-2 | Pilot fylke | **N/A** — nationwide batch after scaffolding (same as anlegg) |
| P-3 | Rollout | Contour B full-matrix relay after code+seed |
| P-4 | Vilbli contour | **Signed — Bygg → Klima, energi og miljøteknikk** (`BAKEM2`), not full `V.BA` menu |
| P-5 | V.BA VG2 switch | **Extend** (`carpenter` / `plumber` / `painter` / `anleggsteknikk` + `klima`) |
| P-6 | Overlays | **LOSA** cross-profession. **No** P-7/P-8 for klima at start |

Detail: `phase-0-6-contour-b-klima-vilbli-branch-owner-record.md`.

---

## 3. Signed tokens

| Step | Token |
|------|--------|
| VG1 | `V.BABAT1----` |
| VG2 | `V.BAKEM2----` |
| Kolonne-3 | `BAVBL3` (Ventilasjons- og blikkenslager), `BAISL3` (Isolatør), `BATAK3` (Tak- og membrantekker) |

Pipeline URL: `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAKEM2----&side=p5`

---

## 4. Closure checklist

| Step | Status |
|------|--------|
| Owner sign P-1 / P-4 | ☑ 2026-07-21 |
| Path + materialization + eligibility | ☑ scaffolding |
| Catalog seed SQL | ☑ `scripts/sql/seed-profession-klima-catalog.sql` — **applied prod 2026-07-21** |
| Kolonne-3 roster | ☑ `data/larebedrift/kolonne3-rosters/klima.json` |
| NAV map | ☑ `håndverkere.platearbeider-og-sveiser` (closest STYRK leaf) |
| Relay dry-run + production | ☐ after seed + deploy |
| E2E + prod UI | ☐ |
