# Phase 4 — Route Outcome Filter (`preferred_education_level`) Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-ROUTE-OUTCOME-FILTER** |
| **Status** | **EFFECTIVE** — owner sign-off 2026-06-10 |
| **Date (UTC)** | 2026-06-10 |
| **Scope** | User-facing route outcome filter catalog, alternative-route ordering rules, NAV-matcher input contract |
| **Implementation** | **Not implied by this doc alone** — code/types still use legacy diploma-level enum until migration |

---

## 1. Purpose

Families choose **how they want the education path to unfold toward work**, not an abstract diploma level.

The internal field remains `preferred_education_level`. User-facing copy uses short, human Norwegian labels. Long explanations belong in route signals and matcher logic, not in filter titles.

**Downstream dependency:** NAV/STYRK matcher design **must** take the active `filter_id` as input. Finalize this catalog before matcher implementation.

---

## 2. Locked filter catalog

Display order for barn/ungdom route UI (top → bottom):

| Order | `filter_id` | UI label (nb) | Audience | Meaning (one line) |
|------:|-------------|---------------|----------|-------------------|
| 1 | `open` | Åpen / Ikke valgt ennå | Alle | No narrowing; engine proposes canon + alternatives |
| 2 | `fast_to_work` | Kort vei til fagbrev | Barn/ungdom | VG1 → VG2 → lære; skip VG3 where valid |
| 3 | `vg3_before_apprenticeship` | Velg fag på VG3 før læretid | Barn/ungdom | VG3 på skole, then lære |
| 4 | `fagskole_after_vgs` | Fagskole etter VGS (1–2 år) | Info / etter VGS | Practical 1–2 year step **after** completed VGS |
| 5 | `long_academic` | Lang og spesialisert utdanning | Plan / annet kontur | Long regulated paths (e.g. ingeniør, sykepleier, **lege**) — not “bachelor only” |
| 6 | `flexible` | Vis meg ulike realistiske veier | Alle | Explicit compare mode across realistic contours |
| 7 | `pabygging_studiekompetanse` | Påbygging til generell studiekompetanse | **Kun etter VGS / voksne** | Bridge from yrkesfag to generell studiekompetanse |

### Merged / retired IDs (do not use in new UI)

| Retired | Replaced by |
|---------|-------------|
| `practice_first` | `fast_to_work` |
| `keep_study_options` | `pabygging_studiekompetanse` (explicit name) |
| `short_after_vgs` | `fagskole_after_vgs` |
| `school_then_work` | `vg3_before_apprenticeship` |

### Child-profile / barn route rules

| Rule | Detail |
|------|--------|
| R-1 | `pabygging_studiekompetanse` is **disabled** on child profiles and child route filters |
| R-2 | `pabygging_studiekompetanse` belongs to a **separate etter-VGS contour** (future) |
| R-3 | `fagskole_after_vgs` may appear as informational / “mulig neste steg” on child routes; primary VGS construction remains VG1→VG2→(VG3)→lære |

### `long_academic` semantics (Norway)

Not limited to bachelor/master labels. Includes **lang profesjonsløp** with multiple regulated stages (e.g. medisin → turnus → spesialisering). Matcher must route by **path family / contour**, not a single academic tier.

---

## 3. Alternative routes (K=3 pool)

Each alternative must differ by **`filter_id`**, not near-duplicate path variants.

### Default ordering by distance from canon (yrkesfag professions)

For canon `fast_to_work` / `open` on mechanic, electrician, etc.:

| Slot | Filter | Example (mechanic) |
|------|--------|-------------------|
| **Kanon** | `fast_to_work` | VG1 teknologi → VG2 kjøretøy → lære bilfag |
| **Alt 1** | `vg3_before_apprenticeship` | … → VG3 motormekaniker → lære |
| **Alt 2** | `fagskole_after_vgs` | Etter fagbrev: fagskole transport/teknologi (1–2 år) |
| **Alt 3** | `long_academic` | Maskiningeniør — annet kontur, tydelig merking |

**Ordering rationale:** VG3 (same VGS kontur) → fagskole (still yrkesfag world, after VGS) → lang spesialisert (largest pivot).

### When to omit an alternative

| Case | Action |
|------|--------|
| No realistic fagskole chain for path family | Skip Alt 2; do not invent |
| No akademisk path family for profession | Skip Alt 3 |
| Only one valid contour exists | Reduce filter options; no fake alternatives |
| Child route context | Never offer `pabygging_studiekompetanse` as an alternative |

---

## 4. NAV matcher contract (next work item)

| `filter_id` | Matcher focus | Exclude |
|-------------|---------------|---------|
| `fast_to_work` | Yrker with lære/fagbrev after VG2 chain | VG3-specific titles, akademisk STYRK |
| `vg3_before_apprenticeship` | Yrker tied to VG3 spesialisering | Broad “mekaniker” without spesialisering |
| `fagskole_after_vgs` | Fagskole-related STYRK / påbyggende yrker | Direct lære-only outcomes |
| `long_academic` | Høyskole/uni + lang profesjonsløp STYRK groups | Fagbrev/lære-only outcomes |
| `pabygging_studiekompetanse` | Etter-VGS contour only | All VG1→VG2 lære matching |
| `open` / `flexible` | Default profession outcome + ranked cross-filter alts | — |

Chain model: **NAV → catalog profession → path family → VG1 anchor → VG2 branches → VG3/lære outcomes**.

---

## 5. Owner sign-off

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| OF-0 | Adopt outcome-oriented filter catalog (§2)? | **Yes** | ☑ 2026-06-10 |
| OF-1 | Merge `practice_first` into `fast_to_work`? | **Yes** | ☑ |
| OF-2 | Rename påbygging explicitly; bottom + child-disabled? | **Yes** | ☑ |
| OF-3 | Alternative order: VG3 → fagskole → lang spesialisert? | **Yes** | ☑ |
| OF-4 | UI label `long_academic` = «Lang og spesialisert utdanning» (short)? | **Yes** | ☑ |
| OF-5 | NAV matcher blocked until this record is effective? | **Yes** — now effective | ☑ |

---

## 6. Conflict resolution log

| # | Topic | Resolution | Status |
|---|-------|------------|--------|
| C-1 | Four abstract learning-depth options vs seven outcome filters | Stage 6 UX amended to §2 catalog | **Resolved** 2026-06-10 |
| C-2 | Alternative order shorter→broader→deeper vs `filter_id` distance order | Stage 6 UX amended to owner record §3 | **Resolved** 2026-06-10 |
| C-3 | Filter “cosmetic only” vs contour + matcher scope | Stage 6 UX clarifies engine unchanged; contour, alternatives, matcher scoped | **Resolved** 2026-06-10 |
| C-4 | Legacy diploma enum in code vs outcome `filter_id` | **Deferred** — separate implementation phase; field currently display + legacy fit + signature only | **Open (code)** |

**Code migration (C-4):** `profession-fit-utils.ts`, `edit-child-form.tsx`, and stored DB values remain on legacy enum until a dedicated migration task. No silent rename in this phase.

---

## 7. References

- `phase-4-multi-contour-truth-registry-owner-decision-record.md` — truth sources, ingest, and live rules per education layer
- `route-engine-master-spec.md` — `preferred_education_level` in route input signature
- `route-engine-stage-6-ux.md` — route outcome filter UX (aligned §6 C-1…C-3)
- `route-path-engine-production-spec.md` — alternative routes, hard filters (orthogonal)
