# Phase 0–6 Contour B — Operational Closure Checklist

| Field | Value |
|--------|--------|
| **Section** | **P06-CLOSURE** |
| **Status** | **OPEN** — owner accepted all blocks (2026-06-04) |
| **Goal** | Working **automatic** Contour **B** → PSA → route `programme_selection.options`; **no return** to P0–6 rework after closure |
| **Prerequisite code** | `616ce82` — `--contour-b-partial`, `run-contour-b-operational-ingest.mjs`, `contour-b-operational-eligibility.mjs`, P06 §12 |
| **NOT_READY_FOR_APPLY** | **unchanged** unless a separate gate says otherwise |

**Execution model:** complete **one block at a time** (A → B → C → D → E → F → G). Do **not** skip B before claiming automation. Block **D** is required for full Vilbli parity in route options, not optional if that is the product goal.

**Block status:** `OPEN` | `IN_PROGRESS` | `CLOSED`

---

## Block A — Policy alignment (docs only)

**Block status:** `CLOSED` (2026-06-04)

**Purpose:** Single product meaning for Contour **B**; remove contradictions so closure is auditable.

| Done when |
|-----------|
| P06 §12 is the **only** active product rule for Contour **B** (B → PSA → route options; no separate UI blocks; unverified rows absent from options, not badge-labeled). |
| P06 §9 decisions P06-1…P06-5 marked **superseded by §12** in `phase-0-6-processing-contour-owner-decision-record.md`. |
| `phase-2-closure-criteria-checklist.md` no longer recommends P0–6 as open work; references **P06-CLOSURE** (this file). |
| One paragraph **non-return rule**: new counties/professions extend `CONTOUR_A_OPERATIONAL_BY_PROFESSION` / `vgs-path-definitions.mjs` — **not** a new processing contour. |

**Explicitly not in this block:** code, MAIN write, scheduler.

---

## Block B — Automation (scheduler / job)

**Block status:** `CLOSED` (2026-05-29)

**Purpose:** Contour **B** runs **without manual CLI** for all eligible `(profession, county)` pairs.

| Done when |
|-----------|
| Scheduled job exists in repo (cron, GitHub Action, or worker) with documented cadence. |
| Job algorithm: `classify` → `assessContourBOperationalEligibility` → if eligible → `run-contour-b-operational-ingest` **without** `--dry-run`. |
| Job **does not** run on every route page load / recompute. |
| Job **skips** Contour **A** green pairs (`use_contour_a`, e.g. `46` + `verification_ready_after_write`). |
| Failure handling: repeated job failure or zero-write streak logged (owner-held or CI artifact). |
| Smoke: green-county Contour **A** PSA rows unchanged after B job run. |

**Artifacts:**

| Artifact | Role |
|----------|------|
| `scripts/run-contour-b-operational-scheduler.mjs` | Batch loop over profession × county |
| `src/app/api/internal/vgs/run-contour-b-operational-scheduler/route.ts` | Deployed runner (spawns script; keys from **Vercel env**, not GitHub) |
| `scripts/relay-contour-b-vilbli-to-production.mjs` | **Production path:** home-IP Vilbli fetch → `POST …/ingest-contour-b-vilbli-relay` |
| `vercel.json` | Empty (no Vilbli cron on Vercel) |
| `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` | Auth, relay commands, **mandatory rules when updating app professions/counties** |
| Cadence | 6 months via **launchd + relay** (Mac); production write proof remains **Block C** |

**Explicitly not in this block:** full Vilbli parity (Block D), E2E UI proof (Block C), production MAIN write smoke (Block C).

---

## Block C — MAIN write + product proof

**Block status:** `CLOSED` (2026-06-05)

**Purpose:** Production PSA populated; route shows verified schools in normal steps.

| Done when |
|-----------|
| First production **write** completed for pilot counties (minimum: **`56`**, **`15`**, **`18`**, **`55`** for `electrician`); charter in owner-held. **Relay ingest completed** for all eligible Contour B pairs (see terminal batch `ingested` / `contour_b_partial`). |
| E2E verified: child planning in fylke → electrician route → `programme_selection` **options** from PSA where verified rows exist. |
| Second job run shows refresh behaviour (`updated_at` or documented stale policy). |
| Green counties **`03` / `11` / `46` / `50`**: options still Contour **A** only; B job did not corrupt them. |

**Closure evidence (2026-06-05):**

| Criterion | Proof |
|-----------|--------|
| Pilot PSA write | `node scripts/verify-contour-b-psa-snapshot.mjs` → `pilotAllHaveTruth: true` for **56, 15, 18, 55** |
| Relay batch | Home-IP relay ingested 11 Contour B counties (`contour_b_partial`); Contour A **03/11/46/50** skipped |
| Refresh | Re-relay **18** (Nord-Salten) and **15** (Surnadal) advanced `latestUpdatedAt` to **2026-06-05** |
| E2E UI | Owner verified route `programme_selection` options match PSA: **18** (13 VG1 incl. Nord-Salten), **15** (post matcher fix), **55** (3 VG1 / 2 VG2 honest partial), **56** (Nordkapp only — expected partial) |
| Green counties | **03/11/46/50** `hasTruth: true`; `latestUpdatedAt` unchanged by B batch (May 2026); row counts stable |

**Explicitly not in this block:** LOSA publication rows (Block D), identity resolution (Block D), full Vilbli parity (Block D).

---

## Block D — Vilbli parity (identity + programme + LOSA in PSA)

