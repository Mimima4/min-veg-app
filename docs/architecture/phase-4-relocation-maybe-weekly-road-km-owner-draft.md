# Phase 4 — Relocation `maybe` = weekly road-km reach (DRAFT)

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-MAYBE-ROAD-KM** |
| **Status** | **SUPERSEDED as primary design** — kept for history. Prefer `phase-4-relocation-maybe-public-transport-reach-owner-draft.md` (bus + rail time budget). Road-km remains a **fallback**, not the sole admit. |
| **Date** | 2026-07-19 · superseded note 2026-07-20 |
| **Parent** | `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5 |
| **Triggered by** | Owner clarification: `maybe` is not daily commute; child relocates to study city and travels home ~weekly / biweekly |
| **Superseded by** | `phase-4-relocation-maybe-public-transport-reach-owner-draft.md` (owner 2026-07-20: autobus + jernbane as primary) |

---

## 1. Intent (plain language)

When the family chooses relocation willingness **`maybe`**:

- The child is **not** expected to commute home↔school every school day.
- They typically **live in (or near) the study municipality** during the week.
- Trips home are **occasional** (about once a week or every two weeks).

Therefore the distance filter for `maybe` must measure **how far the study city is from home by road**, not “can I arrive by public transport every morning”.

---

## 2. Binding product rules (proposed)

| ID | Rule | Proposed answer |
|----|------|-----------------|
| RM-0 | `maybe` uses **road network kilometres** between home kommune and school kommune (or school city centroid) | **Yes** |
| RM-1 | Do **not** use straight-line (haversine) as the sole `maybe` gate once road-km is live | **Yes** |
| RM-2 | Do **not** treat `maybe` as daily Entur morning-commute feasibility | **Yes** — Entur may still **sort** options, but must not be the only admit/deny for `maybe` |
| RM-3 | Trip cadence assumption for copy/UX: home visits ~**1× / week** or **1× / 2 weeks** | **Yes** — document in UI copy later; not a hard DB field |
| RM-4 | `yes` remains: all national sparse seats outside primary (ordered by realism) | **Unchanged** |
| RM-5 | `no` remains: omit P-8 national alternative | **Unchanged** |
| RM-6 | Dense professions stay out of national VGS relocation lists (P-8 sparse gate) | **Unchanged** — this draft does not reopen §4 of the geography contract |
| RM-7 | Implementation requires owner gate + Opus 4.8+ review (same as G-7) | **Yes** |

---

## 3. What replaces today’s `maybe` filter

**Today (P-8 anlegg):** haversine ≤ **400 km** (`SPARSE_VG2_MAYBE_MAX_DISTANCE_KM`), with Entur ranks when available.

**Target:**

| Piece | Behaviour |
|-------|-----------|
| **Admit/deny for `maybe`** | Road distance ≤ **TBD km** (owner picks threshold after sample distances; draft placeholder **≤ 500 road-km** until calibrated) |
| **Ordering** | Prefer shorter road-km; Entur optional secondary sort when both cities have PT data |
| **Missing road graph** | Fail-open to haversine with loud diagnostic **or** fail-closed for that school — **NEED_DECISION** at implementation time |
| **Provider** | Prefer a maintained NO road-distance source (OSRM / similar) with cache; no per-click live scrape of Google |

---

## 4. Out of scope (this draft)

- Private-car travel **time** matrices (separate from km).
- Turning on national school lists for carpenter / dense professions.
- Changing Contour A / LOSA / lærebedrift geography (bedrift already has its own relocation scope).

---

## 5. Implementation checklist (when owner says «го п.5»)

1. Owner sign-off: threshold km + fail-open vs fail-closed on missing road data.
2. Small module: `roadDistanceKm(homeMunicipality, schoolMunicipality)` + cache table or edge cache.
3. Wire into `filterAndRankSparseVg2RowsByHomeDistance` (P-8 only first).
4. Smoke: known pairs (e.g. Oslo→Os, Oslo→Kirkenes) assert road-km ordering and `maybe` cut.
5. Update geography contract §4.2 / §5 from “Entur overlay” to “road-km admit + optional Entur sort”.
6. QA build; no Contour B relay required for this change.

---

## 6. Open questions for owner (before coding)

1. Exact **road-km threshold** for `maybe` (placeholder 500 until samples).
2. If OSRM/network unavailable: keep school with haversine, or drop it?
3. Should UI copy mention “reise hjem ca. hver uke / annenhver uke”?

---

## 7. References

- `phase-4-relocation-geography-contract-owner-decision-record.md`
- `src/lib/regional-delivery/anleggsteknikk-sparse-vg2-distance-rank.ts`
- Owner chat 2026-07-19: `maybe` = rare home trips, road-km not daily A→B commute
