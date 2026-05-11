# Phase 4 LOSA — Official Source Registry

## 1. Status / boundary

- Status: **PLANNING ARTIFACT / DOCS-ONLY**.
- This document is a **source registry** for **future** automated LOSA / external-delivery **refresh inputs** only.
- **Not legal advice.** It does not replace Lovdata, Udir, Regjeringen, Stortinget, or professional legal review.
- **No implementation** is approved by this document.
- **No source fetch execution**, script/job, DB schema/write, PSA publication, decision-row writes, runtime/readiness/pipeline/operator, or helper integration is approved.
- **No DB writes** and no Route Engine or publication behaviour change is implied.
- The future refresh contour must remain **server-side / headless / client-agnostic** (not web-only truth ownership).

### Network / source access (authoring rule)

- **Do not invent deep URLs** or school/kommune-specific concrete URLs in this registry.
- If live web access is unavailable during authoring, this document may still use **stable public canonical base URLs** for Tier 1 entry points:

  - `https://lovdata.no/`
  - `https://www.regjeringen.no/`
  - `https://www.stortinget.no/`
  - `https://www.udir.no/`

- Mark those rows as `url_kind = canonical_base_url` and note: **Owner may replace with organization-preferred landing URL later.**

**Authoring is BLOCKED** only if even these stable public Tier 1 entry points cannot be documented honestly, or if creating the registry would require **invented** concrete school/kommune URLs.

### URL normalization rule

- Use **one** normalized `canonical_base_url` form per domain.
- Put alternates (www/non-www variants, deep pages) in **notes** only.
- **Do not** create duplicate rows for URL variants.

## 2. Relationship to refresh design

- This registry **complements** `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md`.
- The refresh design defines tiers, claim labels, cadence, diff/risk rules, refresh outcome states, and publication/runtime boundaries.
- **This file defines registry rows and source-selection inputs only.** It does not restate the full refresh-design rule set.

### Precedence rule

- This registry states **source-input defaults** only.
- If risk, diff, claim-label, or refresh-outcome semantics **conflict** with the refresh design, **`phase-4-losa-official-source-evidence-refresh-design.md` prevails.**

### Navigation scope

- This registry **may cite** the refresh design (as above).
- **Do not** add reverse links from other existing documents in this gate; reverse navigation can be a **later** docs-only patch.

## 3. Claim class matrix

Compact matrix: which **minimum tier** is required to treat a claim as **current-truth-eligible** (subject to refresh-design coverage and labeling rules).

| claim_class | required_minimum_tier | supporting_tiers | notes |
|-------------|----------------------|------------------|-------|
| `legal_status` | Tier 1 | Tier 2/Tier 3 for context only | Tier 2/3 cannot **close** legal truth alone. |
| `fjernundervisning_rules` | Tier 1 | Tier 2 for local operational practice only | Legal boundary remains Tier 1. |
| `provider_school` | Tier 2 | Tier 3 offer pages as supporting only | School identity must map to official school/fylke/kommune sources. |
| `delivery_municipality` | Tier 2 | Tier 3 as supporting only | Local delivery context is operational/local. |
| `local_veileder` | Tier 2 | — | Public role pages where applicable. |
| `praksis_bedrift` | Tier 2 | — | Workplace/practice model as published by responsible bodies/schools. |
| `samling_location` | Tier 2 | — | Gathering location as published operationally. |
| `programme_stage_availability` | Tier 2 | Tier 3 as supporting only | National/offer portals do not replace local operational confirmation. |
| `publication_supporting_evidence` | **Combined: Tier 1 + Tier 2** as applicable | Tier 3 supporting only | Never sufficient **alone** for PSA publication; see warning below. |

**Publication support warning:** `publication_supporting_evidence` is **never sufficient alone** for PSA publication. Publication still requires a **separate owner gate** and an **approved publication decision model** (per refresh design gates).

**Tier 3 note:** Vilbli / public education-offer pages are **supporting offer representation only**. They are **not** Tier 1 legal truth and do **not** replace Tier 2 operational school/kommune sources. **Do not** reference internal/private APIs in this registry.

## 4. Source registry table

**Table compactness rule:** For `if source changes` and `if source disappears`, use **`see §6–§7 default`** unless this source has a **specific exception**; put exceptions in **notes** only.

**Pattern row value rule:** For `pattern_scope` rows, `currentness / date visible` may be **`varies by publisher`**, **`n/a (pattern)`**, or **`owner_curated_list_tbd`**. Do not pretend a pattern row has a single global last-updated date.

