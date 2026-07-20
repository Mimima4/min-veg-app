# Kommune-transport / Entur speed spike — rejection record

| Field | Value |
|-------|--------|
| **Status** | **REJECTED — NOT APPLIED** |
| **Date (UTC)** | 2026-07-20 |
| **Save point (continue from)** | `f76a474a16abce2982e914a09cf72b2429cc08a7` (`f76a474`) |
| **Working tree** | All spike code discarded; tree returned to save point (this docs record only) |
| **Verdict** | No substantial user-facing improvement. Warm-cache gains are friction, not product progress: almost all real users hit cold Entur path. |

---

## 1. Goal of the spike

Reduce wall-time of Contour B study-route recompute when `buildKommuneTransportSortContext` calls Entur (hub resolve + corridor morning trips). Entur remains **required** for personal default-route school ranking (transport rank → VG1/VG2 school choice); this was never “optional sort”.

---

## 2. Constraints agreed during the spike

| Rule | Decision |
|------|----------|
| Rollback model | Commit rollback only — **no** long-lived feature branch for this work |
| Save point | `f76a474` — restore with `git reset --hard f76a474` if needed |
| Commits | **Forbidden** until full plan + performance comparison |
| Benchmark env | **Dev** (`.env.local`, `http://localhost:3000`) — not prod |
| Benchmark child | Miya `fafad05c-4bf6-43c6-9142-7982262993bc`, anleggsteknikk draft `d0c9d010-d882-436c-a3c1-b98712590d46` |
| Benchmark protocol | 5 sequential `POST /api/internal/routes/trigger-study-route-recompute` runs before vs after, table + mean |

---

## 3. What was implemented (then discarded)

All of the following lived only in the working tree on top of `f76a474`. **None were committed. None are accepted. All discarded on 2026-07-20.**

### P2+P3 — Entur fetch resilience + hub concurrency

- `src/lib/planning/kommune-transport/entur-fetch.ts` — timeout ~6s, up to 3 attempts, jitter backoff, `[kommune-transport:entur]` logs
- Constants in `kommune-transport/constants.ts`
- `entur-client.ts` routed through the helper
- Hub resolve in `build-transport-sort-context.ts` via `mapWithConcurrency` (max 8)

### P1 — Persist kommune → StopPlace

- Migration `20260720120000_kommune_transport_hubs.sql`
- Store `kommune-transport-hub-store.ts`
- Runtime: DB → live Entur → persist; fail-open if table missing
- Ops script `scripts/resolve-kommune-transport-hubs.mjs`
- `supabase` passed through recompute call sites

### P4 — Durable corridor cache

- Migration `20260720130000_kommune_transport_corridor_trips.sql`
- Store `kommune-transport-corridor-store.ts`
- L1 memory → L2 Postgres → L3 live Entur in `hub-corridor-cache.ts`

### P5 — Prewarm on relay / scheduled ops

- `run-kommune-transport-prewarm.ts` + internal API + `scripts/run-kommune-transport-prewarm.mjs`
- Hooked after Contour B Vilbli relay and in `run-vgs-scheduled-ops.mjs`

### P6 — Not done

- Parallel morning fallback in `planMorningTripsFromHub` — never implemented

### Known issues left unfixed (intentionally during spike)

- On Entur fail: `RANK_UNKNOWN=400` ranked above `NOT_REACHABLE=800` — possible school-choice inversion
- `computed: true` even when transport did not succeed

---

## 4. Benchmark results (dev, 2026-07-20)

**Metric:** client wall-time of internal recompute (ms).  
**Before:** clean tree at `f76a474`.  
**After:** same commit + uncommitted P1–P5 spike.  
**Protocol:** fresh `npm run dev` per side → 5 sequential recomputes (no restart between runs).

| Замер | До (мс) | После (мс) | Δ |
|------:|--------:|-----------:|--:|
| 1 (cold) | 21 798 | 16 291 | −5 507 |
| 2 | 6 662 | 6 576 | −86 |
| 3 | 6 836 | 6 270 | −566 |
| 4 | 6 304 | 6 876 | +572 |
| 5 | 6 264 | 6 668 | +404 |
| **Среднее (все 5)** | **9 573** | **8 536** | **−1 037 (−11%)** |
| **Среднее без замера 1** | **6 517** | **6 598** | **+81 (~noise)** |

### Dev DB note at measurement time

Tables `kommune_transport_hubs` and `kommune_transport_corridor_trips` were **not** applied in the connected Supabase project. P1/P4/P5 therefore ran **fail-open** (no durable cache / no useful prewarm). Measured “after” mostly reflects P2+P3 + process-local memory cache.

---

## 5. Why this is rejected (owner framing)

1. **Almost all real users are cold.** A family opening a route / triggering recompute does not benefit from a warm in-process Entur corridor cache left by a previous call on the same Node process. Treating warm runs 2–5 as “the win” is product friction: it optimizes a lab condition users rarely see.
2. **Cold improvement was modest and incomplete.** ~22 s → ~16 s (−25% on run 1) still leaves a multi-second Entur-bound recompute; not a meaningful UX step-change.
3. **Warm path unchanged.** Runs 2–5 stayed ~6.3–6.9 s on both sides — spike did not move the steady-state user-visible cost once memory already held corridors.
4. **Durable cache was unproven in the comparison.** Even if migrations + prewarm later shave cold cost, that path was not demonstrated under the agreed benchmark; accepting the spike would ship complexity (migrations, ops scripts, relay hooks, fail-open semantics, ranking risk on Entur fail) without an accepted cold-user proof.
5. **Decision:** do **not** apply, do **not** commit, do **not** migrate. Continue product work from save point `f76a474`.

---

## 6. Disposition

| Item | Action |
|------|--------|
| Spike code / migrations / scripts / API routes | **Discarded** (restored / deleted to match `f76a474`) |
| This document | **Kept** as working artifact of negative result |
| Next Entur latency work | Requires a **new** plan aimed at **cold** user path (or architectural change that removes live Entur from the critical recompute path without changing ranking truth) — not a revive of this spike by default |

---

## 7. Restore command (if tree ever drifts)

```bash
git reset --hard f76a474a16abce2982e914a09cf72b2429cc08a7
```

Do not re-apply the discarded spike files from history or chat unless owner explicitly reopens the problem with a cold-path success criterion.

---

## 8. Independent review conclusion (2026-07-20)

Second-opinion review of this record and the owner rejection decision.

**Verdict: rejection is correct.** The document is honest; the stop is evidence-based loss-cutting, not abandonment.

**Cold-user framing holds.** Runs 2–5 reflect one warm dev process holding Entur corridors in memory. A real family opening a route, hitting a fresh serverless instance, or returning after idle time lands closer to run 1. Averaging all five runs (−11%) mixes lab conditions with product reality; judging by cold path is the right product lens.

**Technical rejection is justified.**

- “After” mostly measured P2+P3; P1/P4/P5 were not active (dev tables missing). Accepting would ship migrations, ops hooks, and fail-open paths without proven cold benefit.
- 22 s → 16 s is noticeable but not a UX step-change; warm path (~6.3–6.9 s) did not move.
- Unfixed ranking risk on Entur fail makes the complexity/reward ratio unacceptable for this package.

**What the spike did prove (not wasted).** In-process cache does not solve the product problem. If Entur latency is revisited, success criteria are already defined: **cold, single request, no warm-up**; separate reliability work (timeout/retry) from speed work (durable prewarm), not one bundled commit.

**Outcome:** rollback to `f76a474` plus this record is the mature path — do not commit “almost better,” do not carry unproven complexity.
