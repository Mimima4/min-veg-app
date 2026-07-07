# Phase 4 — Multi-Contour Truth Registry Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-MULTI-CONTOUR-TRUTH-REGISTRY** |
| **Status** | **EFFECTIVE** — owner sign-off 2026-06-10 |
| **Date (UTC)** | 2026-06-10 |
| **Governs** | Source-of-truth, ingest, readiness, and product-live rules for **all education layers** used by route outcome filters and NAV matcher |
| **Prerequisite** | `phase-4-route-outcome-filter-owner-decision-record.md` (filter catalog + alternative ordering) |

---

## 1. Problem statement

Route outcome filters and NAV matcher require **verified institution + programme + stage** truth per education layer.

Without a contour truth layer, alternatives (`fagskole_after_vgs`, `long_academic`, `pabygging_studiekompetanse`) become stubs, teasers, or frozen placeholders — **forbidden** for production claims.

**Goal:** every layer follows the **same operational pattern as VGS** (authority → snapshot → classify → materialize → expansion gate → scheduled refresh → route read).

**Non-goal:** ingest every school in Norway before shipping matcher on VGS. Layers go live **incrementally**; UI and matcher **omit** what is not live.

---

## 2. Universal contour contract (VGS template)

Every contour in this registry MUST implement:

| # | Requirement | VGS reference |
|---|-------------|---------------|
| U-1 | **Authority URL(s)** — canonical public source, stored as `source_reference_url` on rows | Vilbli programme chain URLs |
| U-2 | **Snapshot-first ingest** — fetch separated from route page load; datacenter-blocked sources use home-IP / queue relay | Contour B relay from Mac |
| U-3 | **Readiness classifier** — green / partial / blocked; partial may be production-safe with explicit charter | `classify-vgs-truth-readiness.mjs` |
| U-4 | **Materialized read model** — route engine reads PSA/truth tables only, never live scrape on user request | `programme_selection_availability` (PSA) + `availability_truth` |
| U-5 | **Expansion gate** — checklist before family-facing “live” for a `(profession, region)` or national slice | `VGS_OPERATIONAL_RUNNERS.md` § Expansion gate |
| U-6 | **Scheduled refresh** — full-matrix production relay; **never** profession/county-scoped production tails | `run-vgs-scheduled-ops.mjs`, relay-scope policy |
| U-7 | **UI scope ≤ pipeline scope** — product must not show institutions/programmes the contour has not ingested | P06 §12 policy |
| U-8 | **Route steps** — institution + programme + stage (domain validity); no shorthand-only UI | `route-path-engine-production-spec.md` §9 |
| U-9 | **Omit, don’t stub** — if contour not live, hide filter option or skip alternative; no fake schools | Owner filter record §3 |

---

## 3. Contour registry

### Summary

| Contour ID | Stage type(s) | `filter_id`(s) | Ops status | Product live rule |
|------------|---------------|----------------|------------|-------------------|
| **C-VGS-YRKESFAG** | `UPPER_SECONDARY`, `APPRENTICESHIP` | `open`, `fast_to_work`, `vg3_before_apprenticeship`, `flexible` | **IN PROGRESS** | 4 of N catalogue professions live; VG2 gate + V.BA cross-profession switch done for carpenter↔plumber; **phase not closed** until every planned profession **and** every kolonne-3 fag has prod truth (PSA relay + bedrift + matcher) |
| **C-NAV-OCCUPATION** | (matcher only) | all filters (scope gate) | **IN PROGRESS (on VGS)** | Matcher wired (P4-NM go-live 2026-06-13); links Vilbli outcomes to **NAV vacancy-catalog profession level** (e.g. one Mekaniker / one Elektriker family — kolonne-3 fag differentiate route/bedrift, not separate NAV job families) |
| **C-FAGSKOLE** | `VOCATIONAL_COLLEGE` / `FAGSKOLE` | `fagskole_after_vgs` | **NOT STARTED** | Omit Alt 2 or neste-steg text only until gate passed |
| **C-HOYSKOLE-BACHELOR** | `HIGHER_EDUCATION` / `BACHELOR` | `long_academic` (subset) | **NOT STARTED** | Omit `long_academic` alt or show honest “ikke tilgjengelig ennå” |
| **C-PROFESJONSSTUDIER** | `HIGHER_EDUCATION` (+ multi-stage) | `long_academic` (subset) | **NOT STARTED** | Separate path families (medisin, jus, …); never merge with fagbrev chain |
| **C-PABYGGING** | `REQUALIFICATION` / `BRIDGING_PROGRAM` | `pabygging_studiekompetanse` | **NOT STARTED** | Disabled for barn; etter-VGS contour only |
| **C-TRANSPORT-KOMMUNE** | (logistics overlay on VGS) | — | **LIVE** | Nationwide sort overlay; see kommune transport record |
| **C-LOSA-FJERN** | `UPPER_SECONDARY` delivery variant | — | **LIVE (56 only)** | Finnmark electrician LOSA charter |

---

### C-VGS-YRKESFAG (reference contour — operational)

