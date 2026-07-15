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

## Rejected approach (do not re-apply)

**Identity before `avd_location`** — breaks campus pick when Vilbli `avd.` vs NSR `Avdeling` (Førde → Høyanger regression proved in chat 2026-07-15).
