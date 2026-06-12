# Phase 4 — Route recompute UX, refresh policy & global loader owner note

| Field | Value |
|-------|--------|
| **Status** | **A′ + B + C IMPLEMENTED** (2026-06-11) |
| **Date (UTC)** | 2026-06-10 |
| **Governs** | Draft/saved stale UX, background refresh, `MinVegRoadLoader` |
| **Master spec** | `route-engine-master-spec.md` — principle *better outdated + visible than silently wrong* |

---

## Owner decisions (signed 2026-06-10)

| # | Decision | Status |
|---|----------|--------|
| R-1 | **Draft + stale:** do **not** block page load on full recompute; do **not** show stale school/VG steps as truth | **OK** |
| R-2 | **Draft + stale:** fast shell + global loader **without** VG1/school step names until fresh snapshot | **OK** |
| R-3 | **Saved + stale:** keep saved snapshot; surface `newRouteAvailable` / outdated warning — **no** silent overwrite | **OK** |
| R-4 | **Refresh policy:** event-driven (Vilbli relay / `truth_version`, profile change, logic-version bump) — **not** weekly full recompute | **OK** |
| R-5 | **Optional batch:** rare job in **03:00–05:00** (quarterly or aligned with **6-month** Vilbli relay per `VGS_OPERATIONAL_RUNNERS.md`) | **OK** |
| R-6 | **Entur:** sort-only (T-1); `route_input_signature` does **not** include timetable — day-to-day disruptions must not reshape routes | **OK** |
| R-7 | **`MinVegRoadLoader`:** one global “thinking” animation for slow blocking surfaces (route recompute, heavy loads) — not every short button click | **OK** |
| R-8 | **Loader animation:** **top → down** — lines grow **from pin downward**; pin stays top-center; **no** rotate or mirror of logo | **OK** |

---

## Stale draft UX (R-1, R-2)

**Problem today:** `get-study-route-detail.ts` awaits full `triggerStudyRouteRecompute` on SSR when `status === "draft"` and signature is stale — 30–100s blocking, and user may still see outdated school names during the wait.

**Target:**

1. Page returns quickly with `recomputePending: true` (or equivalent) and **no** stale VG1/school steps in the step list.
2. Client triggers recompute (or server kicks async job) and polls / refreshes until snapshot is fresh.
3. User orients on **school name appearing** in the route — not on transport badges during load.
4. Aligns with master spec: never present stale snapshot as current truth.

**Saved routes:** unchanged — show last saved snapshot + banner when a newer working route exists or signature drifted (`showUpdateAvailableForSavedRoute` pattern).

---

## Refresh policy (R-4, R-5, R-6)

| Trigger | Action |
|---------|--------|
| Vilbli Contour B relay / ingest (`truth_version` change) | Recompute **affected** working (draft) routes — background |
| Child profile save (route-relevant fields) | Recompute that child’s working route — existing trigger |
| Logic version bump (`v3-norm-before-exception`, transport contour, etc.) | Recompute drafts whose snapshot predates version |
| Entur nightly timetable | **No** automatic route recompute (transport is sort-only) |
| Scheduled batch | **Optional** — **03:00–05:00**, at most quarterly or on **6-month** relay cadence; not nightly Entur sweep |

**Explicitly rejected:** weekly full recompute of all routes.

