# Phase 0–6 Contour B — Painter Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **PILOT CLOSED** (prod UI verified 2026-07-10) |
| **Date (UTC)** | 2026-07-10 |
| **Profession slug** | `painter` (catalog: Maler) |
| **Parent gate** | `VGS_OPERATIONAL_RUNNERS.md` § Expansion gate |

---

## Signed Vilbli contour (`V.BA` — Overflateteknikk chain)

**Core school path (materialized per fylke):**

| Step | Vilbli label | Course tokens (reference) |
|------|----------------|---------------------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Overflateteknikk | `V.BAOFT2----` |

**VG3 / Opplæring i bedrift (UI — kolonne 3 from *this* chain in *this* fylke):**

Show kolonne-3 / bedrift continuations Vilbli lists on the county `bygg-og-anleggsteknikk-skoler-og-laerebedrifter` page for kurs `V.BABAT1----_V.BAOFT2----_V.BAMOT3----` (e.g. Maler- og overflateteknikkfaget, Industrimalerfaget, sibling bygg specializations where listed).

**Product policy (owner 2026-07-09):**

| Show | Do not show |
|------|-------------|
| Overflateteknikk chain only (`BAOFT2`) | Other VG2 columns (Tømrer, Rørlegger, …) as separate product professions |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.BA` branches |
| | **Påbygging til generell studiekompetanse** |

Catalog profession: **Maler**. Route truth is **programme-path-scoped** (painter contour), not “every bygg job in Norway”.

**V.BA shared VG1 rule:** `painter` shares VG1 Bygg with `carpenter` and `plumber`. Keep **separate** `profession_slug` and path truth; wire **VG2 cross-profession programme switch** on the VG2 step (no mixed school lists).

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart (overflateteknikk) | https://www.vilbli.no/nb/no/strukturkart/V.BA/overflateteknikk?kurs=V.BAOFT2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAOFT2----_V.BAMOT3----&side=p5` |
| Program overview | https://www.vilbli.no/nb/no/om/v.ba/bygg-og-anleggsteknikk |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `painter-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `painter-vg2-overflateteknikk-{countySlug}` | VG2 Overflateteknikk |

Trøndelag (`50`): `painter-vg1-bygg-trondelag`, `painter-vg2-overflateteknikk-trondelag`.

VG3/bedrift: expanded from Vilbli bedrift links (`painter-vg3-{title}-{countySlug}` pattern).

---

## Lærebedrift ingest

| Field | Value |
|-------|--------|
| Primary `larefag_code` | `MALER_OG_OVERFLATETEKNIKKFAGET` |
| VIGO api query | `BAMOT3` |
| Sibling on chain | `INDUSTRIMALERFAGET` / `BAIMF3` (kolonne-3 selection) |
| Cron batch | Batch 0 (`MALER_OG_OVERFLATETEKNIKKFAGET`, `INDUSTRIMALERFAGET`) — `scheduled-larebedrift-ingest-fags.ts` |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **OK — Bygg → Overflateteknikk** (`BAOFT2`), not full `V.BA` VG2 menu |
| P-2 | VG3/bedrift list | **OK — kolonne-3 for Bygg→Overflateteknikk chain** |
| P-3 | NAV matcher | **OK — catalog level `håndverkere.maler`** |
| P-4 | V.BA VG2 switch | **OK — sibling switch with carpenter/plumber** |
| P-5 | Empty bedrift | **OK — godkjent-only truth** |
| P-6 | Northern fylke (VG2=0 local) | **OK — no primary route in home fylke; no VG1-only patch** (`phase-4-county-local-primary-route-completeness-owner-policy.md`) |
| P-7 | Cross-fylke Vilbli schools | **OK — alternative routes only** when home has VG1 PSA and neighbor has VG2+ PSA (Vilbli split: VG1 home, VG2 neighbor); never primary |

---

## Northern fylke note (Overflateteknikk)

County-scoped Vilbli extract (2026-07-09): Troms `55` and Finnmark `56` have **VG1>0, VG2=0** for `BAOFT2`. Carpenter/plumber branches still have local VG2 in the same counties — painter is the first V.BA branch hitting this pattern.