| source_id | source_name | url_kind | URL / pattern | domain | tier | source_type | currentness / date visible | claim classes supported | cannot prove | default refresh cadence | change risk | if source changes | if source disappears | notes |
|-----------|-------------|----------|---------------|--------|------|-------------|----------------------------|-------------------------|--------------|-------------------------|-------------|---------------------|----------------------|-------|
| `T1_LOVDATA` | Lovdata (law and regulations) | `canonical_base_url` | `https://lovdata.no/` | `lovdata.no` | 1 | legal | varies by instrument | `legal_status`, `fjernundervisning_rules`, `publication_supporting_evidence` | `provider_school`, `delivery_municipality`, `local_veileder`, `praksis_bedrift`, `samling_location`, `programme_stage_availability` (alone) | semiannual (align refresh design) | high | see §6–§7 default | see §6–§7 default | Owner may replace with organization-preferred landing URL later. Deep statute URLs belong in evidence packets, not as invented registry rows. |
| `T1_REGJERINGEN` | Norwegian Government (Regjeringen) | `canonical_base_url` | `https://www.regjeringen.no/` | `regjeringen.no` | 1 | policy | varies by page | `legal_status`, `fjernundervisning_rules`, `publication_supporting_evidence` | same operational/local set as Lovdata row | semiannual | high | see §6–§7 default | see §6–§7 default | Owner may replace with organization-preferred landing URL later. |
| `T1_STORTINGET` | Norwegian Parliament (Stortinget) | `canonical_base_url` | `https://www.stortinget.no/` | `stortinget.no` | 1 | legal | varies by page | `legal_status`, `publication_supporting_evidence` | same operational/local set as Lovdata row | semiannual | high | see §6–§7 default | see §6–§7 default | Owner may replace with organization-preferred landing URL later. |
| `T1_UDIR` | Norwegian Directorate for Education (Udir) | `canonical_base_url` | `https://www.udir.no/` | `udir.no` | 1 | policy | varies by page | `legal_status`, `fjernundervisning_rules`, `publication_supporting_evidence` | Local operational delivery detail without Tier 2 | semiannual | high | see §6–§7 default | see §6–§7 default | National policy/guidance; local delivery still needs Tier 2. Not concrete local programme / LOSA offer availability without Tier 2. Owner may replace with organization-preferred landing URL later. |
| `T2_FYLKESKOMMUNE_PATTERN` | County authority official web pages | `pattern_scope` | Official pages on the **relevant county (fylkeskommune) internet domain** for the case geography (no concrete URL in this registry row). | `fylkeskommune` (pattern) | 2 | county authority / fylkeskommune | `varies by publisher` | `provider_school`, `delivery_municipality`, `local_veileder`, `praksis_bedrift`, `samling_location`, `programme_stage_availability`, `publication_supporting_evidence` | `legal_status`, `fjernundervisning_rules` (final legal) | semiannual | medium / high | see §6–§7 default | see §6–§7 default | **Do not invent** county-specific URLs here. Curated per-county URL lists = separate owner gate (`owner_curated_list_tbd` workflow). |
| `T2_OFFICIAL_SCHOOL_PATTERN` | Official school web pages | `pattern_scope` | Official site of the **identified school / provider institution** for the case (no concrete URL in this registry row). | school official (pattern) | 2 | school | `varies by publisher` | `provider_school`, `delivery_municipality`, `local_veileder`, `praksis_bedrift`, `samling_location`, `programme_stage_availability`, `publication_supporting_evidence` | `legal_status`, `fjernundervisning_rules` (final legal) | semiannual | medium / high | see §6–§7 default | see §6–§7 default | Concrete school URLs are **case-specific**; future job must resolve via NSR/org linkage + official domain rules, not registry invention. |
| `T2_KOMMUNE_PATTERN` | Municipality official web pages | `pattern_scope` | Official **kommune** pages relevant to delivery municipality / local delivery context (no concrete URL in this registry row). | `kommune` (pattern) | 2 | municipality | `varies by publisher` | `delivery_municipality`, `local_veileder`, `samling_location`, `publication_supporting_evidence` | Final **legal** status alone; provider identity without school/county context | semiannual | medium / high | see §6–§7 default | see §6–§7 default | Same as county pattern: no invented kommune URLs in this row. |
| `T3_UTDANNING_NO` | utdanning.no (national education offer portal) | `canonical_base_url` | `https://www.utdanning.no/` | `utdanning.no` | 3 | programme offer | varies by page | `programme_stage_availability`, `publication_supporting_evidence` | All Tier-1-only and Tier-2-primary claims as **sole** proof | semiannual | low / medium | see §6–§7 default | see §6–§7 default | Supporting representation only; cannot override Tier 1/2. Owner may replace landing URL later if org standard differs. |
| `T3_VILBLI_PUBLIC_OFFER` | Vilbli / public education-offer pages | `pattern_scope` | Public education-offer pages **as used in product context** (no deep Vilbli URL template in this registry row; no internal APIs). | vilbli / public offer (pattern) | 3 | programme offer | `varies by publisher` | `programme_stage_availability`, `publication_supporting_evidence` | Same as Tier 3 utdanning row | semiannual | low / medium | see §6–§7 default | see §6–§7 default | **Not** Tier 1 legal truth; **not** a substitute for Tier 2 operational school/kommune pages. |

