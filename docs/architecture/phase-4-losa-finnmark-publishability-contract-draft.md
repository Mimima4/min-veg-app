# Phase 4 LOSA — Finnmark Publishability Contract (Draft)

## 1. Status / boundary

| Field | Value |
|--------|--------|
| **Status** | **`ACCEPTED WITH NOTES`** (2026-05-31) — see `phase-4-losa-finnmark-publishability-contract-acceptance-owner-decision-record.md` |
| **Scope** | Publishability **contract** for **LOSA / external-delivery** rows affecting county **`56`** (nationwide-applicable patterns) |
| **Date (UTC)** | 2026-05-31 |
| **Entry** | `phase-4-losa-finnmark-slice-owner-decision-record.md` + `phase-0-6-contour-b-finnmark-processing-review-summary.md` |
| **Precedence** | `phase-4-losa-official-source-evidence-refresh-design.md` > registry > this draft |

**This draft is not:** legal advice, implementation approval, source fetch, PSA write, Route/UI wiring, Phase 2 row writes, or main matcher retry approval.

---

## 2. Problem anchor (Finnmark `56` / electrician)

From **P06-CONTOUR-B-post** baseline (safe aggregates):

| Signal | Value | Implication |
|--------|-------|-------------|
| Pipeline abort | **22** unmatched; **0** ambiguous | Contour **A** **STOP** |
| LOSA hints in unmatched diagnostics | **17** | Majority of failure mass is **LOSA-shaped**, not random NSR gap |
| Slash hints | **5** | Secondary alias risk |
| Readiness | `missing_programme_rows` | Programme path not green — **parallel** blocker to LOSA |
| NSR institutions in county | **12** | Registry exists; **1:1 Vilbli→NSR** fails for problem rows |

**Contract goal:** define what must be true before any **LOSA-class** Vilbli row may enter **published internal truth** (future PSA / Route), without treating LOSA as an ordinary on-campus VGS school.

---

## 3. Entity model (required semantics)

### 3.1 Three roles (non-negotiable separation)

| Role | Definition | May map to `education_institutions`? |
|------|------------|--------------------------------------|
| **Provider school** | The institution **responsible** for programme delivery authority (often named in Vilbli/NSR) | **Only** when Tier 2 evidence confirms provider identity |
| **Delivery site / municipality** | Where learning is **delivered** under LOSA/fjernundervisning (may differ from provider campus) | **Not** as a substitute for provider without explicit delivery-site record |
| **Gathering location (`samling`)** | Physical gathering for LOSA when published by operator | Separate from daily “school availability” row |

**Forbidden:** collapsing provider + delivery site + gathering into one **ordinary** `programme_school_availability` row because Vilbli listed a single label.

### 3.2 Vilbli label vs publishable truth

| Layer | Purpose |
|-------|---------|
| Vilbli row | **Source observation** input only for LOSA-class rows |
| NSR match (CASE 4) | **Abort / unsupported** until Phase 4 contract satisfied — no random match |
| Phase 2 state | `unsupported_losa` / `external_delivery` / `needs_review` — **expose**, not publish |
| Phase 4 evidence | Tiered **official** evidence per claim class |
| Published internal truth | **Separate** publication decision gate — **not** this draft alone |

---

## 4. Claim classes required before publishability (Finnmark LOSA rows)

Minimum claim coverage per refresh-design matrix (detail in registry + refresh-design — **not restated**):

| claim_class | Minimum tier | Required for LOSA publishability? |
|-------------|--------------|----------------------------------|
| `legal_status` | Tier 1 | **yes** — fjernundervisning/LOSA legal frame |
| `fjernundervisning_rules` | Tier 1 | **yes** |
| `provider_school` | Tier 2 | **yes** |
| `delivery_municipality` | Tier 2 | **yes** |
| `programme_stage_availability` | Tier 2 | **yes** — local operational confirmation |
| `publication_supporting_evidence` | Tier 1 + Tier 2 combined | **yes** — never alone |

**Rule:** `publication_supporting_evidence` **never sufficient alone** for PSA (per registry warning).

---

## 5. Phase 2 state mapping (conceptual — planning only)

