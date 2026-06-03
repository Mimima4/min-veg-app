# Phase 4 LOSA Refresh Pilot 2 — Tier 2 Curated URLs Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **Pilot 2 curated URL list** — docs-level adoption only |
| **Closure label** | `PHASE_4_LOSA_REFRESH_PILOT_2_TIER2_CURATED_URLS_ADOPTED` |
| **Scope** | Bounded **concrete fetch URLs** for Finnmark **`56` reference** under registry **Tier 2/3** patterns — **not** nationwide rollout |
| **Date (UTC)** | 2026-06-03 |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — **P4-LOSA-REFRESH-PILOT-2** |
| **Prerequisite** | **P4-LOSA-REFRESH-IMPL-post** (Pilot 1) |

This record adopts a **minimum curated URL set** for **Pilot 2** only. It does **not** approve per-school URL invention at scale, PSA writes, Phase 2 DML, UI (**#3**), **#2** write on `56`, or matcher publication.

**NOT_READY_FOR_APPLY** unchanged.

---

## Curated fetch rows (Pilot 2)

| fetch_id | registry_pattern | URL (canonical landing) | Host | Tier | Owner rationale |
|----------|------------------|-------------------------|------|------|-----------------|
| `T2_FYLKESKOMMUNE_56_REF` | `T2_FYLKESKOMMUNE_PATTERN` | `https://tromsfylke.no/` | `tromsfylke.no` | 2 | County authority for **Troms og Finnmark** (Finnmark `56` geography post-merger); pattern row has no concrete URL |
| `T2_KOMMUNE_ALTA_REF` | `T2_KOMMUNE_PATTERN` | `https://www.alta.kommune.no/` | `alta.kommune.no` | 2 | Reference **kommune** landing cited in Phase 2 validation backlog (Alta VGS context); not a deep invented page |
| `T3_UTDANNING_NO` | `T3_UTDANNING_NO` | `https://www.utdanning.no/` | `utdanning.no` | 3 | National offer portal — **supporting only** per registry |

**Explicitly deferred in Pilot 2:**

| registry_pattern | Reason |
|------------------|--------|
| `T2_OFFICIAL_SCHOOL_PATTERN` | Per-school official URLs require case-specific NSR/org resolution — **separate** bounded session |

---

## Owner/security decisions

| # | Decision | Answer |
|---|----------|--------|
| 1 | Adopt curated list for Pilot 2 charter | **Yes** |
| 2 | No URLs outside table above in Pilot 2 | **Yes** |
| 3 | No invented school/kommune deep links | **Yes** |
| 4 | Pilot 2 follows Pilot 1 gate boundaries (LRI4–LRI16) | **Yes** |
| 5 | Expected refresh state after Pilot 2 | `refresh_review_required` or `refresh_blocked_source_coverage_missing` (school pattern gap) — **not** publication |

---

## Final boundary

Pilot 2 fetches **official landing evidence** for Finnmark reference Tier 2/3 rows listed above. It does **not** close Finnmark operational resolution or LOSA publication.
