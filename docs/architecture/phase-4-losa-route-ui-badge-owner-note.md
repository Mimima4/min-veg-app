# Phase 4 LOSA — Route UI Badge Owner Note (deferred)

| Field | Value |
|-------|--------|
| **Status** | **DEFERRED** — implement when closing **Nordkapp** + **Vadsø** manifest rows |
| **Date (UTC)** | 2026-05-29 |
| **Pattern reference** | `Privatskole` badge in `route-steps-panel.tsx` |

---

## Problem

Today LOSA options use `buildLosaOptionDisplayTitle()` → e.g. `Nordkapp videregående skole – LOSA Båtsfjord`. That embeds **LOSA** in the programme/school title. Dropdown rows show only provider name — **18 identical** `Nordkapp videregående skole` labels.

---

## Target UX (mirror Privatskole)

**Reference:** `PRIVATE_SCHOOL_BADGE_CLASSES` + `institution_is_private_school` in `src/app/[locale]/(app)/app/children/[childId]/route/route-steps-panel.tsx`.

| Element | Ordinary school | LOSA (target) |
|---------|-----------------|---------------|
| Card heading (`display_title`) | Programme title | **Provider only** — `Nordkapp videregående skole` (no `– LOSA {kommune}`) |
| Subline | School name | Same provider label (unchanged) |
| Location line | Municipality | **Delivery kommune** — e.g. `Loppa` |
| Badge | `Privatskole` (orange pill) | **`LOSA`** (same pill pattern, distinct palette TBD) |
| Dropdown row | `schoolName` | `schoolName` + badge **LOSA**; location in secondary line or `schoolName · {kommune}` |

**Detection:** `option.option_kind === 'losa_fjern_delivery_municipality'` (already on route payload) — no new PSA column required for v1.

**Copy:** badge label **`LOSA`**; optional `title` tooltip: *Lokal opplæringsordning / fjernundervisning* (owner to confirm nb/nn).

---

## Code touchpoints (when implemented)

1. `src/lib/losa/availability-scope.ts` — stop emitting `– LOSA {delivery}` from `buildLosaOptionDisplayTitle`; provider-only title + delivery stays on `institution_city`.
2. `route-steps-panel.tsx` — `LOSA_BADGE_CLASSES` + render beside Privatskole on card and dropdown.
3. `enrich-study-route-steps.ts` / `build-steps-from-availability-truth.ts` — align `display_title` with provider-only rule.

---

## Why deferred to Nordkapp + Vadsø rows

Those two rows stress provider/delivery naming (Nordkapp kommune vs Nordkapp VGS; Vadsø vs `nordkapp.vgs.no` LOSA reference). Badge + provider-only title must disambiguate without reintroducing `– LOSA …` in headings. Close remaining **safe** rows (Loppa, Måsøy) first; revisit this note at **row 17–18** gate.
