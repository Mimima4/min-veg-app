# Phase 4 LOSA Refresh Pilot 3b — School Program Deep URLs Owner Decision Record

| Field | Value |
|--------|--------|
| **Status** | Pilot **3b** curated program-page URLs — docs adoption only |
| **Section** | **P4-LOSA-REFRESH-PILOT-3B** |
| **Date (UTC)** | 2026-06-03 |
| **Prerequisite** | Pilot 2b school landings; snippet session noted homepage-only programme gap |

**No software installation.** Session uses existing `curl` + repo `node` only.

---

## Curated rows

| fetch_id | URL | HTTP at adoption | Notes |
|----------|-----|------------------|-------|
| `T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP` | `https://alta.vgs.no/utdanningstilbud/` | 200 | Programme listing (electrician path TBD on page) |

**Deferred:** `T2_SCHOOL_NORD_SALTEN_VGS` program deep — no stable 200 path found without invention at adoption.

---

## Final boundary

Pilot 3b fetch only — not `CONFIRMED`, not PSA, not matcher write.