| Fylke | Primary painter route | PSA ingest |
|-------|----------------------|------------|
| `03,11,18,31,46,50` | Eligible when full chain in PSA | `verification_ready_after_write` |
| `55,56,…` (no local VG2) | **Not available** (R-2) | Pipeline **must not** partial-write; `missing_programme_rows` / ingest abort expected |
| Neighboring fylke with VG2 | **Alternative only** (P-7, planned automation) | Separate county PSA |

---

## Classify matrix (2026-07-09, post primary gate `e0098e3`)

| County | `status` | Primary route | Notes |
|--------|----------|---------------|-------|
| `03` Oslo | `verification_ready_after_write` | Yes | Relay dry-run pending per county |
| `11` Rogaland | `verification_ready_after_write` | Yes | |
| `18` Nordland | `verification_ready_after_write` | Yes | |
| `31` Østfold | `verification_ready_after_write` | Yes | Pilot county for bedrift E2E |
| `46` Vestland | `verification_ready_after_write` | Yes | Relay dry-run **OK** (`contour_b_partial`) |
| `50` Trøndelag | `verification_ready_after_write` | Yes | |
| `15` Møre og Romsdal | `missing_programme_rows` | **No** (Vilbli VG2=0) | Relay ABORT by design; not north P-7 |
| `32` Akershus | `missing_programme_rows` | **No** (Vilbli VG2=0) | Relay ABORT by design |
| `33` Buskerud | `missing_programme_rows` | **No** (Vilbli VG2=0) | Relay ABORT by design |
| `39` Vestfold | `missing_programme_rows` | **No** (Vilbli VG2=0) | Relay ABORT by design |
| `40` Telemark | `missing_programme_rows` | **No** (Vilbli VG2=0) | Relay ABORT by design |
| `34` Innlandet | `canonical_matching_review` | PSA ingested; matching review | Prod relay ingested 2026-07-10; programmes materialized |
| `42` Agder | `canonical_matching_review` | PSA ingested; matching review | Prod relay ingested 2026-07-10; programmes materialized |
| `55` Troms | `missing_programme_rows` | **No** (VG2=0 local) | Pipeline abort + runtime gate |
| `56` Finnmark | `missing_programme_rows` | **No** (VG2=0 local) | Pipeline abort + runtime gate |

**Runtime gate (P-6):** `home-county-primary-route-completeness.ts` — no VG1-only primary steps when home fylke PSA lacks VG1+VG2.

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding + bedrift pilot | **Done** (`617e62d`) |
| Primary completeness gate (P-6) | **Done** (`e0098e3`, `1fe01f8`) |
| Classify green counties | **Done** (6× `verification_ready_after_write`) |
| Relay dry-run (green counties) | **Done** (`03,11,18,31,46,50`) |
| Production relay (green matrix) | **Done** (owner sign-off 2026-07-10) |
| P-7 north alternatives (VG1 home + VG2 neighbor) | **Done** (`1fe01f8`; UI verified Troms/Finnmark) |
| Browser E2E (green fylke) | **PASS** (`npm run test:e2e:painter`, 2026-07-09) |
| Prod UI spot-check | **Done** (owner 2026-07-10) |

### Post-closure expansion (not blocking pilot)

| Fylke | Vilbli extract (painter) | Relay | Product |
|-------|---------------------------|-------|---------|
| `34` Innlandet | VG1+VG2 | **ingested** 2026-07-10 | Classify still `canonical_matching_review` — route may work after review |
| `42` Agder | VG1+VG2 | **ingested** 2026-07-10 | Classify still `canonical_matching_review` — route may work after review |
| `15,32,33,39,40` | VG1 only, VG2=0 | **ABORT** (correct) | No primary; no P-7 (not `55`/`56`) |
| `55,56` | VG1 only, VG2=0 | **ABORT** (correct) | P-7 alternatives only; VG1 PSA via shared `carpenter-vg1-bygg-*` until painter catalog rows exist |

**North VG1 slug note:** `painter-vg1-bygg-troms/finnmark` catalogue rows are **not** materialized — Contour B ingest ABORTs without local VG2. Runtime reads home VG1 through **V.BA shared VG1** (`painterHomeVg1ProgrammeSlugsForFylke`). Not a hack; matches owner P-6/P-7 policy.
