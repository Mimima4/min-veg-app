# Phase 4 LOSA Finnmark — Publication Model (Draft)

| Field | Value |
|--------|--------|
| **Status** | **DRAFT** — adoption via **P4-LOSA-PUBLICATION-MODEL** gate |
| **Scope** | How **LOSA-class** Vilbli rows may approach **`programme_school_availability`** — **not** ordinary on-campus schools |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisites** | **P4-LOSA-EVIDENCE-LINK** Tranche 2; publishability contract **`ACCEPTED WITH NOTES`** |

**This draft is not:** SQL migration approval, PSA write, pipeline patch, Route/UI (#3), or per-row §4 closure.

---

## 1. Problem statement

Finnmark **18** Vilbli rows share one **provider** label (Nordkapp videregående skole) and **18** distinct **delivery municipalities**. Contour B / CASE 4 **excludes** them from ordinary PSA. Collapsing provider + delivery into one `programme_in_school` row would violate §3 of the publishability contract.

---

## 2. Publication unit (proposed)

One **publishable unit** = one Vilbli LOSA row (unique `vilbliSchoolCode`) × programme stage × county — when **all** §4 claim classes are row-satisfied **and** a separate **publication decision** exists.

| Field role | Source | PSA mapping (proposed) |
|------------|--------|-------------------------|
| Vilbli observation | `vilbliSchoolCode`, `schoolPagePath` | `source_reference_url`, snapshot label lineage |
| Provider school | Tier 2 evidenced NSR institution | `institution_id` → **provider** only |
| Delivery municipality | Tier 2 evidenced kommune | `municipality_code` + display metadata — **not** a fake second `institution_id` |
| Programme stage | Path node + Vilbli stage | `stage`, `education_program_id` |
| Scope discriminator | Phase 4 model | **`availability_scope`** ≠ `programme_in_school` |

---

## 3. Proposed `availability_scope` (schema gate deferred)

| Value | Meaning |
|-------|---------|
| `programme_in_school` | **Existing** ordinary on-campus VGS (Contour A/B today) |
| `losa_fjern_delivery_municipality` | **Proposed** — provider institution + delivery municipality under LOSA/fjern model |

**Current DB constraint:** `programme_school_availability.availability_scope` allows only `programme_in_school` (`programme-school-availability-foundation.sql`). **P4-LOSA-PSA** gate must approve migration before any LOSA write.

**Uniqueness (proposed):** extend unique key to include `availability_scope` + `municipality_code` (or delivery-site key) so one provider can have N municipality rows without colliding with ordinary campus rows.

---

## 4. Pipeline emission rules (binding for future implementation)

| Rule | Requirement |
|------|-------------|
| **R1** | `isLosa` Vilbli rows **must not** use `pickInstitutionsForPsaEmission` / CASE 1–3 matcher path |
| **R2** | LOSA emit function is **separate** (`planLosaFinnmarkPsaEmission` scaffold — read-only until PSA gate) |
| **R3** | `institution_id` set only when `provider_school` claim is **CONFIRMED** at row scope (not SNIPPET_ONLY) |
| **R4** | `municipality_code` set only when `delivery_municipality` claim is **CONFIRMED** at row scope |
| **R5** | County-reference-only Tier 1 CONFIRMED **does not** unlock row emission |
| **R6** | `verification_status` default **`needs_review`** until Utdanning verification path defined for LOSA |
| **R7** | Contour B partial ingest **continues to skip** `isLosa` until publication gate + write charter |

---

## 5. Route consumption (future — #3 gate)

| Principle | Requirement |
|-----------|-------------|
| Option kind | Distinct from ordinary campus option — label shows **provider + delivery municipality** |
| Forbidden | Treating LOSA row as random on-campus school; per-`avd` campus pick |
| Read path | Same backend `get-availability-truth` family — filtered by `availability_scope` |
| Product copy | Deferred — scaffold only per P06 §12 |

---

## 6. Current Finnmark posture (2026-06-05)

| Metric | Value |
|--------|--------|
| Manifest rows | **18** |
| Row-level emission allowed | **0** (`STILL_BLOCKED_SECTION_4`) |
| Proposed scope on all plans | `losa_fjern_delivery_municipality` |
| Schema ready | **no** — scope enum migration pending **P4-LOSA-PSA** |
| CLI proof | `npm run losa:finnmark-publication-plan` |

---

## 7. Gate sequence after this draft

1. **P4-LOSA-PUBLICATION-MODEL** — adopt this draft (docs)
2. **P4-LOSA-PSA** — schema migration + write charter + bounded pilot row (separate)
3. **P4-LOSA-ROUTE** — Route consumption (#3)

---

## Final statement

This draft removes the architectural ambiguity of «LOSA = ordinary school PSA row». Implementation remains **blocked** until PSA schema gate and row-level §4 closure.
