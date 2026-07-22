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
```

- **Not** a republish of Vilbli — Vilbli is the *listing* signal; NSR + PSA are admission.
- **Not** Utdanning (owner: redundant with Vilbli).
- **Not** a new `availability_scope` and **not** a third UI zone.
- **Not** “add fylke 15 to all north neighbors” (would false-positive other professions).
- **Membership (amended 2026-07-22 / privat 2026-07-22):** Vilbli-listed continuations ∩ NSR ∩ destination PSA. **Includes privatskole when Vilbli lists them** (temporary public-only filter retired). **No** adjacency PSA dump. Allowlist refreshed on **every** Contour B county relay (not cleared when local VG2 exists). P-7 still only *shows* when home VG2 missing + north home scope; P-8 uses the same allowlist for sparse «andre steder». **No** Oslo gold list.
- P-6 unchanged: empty primary when local chain incomplete; no foreign schools in home PSA.
- Extract / upsert at **Contour B relay** for **every** county ingest (success + ABORT-missing-VG2); **not** on page load.
- Do **not** clear allowlist merely because local VG2 exists — P-8 needs out-of-county pins when home also has local seats.
- Alta-style Vilbli lies (listed abroad but no destination PSA / not this year) stay out because PSA admission fails — not a profession×school ban-list.

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
| **Membership (amended 2026-07-22)** | **Always** refresh allowlist from home county Vilbli p5 out-of-county VG2 pins ∩ NSR (fail-closed). Used by **P-7** (when home VG2 missing) and **P-8** sparse alt (anleggsteknikk). **No** clear-on-local-VG2; replace-set each relay. **No** Oslo gold list. |
| Adjacency PSA dump | **No** (amended 2026-07-22) — north scope only, not school membership |
| Utdanning | **No** |
| Scope | General Contour B rule (not profession×region hack) |
| UI | Same P-7 alt zone |
| Manual allowlist | **No** (relay extract only) |
