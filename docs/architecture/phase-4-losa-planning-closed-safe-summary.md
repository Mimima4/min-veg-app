# Phase 4 LOSA — Planning Closed Safe Summary

| Field | Value |
|--------|--------|
| **Document type** | Repo-safe summary — **P4-LOSA-PLANNING-CLOSED** |
| **Section** | **P4-LOSA-PLANNING-CLOSED-post** |
| **Status code** | `P4_LOSA_FINNMARK_REF_MANIFEST_COMPLETE` |
| **Date (UTC)** | 2026-06-05 (planning); reference pilot tail closed **2026-05-29** |
| **Reference county** | `56` (Finnmark) — **not** a production exception rule |
| **Head commit (reference)** | `aff1037`; tail closure `phase-4-losa-operational-tail-closure-execution-review-summary.md` |

**Forbidden in this summary:** secrets, owner-held JSON, snippet text, per-school PII.

---

## This document is

- Formal **planning / scaffold closure** for Phase 4 LOSA (manifest → Route plan).
- **Operational tail** **complete** for Finnmark ref (**18/18** rows): schema → §4 → PSA write → Route **#3** + LOSA badge.

## This document is not

- Nationwide product apply beyond Finnmark ref or `NOT_READY_FOR_APPLY` clearance.
- `NOT_READY_FOR_APPLY` clearance.
- Permission to treat Finnmark as special-case production rules.

---

## 1. Gate closure matrix (planning)

| Gate | Status | CLI proof |
|------|--------|-----------|
| **P4-LOSA-IMPL** | **CLOSED** | `npm run losa:finnmark-manifest` |
| **P4-LOSA-EVIDENCE-LINK** | **CLOSED** | `npm run losa:finnmark-evidence-link` |
| **P4-LOSA-PUBLICATION-MODEL** | **CLOSED** | `npm run losa:finnmark-publication-plan` |
| **P4-LOSA-PSA** (schema) | **CLOSED** (repo + **main applied**) | `npm run losa:validate-psa-schema` |
| **P4-LOSA-PSA-WRITE** (pilot) | **CLOSED** | `npm run losa:preview-psa-write` → **1** candidate |
| **P4-LOSA-ROUTE** (plan + wiring) | **CLOSED** | `npm run losa:plan-route-consumption` → **1** eligible |
| **P4-LOSA-OPERATIONAL-TAIL** | **CLOSED** | Full CLI chain — `phase-4-losa-operational-tail-closure-execution-review-summary.md` |
| **Kommune resolve** (ref) | **CLOSED** | `npm run losa:resolve-municipality-codes` → **18/18** |

---

## 2. Current product posture

| Metric | Value |
|--------|--------|
| LOSA manifest rows (Finnmark ref) | **18** |
| Row §4 satisfied | **18/18** (full Finnmark ref manifest) |
| PSA LOSA writes | **18** (all ref county delivery municipalities) |
| Route LOSA options | **18** eligible (#3 wired; LOSA UI badge) |
| Contour B ordinary Finnmark schools | **6** (unchanged) |
| P06 operational | **CLOSED** (Block D LOSA tail complete) |

---

## 3. Nationwide applicability

- `losa_fjern_delivery_municipality` scope and pipeline rules apply to **any** county/profession with LOSA-shaped Vilbli rows.
- Finnmark `56` / `electrician` is **reference proof** for CLI only.
- Kommune reference table is **fylke 56** data — other counties require their own reference module at ops time.

---

## 4. Operational tail (ordered)

| # | Step | Gate / action |
|---|------|----------------|
| 1 | Apply `20260605120000_programme_school_availability_losa_scope.sql` (+ co-applied `name_i18n`) | **DONE** — `phase-4-losa-psa-schema-main-apply-checklist.md` |
| 2 | Close §4 on ≥1 row (evidence + publication decision) | **DONE** — Alta `ROW_SECTION_4_SATISFIED` + publication decision (`P4-LOSA-ALTA-PUBLICATION-DECISION-post`) |
| 3 | Owner-held **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `phase-4-losa-psa-write-pilot-execution-review-summary.md` |
| 4 | Permission **#3** → wire `get-availability-truth` + scope filter | **DONE** — `phase-4-losa-route-wiring-execution-review-summary.md` |
| 5 | Operational tail closure (reference pilot) | **DONE** — `phase-4-losa-operational-tail-closure-execution-review-summary.md` |

---

## 4b. Open tracks (post-tail)

| Track | Status |
|-------|--------|
| Row **2** (Hammerfest) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-HAMMERFEST-PILOT-post`) |
| Row **3** (Sør-Varanger) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-SOR-VARANGER-PILOT-post`) |
| Row **4** (Porsanger) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-PORSANGER-PILOT-post`) |
| Row **5** (Karasjok) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-KARASJOK-PILOT-post`) |
| Row **6** (Kautokeino) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-KAUTOKEINO-PILOT-post`) |
| Row **7** (Vardø) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-VARDO-PILOT-post`) |
| Row **8** (Nesseby) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-NESSEBY-PILOT-post`) |
| Row **9** (Tana) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-TANA-PILOT-post`) |
| Row **10** (Lebesby) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-LEBESBY-PILOT-post`) |
| Row **11** (Gamvik) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-GAMVIK-PILOT-post`) |
| Row **12** (Berlevåg) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-BERLEVAG-PILOT-post`) |
| Row **13** (Hasvik) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-HASVIK-PILOT-post`) |
| Row **14** (Båtsfjord) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-BATSFJORD-PILOT-post`) |
| Row **15** (Loppa) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-LOPPA-PILOT-post`) |
| Row **16** (Måsøy) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-MASOY-PILOT-post`) |
| Row **17** (Nordkapp) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-NORDKAPP-PILOT-post`) + LOSA route badge |
| Row **18** (Vadsø) §4 | **COMPLETE** — PSA inserted (`P4-LOSA-PSA-WRITE-VADSO-PILOT-post`); **18/18** closed |
| Bulk PSA write | **OPEN** — unchartered bulk still forbidden; **18/18** done per-row |
| `NOT_READY_FOR_APPLY` | **unchanged** — see `phase-4-losa-not-ready-for-apply-next-gate-owner-note.md` |
| Post-pilot steps | **ACTIVE** — `phase-4-losa-post-pilot-next-steps-owner-record.md` |

---

## 5. Non-return rules

- Do **not** publish LOSA as ordinary `programme_in_school` rows.
- Do **not** use Contour B `pickInstitutionsForPsaEmission` for `isLosa` Vilbli rows.
- Do **not** add Finnmark-only Route/PSA hacks — extend reference tables and gates instead.

---

## Final statement

Phase 4 LOSA **reference pilot operational tail is complete** (**1** Alta row end-to-end). Remaining **17** kommuner and `NOT_READY_FOR_APPLY` require **new** row-level gates — not automatic scale-out.