| Field | Value |
|-------|--------|
| **Authority** | Vilbli.no programme chains per `scripts/vgs-path-definitions.mjs` |
| **Ingest** | Contour A: `run-vgs-truth-pipeline.mjs`; Contour B: `relay-contour-b-vilbli-to-production.mjs` |
| **Eligibility** | `contour-b-operational-eligibility.mjs` / TS mirror |
| **Materialized** | PSA rows, `availability_truth`, path variants via `build-path-variants.ts` |
| **Route shape** | Shared **VG1 anchor**; VG2+ branches; full horizontal steps (not shorthand labels) |
| **Matcher role** | Vilbli outcomes → NAV; filter picks path variant (`direct-bedrift` vs `vg3-then-bedrift`) |
| **Ops doc** | `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` |
| **Expansion** | New **profession** → 10-step gate before product claim. **Fylke:** pipeline already covers all **15** Norwegian fylke (post-reform); no additional counties exist to add — only data refresh / relay quality per pair. |

---

### C-NAV-OCCUPATION (taxonomy — partial)

| Field | Value |
|-------|--------|
| **Authority** | `https://arbeidsplassen.nav.no/stillinger` (STYRK level-1 / level-2 categories) |
| **Ingest** | `nav-taxonomy-adapter.ts` — HTML snapshot parse (~114 occupations today) |
| **Materialized** | In-memory per request today; **future:** versioned snapshot table + refresh job |
| **Matcher role** | Map Vilbli outcome titles → NAV codes; **filter_id gates** (exclude ingeniør on `fast_to_work`, etc.) |
| **Live rule** | Matcher may rank/link; must not invent professions without `reviewNeeded` flag |
| **Next ops** | Snapshot persistence, cadence refresh, explicit STYRK ↔ path-family map (v2) |

---

### C-FAGSKOLE (planned — priority 1 after VGS matcher)

| Field | Value |
|-------|--------|
| **Authority (candidate)** | DBH / HK-dir institution register + per-institution study offer pages; verify before ingest |
| **Stage** | `VOCATIONAL_COLLEGE` / `FAGSKOLE` — programme inside step, not separate stage codes |
| **Geography** | Institution county/kommune + admission region where applicable |
| **Chain position** | **After** completed VGS/fagbrev for same path family (not replacement of VG2) |
| **Route shape** | Full steps: e.g. `Fagskole X · Program Y` (1–2 år) — same block UI as VGS |
| **Materialized (TBD)** | `fagskole_programme_availability` or unified `education_contour_truth` with `contour_id` |
| **Readiness (TBD)** | Classifier: missing institution, stale offer year, unverified programme link |
| **Expansion gate (draft)** | (1) authority URL per programme (2) dry-run ingest county (3) E2E step on route (4) scheduled refresh |
| **Product until live** | `fagskole_after_vgs` alternative **omitted**; optional non-blocking neste-steg copy without institution names |

---

### C-HOYSKOLE-BACHELOR (planned — priority 2)

| Field | Value |
|-------|--------|
| **Authority (candidate)** | DBH study programmes; Samordna opptak where relevant; institution canonical URLs |
| **Stage** | `HIGHER_EDUCATION` / `BACHELOR` |
| **Chain position** | Requires **studiekompetanse** path (studiespesialisering or påbygging bridge) — separate entry contour |
| **Route shape** | Full steps: institution + bachelor programme; linked to path family (e.g. maskiningeniør) |
| **Matcher role** | NAV STYRK akademisk gruppe; exclude fagbrev outcomes from same Vilbli chain |
| **Product until live** | `long_academic` alt omitted for professions without proven høyskole chain |

---

### C-PROFESJONSSTUDIER (planned — priority 3)

| Field | Value |
|-------|--------|
| **Examples** | Medisin (6 år + turnus + spesialisering), jus, psykolog med autorisasjon |
| **Stage** | Multi-step `HIGHER_EDUCATION` sequence (not a single “bachelor” label) |
| **Authority (candidate)** | Per-profession regulated programme lists (faculty / NOKUT / helseutdanning registers) — **one sub-charter per løp** |
| **Filter** | `long_academic` — UI label «Lang og spesialisert utdanning» only |
| **Product until live** | Show only path families with full multi-step truth; never collapse to generic “universitet” stub |

---

### C-PABYGGING (planned — priority 4, etter-VGS)

| Field | Value |
|-------|--------|
| **Stage** | `REQUALIFICATION` / `BRIDGING_PROGRAM` |
| **Authority (candidate)** | VGS/skole tilbydere med påbygging — Udir school base + verified påbygging offer URLs |
| **Filter** | `pabygging_studiekompetanse` — bottom of list; **disabled for barn** |
| **Chain position** | After yrkesfag VGS; bridge to `C-HOYSKOLE-BACHELOR` |
| **Product until live** | No child routes; adult/etter-VGS product surface only |

---

## 4. Matcher ↔ contour dependency

```
filter_id  →  eligible contour(s)  →  path variant (VGS) or post-VGS chain  →  materialized steps  →  NAV scope
```

