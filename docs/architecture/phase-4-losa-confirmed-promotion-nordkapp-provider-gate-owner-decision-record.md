# Phase 4 LOSA — Bounded CONFIRMED Promotion (Nordkapp Provider Tier 2) Gate

| Field | Value |
|--------|--------|
| **Status** | Owner **CONFIRMED** promotion adopted — **1** `provider_school` row |
| **Section** | **P4-LOSA-CONFIRMED-NORDKAPP-PROVIDER** |
| **Closure label** | `PHASE_4_LOSA_CONFIRMED_NORDKAPP_PROVIDER_PROMOTION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-SECTION-4-ALTA-PILOT** (P4LS4A0, P4LS4A2); **P4-LOSA-REFRESH-PILOT-2B-post**; **P4-LOSA-SNIPPET-SESSION-post** |

**Does NOT:** clear full §4 on Alta row, PSA write, Route/UI (**#3**), matcher on `56`, or `NOT_READY_FOR_APPLY`.

---

## Row eligible for CONFIRMED (binding)

| source_id | claim_class | scope | Citation basis |
|-----------|-------------|-------|----------------|
| `T2_SCHOOL_NORDKAPP_VGS` | `provider_school` | `provider_nordkapp` | Pilot 2b `nordkapp.vgs.no` landing (HTTP 200, fingerprint prefix `3ca479962b05`) + snippet session **LOSA_CONTEXT** review |

**Not eligible:** Alta VGS as provider for Nordkapp LOSA rows, Nord-Salten, kommune URLs, duplicate second Nordkapp CONFIRMED, delivery_municipality in this gate.

**Nationwide rule:** `provider_nordkapp` scope applies to any manifest row whose Vilbli provider label matches Nordkapp videregående skole — Finnmark `56` is reference proof only.

---

## Owner decisions (P4LCNP0–P4LCNP7)

| # | Decision | Answer |
|---|----------|--------|
| P4LCNP0 | Promote after owner re-opens SNIPPET_ONLY provider (P4LS4A2)? | **Yes** |
| P4LCNP1 | Max **1** new CONFIRMED row in owner-held `confirmed-claims` append | **Yes** |
| P4LCNP2 | Repo index sync in `losa-finnmark-evidence-index.mjs` | **Yes** |
| P4LCNP3 | `publishable: true` for `provider_school` on Nordkapp-provider rows only | **Yes** |
| P4LCNP4 | **No** PSA / Phase 2 DML / Route **#3** | **Yes** |
| P4LCNP5 | §4 remains blocked until delivery + programme full + supporting evidence | **Yes** |
| P4LCNP6 | Next sub-gate: Alta `delivery_municipality` CONFIRMED | **Yes** |
| P4LCNP7 | CLI proof: `losa:finnmark-evidence-link` — Alta `provider_school` not snippet | **Yes** |

---

## Final boundary

Bounded **Tier 2 provider** CONFIRMED for Nordkapp official school landing — **sub-gate 1** of Alta §4 pilot only; not operational LOSA publication.
