# Phase 4 — Current-year programme offering truth (owner decision)

| Field | Value |
|-------|--------|
| **Section** | **P4-CURRENT-YEAR-OFFERING** |
| **Status** | **EFFECTIVE** — owner 2026-07-18 |
| **Criticality** | **CRITICAL** — product must not list schools that do not offer the programme in the **current school year** |
| **Triggered by** | Anleggsteknikk VG2 P-8 audit vs Vilbli national strukturkart «Skoler som tilbyr dette» |

---

## 1. Binding product rule

**PSA rows surfaced to families (`get-availability-truth` → primary + alternatives) MUST represent schools that offer the programme in the current school year**, matching Vilbli UI:

> «Skoler som tilbyr dette» on the national strukturkart (and equivalent current-year tilbud on county pages when that signal is available).

| Allowed | Forbidden |
|---------|-----------|
| Schools Vilbli lists as offering **this** school year | Every school that appears in the county **programme structure** map (`vb_map_data_VG*`) |
| PSA-derived / ingest-maintained offering set | Hardcoded permanent school name lists in route builders (P8-7) |

This rule applies to **all Contour B professions**, not only anleggsteknikk. Anleggsteknikk is the first audited case; the bug is systemic.

---

## 2. Root cause (2026-07-18)

Contour B ingest parses the **per-county structure map** on  
`…/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=…&side=p5`  
(`vb_map_data_VG2` / `kursKolonne`).

That map is a **superset** of current-year tilbud.

> **CORRECTION (2026-07-18, home-IP audit).** The first durable fix assumed the national `side=p2`
> «fag- og timefordeling» page mirrors the county `side=p5` map (`vb_map_data_VG*`). A real home-IP
> fetch proved this **wrong**: `side=p2` (national **and** county) carries **no** `vb_map_data` and no
> school listing — it is only the subject/hour course graph. No `/nb/no/…` national page carries a
> map at all. Result: `buildCurrentYearOfferingSet` always returned `null` and the gate was stuck
> **fail-open**. The real current-year signal is described in §3 / §4a: the course-specific
> `skoler-og-laerebedrifter … side=p5` **`vb_map_data_Vg2` landslinje set**, read from a probe county.

| Source | Anleggsteknikk VG2 count (2026-07-18) |
|--------|--------------------------------------|
| Vilbli national landslinje `vb_map_data_Vg2` (Oslo probe p5) | **6** |
| Our active PSA (`is_active=true`) before reconcile | **28** |
| After `reconcile:anlegg-vg2-current-year --apply` (2026-07-18) | **6** |

There is **no** `school_year` / `tilbud` column on `programme_school_availability`. All Contour B rows are written `verification_status=needs_review`. Read path accepts `verified` + `needs_review` + `is_active=true` — so structure-only rows must stay `is_active=false`.

---

## 3. Current-year offering set (anleggsteknikk VG2, audit 2026-07-18)

Authority (real signal): `vb_map_data_Vg2` on the course-specific national schools page, read from a
probe county that does **not** offer anleggsteknikk locally (Oslo), so the map is exactly the national
landslinje set with no local-structure noise:
https://www.vilbli.no/nb/oslo/strukturkart/V.BA/anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5

| Fylke | School (Vilbli) | Vilbli schoolCode |
|-------|-----------------|-------------------|
| Agder `42` | Sam Eyde videregående skole | `303535` |
| Finnmark `56` | Kirkenes videregående skole / Girkonjárgga joatkkaskuvla | `8858` |
| Innlandet `34` | Solør videregående skole | `8158` |
| Nordland `18` | Fauske videregående skole | `8741` |
| Rogaland `11` | Øksnevad vidaregåande skole | `6586` |
| Vestland `46` | Os vidaregåande skule | `8524` |

Live-verified 2026-07-18 (home IP): `node scripts/smoke-current-year-offering-gate.mjs --live` →
`VG2 offering count=6 (fylke=6) codes=303535,8858,8158,8741,6586,8524`.

**Immediate remediation (applied 2026-07-18):** `npm run reconcile:anlegg-vg2-current-year -- --apply` deactivated 22 structure-only anleggsteknikk VG2 PSA rows (`is_active=false`, `verification_status=superseded`). Active count is **6**. Primary + P-8 both read via existing `is_active` filter — no route-builder allowlist.

---

## 4. Durable ingest (required before next full relay)

