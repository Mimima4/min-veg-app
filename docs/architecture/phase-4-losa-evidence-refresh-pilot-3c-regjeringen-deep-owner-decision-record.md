# Phase 4 LOSA Refresh Pilot 3c — Regjeringen Deep URL Owner Decision Record

| Field | Value |
|--------|--------|
| **Status** | Pilot **3c** — single verified Regjeringen deep page |
| **Section** | **P4-LOSA-REFRESH-PILOT-3C-REGJERINGEN** |
| **Date (UTC)** | 2026-06-03 |
| **Prerequisite** | **P4-LOSA-REFRESH-PILOT-3-post**; **P4-LOSA-CONFIRMED-ALTA-PROGRAMME-post** |

**No software installation.** `curl` only.

---

## Curated row

| fetch_id | URL | HTTP at adoption | Notes |
|----------|-----|------------------|-------|
| `T1_REGJERINGEN_PROP57_FJERN_DEEP` | `https://www.regjeringen.no/no/dokumenter/prop.-57-l-20222023/id2967679/?ch=15` | 200 | Prop. 57 L (2022–2023) — fjernundervisning chapter (forarbeid to §14-4) |

**Rejected at adoption:** vanity `/aktuelt/.../fjernundervisning/` paths that returned unrelated article titles (redirect/content mismatch).

---

## Final boundary

Pilot 3c fetch only — not `CONFIRMED`, not PSA, not matcher write.
