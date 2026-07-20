# Phase 4 — Relocation `maybe` = public-transport reach (bus + rail) — DRAFT

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-MAYBE-PT-REACH** |
| **Status** | **DRAFT** — calibration + product rules for owner «го»; **not for runtime merge until owner sign-off + Opus 4.8+ review (G-7)** |
| **Date** | 2026-07-20 |
| **Supersedes (intent)** | `phase-4-relocation-maybe-weekly-road-km-owner-draft.md` — road-km alone is **insufficient**; bus + train are the **primary** realism signal |
| **Parent** | `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5; `phase-4-route-kommune-transport-logistics-owner-record.md` (TR / Entur) |
| **Reuse scope** | Designed as **shared geography rule** for VGS sparse alternatives **and later** fagskole / university / other contours — not anlegg-only forever |
| **Triggered by** | Owner 2026-07-20: keep the ~400 km budget idea, but admit/deny must be grounded in **autobus + jernbane** (not haversine-as-truth); weekly/biweekly home visits remain the cadence |

---

## 1. Intent (plain language)

When the family chooses relocation willingness **`maybe`**:

- The child is **not** expected to commute home↔school every school day.
- They typically **live in (or near) the study city** during the week.
- Trips home are **occasional** (~1× / week or 1× / 2 weeks).

So the admit/deny question is:

> «Can a family realistically travel home↔study city by **ordinary public transport (bus and/or train)** in about the same effort we already accepted for ~400 km?»

**Not:** «Is the straight-line (haversine) distance ≤ 400 km?»  
**Not:** «Can the pupil arrive every morning by 08:00?» (that is daily-commute / Entur morning sort — different job).

---

## 2. Why haversine ≤ 400 km is not enough (but is the calibration seed)

**Today (P-8 anlegg v1, shipped):** `SPARSE_VG2_MAYBE_MAX_DISTANCE_KM = 400` haversine, aligned with `MAYBE_MAX_DISTANCE_KM` in `select-truth-candidate-for-route.ts`. Entur ranks **sort** when available; haversine **admits**.

That v1 rule was a **signed pilot heuristic**, not a fake school stub. It is still **wrong as the long-term product truth** because:

1. Haversine ignores fjords, mountains, and missing corridors (coastal Norway).
2. It treats bus-only and rail-served cities the same.
3. Contract §4.2 / TR-3 already say **public transport** is the realism mode — admit should follow that, not only sort.
4. The same `maybe` rule will later gate **fagskole / university** alternatives — a weak heuristic will multiply.

**Decision direction (this draft):** keep **~400 km bus-equivalent effort** as the **time budget seed**, implement admit via **bus+rail journey feasibility** (Entur), use road/rail network km only as secondary / fallback — never as sole truth once PT is live.

---

## 3. Calibration: what does «400 km» mean in time?

Sources: published long-distance schedules (Vy Express / Nor-Way / Bergensbanen / Dovrebanen), Wikipedia long-distance averages (~80 km/h rail in NO). Figures are **schedule averages**, not peak cruise speed.

### 3.1 Bus (express / long-distance)

| Corridor | Approx network km | Typical duration | Implied avg speed |
|----------|-------------------|------------------|-------------------|
| Oslo → Kristiansand (NW192 / VY190) | ~320 km | ~4.1–4.5 h | **~73 km/h** |
| Oslo → Stavanger (VY190) | ~550 km | ~8.2–8.5 h | **~66 km/h** |
| Oslo → Trondheim (VY710 day headline) | ~500 km | ~7.5 h | **~67 km/h** |

**Band for planning:** long-distance bus in Norway often lands **~55–73 km/h** schedule average (terrain, stops, ferries).

| Question | Answer |
|----------|--------|
| How long is **400 km by bus**? | At 55–73 km/h → **~5.5–7.3 hours**. Central design budget: **~6.5–7.0 hours one-way**. |
| Using Oslo→Kristiansand effective ~73 km/h | 400 / 73 ≈ **5.5 h** (optimistic corridor). |
| Using slower coastal ~66 km/h | 400 / 66 ≈ **6.1 h**. |

**Owner-facing summary:** the existing 400 km maybe radius is roughly a **half-day bus trip** (~6–7 hours), not a short regional hop.

### 3.2 Train — how far in the **same time**?

Long-distance Norwegian rail schedule averages (examples):

| Corridor | Approx rail km | Typical duration | Implied avg speed |
|----------|----------------|------------------|-------------------|
| Oslo → Bergen (Bergensbanen) | ~492 km | ~6.5–7.5 h | **~76 km/h** |
| Oslo → Trondheim (Dovrebanen) | ~552 km | ~6.5–6.75 h | **~80–82 km/h** |
| Oslo → Kristiansand (Sørlandsbanen band) | ~350 km | ~4.5 h | **~78 km/h** |

Wikipedia / NTP context: many long-distance NO lines average **~80 km/h** door-to-door schedule (not HSR outside short Gardermoen/regional stretches).

| Bus budget (h) | Rail @ ~76 km/h | Rail @ ~80 km/h |
|----------------|-----------------|-----------------|
| 5.5 h (optimistic bus-400) | **~418 km** | **~440 km** |
| 6.5 h (central) | **~494 km** | **~520 km** |
| 7.0 h (conservative) | **~532 km** | **~560 km** |

**Owner-facing summary:** in the **same clock time** as a ~400 km bus trip (~6.5–7 h), a train typically covers **~450–560 km of rail network** — about **1.1–1.4×** the bus network distance, because rail schedule averages are a bit higher and paths differ.

### 3.3 Haversine vs network vs time (do not mix units)

| Measure | Role |
|---------|------|
| Haversine km | Cheap coarse filter only (today’s v1). **Must not** remain sole admit once PT-reach ships. |
| Road network km | Useful fallback / secondary sort when Entur has no pattern; **not** primary if bus/rail exist. |
| Rail network km | Illustrative; **not** the admit unit — admit is **journey time / feasibility**. |
| Public-transport journey time (bus+rail legs) | **Primary admit unit** for `maybe`. |

Example distortion: Oslo↔Bergen haversine is ~300 km, rail network ~470–530 km, schedule ~6.5–7.5 h — haversine alone **understates** effort.

---

## 4. Proposed product rules (for owner sign-off)

| ID | Rule | Proposed |
|----|------|----------|
| MR-0 | `maybe` cadence = weekly / biweekly home visit (not daily commute) | **Yes** |
| MR-1 | **Primary admit modes:** **bus + train** (Entur `bus` / `rail` / coach; ferry OK as connector) | **Yes** |
| MR-2 | **Primary admit metric:** one-way public-transport journey time ≤ **T** (proposed **T = 7.0 h**, seeded from 400 km bus budget) | **Yes — NEED owner confirm T** |
| MR-3 | Journey must be a real Entur trip pattern hub→hub (kommune hubs), not a fabricated link | **Yes** (aligns G-5 omit-don’t-stub) |
| MR-4 | Air legs **do not** count toward `maybe` admit (Entur sometimes suggests fly) | **Yes — exclude `air`** |
| MR-5 | Private car time remains deferred (`P4-TRANSPORT-PRIVATE` / TR-4) | **Unchanged** |
| MR-6 | Road-km / haversine: **fallback only** when PT extract fails (loud diagnostic); not sole gate once PT live | **Yes — NEED fail-open vs fail-closed** |
| MR-7 | Ordering: shorter PT time first; then road-km; then name | **Yes** |
| MR-8 | `yes` = all sparse national seats (existing); `no` = omit | **Unchanged** |
| MR-9 | Shared module for future fagskole / university geography — same T + mode policy | **Yes** |
| MR-10 | Opus 4.8+ review before merge (G-7) | **Yes** |

### Proposed default threshold

| Constant | Proposed value | Rationale |
|----------|----------------|-----------|
| `MAYBE_PT_MAX_DURATION_H` | **7.0** | Conservative edge of «400 km by Norwegian express bus» band (5.5–7.3 h) |
| Equivalent rail reach (illustrative) | **~530–560 network-km** | At ~76–80 km/h × 7 h — **not** a hard km gate |
| Legacy haversine 400 | Keep as **coarse prefilter** optional (drop candidates already ≫ budget) | Perf only |

---

## 5. Architecture (implementation sketch — after «го»)

1. **Shared module** (not buried in anlegg-only file): e.g. `src/lib/planning/relocation-maybe-reach.ts`
   - Input: home municipality codes, candidate institution municipality, optional Entur hubs.
   - Output: `{ admitted: boolean, durationSec?, modes[], reason }`.
2. **Provider:** existing Entur journey planner (same client family as C-TRANSPORT-KOMMUNE). Prefer **rail then bus** corridors; reject patterns whose best option is air-primary.
3. **Cache:** durable pair cache `(homeKommune, schoolKommune, modePolicyVersion) → duration` — required for fagskole/university scale; cold path must not N+1 Entur on every recompute (see rejected in-process Entur spike — durable cache is the right layer).
4. **Wire order:** P-8 anlegg first → then shared `maybe` for other sparse / post-VGS contours.
5. **Update** geography contract §4.2 from «Entur overlay» wording to: **PT time ≤ T admit; Entur sort; haversine/road fallback**.
6. **Smokes:** fixed pairs with recorded durations (Oslo↔Kristiansand bus; Oslo↔Bergen rail; Oslo↔Kirkenes expect deny or air-reject); assert air-only rejected.
7. QA build; Contour B relay **not** required (runtime filter).

---

## 6. Open questions (owner — blocking before code)

1. Confirm **T = 7.0 h** one-way, or pick another (6.5 / 8.0)?
2. Fail-open (keep haversine 400) vs fail-closed when Entur returns no bus/rail pattern?
3. Count **one connection** OK? (almost always yes for NO long-distance)
4. UX copy: mention «ca. en halv dagsreise med buss/tog» / weekly home visit?
5. Apply immediately only to P-8, or also widen `select-truth-candidate-for-route` maybe radius in the same change?

---

## 7. What this draft is **not**

- Not a claim that Entur morning school-start logistics (T-1…T-12) should gate `maybe`.
- Not approving private-car matrices.
- Not turning on national lists for dense VGS professions (sparse gate stays).
- Not implementing until owner «го» on §6.

---

## 8. References

- `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5 TR-1…TR-3
- `phase-4-route-kommune-transport-logistics-owner-record.md`
- `phase-4-relocation-maybe-weekly-road-km-owner-draft.md` (road-km-only predecessor)
- `src/lib/regional-delivery/anleggsteknikk-sparse-vg2-distance-rank.ts` (v1 haversine 400)
- Schedule calibration sources: Nor-Way / Vy Express published Oslo–Kristiansand / Stavanger times; Bergensbanen & Dovrebanen published durations; Wikipedia «High-speed rail in Norway» long-distance averages (~80 km/h)
- Owner chat 2026-07-20: bus + train primary for `maybe`; calibrate from 400 km bus time vs train distance
