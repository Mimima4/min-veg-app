# Phase 0–6 Contour B — Eighth Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **IN PROGRESS** — scaffolding 2026-07-21 (owner signed murer / Betong og mur) |
| **Date (UTC)** | 2026-07-21 |
| **Prerequisite** | Seven professions in pipeline (`electrician`, `mechanic`, `carpenter`, `plumber`, `painter`, `anleggsteknikk`, `klima`); template `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Profession slug** | `murer` (catalog: **Murer og betong** / Betong og mur) |

---

## 1. Goal

Add **`murer`** as the eighth VGS catalogue profession on the **V.BA** Bygg chain — VG2 **Betong og mur** (`BABMO2`), reusing shared VG1 + VG2 cross-profession switch. Clones the `klima` scaffolding pattern (commit `66cb987`).

---

## 2. Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Profession slug + catalog label | **Signed — `murer`** · catalog **Murer og betong** |
| P-2 | Pilot fylke | **N/A** — nationwide batch after scaffolding (same as anlegg / klima) |
| P-3 | Rollout | Contour B full-matrix relay after code+seed |
| P-4 | Vilbli contour | **Signed — Bygg → Betong og mur** (`BABMO2`), not full `V.BA` menu |
| P-5 | V.BA VG2 switch | **Extend** (`carpenter` / `plumber` / `painter` / `anleggsteknikk` / `klima` + `murer`) |
| P-6 | Overlays | **P-7 north nabofylke auto** (profession-agnostic). **No P-8** for murer at start |

Detail: `phase-0-6-contour-b-murer-vilbli-branch-owner-record.md`.

---

## 3. Signed tokens

| Step | Token |
|------|--------|
| VG1 | `V.BABAT1----` |
| VG2 | `V.BABMO2----` |
| Kolonne-3 | `BAMFF3` (Murer- og flisleggerfaget, **primary**), `BABET3` (Betongfaget) |

Pipeline URL: `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BABMO2----&side=p5`

---

## 4. Closure checklist

| Step | Status |
|------|--------|
| Owner sign P-1 / P-4 | ☑ 2026-07-21 |
| Path + materialization + eligibility | ☑ scaffolding |
| Catalog seed SQL | ☑ `scripts/sql/seed-profession-murer-catalog.sql` — **not yet applied prod** |
| Kolonne-3 roster | ☑ `data/larebedrift/kolonne3-rosters/murer.json` |
| NAV map | ☑ `håndverkere.murer` (dedicated STYRK leaf) |
| Relay dry-run + production | ☐ after seed + deploy |
| Lærebedrift ingest (2 fag) | ☐ |
| E2E + prod UI | ☐ |
