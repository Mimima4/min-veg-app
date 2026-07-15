# Canonical matching review — matcher rollback checkpoint

| Field | Value |
|-------|--------|
| **Date (UTC)** | 2026-07-15 |
| **Baseline commit** | `14640dc` (pre–Rule-2 nord stop-word) |
| **Scope** | Fylke `34` Innlandet — `Lillehammer videregående skole Avdeling Nord` ambiguous tie |
| **Change applied** | `AVD_LOCATION_BLOCKED_PRIMARY_TOKENS = { nord }` in `scoreAvdLocationInstitutionMatch` only |
| **Explicitly NOT applied** | Identity-before-location reorder; `avdeling` normalization; other direction tokens |

## Baseline classify (`34`, 2026-07-12 export)

All 6 professions: `canonical_matching_review`, 1 ambiguous (3× Karriere false + Lillehammer avd Nord tie on token `nord`).

Artifact: `canonical-matching-review-classify-export-2026-07-12.json`

## After Rule 2 only (`nord` stop-word), classify `34` (2026-07-15)

| Profession | Before | After | Matched Δ | PSA rows (DB, unchanged) |
|------------|--------|-------|-----------|--------------------------|
| electrician | review | **green** | 10→11 | 19 |
| mechanic | review | **green** | 16→17 | 23 |
| carpenter | review | **green** | 12→13 | 22 |
| plumber | review | **green** | 11→12 | 14 |
| painter | review | **green** | 12→13 | 13 |
| anleggsteknikk | review | **green** | 11→12 | 12 |

**Resolved school:** `Lillehammer videregående skole Avdeling Nord` [16888] → NSR `Lillehammer videregående skole avd Nord` (`e06e29ea-…`, kommune Lillehammer 3405), `fallback_fuzzy` score **0.6**.

**Counties 42 / 56 sample:** no status change (regression check).

Artifact: `canonical-matching-review-classify-export-2026-07-15-fylke34-after-nord-stopword.json`

**Prod truth:** PSA row counts unchanged until re-ingest `34` — classify is readiness/diagnostic, not a DB write.

## Post re-ingest `34` (2026-07-15, local CLI + nord stop-word)

Command per profession:
`node --env-file=.env.local scripts/run-contour-b-operational-ingest.mjs --profession <slug> --county 34`

| Profession | Classify | PSA before→after | Lillehammer in matched |
|------------|----------|------------------|------------------------|
| electrician | green | 19→**21** | ✓ fallback_fuzzy |
| mechanic | green | 23→**25** | ✓ |
| carpenter | green | 22→**24** | ✓ |
| plumber | green | 14→**16** | ✓ |
| painter | green | 13→**14** | ✓ |
| anleggsteknikk | green | 12→**13** | ✓ |

**NSR institution:** `Lillehammer videregående skole avd Nord` (`e06e29ea-…`) — **15** active PSA rows in county `34` (VG1/VG2 per profession path).

**Note:** Ingest used **local** matcher (nord fix). Vercel relay bundle still on `14640dc` until matcher is committed + deployed.


```bash
git checkout 14640dc -- scripts/lib/vilbli-nsr-institution-match.mjs
# Re-run classify matrix for 34/42/56 if verifying restore
```

## Superseded: nord blocklist removed for brand-cohort architecture (2026-07-15)

The `AVD_LOCATION_BLOCKED_PRIMARY_TOKENS = { nord }` stop-word hack has been
**removed** in favor of a two-phase, brand-cohort matcher (Variant 1) in
`scripts/lib/vilbli-nsr-institution-match.mjs`:

- **Fix — identity core symmetry:** `extractIdentityCore` and
  `classifyInstitutionMatch` now strip **both** `avd` and `avdeling`
  (`/\b(?:avd|avdeling)\b.*$/`), so Vilbli `avd. Høyanger` and NSR
  `Avdeling Høyanger` share the same brand core (`forde`).
- **Phase 1 (identity only):** `classifyInstitutionMatchForVilbliSchool` no longer
  scores `avd_location`. Ranking is exact / core / conservative-fuzzy only, so a bare
  location token (e.g. `nord`) can no longer inflate an unrelated brand
  (Karriere Innlandet, Nord-Fron, Nord-Østerdal drop out as `none`).
- **Phase 2 (campus within cohort):** `avd_location` is applied **only** to tied
  candidates sharing the Vilbli identity core (`resolveAvdLocationCampusTie`). It can
  never select a brand outside the cohort — so no per-token blocklist is needed.
- **CASE 2 tie:** `isMultiAvdIdentityTie` now also accepts `avd_location_match` ties
  when every candidate shares the same `vilbliCore` (identical avd rows →
  `multi_avd_identity`, 1:1 PSA emission).

Regression coverage in `scripts/smoke-vilbli-nsr-institution-match.mjs`:

- **A** Lillehammer `Avdeling Nord` → Lillehammer avd Nord (no Karriere / Nord-Fron ties).
- **B** Setesdal `Avdeling Hornnes` → 3 identical NSR rows → `multi_avd_identity` → single PSA.
- **C** Førde `avd. Høyanger` → Høyanger campus, not main Førde.
- Invariant: `avd_location` never selects outside the brand cohort.

The previously "rejected" identity-before-`avd_location` ordering no longer breaks the
Førde → Høyanger campus pick, because Phase 2 restores the campus signal *inside* the
brand cohort (both `avd`/`avdeling` now normalize to the same core).

## Rejected approach (historical; do not re-apply the nord stop-word)

**Identity before `avd_location` (naïve global reorder)** — broke campus pick when Vilbli
`avd.` vs NSR `Avdeling` (Førde → Høyanger regression, chat 2026-07-15). Superseded by the
brand-cohort Phase 2 above, which resolves the campus without a global reorder or blocklist.