**Block status:** `IN_PROGRESS` — **CASE 2** matcher **1:N** linkage + **1:1** Vilbli school-brand PSA/display (`db67b40`); **CASE 3** Finnmark slash-alias matcher (`classifyInstitutionMatchForVilbliSchool`); **56** LOSA tail **auditable exclude** (below)

**Purpose:** Route options converge toward Vilbli list for all rows that pass verification gates.

| Done when |
|-----------|
| **Identity tail:** unmatched → **0** or auditable exclude list per pilot county; dry-run matcher clean or excludes documented. **CASE 2 multi-`avd`:** matcher links all tied NSR `avd` rows (`multi_avd_identity`); PSA + route options **1:1** Vilbli school-brand (`pickInstitutionsForPsaEmission`) — no per-`avd` programme publish without Tier 2+ proof. |
| **Programme rows:** `missing_programme_rows` resolved → classify green for electrician on pilot counties before relying on write. |
| **LOSA:** §4 + publication decision → LOSA rows enter PSA via **published** path (same `programme_selection` model, not ordinary campus). |
| Pipeline/ingest rule for **published LOSA** implemented and proven on at least one county. |
| Closure metrics in job or post: `vilbli_extract` / `psa_active` / `verified` counts (safe summary, no secrets). |

**Note:** Until Block D closes, automation (B) runs but options remain a **verified subset** of Vilbli — honest, not a P0–6 defect.

### Finnmark `56` — LOSA auditable exclude list (2026-06-05)

**18** Vilbli rows `Nordkapp videregående skole – LOSA {kommune}` are **explicitly excluded** from ordinary PSA / route options until Phase 4 LOSA **implementation gate** (publishability contract `ACCEPTED WITH NOTES`; `publishability_posture=STILL_BLOCKED_ALL_SECTION_4`). Matcher CASE 4; Contour B partial skips `isLosa` rows. **Not** a matcher defect; **not** publishable as on-campus VGS schools without Tier 1+2 evidence per `phase-4-losa-finnmark-publishability-contract-draft.md`.

**5** slash-alias ordinary schools (Alta, Hammerfest, Kirkenes, Lakselv, Vadsø) are **in scope** for CASE 3 matching — separate from LOSA exclude.

---

## Block E — Professions and regions coverage

**Block status:** `OPEN`

**Purpose:** Not Finnmark-only; all ABORT-class counties in plan are in scope or explicitly out of scope.

**Mandatory when product information changes:** complete the **Expansion gate** in `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (code sync + relay dry-run + production relay + Block C E2E). Product/UI updates alone do **not** refresh Vilbli PSA.

| Done when |
|-----------|
| New VGS profession = `vgs-path-definitions.mjs` + optional `CONTOUR_A_OPERATIONAL_BY_PROFESSION`; job picks up via `SUPPORTED_VGS_PROFESSION_SLUGS`; **TS** `src/lib/vgs/contour-b-operational-eligibility.ts` updated for route read path. |
| Møre **`15`** (`ambiguous=1`): identity case closed or explicit handling — not permanent silent ABORT. |
| Every ABORT county in `norway-school-identity-matching-execution-plan.md` is either in job scope or on **OUT_OF_SCOPE** list with reason. |

---

## Block F — Code guards and regression

**Block status:** `OPEN`

**Purpose:** Contour **A** and reverted UI patterns do not regress.

| Done when |
|-----------|
| `--contour-b-partial` only invoked from ingest / scheduled job (not accidental default on Contour A). |
| CI smoke: `run-contour-b-operational-ingest --profession electrician --county 56 --dry-run` exits 0. |
| Vilbli-mirror separate UI panel remains **out of scope** (documented in P06-CLOSED). |

---

## Block G — Final closure (stop returning to P0–6)

**Block status:** `OPEN`

**Purpose:** Formal stop line for the contour.

| Done when |
|-----------|
| Git post **P06-OPERATIONAL-CLOSED** (safe summary): schedule, pilot counties, Block C E2E, Block D metrics, automation health. |
| This checklist: all blocks **CLOSED**. |
| `phase-2-closure-criteria-checklist.md`: **P06-CLOSED**; operational next steps **exclude** P0–6 rework. |
| Owner statement: **no further P0–6 contour work** — only job ops, new professions, or new problem classes (not re-opening B design). |

---

## Already done (do not redo)

| Item | Reference |
|------|-----------|
| Partial pipeline + ingest CLI + eligibility | `616ce82` |
| P06 §12 product amendment | `phase-0-6-processing-contour-owner-decision-record.md` |
| Finnmark evidence / planning sufficient | P06-CONTOUR-B*, P4-LOSA-FM-PLANNING-SUFFICIENT |
| Reverted Vilbli-mirror UI | `b2fd244` |

---

## Closure rule (binding)

**P06-CLOSURE complete** only when blocks **A through G** are **CLOSED**.

**Partial closure allowed for reporting only:**

| Blocks closed | Meaning |
|---------------|---------|
| A + B + C + F + G | **Automation works**; Vilbli parity may be incomplete |
| All including **D** | **Automation works** and route options match Vilbli for all gated rows |

---

## Recommended block order

1. **A** (small, unblocks clean docs)  
2. **B** (automation — core ask)  
3. **C** (prove MAIN + UI)  
4. **F** (lock regressions while D runs)  
5. **D** (largest — identity + programme + LOSA)  
6. **E** (breadth)  
7. **G** (sign-off)

**F** may run in parallel with **D** after **C**.