## 5. Minimum required source set per refresh run

- **Legal / current-policy claims** require **current Tier 1** coverage (per claim class matrix and refresh-design minimum coverage rules).
- **Operational provider / programme claims** require **current Tier 2** coverage where the claim applies (school / fylke / kommune as relevant).
- **Local delivery claims** require **relevant local Tier 2** sources (delivery municipality, local pages).
- **Tier 3** is **supporting only**; it cannot close legal or operational truth alone.
- If required coverage is **missing**, refresh outcomes must remain **`UNKNOWN` / blocked / review-needed** with **evidence gaps only** — no publication or runtime truth expansion (per refresh design).

## 6. Change detection defaults

Global defaults for classifying **meaningful change** signals from registry sources (detailed diff taxonomy and refresh outcome states remain in the refresh design doc):

- **Legal status** changed → **high / blocked** until Tier 1 confirmation.
- **Law / proposition** status changed → **high / blocked** until Tier 1 confirmation.
- **Provider school** changed → **high / review**.
- **Delivery municipality** changed → **high / review**.
- **Programme / stage list** changed → **high / review**.
- **LOSA wording** changed → **medium / high** depending on claim class (legal vs operational).
- **Samling / praksis model** changed → **medium / high**.
- **Source removed / unavailable** → **blocked / review** (no silent “fresh” truth).
- **Date / last updated** metadata changed → **low / medium** unless a **semantic** change is detected.

Per-row exceptions, if any, live in **notes** in §4 only.

## 7. Source disappearance / stale policy

- Source **missing** must **not** silently preserve old truth as **current** (per refresh design and Phase 4 failure-handling principles).
- **Stale tolerance** for already-published internal truth requires a **separately approved** stale-tolerance policy; without it, disappearance produces **warning / review-needed** state.
- **Legal** claims with missing Tier 1 remain **`UNKNOWN`**.
- Row-level handling defaults: **see §6** for change signal; **no auto-publication** on recovery.

## 8. Future refresh output fields (conceptual)

Future snapshot or run record **may** include (conceptual field names only — **no DB schema approved**, **no job approved**):

- `source_id`
- `fetched_at`
- `source_hash` / content fingerprint
- `detected_change`
- `affected_claims`
- `claim_label`
- `risk_level`
- `review_required`
- `publication_blocked`
- `route_blocked`
- `notes`

Semantics for `risk_level`, `review_required`, and refresh outcome states remain governed by **`phase-4-losa-official-source-evidence-refresh-design.md`**.

## 9. Forbidden shortcuts

- **No invented URLs** (especially no fabricated school/kommune deep links).
- **No Tier 2/3 legal substitution** for Tier 1 legal claims.
- **No stale source** treated as current truth without explicit policy and labeling.
- **No manual hidden truth** as baseline operation.
- **No runtime scraping** by Route Engine or clients as truth source.
- **No web-only truth** ownership.
- **No automatic publication** from refresh alone.
- **No Route Engine consumption** of raw external source payloads as published route truth.
- **No PSA publication** from draft evidence or registry rows alone.

For the full gate list and automation boundaries, see the refresh design document.

## 10. Next gates (each requires a separate owner approval)

1. Approve **this registry** as a planning artifact.
2. Approve **concrete source lists** for specific counties / schools / cases (curated URLs under Tier 2 patterns).
3. Approve **source fetch prototype** design (read-only, headless).
4. Approve **snapshot storage** design.
5. Approve **diff classifier** design.
6. Approve **review workflow** design.

---

## Controlling reference

- `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md`