| `filter_id` | Required contour(s) for **full** route | If contour missing |
|-------------|------------------------------------------|--------------------|
| `fast_to_work` | C-VGS-YRKESFAG | N/A (baseline) |
| `vg3_before_apprenticeship` | C-VGS-YRKESFAG (VG3 variant) | Omit filter if no VG3 branch in truth |
| `fagskole_after_vgs` | C-VGS + **C-FAGSKOLE** | Omit alternative; no institution names |
| `long_academic` | **C-HOYSKOLE** and/or **C-PROFESJONSSTUDIER** (+ entry contour) | Omit alternative |
| `pabygging_studiekompetanse` | **C-PABYGGING** | Hidden for barn |
| `open` / `flexible` | Best available contour per slot in §3 ordering | Omit slot, don’t stub |

**VG1 rule (locked):**

- If a profession has one valid VG1 entry chain, keep one VG1 anchor for that path family.
- If the **same profession** has multiple valid entry chains starting from different VG1 paths, treat each chain as an **alternative route variant** under the same profession selection (not a new profession card).
- Post-VGS contours attach **after** the VGS step sequence, not as a one-line substitute.

**Example format (rule illustration):** one profession can expose alternatives like `VG1 A -> VG2 A -> ...` and `VG1 B -> VG2 B -> ...` as `alternative_routes[]` for that same profession when both chains are materialized truth.

---

## 5. Phased delivery order

**P4-MCT-1 exit rule (owner binding, 2026-07-04):** phase **stays open** until **every** planned VGS catalogue profession **and** **every** kolonne-3 fag Vilbli lists on those chains is live in production with:

| Layer | “Done” means | **Not** a blocker |
|-------|----------------|-------------------|
| **VGS route (PSA)** | Fag appears in Fagvalg when Vilbli lists it for that fylke chain | — |
| **Verified bedrift** | Ingest roster covers the fag **and** we surface **godkjent-only** rows from `larebedrift_truth` | **Empty bedrift dropdown** when no godkjent employers exist — **honest truth**, not a defect |
| **NAV matcher** | Outcomes link to **NAV vacancy-catalog level** for the catalogue profession (shared VG1/VG2 base; post-VGS job search via NAV/Finn — specialization mostly in ad text, not separate STYRK per kolonne-3 fag) | Per-fag STYRK split inside one mechanic/electrician family |
| **E2E** | Family-facing proof per profession slice | — |

**P4-NM go-live (2026-06-13) closed matcher wiring only** — not P4-MCT-1.

| Phase | Deliverable | Contours | Status (2026-07-04) |
|-------|-------------|----------|---------------------|
| **P4-MCT-1** | NAV matcher + **full VGS depth** (all professions + all fag) | C-VGS, C-NAV | **IN PROGRESS** — 4 professions live; depth work continues |
| **P4-MCT-2** | Fagskole authority proof + ingest charter + pilot county/profession | C-FAGSKOLE | **Blocked on P4-MCT-1** — do not start product claim until owner closes MCT-1 |
| **P4-MCT-3** | Høyskole bachelor pilot (one path family, e.g. maskiningeniør) | C-HOYSKOLE-BACHELOR | Not started |
| **P4-MCT-4** | One lang profesjonsløp charter (e.g. lege) | C-PROFESJONSSTUDIER | Not started |
| **P4-MCT-5** | Påbygging etter-VGS surface | C-PABYGGING | Not started |

Each phase requires its own expansion gate + E2E checklist before **NOT_READY_FOR_APPLY** clearance for that slice.

---

## 6. Shared schema direction (implementation note — not blocking this doc)

Future contours should share a common identity shape:

- `contour_id`
- `institution_id`, `programme_slug`, `stage_type`, `stage_code`
- `county_code`, `municipality_code`
- `source_reference_url`, `truth_version`, `readiness_status`
- optional `path_family_slug`, `profession_slug`, `nav_styrk_code`

VGS PSA remains source of truth for C-VGS until unified table migration is chartered separately.

---

## 7. Owner sign-off

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| MC-0 | Adopt multi-contour registry as governance for all matcher layers? | **Yes** | ☑ 2026-06-10 |
| MC-1 | New layers follow VGS universal contract (§2)? | **Yes** | ☑ |
| MC-2 | No production stubs — omit filter/alt when contour not live? | **Yes** | ☑ |
| MC-3 | Phased order: VGS matcher → fagskole → høyskole → profesjonsstudier → påbygging? | **Yes** | ☑ |
| MC-4 | Authority URLs for non-VGS contours require owner verification before ingest code? | **Yes** | ☑ |
| MC-5 | This doc does not imply immediate ingest implementation? | **Yes** | ☑ |

---

## 8. References

- `phase-4-route-outcome-filter-owner-decision-record.md` — filter catalog + alternatives
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — VGS ops template
- `route-engine-domain-validity-v1.md` — stage types / codes
- `route-path-engine-production-spec.md` — institution + programme + stage rule
- `phase-4-route-kommune-transport-logistics-owner-record.md` — C-TRANSPORT-KOMMUNE
- `phase-4-losa-not-ready-for-apply-partial-clearance-owner-decision-record.md` — C-LOSA-FJERN
- `phase-4-nav-matcher-owner-decision-record.md` — matcher contract (P4-MCT-1)
