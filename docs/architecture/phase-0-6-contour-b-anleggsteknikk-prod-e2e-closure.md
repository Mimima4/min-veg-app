# Phase 0–6 — Anleggsteknikk Prod E2E Closure

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — Block C + bedrift kolonne-3 prod sign-off 2026-07-12 |
| **Date (UTC)** | 2026-07-12 |
| **Prerequisite** | `3b286b1`+ (kolonne-3 roster, batch 7 ingest) |

---

## Automated proof

| Check | Result |
|-------|--------|
| `npm run smoke:kolonne3-larefag-mapping` | PASS — 9/9 anlegg URL match |
| `npm run verify:kolonne3-roster -- anleggsteknikk` | PASS — 9/9 vs Vilbli Vestland |
| `npm run test:e2e:anleggsteknikk` | PASS when `E2E_CHILD_ID` set |
| Nationwide bedrift ingest | PASS — 2140 active rows (8 fag with godkjent; Fundamenteringsfaget 0) |

---

## Prod spot-check (owner 2026-07-12)

- [x] VG1 + VG2 Anleggsteknikfaget — schools render
- [x] Fagvalg — 9 kolonne-3 options
- [x] Bedrift — employers for sampled fag (incl. Anleggsmaskinfører, Anleggsrørlegger, Vei- og anleggsfaget)
- [x] Fundamenteringsfaget — empty bedrift (0 godkjent nationwide — OK per charter)

**Sign-off:** owner confirmed in chat 2026-07-12.

---

## Out of scope (parallel batch ops)

| Item | Status |
|------|--------|
| `34` / `42` / `56` `canonical_matching_review` | Batch hygiene — not runtime blocker |
| Oslo `03` VG2=0 ABORT | Expected — primary empty per P-6 |
| P-3 NAV matcher classify confirm | **OK** — `bygg-og-anlegg.maskin--og-kranfører` present in NAV snapshot; map resolve PASS 2026-07-21 |

---

## References

- `phase-0-6-contour-b-anleggsteknikk-vilbli-branch-owner-record.md`
- `data/larebedrift/kolonne3-rosters/anleggsteknikk.json`
