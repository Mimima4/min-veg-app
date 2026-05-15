# Phase 4 LOSA / External-Delivery Relationship Crosswalk

**Document path (retained temporarily):** `docs/architecture/phase-4-source-truth-contour-map.md`  
**Content scope (narrowed):** Phase 4 **LOSA / external-delivery** relationship crosswalk only — **not** a general Phase 4 source-truth ownership map. A future path rename/cleanup requires a **separate owner-approved gate**.

## 2. Snapshot / status

- **Status:** docs-only relationship crosswalk
- **Scope:** Phase 4 LOSA/external-delivery **relationship** to VGS availability, matcher, Phase 2, Route, PSA
- **Repository checkpoint:** `af97513 Add Phase 2 isolated test RLS evidence record`
- **Created at (UTC):** 2026-05-15 (narrow fix after Gate 35 audit: `HOLD_GATE_35_REVIEW_REQUIRED`)
- **Path/name mismatch note:** file path retained for this gate; content scope is narrowed (see §3)
- **Not** a general source-truth ownership map
- **Not** source connector implementation
- **Not** refresh execution
- **Not** Route data source replacement
- **Not** VGS availability contour replacement
- **Not** matcher replacement
- **Not** Phase 2 replacement
- **Not** Route/PSA/admin/app integration
- **Not** main / production apply
- **Not** Phase 4 LOSA execution approval
- **No partial integration authorization**
- **No new canonical statuses / enums / API fields / dashboard contracts**
- **Child-information protection principle applies**

**Non-canonicality:** This file is a **relationship crosswalk only**. It **must not** introduce enums, DB statuses, API fields, route/dashboard fields, SQL, schema, endpoints, UI, parser/fetcher/queue/cron names, or storage paths. It **must not** duplicate registry claim-class matrices, registry tier tables, refresh outcome tables, cadence tables, or detailed LOSA rule sets from `phase-4-losa-official-source-registry.md` or `phase-4-losa-official-source-evidence-refresh-design.md`. It **must not** override `route-engine-master-spec.md`, `norway-school-identity-matching-spec.md`, `school-identity-location-resolution-phase-2-spec.md`, or the LOSA planning docs.

## 3. Scope correction from Gate 35 audit

- This document **must not** be read as **Phase 4 owning all source truth** for Route or the product.
- **Phase 4 here** means the already planned **LOSA / external-delivery** source-evidence slice only (`phase-4-losa-official-source-registry.md`, `phase-4-losa-official-source-evidence-refresh-design.md`).
- **Phase 4 LOSA is a conditional slice**, not a universal upstream layer for every route or every county.
- **VGS programme → school availability** remains governed by **`route-engine-master-spec.md` §4.X** (VGS contour) and the operational VGS truth pipeline — **not** by this crosswalk and **not** by Phase 4 LOSA alone.
- **Route Engine** remains an **internal-DB-truth** consumer at runtime; it **must not** fetch external sources live.
- **School identity matcher** remains the **identity/location safety** contour (`norway-school-identity-matching-spec.md` CASE 1–4).
- **Phase 2** remains the **future** evidence / problem / decision / publishability boundary (`school-identity-location-resolution-phase-2-spec.md`).
- **Existing Phase 4 LOSA registry/refresh docs** remain the **detailed** controlling artifacts for LOSA source evidence mechanics.
- **Current VGS production path** and **future Phase 2 target path** are **not** the same thing (see §6).

## 4. Source basis

