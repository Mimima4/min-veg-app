# Phase 4 — Vilbli home VG2 continuation overlay (owner record)

| Field | Value |
|-------|--------|
| **Status** | **SIGNED** — implement 2026-07-22 |
| **Date (UTC)** | 2026-07-22 |
| **Parent** | `phase-4-county-local-primary-route-completeness-owner-policy.md` (R-3 alternatives) |

---

## Product rule (general Contour B)

When **county-local VG2 is missing** for `(professionSlug, homeCountyCode)`:

```
show in alternative VG2 pool  ⟺
  school listed on that profession’s Vilbli home county side=p5
  ∧ NSR institution match (fail-closed on unmatched / ambiguous)
  ∧ destination-county PSA active (programme_in_school)
  ∧ public school (is_private_school ≠ true)
```

- **Not** a republish of Vilbli — Vilbli is the *listing* signal; NSR + PSA are admission.
- **Not** Utdanning (owner: redundant with Vilbli).
- **Not** a new `availability_scope` and **not** a third UI zone.
- **Not** “add fylke 15 to all north neighbors” (would false-positive other professions).
- Membership is **union** of existing P-7 adjacency nabofylke (public) **and** Vilbli-listed continuations.
- P-6 unchanged: empty primary when local chain incomplete; no foreign schools in home PSA.
- Extract / upsert at **Contour B relay** (ABORT path when required VG2 missing); **not** on page load.

---

## Storage

Table `vgs_vilbli_home_vg2_continuations`:

- PK `(profession_slug, home_county_code, institution_id)`
- `destination_county_code`, `vilbli_school_code`, `updated_at`
- Replace-set per `(profession, home)` on each relay ABORT-with-continuations; clear when local VG2 present.

---

## UI

Same curated P-7 nabofylke alternative card (`alternative_routes[]`). Copy may later say «Vilbli-fortsettelse» — not required for v1.

---

## Verification

- Smokes: false positives (dense profession / no far pins → no spurious Møre bleed)
- Ops: relay dry-run/production for ABORT counties writes allowlist; unmatched pins stay out of UI
- Spot-check: anleggsgartner × {18,55,56} includes Gjermundnes when listed + matched + PSA

---

## Owner decisions

| # | Decision |
|---|----------|
| Truth formula | Vilbli list ∩ NSR ∩ destination PSA ∩ public |
| Utdanning | **No** |
| Scope | General Contour B rule (not profession×region hack) |
| UI | Same P-7 alt zone |
| Manual allowlist | **No** (relay extract only) |
