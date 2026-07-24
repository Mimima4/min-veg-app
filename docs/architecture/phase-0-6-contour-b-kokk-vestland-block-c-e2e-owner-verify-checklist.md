# Phase 0–6 Contour B — Kokk Vestland Block C E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner verified **2026-07-24** |
| **Date (UTC)** | 2026-07-24 |
| **Profession** | `kokk` (catalog **Kokk**) |
| **Fylke (app)** | **Vestland** |
| **County code** | `46` (ops only) |
| **Prerequisite** | Production relay kokk 15/15 (2026-07-24); Vestland active PSA **VG1=8**, **VG2=7** |
| **Known deferred** | Innlandet `34` campus Sør≠Nord — day-plan **2026-07-25 §C** (after A+B); **do not** manual PSA |

---

## PSA VG1 schools (expect in dropdown) — 8

Restaurant- og matfag (`kokk-vg1-restaurant-vestland`):

1. Fitjar vidaregåande skule (Fitjar)
2. Fusa vidaregåande skule (Bjørnafjorden)
3. Førde vidaregåande skule (Sunnfjord)
4. Måløy vidaregåande skule (Kinn)
5. Sandsli videregående skole (Bergen)
6. Sogndal vidaregåande skule (Sogndal)
7. Sotra vidaregåande skule (Øygarden)
8. Voss vidaregåande skule (Voss)

---

## PSA VG2 schools (expect in dropdown) — 7

Kokk- og servitørfag (`kokk-vg2-kokk-servitor-vestland`):

1. Fitjar vidaregåande skule (Fitjar)
2. Fusa vidaregåande skule (Bjørnafjorden)
3. Måløy vidaregåande skule (Kinn)
4. Sandsli videregående skole (Bergen)
5. Sogndal vidaregåande skule (Sogndal)
6. Sotra vidaregåande skule (Øygarden)
7. Voss vidaregåande skule (Voss)

**Must NOT appear on VG2:** `Førde vidaregåande skule` — Vilbli structure-only (`html_stage_block`); map tilbud omits it; Min Veg correctly has no VG2 PSA (I-1…I-3).

---

## Owner browser checklist (Vestland / Kokk)

Setup: child with **home fylke Vestland** → profession **Kokk** → recompute route → **programme_selection**.

- [x] Profession **Kokk** visible in catalog / route entry
- [x] VG1 dropdown: **8** schools (list above); **includes Førde**
- [x] VG2 dropdown: **7** schools (list above); **no Førde**
- [x] Sample pick + save/reload persists
- [x] No invented schools beyond PSA lists
- [x] **Lærebedrift / employers** — Fagvalg **Kokkfaget** shows godkjent employers (owner confirmed on dev **2026-07-24**)

**Sign-off:** schools + bedrift **CLOSED** — owner 2026-07-24.

---

## Related

- Branch record: `phase-0-6-contour-b-kokk-vilbli-branch-owner-record.md`
- Day-plan campus fix: `docs/ops/day-plan-2026-07-25-recompute-offline-truth.md` §C