| Path | Contribution | Precedence / note |
|------|--------------|-------------------|
| `docs/architecture/route-engine-master-spec.md` | Route master; **§4.X** VGS programme→school availability truth contract; internal DB only at runtime | **Authority** for VGS availability + Route consumption |
| `docs/architecture/route-path-engine-production-spec.md` | Route product construction baseline (saved profession → built route) | **Cite only** (e.g. §27–28); do not restate |
| `docs/architecture/route-engine-implementation-boundary-v1.md` | v1 uses `child_profiles`, `professions`, `education_institutions`, `education_programs`, `profession_program_links`, `built_*` | **Cite only**; do not restate |
| `docs/architecture/route-engine-stage-4-data-realism.md` | Child/school **evidence trust tiers** for Route realism | **Not** VGS Vilbli/NSR availability replacement |
| `docs/architecture/norway-school-identity-matching-spec.md` | Matcher **CASE 1–4**; forbidden shortcuts | **Authority** for identity/location matching |
| `docs/architecture/school-identity-location-resolution-phase-2-spec.md` | Future observations/decisions/publishability; §21 Phase 4 relationship | **Authority** for Phase 2 boundary |
| `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` | Clean vs problem path; non-overload rules | Crosswalk only |
| `docs/architecture/phase-2-production-truth-closure.md` | Evidence vs decision vs publication vs PSA vs Route | Truth-path separation |
| `docs/architecture/phase-4-losa-official-source-registry.md` | LOSA **registry inputs** only | Does not govern VGS contour |
| `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md` | LOSA **refresh/evidence** design; prevails over registry on risk/diff/outcomes | **LOSA slice detail** — cite, do not duplicate tables |
| `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` | Temporary RLS lab evidence; main apply blocked | Not contour readiness proof |

Supporting context (not restated here): `phase-2-runtime-write-closure.md`, `phase-2-read-only-diagnostics-contract.md`, `phase-2-read-only-diagnostics-helper-boundary-adr.md`, `norway-school-identity-matching-execution-plan.md`.

## 5. Cross-contour ownership

| Contour | Owns | Does not own | Applies when | Feeds / hands off to | Authority docs |
|---------|------|--------------|--------------|----------------------|----------------|
| **Route Engine runtime** | Saved profession → route templates → `built_routes` / steps / scoring; reads **internal DB** only | Live Vilbli/NSR/Utdanning fetch; LOSA legal semantics; raw Phase 2 observations | Every route build/read | `programme_school_availability` + domain tables when availability-truth mode enabled | `route-engine-master-spec.md`; `route-engine-implementation-boundary-v1.md`; `route-path-engine-production-spec.md` |
| **VGS programme/school availability** | Vilbli **primary** availability; NSR-linked identity prerequisite; Utdanning **secondary** verify/display; `verification_status` on `programme_school_availability`; stale row lifecycle via VGS pipeline | LOSA-as-ordinary-school; Tier 1 legal closure for ordinary VGS rows; Phase 4 refresh outcomes as runtime truth | VGS routes / programme→school contour (nationwide default path) | `programme_school_availability` → Route availability-truth reads | `route-engine-master-spec.md` §4.X |
| **NSR / canonical school identity** | Institution registry truth for canonical school identity | Programme availability; LOSA delivery model; Route step UX | Identity resolution for publishable availability | `education_institutions`; matcher + pipeline | `route-engine-master-spec.md` §4.X; matching spec |
| **Utdanning verification/display** | Secondary confirmation + preferred display naming when verified | Primary availability; legal status for LOSA | VGS rows where Utdanning check applies | `verification_status` inputs (with Vilbli) | `route-engine-master-spec.md` §4.X |
| **School identity matcher** | Vilbli row → NSR-linked **identity/location**; CASE 1–4; abort on ambiguity | Programme availability truth; `verification_status`; LOSA final model | Every Vilbli→NSR match before publishable availability | Matcher outcome → pipeline / future Phase 2 observations | `norway-school-identity-matching-spec.md` |
| **Phase 2 problem/evidence/decision/publishability** | Immutable observations; candidates; decision states; publishability contract; publication decisions (future, gated) | VGS Vilbli/Utdanning primary contract; LOSA semantics; Route runtime | Future integration when wired; problem tail today | Publication boundary → PSA rows (gated) → Route published truth | `school-identity-location-resolution-phase-2-spec.md`; problem-contour map |
| **Phase 4 LOSA / external-delivery** | LOSA/external-delivery **legal/operational source-evidence** semantics; future refresh **evidence** for that slice | All Route data; VGS availability rules; matcher CASE 1–3 ordinary schools; direct Route/PSA publish | **`unsupported_losa`**, **`external_delivery`**, county **56** / LOSA dependency, external-delivery claims only — **not** every route | Future evidence → Phase 2 states / blocked publishability — **not** Route raw | LOSA registry + refresh-design docs |
| **PSA publication/materialization** | Future programme/school materialization (gated) | Source refresh alone; diagnostics; unresolved identity | Separate owner gates | Published internal truth for Route | phase-2-spec §17; production-truth-closure |
| **Admin/owner review surface** | Processed **exceptions/decisions** (future, gated) | Raw source dumps; all schools/professions/fylke; matching engine role | Exception tail only | Decision support, not truth | problem-contour map; phase-2-spec |
| **Isolated RLS evidence** | Phase 2 table RLS lab proof in isolated test project | Full contour readiness; main apply | Isolated test only | None operational | `phase-2-isolated-test-rls-evidence-record.md` |

