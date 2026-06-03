# Phase 4 LOSA Refresh Pilot 2b — Tier 2 School URLs Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **Pilot 2b** curated per-school URL list — docs-level adoption only |
| **Closure label** | `PHASE_4_LOSA_REFRESH_PILOT_2B_TIER2_SCHOOL_URLS_ADOPTED` |
| **Scope** | Bounded **official school homepage** fetches for Finnmark **`56` reference** — **3** schools max in this pilot |
| **Date (UTC)** | 2026-06-03 |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — **P4-LOSA-REFRESH-PILOT-2B** |
| **Prerequisites** | **P4-LOSA-REFRESH-PILOT-2-post**, **P4-LOSA-REFRESH-IMPL-post** |
| **Registry pattern** | `T2_OFFICIAL_SCHOOL_PATTERN` |

**NOT_READY_FOR_APPLY** unchanged. No PSA, Phase 2 DML, UI (**#3**), **#2** write on `56`, Vilbli deep URLs, or invented kommune/fylke pages in this pilot.

---

## Curated school fetch rows (Pilot 2b)

| fetch_id | School (planning label) | URL | Host | Owner rationale |
|----------|-------------------------|-----|------|-----------------|
| `T2_SCHOOL_ALTA_VGS` | Alta videregående skole | `https://alta.vgs.no/` | `alta.vgs.no` | `norway-school-identity-matching-spec.md` test case §1; Phase 2 backlog **Case C** / bilingual alias context |
| `T2_SCHOOL_NORDKAPP_VGS` | Nordkapp videregående skole (LOSA Vadsø) | `https://nordkapp.vgs.no/` | `nordkapp.vgs.no` | Matching spec test case §5 — **LOSA/special delivery** reference; official school domain landing only |
| `T2_SCHOOL_NORD_SALTEN_VGS` | Nord-Salten videregående skole | `https://www.nord-salten.vgs.no/` | `nord-salten.vgs.no` | Matching spec test case §2 (Nuortta-Sálto / multi-location class) |

**URL rule:** homepage / canonical site root only — **no** deep programme pages invented in this record.

**Reachability note (2026-06-03 spot-check):** all three URLs returned HTTP **200** via `curl -L` at adoption time.

---

## Explicitly out of Pilot 2b

| Item | Reason |
|------|--------|
| Remaining unmatched Vilbli rows (~22) | Separate bounded sessions; no scale-up in 2b |
| `vadso.vgs.no` | Overlapping geography with Nordkapp LOSA context; avoid duplicate host in same pilot |
| Tier 1 re-fetch | Pilot 1 closed |
| Fylke/kommune landings | Pilot 2 closed |

---

## Owner/security decisions

| # | Decision | Answer |
|---|----------|--------|
| 1 | Adopt list for Pilot 2b charter | **Yes** |
| 2 | Hosts limited to table above | **Yes** |
| 3 | Pilot 2b follows LRI4–LRI16 boundaries | **Yes** |
| 4 | Expected post code | `LOSA_REFRESH_PILOT_PASS_WITH_GAPS` (22 unmatched unchanged) |

---

## Final boundary

Pilot 2b adds **school-level official landing fingerprints** only — not publishability closure, not matcher write, not LOSA publication.
