# Phase 4 — Route Mobile API Contract v1

| Field | Value |
|-------|--------|
| **Status** | **OWNER SIGNED** — contract review complete 2026-06-10 |
| **Scope** | VGS route read model + mutations via existing internal API |
| **Applies to** | Web client, future native/mobile — **same server modules, same JSON** |
| **Primary types** | `src/lib/routes/route-types.ts`, `src/lib/routes/route-signal-types.ts` |
| **Primary SoT** | `docs/architecture/route-engine-master-spec.md` |

---

## 1. Boundary

| In scope | Out of scope |
|----------|----------------|
| `/api/internal/routes/*` read + write for child study routes | Higher-ed / institute routes (separate contour later) |
| `StudyRouteReadModel` v1 fields documented below | Entur / kommune-transport internals on client |
| Snapshot `selected_steps_payload` shape (persisted truth) | Direct Supabase table access from mobile |
| LOSA option identity + save keys | New snapshot fields for transport metadata in v1 |

**Transport (kommune logistics):** server-only enrichment at recompute/create time. Mobile **must not** re-sort schools or call Entur. Effect is visible only as default `institution_name` / `options[]` order in the read model after server recompute.

**VGS universality:** one shared contour for all professions and counties — no profession-specific API branches.

---

## 2. Authentication

| Caller | Requirement |
|--------|-------------|
| Parent app (web or mobile) | Valid Supabase **authenticated session** (same project JWT as web). Routes are resolved by `childId` + family membership via RLS / server checks. |
| Internal automation | `POST` + header `x-internal-secret: $BILLING_SYNC_SECRET` on `trigger-study-route-recompute` only (admin client bypass). **Not** for mobile apps. |

Mobile must use the **same origin** deployment as web (`VERCEL_APP_URL`) or an explicitly approved API gateway that forwards session cookies / bearer JWT.

---

## 3. Response envelope (all endpoints)

**Success:**

```json
{
  "ok": true,
  "data": { },
  "meta": { "modelVersion": "v1", "generatedAt": "<iso8601>" }
}
```

Mutations may use `updated` (full `StudyRouteReadModel`) and/or `result` (ids/status subset) instead of `data`.

**Error:**

```json
{
  "ok": false,
  "error": { "code": "<RouteErrorCode>", "message": "...", "details": {} }
}
```

**Stable error codes** (`src/server/children/routes/route-errors.ts`):  
`invalid_request`, `route_not_found`, `profession_not_saved_for_child`, `route_access_denied`, `route_readonly_state`, `route_recompute_failed`, `route_variant_conflict`, `route_recompute_pending`, `internal_error`.

**Note:** `get-study-route-alternatives` and `get-study-route-available-professions` currently map failures to `internal_error` only — mobile should treat unknown errors as retryable.

---

## 4. Endpoints

Base path: `/api/internal/routes/` — all **POST**, `Content-Type: application/json`.

| Endpoint | Request body | Response `data` / `updated` |
|----------|--------------|-----------------------------|
| `get-child-routes-overview` | `{ childId, locale?, childDisplayName? }` | `ChildStudyRoutesOverview` |
| `get-study-route-detail` | `{ childId, routeId, locale? }` | `StudyRouteReadModel` (+ extension fields §5) |
| `create-initial-study-route` | `{ childId, targetProfessionId, locale? }` | `updated`: `StudyRouteReadModel`; `result`: `{ routeId, routeVariantId }` |
| `save-study-route` | `{ childId, routeId, locale?, selectedOptions? }` | `updated`: `StudyRouteReadModel`; `result`: `{ routeId, routeVariantId, status }` |
| `trigger-study-route-recompute` | `{ childId, routeId, locale? }` | `updated`: `StudyRouteReadModel` |
| `remove-saved-study-route` | `{ childId, routeId }` | `result` (archive outcome) |
| `remove-saved-profession` | `{ childId, professionId }` | `result` |
| `get-study-route-alternatives` | `{ routeId }` | `StudyRouteAlternativeTeaser[]` |
| `get-study-route-available-professions` | `{ routeId, locale? }` | `StudyRouteAvailableProfessionsBlock` |

**Web parity:** route detail/overview pages call the same server functions (`getStudyRouteDetail`, `getChildStudyRoutesOverview`) — mobile using these APIs gets **equivalent** read models to web RSC, not a reduced DTO.

---

## 5. `StudyRouteReadModel` v1 (stable for mobile)

Canonical type: `StudyRouteReadModel` in `route-types.ts`.

