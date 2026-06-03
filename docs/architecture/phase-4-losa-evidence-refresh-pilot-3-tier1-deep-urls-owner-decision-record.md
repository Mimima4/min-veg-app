# Phase 4 LOSA Refresh Pilot 3 — Tier 1 Deep URLs Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **Pilot 3** deep Tier 1 URLs — docs-level adoption |
| **Closure label** | `PHASE_4_LOSA_REFRESH_PILOT_3_TIER1_DEEP_URLS_ADOPTED` |
| **Scope** | Verified **deep** pages for `fjernundervisning_rules` / `legal_status` (Finnmark `56` reference) |
| **Date (UTC)** | 2026-06-03 |
| **Prerequisite** | `owner-claim-decisions-2026-06-03.json` — **QUEUE_DEEP_URL** |
| **Control reference** | **P4-LOSA-REFRESH-PILOT-3** |

**NOT_READY_FOR_APPLY** unchanged. No homepages re-fetched. Regjeringen deep URL **deferred** (no verified 200 topic page at adoption).

---

## Curated deep fetch rows

| fetch_id | Parent | URL | HTTP at adoption | Rationale |
|----------|--------|-----|------------------|-----------|
| `T1_UDIR_FJERNUNDERVISNING_DEEP` | T1_UDIR | `https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/fjernundervisning/` | 200 | Official Udir fjernundervisning rules page (§14-4 context) |
| `T1_UDIR_VEILEDER_FJERN_DEEP` | T1_UDIR | `https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/veileder-for-tilpasset-opplaring-og-individuell-tilrettelegging/opplaring-hjemmet-langvarig-sykdom/` | 200 | Veileder §10.4 fjernundervisning (operational practice) |
| `T1_LOVDATA_OPPLARINGSLOVA_DEEP` | T1_LOVDATA | `https://lovdata.no/dokument/NL/lov/2023-06-09-30` | 200 | Opplæringslova (legal instrument; fjernundervisning in law text) |
| `T1_STORTINGET_PUBLIKASJONER_DEEP` | T1_STORTINGET | `https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/` | 200 | Parliament publications index (weak; placeholder until case-specific doc URL gate) |

**Deferred:** `T1_REGJERINGEN` deep page — no stable 200 URL identified without invention.

---

## Final boundary

Pilot 3 adds **deep Tier 1** fingerprints only — not `CONFIRMED` claims, not publication.