| Step | Action | Status |
|------|--------|--------|
| I-1 | Extend Vilbli extract to capture **current-year offering** | **REWRITTEN 2026-07-18** — original p2 assumption was wrong (see §2 CORRECTION). Now: relay fetches the course-specific `skoler-og-laerebedrifter … side=p5` `strukturkartReferenceUrl` once per profession from a non-offering probe county (Oslo for anleggsteknikk); `buildCurrentYearOfferingSet` parses `vb_map_data_Vg*` **nationally (no county filter)** and keeps only landslinje stages (pins spanning ≥2 fylke). Live-verified count=6 (`scripts/lib/vilbli-current-year-offering.mjs`) |
| I-2 | Write/keep `is_active=true` only for offering ∩ matched NSR institutions | **CODE LANDED** — pipeline write loops gate on `resolveOfferingDecision` |
| I-3 | Structure-only schools: skip write → existing stale-deactivation flips prior `is_active=true` → `false` | **CODE LANDED** — reuses tested stale-deactivation pass (no new deactivate path) |
| I-4 | Optional schema: `school_year_label` (or equivalent) for audit — separate migration gate | Deferred |
| I-5 | Re-apply for **all** Contour B professions (same mechanism) | Profession-generic (no hardcoded lists); auto-enforced once I-1 proven per profession |

### 4a. Real p5 landslinje extract approach + enforcement gate (fail-closed ONLY when extract succeeds)

**What the markup actually is.** `side=p2` («fag- og timefordeling») is a school-less course graph.
`vb_map_data_Vg*` arrays exist **only on county-scoped `side=p5` pages** (var casing is `Vg1`/`Vg2`,
item shape `[lat, lng, type, name, code, addr, phone, email, fylke, path]`). For a **landslinje /
landstilbud** course, the `Vg2` map on every county's course-specific page pins the same **national**
offering schools (several fylke); a broad stage (VG1 Bygg- og anleggsteknikk) pins only that page's
own single county.

**Extraction (`scripts/lib/vilbli-current-year-offering.mjs`).**
1. Reference URL (`strukturkartReferenceUrl`) = the course-specific `…-skoler-og-laerebedrifter … side=p5`
   page for a **probe county that does not offer the landslinje locally** (Oslo for anleggsteknikk) →
   its `vb_map_data_Vg2` is exactly the national offering, with no local-structure contamination.
   (Reading it from an offering county — e.g. Rogaland — would mix in that county's structure-only
   schools: 10 pins vs the true 6.)
2. `buildCurrentYearOfferingSet` parses all `vb_map_data_Vg*` pins **nationally (no county filter)** and
   keeps a stage as the offering set **only if its pins span ≥ 2 distinct fylke** (the landslinje
   signal). Single-fylke stages (broad VG1) are dropped → the gate stays **fail-open** for them, so a
   broadly-offered stage is never mass-deactivated.
3. Membership is national and applied to **every** county: a landslinje school in county X is kept in
   X; structure-only schools in any county (including counties with zero offering) are dropped.
   Matching is by Vilbli `schoolCode` first, normalized school name as fallback.

| Condition | Behavior |
|-----------|----------|
| No offering HTML / stub (<10k) / no landslinje stage (no multi-fylke `vb_map_data`) | **Fail-open** — `is_active` written from structure map (current behavior) + **loud diagnostic** `[current-year-offering] … NO_OFFERING_HTML / OFFERING_PARSE_EMPTY` |
| Offering parsed (default) | **Fail-closed** — structure-only schools skipped; stale-deactivation deactivates prior active extras |
| Opt-out | `CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING=0` (or `false`) |

**Validated 2026-07-18 (home IP):**
1. Live: `node scripts/smoke-current-year-offering-gate.mjs --live` → `VG2 offering count=6`.
2. County sims: Agder 2→1 (drop Byremo); Rogaland 5→1; Vestland 4→1; Trøndelag 3→0.
3. **Enforcement default ON** in `isCurrentYearOfferingEnforcementEnabled` (after the above). Dense professions whose `strukturkartReferenceUrl` still points at schoolsless p2 stay fail-open (Contour B unchanged).

Stopgap `reconcile:anlegg-vg2-current-year` = emergency audit only. Next full anlegg Contour B relay with this build keeps PSA at current-year offering without manual reconcile.

**I-5 remaining:** give other landslinje / sparse professions the same Oslo-style probe `strukturkartReferenceUrl`; for dense in-county structure≠tilbud cases, add a county tilbud marker (separate extract).

---

## 5. Owner sign-off

| ID | Decision | Answer |
|----|----------|--------|
| CY-0 | Surface only current-year tilbud schools | **Yes — CRITICAL** |
| CY-1 | Structure-map schools without current tilbud must not appear in UI | **Yes** |
| CY-2 | Immediate fix via PSA `is_active` reconciliation (not builder hardcode) | **Yes** |
| CY-3 | Ingest must encode offering before next anlegg relay | **Yes** |

---

## 6. References

- `phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md`
- `phase-4-relocation-geography-contract-owner-decision-record.md`
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md`
- `scripts/reconcile-anleggsteknikk-vg2-current-year-offering.mjs` (stopgap)
- `scripts/lib/vilbli-current-year-offering.mjs` (durable I-1…I-3 gate)
- `scripts/smoke-current-year-offering-gate.mjs` (`npm run smoke:current-year-offering`)