| Phase 2 conceptual state | When set | Publishable to PSA? |
|--------------------------|----------|---------------------|
| `unsupported_losa` | CASE 4 / LOSA keyword / no Tier 1+2 closure | **no** |
| `external_delivery` | Delivery model not ordinary VGS | **no** |
| `needs_review` | Evidence incomplete or conflicting | **no** |
| `identity_unresolved` / `location_unresolved` | Non-LOSA match failures among the 22 | **no** |
| Future `publishable` (gated) | All §4 claims satisfied + publication decision | **only** via separate publication gate |

**Finnmark baseline:** expect **`unsupported_losa` / `external_delivery` dominance** among LOSA-hint rows until §4 satisfied.

---

## 6. Publication blocked rules (county `56` until contract acceptance)

Publication to **`programme_school_availability`** for LOSA-class observations is **blocked** when **any** of:

1. **CASE 4** unresolved — matcher would abort (current baseline).  
2. **Tier 1** legal/fjernundervisning evidence missing or stale per refresh-design outcomes.  
3. **Tier 2** provider or delivery municipality not evidenced.  
4. **Provider vs delivery site** not separated in evidence packet.  
5. **`missing_programme_rows`** still applies to electrician path nodes (orthogonal blocker).  
6. **No auditable publication decision** object (Phase 2 publication boundary).  
7. **Route/UI #3** not approved.

**Ordinary VGS schools** in `56` (non-LOSA unmatched among the 22) follow **matching spec** identity rules first; LOSA contract **does not** waive unmatched non-LOSA rows.

---

## 7. Evidence refresh posture (automation — future gate)

| Principle | Requirement |
|-----------|-------------|
| Automation | Headless scheduled refresh — **not** owner manual browsing as baseline |
| Cadence | Semiannual default (align refresh-design) |
| Runtime | Route **must not** live-fetch Lovdata/Udir/fylke pages |
| Clients | Web/iOS/Android consume **same** backend published truth only |
| Stale evidence | Blocks publishability; triggers `needs_review` / refresh blocked outcomes |

**Implementation** of refresh jobs requires **separate** owner gate after this contract is **ACCEPTED**.

---

## 8. Contour retry criteria (informational)

**Contour A** (`run-vgs-truth-pipeline` dry-run) may be **considered** for `56` only when owner records **all** of:

| # | Criterion |
|---|-----------|
| 1 | This contract **ACCEPTED** (or ACCEPTED WITH NOTES) |
| 2 | Programme materialization readiness **green** for electrician path |
| 3 | LOSA rows have evidence packets meeting §4 (or remain explicitly blocked) |
| 4 | Non-LOSA unmatched rows resolved or explicitly excluded with auditable reason |
| 5 | Separate session charter — **not** auto after contract merge |

**Expected near-term outcome:** dry-run may still **ABORT** until evidence exists — abort is **honest** until then.

---

## 9. Relationship to owner track A → B → C

| Step | Status after this draft |
|------|-------------------------|
| **A.1** Contour B packet + P06-CONTOUR-B-post | **done** |
| **A.2** Phase 4 LOSA slice (this contract) | **`ACCEPTED WITH NOTES`** (P4-LOSA-FM-post) |
| **A.3** Contour A retry charter for `56` | **pending** — separate charter; evidence may still block dry-run pass |
| **B** Green counties #2 truth refresh | **unblocked at planning level** — requires separate permission **#2** gate + charter |
| **C** Z-AP* apply | **deferred** |

---

## 10. Acceptance checklist (owner review)

| # | Question | pass? |
|---|----------|-------|
| 1 | Provider vs delivery site separation clear? | **yes** |
| 2 | Tier 1+2 claim requirements sufficient for Finnmark? | **yes** |
| 3 | Phase 2 states correctly **non-publishable** until gates? | **yes** |
| 4 | No Vilbli-as-legal-truth shortcut? | **yes** |
| 5 | No UI/PSA/implementation implied? | **yes** |
| 6 | Nationwide applicability preserved (Finnmark = reference, not exception rule)? | **yes** |

**Recorded acceptance (2026-05-31):** **`ACCEPTED WITH NOTES`** — `phase-4-losa-finnmark-publishability-contract-acceptance-owner-decision-record.md`

---

## Final statement

This draft defines **what must be evidenced** before LOSA-class Finnmark material may approach **published internal truth**. It **does not** resolve the **22** unmatched rows by itself; it **removes the architectural half-measure** of treating LOSA as ordinary VGS availability. Implementation, fetch, PSA, and UI remain **separately gated**.
