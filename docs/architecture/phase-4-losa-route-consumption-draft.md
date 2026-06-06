# Phase 4 LOSA — Route Consumption Draft

| Field | Value |
|--------|--------|
| **Status** | **DRAFT** — adoption via **P4-LOSA-ROUTE** gate |
| **Scope** | How Route `programme_selection` **would** consume LOSA PSA rows — **not** #3 UI approval |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisites** | **P4-LOSA-PUBLICATION-MODEL**, **P4-LOSA-PSA-WRITE** framework |

**This draft is not:** permission **#3**, app/API wiring, `get-availability-truth` patch, or family-facing copy finalization.

---

## 1. Separation from ordinary options

| Layer | Ordinary (`programme_in_school`) | LOSA (`losa_fjern_delivery_municipality`) |
|-------|----------------------------------|----------------------------------------|
| PSA scope | On-campus provider | Provider + **delivery municipality** |
| Option identity | School brand / institution | Provider label + delivery site label |
| Matcher path | Contour A/B CASE 1–3 | Phase 4 separate emit — **not** `pickInstitutionsForPsaEmission` |
| Route step | Existing `programme_selection` options | Same step type — **distinct option kind** metadata |

**Forbidden:** LOSA row rendered as ordinary campus; random `avd` pick; live official-source fetch on route page.

---

## 2. Proposed read path (future wiring — separate gate)

When **#3** approved, `get-availability-truth` family should:

1. Query `programme_school_availability` with explicit `availability_scope` filter.
2. **Ordinary route steps (default):** `programme_in_school` only — Contour A/B unchanged.
3. **LOSA-enabled steps (opt-in per product gate):** include `losa_fjern_delivery_municipality` rows where `verification_status` policy allows.
4. Map display: `institutionName` = provider; append delivery municipality from `municipality_code` / notes lineage — not provider campus municipality alone.

**Current production:** no `availability_scope` in select — implicitly ordinary rows only once LOSA rows exist (migration must not pollute ordinary filter until Route gate wires scope).

---

## 3. Option kind metadata (scaffold)

| Field | Purpose |
|-------|---------|
| `optionKind` | `losa_fjern_delivery_municipality` |
| `providerInstitutionId` | PSA `institution_id` |
| `deliveryMunicipalityCode` | PSA `municipality_code` |
| `deliverySiteLabel` | Vilbli/manifest lineage |
| `verificationStatus` | Pass-through from PSA |

Nationwide: **no** `56`-only branch in Route engine — county/profession from route context.

---

## 4. Current posture (2026-06-05)

| Metric | Value |
|--------|--------|
| PSA LOSA rows in DB | **0** (expected) |
| Route options plan | **0** |
| `#3` UI integration | **not** approved |
| CLI proof | `npm run losa:plan-route-consumption` |

---

## 5. Gate sequence

1. **P4-LOSA-ROUTE** — adopt this draft + plan CLI (**no** app wiring)
2. **#3** / product gate — wire `get-availability-truth` + `enrich-study-route-steps`
3. Requires at least **1** LOSA PSA row from **P4-LOSA-PSA-WRITE** execution session

---

## Final statement

Route **consumption model** is defined; families see **no** LOSA options until PSA write + **#3** gates pass.