| Section | Stable fields | Mobile notes |
|---------|---------------|--------------|
| `identity` | `routeId`, `childId`, `targetProfessionId`, `targetProfessionSlug`, `routeVariantId`, `status` (`draft` \| `saved`), `generatedAt`, `lastMeaningfulChangeAt` | `status` drives edit vs locked semantics |
| `header` | `professionTitle`, `overallFitLabel`, `feasibilityLabel`, `realismLabel`, `competitionLevel`, `competitionLabel`, `stepsCount`, `warningsCount`, **`newRouteAvailable`** | Show banner when `newRouteAvailable === true` (saved route stale / material shift) |
| `steps` | Ordered array — see §6 | First programme step = server default (includes transport sort) |
| `signals` | `warnings[]`, `improvementGuidance[]`, `evidenceComposition`, summaries | Display-only |
| `availableProfessions` | `items[]`, `emptyState` | Optional panel |
| `alternativeRoutes` | `StudyRouteAlternativeTeaser[]` | Optional panel |
| `allowedActions` | booleans (`canEditRoute`, `canSaveAsNewVariant`, …) | Prefer server flags over client guesses |
| `savedSelectionSignatures` | `string[]` | Optional — dedupe save UX on web |

**Extension fields** (returned by `getStudyRouteDetail`, not on base type — **stable for mobile v1**):

- `alreadySavedEquivalent: boolean`
- `equivalentSavedRouteId: string | null`

---

## 6. Step / option contract (snapshot v1)

Persisted rows use `type` discriminator (`route-types.ts`).

### `programme_selection` (VG1 / VG2 / VG3 / higher stages)

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `"programme_selection"` |
| `title`, `education_level`, `program_slug`, `fit_band` | yes | `education_level` lowercase e.g. `"vg1"` |
| `institution_name` | yes | Default selection after server sort |
| `institution_city`, `institution_municipality`, `institution_website` | optional | Display |
| `source` | optional | `"availability_truth"` \| `"legacy"` |
| `options[]` | when multi-school | Constructor list — **order is server-sorted** (transport + chain + distance) |

**Option row (constructor):**

| Field | Notes |
|-------|-------|
| `institution_id` | UUID |
| `institution_name` | Ordinary: school name. LOSA: **provider only** (no inline `– LOSA …`) |
| `option_kind` | `"losa"` for LOSA delivery rows |
| `delivery_municipality_code` | LOSA delivery kommune code |
| `delivery_site_label` | LOSA delivery label (e.g. `Vadsø`) |
| `verification_status` | `"verified"` \| `"needs_review"` |
| `display_title` | Optional enriched title |

**LOSA option id** (for save): `buildProgrammeSelectionOptionId` in `src/lib/losa/availability-scope.ts` — pattern `programme-losa-{institutionId}-{municipalityCode}`.

### Other step types

`progression_step`, `apprenticeship_step`, `outcome_step` — same snapshot file; apprenticeship uses `apprenticeship_options[]` + `option_id` on save.

**Not in API v1:** `kommune_transport_logic_version`, Entur margins, reachability ranks — server-only inside `route_input_signature` hash.

---

## 7. Save contract (`save-study-route`)

`selectedOptions`: `Record<string, string>` — keys:

```
snap-{index}-{type}-{program_slug|none}
```

Value: option id from `buildProgrammeSelectionOptionId(option, index)` or apprenticeship `option_id`.

Mobile must build keys from **current** `steps[]` indices returned by `get-study-route-detail` (same as web `route-steps-panel.tsx`).

---

## 8. Recompute / freshness (mobile expectations)

| Route status | Behavior |
|--------------|----------|
| `draft` | Opening detail via API may trigger server auto-recompute when inputs stale (planning fields, truth version, **`kommune_transport_logic_version`** in signature). Mobile should re-fetch detail after profile edits. |
| `saved` | Snapshot **not** silently replaced. `header.newRouteAvailable` or overview `newRouteAvailable` signals review needed. |
| Profile save | Web triggers `trigger-study-route-recompute` for all routes when route-relevant fields change — mobile should call the same endpoint after equivalent profile updates. |

**Pilot note:** kommune transport sort runs only when child home fylke is in `KOMMUNE_TRANSPORT_PILOT_FYLKE_CODES` (`46` Vestland today). Other fylker: same API, transport context empty → legacy distance/chain sort only.

---

## 9. Review findings (2026-06-10)

| Check | Result |
|-------|--------|
| Transport adds new snapshot fields | **PASS** — none |
| Mobile can use same endpoints as web | **PASS** |
| LOSA option ids stable for save/reload | **PASS** — documented in §6 |
| Read model parity API vs RSC | **PASS** — shared `getStudyRouteDetail` |
| Alternatives / available-professions error shape | **WARN** — use generic `internal_error`; consider aligning to `toRouteErrorResponse` later (non-blocking) |
| Institute / higher-ed routes | **OUT OF SCOPE** — separate contract when contour exists |

---

## 10. Non-goals (v1)

- Client-side Entur or commute time display
- Public unauthenticated route sharing API
- Export PDF / share endpoints (`allowedActions.canExportConsultationPdf` false)
- Expanding transport pilot fylke list (owner gate per `phase-4-route-kommune-transport-logistics-owner-record.md`)

---

## References

- `docs/architecture/route-engine-master-spec.md`
- `docs/architecture/route-engine-execution-bridge-v1.md`
- `docs/architecture/phase-4-route-kommune-transport-logistics-owner-record.md`
- `src/lib/routes/route-types.ts`
- `src/app/api/internal/routes/*`