**Ops reference:** `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — Vilbli major offer updates ~January yearly; production relay **≥ every 6 months**.

---

## `MinVegRoadLoader` (R-7, R-8)

### Role

Single reusable component for app-wide “system is working” states where honest content cannot be shown yet. **Not** for sub-200ms interactions.

**Initial surfaces:** route detail (draft + stale), other slow blocking loads as needed.

### Visual (brand)

- **One road, two edges** — chevron `/\`, **not** two parallel logo stripes.
- **Pin** at **top center** — same orientation as logo; static (or light fade-in at loop start).
- **Two path strokes** grow **from pin downward and outward** — route **unfolds from the goal**.
- Real SVG/CSS animation (`stroke-dashoffset`), not a static GIF.

### Narrative (owner)

> Goal first appears as a distant point (pin). As planning proceeds, the abstract target becomes a **concrete path** — edges reveal **from the pin down** toward the user.

Copy examples: *«Строим маршрут…»*, *«Прокладываем путь…»* (nb/nn TBD in i18n).

### Animation cycle

1. Pin visible immediately.
2. Both edges draw **simultaneously** top → down (~0.8–1.2s, `ease-out`).
3. Short hold (~0.2s) on full `/\`.
4. Soft fade of **lines only** (pin stays) → loop.

### Accessibility

`prefers-reduced-motion`: pin + subtle opacity pulse; no stroke draw.

### Do not

- Flip or rotate logo 180°.
- Mirror horizontally.
- Use two unrelated parallel curves from the side-logo asset.
- Show stale school names behind a “loading” badge.

---

## Implementation phases (engineering)

| Phase | Scope |
|-------|--------|
| **A′** | Non-blocking draft stale path + honest loader shell — **done** |
| **B** | Parallel Entur in `build-transport-sort-context.ts`; hub→hub cache — **done** |
| **C** | Production background jobs: post-relay draft recompute; 03:00–05:00 batch + ops scripts — **done** |
| **D** | Instant `loading.tsx` on route navigation; loader i18n (nb/nn/en/se) — **done** |

### Code touchpoints (when implemented)

1. `src/server/children/routes/get-study-route-detail.ts` — stop awaiting full recompute on SSR for stale draft; return pending flag + empty school steps.
2. `src/server/children/routes/trigger-study-route-recompute.ts` — callable from client / job without blocking GET.
3. `src/app/.../route/route-steps-panel.tsx` (or route page) — wire `MinVegRoadLoader` when `recomputePending`.
4. `src/components/` (TBD) — `MinVegRoadLoader` SVG component + i18n strings.
5. Background job / cron charter (phase C) — see **Phase C ops** below.

---

## Phase C ops (implemented 2026-06-11)

### Event: Vilbli Contour B relay ingest

After successful `ingest-contour-b-vilbli-relay` (`action: "ingested"`, not dry-run), the server **fire-and-forgets** a background batch:

- Scope: `professionSlug` + `countyCode` from relay
- Only **draft** routes for that profession where child **home fylke** matches relay county
- Only routes with **stale** `route_input_signature`
- `trigger_reason: truth_relay_refresh`

### Scheduled / manual batch

`GET|POST /api/internal/routes/run-stale-draft-recompute-batch`

Auth: `CRON_SECRET` or `BILLING_SYNC_SECRET` (Bearer or `x-internal-secret`) — same as other internal schedulers.

| Param | Default | Notes |
|-------|---------|--------|
| `force` | false | Required outside **03:00–05:00 Europe/Oslo** |
| `dryRun` | false | List stale count only |
| `professionSlug` | all | Optional filter |
| `countyCode` | all | Optional child-home fylke filter |
| `maxRoutes` | 40 | Cap per run |
| `concurrency` | 2 | Parallel recomputes |

Example (manual, any time):

```bash
curl -sS -X POST "$APP_URL/api/internal/routes/run-stale-draft-recompute-batch" \
  -H "Authorization: Bearer $BILLING_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"force":true,"dryRun":true}'
```

Quarterly / 6-month launchd: `npm run ops:scheduled` (full) or `npm run ops:scheduled -- --skip-relay --skip-green-a` (quarterly sweep). See `VGS_OPERATIONAL_RUNNERS.md` § Unified scheduled ops.

---

## Relationship to master spec

Master spec § working route stale → auto-recompute remains valid at the **data** layer. This note refines **presentation**:

- Recompute still runs for draft routes when stale.
- UI must not block on it or display the pre-recompute snapshot as truth.
- Saved / locked routes: no silent mutation — unchanged.
