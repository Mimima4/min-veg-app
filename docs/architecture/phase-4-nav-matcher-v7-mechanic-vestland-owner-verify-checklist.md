# Phase 4 NAV Matcher — V-7 Mechanic Vestland Browser Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner browser verify confirmed 2026-06-10 |
| **Date (UTC)** | 2026-06-10 |
| **Gate** | `phase-4-nav-matcher-owner-decision-record.md` §9 **V-7** |
| **Pilot** | **mechanic** + home fylke **46** (Vestland), Contour A green county |
| **Prerequisite** | Production deploy `a48f2f4`+; green-a bootstrap **mechanic/46** refreshed (2026-06-11) |

---

## Automated proof (run before browser)

| Check | Command | Expected |
|-------|---------|----------|
| V-1…V-6 | `npm run verify:nav-matcher-v-gates -- --skip-build` | PASS |
| V-8 | `npm run build` | PASS (qa 2026-06-10) |
| Route save smoke | `npm run smoke:route-save-flow` | PASS |
| Route truth smoke | `npm run smoke:route-truth` | PASS |

---

## Setup (one-time per verify session)

1. **Child profile** — preferred municipality in **Vestland (`46`)**  
   Example kommuner that work with transport sort: **Vaksdal**, **Bergen**, **Voss** (any `46` kommune with truth schools is fine).
2. **Saved profession** — **Mekaniker** (`mechanic`) saved for the child.
3. **Open working route** — Route → Open route (entry must land on **draft**, subtitle *Current route for this target profession*).
4. If route is stale / empty steps → wait for recompute or trigger from route page (do not save until steps render).

---

## V-7 — Primary route (kanon `fast_to_work` / direct-bedrift)

Subtitle: **Current route for this target profession.**

- [ ] **VG1** step present — programme **Teknologi- og industrifag** (or equivalent VG1 mechanic chain title).
- [ ] **VG1 dropdown** — real **school names** from truth (not one fake row); selecting another school updates the step.
- [ ] **VG2** step present — programme **Kjøretøy** (or equivalent VG2 title).
- [ ] **VG2 dropdown** — school names (Contour A institutions in Vestland).
- [ ] **No fake VG3 school step** unless county has PSA-backed VG3 school rows (mechanic Vestland: bedrift path expected — **VG3 school step absent is OK**).
- [ ] **Læretid / apprenticeship step** — dropdown shows **fag** options from kolonne-3 truth (e.g. Bilfaget, Motormekanikerfaget, …), not empty, not duplicate school masquerading as VG3.
- [ ] Each step is **horizontal** (institution + programme + stage visible) — no shorthand-only placeholder rows.
- [ ] **Available professions** block below — lists outcome professions scoped to path (no `review-*` slugs).
- [ ] **Save route** — stays on same working page; **Saved** badge appears (do not navigate to saved-route view).

---

## V-7 — One alternative route (outcome-filter variant)

Block **Alternative routes** visible and expandable.

- [ ] At least **one** alternative section (e.g. *Velg fag på VG3 før læretid* **or** *Kort vei til fagbrev* — depends on primary filter and PSA truth).
- [ ] Alternative shows **changed steps** vs primary (`changedStepsCount > 0` — visibly different VG2/VG3/læretid shape).
- [ ] Alternative steps are **full horizontal** (same quality as primary — schools/programmes/fag, not stubs).
- [ ] **Save route** on alternative — **Saved** badge on that alt; working page unchanged.
- [ ] After **Open route** again (with main route also saved) — **both** primary Saved badge and alternative still visible (entry stays on draft).

**Not expected (V-4):**

- [ ] **No** alternative labelled *Fagskole etter VGS* or *Lang akademisk vei* (hidden until post-VGS contours live).

---

## Regression guards (quick)

- [ ] Opening **saved route** from child profile → subtitle *Current saved route…* → **no** Alternative routes block.
- [ ] Signals / warnings panels render without white screen after save + re-open.

---

## Sign-off

| Field | Value |
|-------|--------|
| Owner | confirmed in chat |
| Date | 2026-06-10 |
| Deploy / commit | production `a48f2f4`+ |
| Result | ☑ PASS |
| Notes | Mechanic Vestland: primary + alternative full horizontal steps; save flow OK |

**On FAIL:** capture profession, child kommune, route URL, screenshot of primary + alternative steps; file defect against route engine / matcher / truth ingest.

---

## References

- `phase-4-nav-matcher-owner-decision-record.md` §7 (mechanic Vestland worked example)
- `phase-0-6-contour-b-mechanic-vilbli-branch-owner-record.md` (kolonne-3 fag list)
- `phase-4-green-county-ops-automation-owner-charter.md` (mechanic `46` refreshed)