**Vigo / Samordna opptak:** supporting only for VGS contour (not primary). **NAV:** profession/labour-market enrichment — **not** primary for VGS route structure or school/programme availability (`route-engine-master-spec.md` NAV/Vilbli boundary).

## 6. Current path vs target path

| | **Today (operational)** | **Target (future, gated)** |
|---|-------------------------|----------------------------|
| **VGS availability** | Vilbli-oriented ingestion + NSR linkage + Utdanning verification → writes/feeds **`programme_school_availability`** via existing VGS truth pipeline (e.g. `scripts/run-vgs-truth-pipeline.mjs` — referenced for architecture only; **no script execution in this gate**) | Same contract; stricter matcher/Phase 2 gates when integrated |
| **Phase 2 tables** | Schema exists; diagnostics read-only; **pipeline does not yet replace** VGS path with `source_school_observations` / decision flow | Observations → decisions → publication decisions → publishable rows |
| **Phase 4 LOSA** | Planning docs only; no refresh execution | Headless LOSA evidence refresh → Phase 2 blocked states / future publication |
| **Route runtime** | Reads internal DB (`programme_school_availability` when availability-truth enabled) | Unchanged principle: **no live external fetch** |

- **Do not** pretend current runtime already flows through Phase 2 decision tables.
- **Do not** treat this crosswalk as implementation approval.

## 7. VGS availability is not Phase 4 LOSA

- **Vilbli** is the **primary** VGS programme → school **availability** source.
- **NSR** is the **canonical school identity** authority.
- **Utdanning.no** is **secondary verification** and preferred **display** when verified.
- **`verification_status`** belongs to the **VGS availability contract** on `programme_school_availability` — **not** assigned by the identity matcher.
- **Do not duplicate** `verified` / `needs_review` / `mismatch` / `not_found` rules here — see **`route-engine-master-spec.md` §4.X**.
- **Stale** VGS rows are handled by the **VGS pipeline lifecycle** (deactivation / `is_active`), not by Phase 4 LOSA refresh outcomes.
- **Phase 4 LOSA must not redefine** Vilbli/NSR/Utdanning/VGS rules.
- **Phase 4 LOSA** interacts only where **LOSA / external-delivery** semantics are required (e.g. CASE 4, `unsupported_losa`, `external_delivery`).

## 8. Matcher contour boundary

- Matcher solves **identity/location**, **not** programme availability itself.
- Matcher **does not assign** `verification_status`.
- **CASE 1:** one Vilbli row → one identity + one NSR location — **clean** allowed path.
- **CASE 2:** multi-location ambiguity — **do not** choose random campus; abort / explicit problem state.
- **CASE 3:** slash/Sámi–Norwegian aliases — **one** identity; no false split into multiple schools.
- **CASE 4:** LOSA — **unsupported** until explicit Phase 4 LOSA model; abort / `unsupported_losa`.
- Unresolved matcher outcome **may block publishability**; it **must not** become manual owner matching workload.

## 9. Phase 2 boundary

- Phase 2 is the **future** evidence / problem / decision / **publishability** boundary.
- **Observations / candidates / review** are **not** production truth by themselves.
- **Publication decisions** are **separately gated** from identity/location decisions.
- Phase 2 **does not publish directly to Route** (Route consumes **published internal** truth only).
- Phase 2 **does not replace** the existing **VGS availability** contour or Vilbli/NSR/Utdanning contract.

## 10. Phase 4 LOSA / external-delivery boundary

- Phase 4 LOSA is **narrow**: **LOSA / external-delivery** legal and operational **source-evidence** semantics only.
- **`phase-4-losa-official-source-registry.md`** and **`phase-4-losa-official-source-evidence-refresh-design.md`** remain the **controlling detailed** docs (tiers, claim classes, cadence, diff/outcomes — **cited, not copied** here).
- **No implementation** approved by this crosswalk.
- **No general source-truth ownership** for all Route or VGS data.
- **No direct Route/PSA publication** from LOSA refresh or draft evidence.
- **No silent app/runtime truth mutation.**

For LOSA/external-delivery refresh mechanics (periodic headless pull, claim labels, blocked refresh outcomes), see refresh-design doc **only** — this file states **relationships**, not rule tables.

## 11. Anti-manual-workload principle (scoped)

- Owner/admin **must not** manually verify every school, profession, fylke, or source row.
- **VGS:** automation belongs to **VGS availability contour + matcher + Phase 2 publishability** (where applicable) — **not** owner-as-pipeline.
- **LOSA/external-delivery:** Phase 4 LOSA refresh/design should **minimize** manual review; owner sees **exceptions/decisions**, not raw corpus.
- Owner **must not** act as the **matching engine** (CASE 2–4 forbid human tie-break).
- **Spreadsheet / manual row comparison / raw JSON review** must **not** become truth.
- Temporary manual review **must not** become permanent product architecture.

## 12. Main apply / full automatic contour validation

- **Isolated RLS evidence** does **not** open main / owner-used Supabase apply.
- **This crosswalk** does **not** open main apply.
- Main apply remains blocked until **all relevant contours** work **automatically as one validated organism in test mode**, meaning the **correct separate contours**, with Phase 4 LOSA **not replacing** them:
  - **VGS availability pipeline** (Vilbli/NSR/Utdanning → `programme_school_availability`)
  - **School identity matcher** (CASE 1–4)
  - **Phase 2 problem contour** where applicable
  - **Phase 4 LOSA/external-delivery** where applicable (conditional slice)
  - **Diagnostics/helper** compatibility
  - **App/client** behavior
  - **API/JWT/PostgREST negative tests** where applicable
  - **Rollback/observability**
  - **Owner-approved main apply planning**

## 13. Temporary evidence / cleanup

- Isolated test evidence (including RLS record) is **temporary**; not permanent architecture SoT.
- This crosswalk may become a **cleanup/rename candidate** after replacement evidence and owner gate.
- **No deletion** approved here.

## 14. Open questions / conflicts

No source conflicts were found in this narrow relationship-crosswalk pass.

**Scope notes (not conflicts):**

- File path still says `phase-4-source-truth-contour-map.md`; content is LOSA relationship crosswalk only until a rename gate.
- Phase 2 isolated RLS evidence was authored at checkpoint `d73d307`; this narrow fix at `af97513`.

## 15. What remains blocked

Implementation; source connector execution; scraping; scheduled jobs; SQL execution; DB writes; main / owner-used Supabase apply; production apply; app/admin dashboard integration; server routes; UI; API contracts; PSA publication; Route Engine consumption; Phase 3; **Phase 4 LOSA/registry/refresh execution**; Gate 34B main/manual execution; partial integration.

## 16. Map outcome

**PHASE_4_LOSA_RELATIONSHIP_CROSSWALK_CREATED_DOCS_ONLY**

This means LOSA/external-delivery **relationships** are documented conceptually. It does **not** create general source-truth ownership. It does **not** replace VGS availability. It does **not** replace the matcher. It does **not** replace Phase 2. It does **not** approve implementation. It does **not** approve main/production apply. It does **not** approve Route/PSA/app/admin integration. It does **not** approve Phase 4 LOSA execution. It does **not** create canonical statuses/enums/API contracts.

## 17. Final boundary statement

Phase 4 LOSA / external-delivery relationship boundaries are documented here, but VGS availability truth, school identity matching, Phase 2 publishability, Route Engine consumption, PSA publication, source connector implementation, scheduled data pulls, SQL execution, DB writes, main apply, owner-used Supabase apply, production apply, runtime/write integration, admin dashboard integration, Phase 3, Gate 34B main/manual execution, and any partial app integration remain blocked until separate owner-approved gates and full automatic contour validation in test mode.
