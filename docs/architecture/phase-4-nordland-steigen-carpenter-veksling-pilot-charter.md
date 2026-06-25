# Phase 4 — Nordland Steigen × Carpenter Vekslingsmodell Pilot Charter (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — P0–P3 **shipped** 2026-06-18; no PSA / no apply (employer generic per §4.1) |
| **Pilot** | `carpenter` (Tømrer) × **Steigenmodellen** × home kommune **Steigen `1848`** |
| **Parent research** | `phase-4-nordland-steigen-regional-delivery-research-owner-record.md` |
| **Prerequisite** | Tier 1 + fylke inventory **closed** in parent record |

---

## 1. Problem statement

Families in **Steigen** see **ordinary campus VGS** options (Bodø, Fauske, …) via carpenter Contour B — correct for **2+2 strukturkart** truth. **Steigenmodellen** (0+4, lærling fra dag 1, fellesfag på lokal VGS) is a **real local alternative** for **Tømrerfaget** but is **absent** from Vilbli strukturkart and from current route snapshots.

**Product gap:** no honest representation of **veksling / 0+4** delivery; risk of families not knowing the local path exists.

---

## 2. Pilot scope (binding if approved)

| Dimension | In scope | Out of scope |
|-----------|----------|--------------|
| Geography | Child home kommune **`1848` Steigen** (Nordland `18`) | Hamarøy, Tysfjord, Innlandet, nationwide |
| Profession | **`carpenter`** (Tømrerfaget on Steigenmodellen) | electrician, mechanic, multi-trade Steigen menu |
| Delivery model | **Steigenmodellen / 0+4 veksling** | Finnmark LOSA; Nettskolen; campus-only rewrite |
| Truth source | **Curated operator** (NFK, kommune, Steigenmodellen public pages) | Vilbli strukturkart ingest; synthetic PSA |
| Route UX | **Parallel path** vs existing campus carpenter route | Replace or hide campus VGS options |

---

## 3. Proposed route shape (conceptual — not implemented)

```
Variant A (existing)     : VG1 programme_selection → VG2 programme_selection → apprenticeship_step (Vilbli bedrift)
Variant B (pilot charter): veksling_hub_step? → apprenticeship_step (employer-first 0+4) → fagbrev outcome
```

| Step | Entity | Notes |
|------|--------|-------|
| **Hub school** | Nord-Salten vgs **avd Steigen** (fellesfag 2 d/uke år 1–2) | DB institution exists; **not** on strukturkart PSA |
| **Employer** | Local bedrift (opplæringsbedrift) | **New entity class** in product — not `education_institutions` campus row |
| **Programfag** | In bedrift (per Steigenmodellen) | Not modelled as VG1/VG2 campus programme_selection |
| **Outcome** | Fagbrev Tømrer | Reuse NAV `håndverkere.tømrer` |

**Reuse:** existing `apprenticeship_step` type for bedrift/lære tail; **new** early-step semantics for 0+4 (may need `delivery_model: veksling_0_4` metadata — design in implementation gate).

**UI badge:** **«Veksling / Steigenmodellen»** — never **LOSA**.

---

## 4. Truth & evidence gates (before any write)

| Gate | Requirement | Status |
|------|-------------|--------|
| T-1 | Tier 1 legal frame **signed** in parent record §7 | **CLOSED** — parent record §7 |
| T-2 | NFK **0+4** for Steigen + Hamarøy **2025–2029**; levisteigen lists **Tømrerfaget** | **CLOSED** — docs 2026-06-16 (see §4.1) |
| T-3 | **No** `losa_fjern_delivery_municipality` scope | **CLOSED** — scout + charter |
| T-4 | Curated evidence pack (URLs) — not Vilbli HTML alone | **CLOSED** — §9 references |
| T-5 | Child eligibility: `preferred_municipality_codes` includes **`1848`** | **CLOSED** — P0 code |
| T-6 | `NOT_READY_FOR_APPLY` unchanged; no Phase 2 RLS apply | **OPEN** — unchanged |

### 4.1 T-2 evidence closure (2026-06-16)

| Claim | Evidence | Owner note |
|-------|----------|------------|
| 0+4 / fellesfag on nearest VGS preserved **2025–2029** | [NFK aktuelt — Knut Hamsun / nærmeste VGS](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx) | Policy frame; not per-trade bedrift list |
| **Tømrerfaget** on Steigenmodellen public offer | [levisteigen.no — utdanning i Steigen](https://www.levisteigen.no/utdanning-i-steigen.html) | Public operator page; no auditable employer roster in v1 |
| Not LOSA / not strukturkart | `npm run scout:nordland-regional` 2026-06-15 | 0 LOSA on elec/mech/carpenter `18` |

**Stop rule (unchanged):** if Tier 2 **bedrift list** cannot be sourced with auditable evidence → P1 shows **generic** opplæringsbedrift step only; **no** named employers until P2.

> **Successor (2026-06-25):** the generic placeholder is superseded by the verified-source, multi-commune employer layer — see `phase-4-verified-larebedrift-employer-layer-charter.md`. Steigen migrates to ingested godkjent rows once that layer's P1 covers it (no double truth).

---

## 5. Implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **P0** | Static **info card** on child profile / route detail / compare when Steigen + carpenter | **SHIPPED** — `d9be993` |
| **P1** | Second **path variant** in route builder (read-only curated JSON, not PSA) | **SHIPPED** — curated regional alternative sync |
| **P2** | Employer entity + `apprenticeship_options` curation table (separate from PSA) | **SHIPPED** — curated employer table in app code |
| **P3** | E2E owner checklist Steigen child × carpenter × variant B | **SHIPPED** — smoke + E2E green 2026-06-18; `phase-4-nordland-steigen-carpenter-veksling-e2e-owner-verify-checklist.md` |

**Stop rule:** if Tier 2 bedrift list cannot be sourced with auditable evidence → stay at **P0 info card** only.

---

## 6. Success criteria (pilot closure)

- [x] Child **Steigen `1848`** sees **both** campus carpenter route (A) and Steigenmodellen path (B) with clear labels
- [x] No LOSA badge; no fake Vilbli school rows for avd Steigen on strukturkart
- [x] Owner browser E2E: save/recompute **200** for variant A unchanged; variant B per charter
- [x] NAV matcher still **Tømrer** for carpenter family

---

## 7. Explicit non-goals

- Contour B / green-county ingest changes for `avd Steigen`
- LOSA pipeline reuse (Finnmark `56` pattern)
- Auto-discovery of employers from Vilbli
- Expanding to 17 Steigenmodellen trades in v1

---

## 8. Owner approval (required to move past DRAFT)

| # | Decision | Status |
|---|----------|--------|
| C-1 | Charter scope **Steigen × carpenter** approved | **OK** — chat 2026-06-15 |
| C-2 | Start at **P0 info card** vs **P1 path variant** | **P0 approved** — chat 2026-06-16 |
| C-3 | Implementation gate author | **OK** — P0 shipped in app (info card on child profile, route detail, compare) |
| C-4 | **P1** path variant implementation authorized | **OK** — chat 2026-06-16 |

**Sign-off:** _____________ Date: _____________

---

## 10. P1 design gate (2026-06-16)

**Goal:** eligible children see **variant B** as a real **alternative route** (save/recompute/preview), parallel to campus **variant A**. No PSA; no Contour B ingest changes.

### 10.1 Eligibility (reuse P0)

| Rule | Source |
|------|--------|
| `professionSlug === "carpenter"` | charter §2 |
| `preferred_municipality_codes` includes **`1848`** | `steigen-carpenter-veksling-pilot.ts` |

### 10.2 Variant identity

| Field | Value |
|-------|--------|
| `variantId` | `curated-steigen-carpenter-veksling-0-4` |
| `variant_label` | `Veksling / Steigenmodellen` |
| `variant_reason` | `curated:steigen-carpenter-veksling-0-4` |
| `delivery_model` (step metadata) | `veksling_0_4` |
| `source` (step metadata) | `curated_regional_delivery` |

**Not** a `route_outcome_filter_id` variant — do **not** overload `vilbli-branch-direct-bedrift` / `vilbli-branch-vg3-then-bedrift`.

### 10.3 Curated step shape (target snapshot payload)

```
Step 1 — veksling hub (fellesfag)
  type: progression_step  (or programme_selection with delivery_model metadata)
  institution: Nord-Salten vgs avd Steigen (Leinesfjord)
  title: Fellesfag — Nord-Salten vgs avd Steigen
  duration_label: år 1–2 (2 d/uke fellesfag per operator copy)
  delivery_model: veksling_0_4
  source: curated_regional_delivery

Step 2 — employer-first apprenticeship (0+4)
  type: apprenticeship_step
  title: Lærling i lokal bedrift (Tømrerfaget)
  institution_name: null  (no named bedrift in P1)
  delivery_model: veksling_0_4
  source: curated_regional_delivery
  apprenticeship_options: []  (P2 fills curated list)
```

**Outcome:** NAV scope unchanged — **Tømrer** / carpenter family (same as variant A).

### 10.4 Code integration points (planned)

| Layer | File / hook | Change |
|-------|-------------|--------|
| Curated definition | `src/lib/regional-delivery/steigen-carpenter-veksling-path-variant.ts` | JSON-like constant + `buildSteigenCarpenterVekslingSteps()` |
| Eligibility | `steigen-carpenter-veksling-pilot.ts` | reuse `shouldShowSteigenCarpenterVekslingInfo` |
| Route create / recompute | `create-initial-study-route.ts`, `trigger-study-route-recompute.ts` | after `buildPathVariants`, if eligible → build curated variant |
| Variant persistence | **new** `sync-study-route-curated-regional-alternatives.ts` | insert/update `study_route_variants` + snapshot (parallel to outcome-filter sync) |
| Alternatives read | `get-study-route-alternatives.ts` | already lists non-archived variants; label from `variant_label` |
| Route detail UI | `alternative-routes-collapsible.tsx` | show badge «Veksling / Steigenmodellen» when `variant_reason` matches |
| Invariants | `route-truth-invariants.ts` | curated variants **exempt** from Vilbli path-variant checks |

### 10.5 Explicit P1 non-goals

- Named opplæringsbedrift rows (P2)
- PSA / `availability_truth` rows for avd Steigen
- Changing primary campus variant selection logic
- Hamarøy `1871` eligibility (charter §2 out of scope)

### 10.6 P1 done criteria

- [ ] Steigen + carpenter child: **≥2** variants after create/recompute (campus + veksling)
- [ ] Preview/switch variant B → steps match §10.3
- [ ] Variant A recompute **unchanged** (same schools as before P1)
- [ ] No LOSA badge; P0 info card still shown on route detail
- [ ] `npm run build` green

---

## 9. References

- [levisteigen.no — Steigenmodellen + Tømrerfaget](https://www.levisteigen.no/utdanning-i-steigen.html)
- [Nordland fylkeskommune (NFK) — 0+4 / Steigenmodellen on nearest VGS (2025–2029)](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx)
- [Udir — vekslingsmodeller evaluering](https://www.udir.no/tall-og-forskning/finn-forskning/rapporter/evaluering-av-vekslingsmodeller-i-fag--og-yrkesopplaringen/)
- [Udir — fleksibilitet / vekslingsmodell](https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/veiledning-fleksibilitet-i-fag--og-timefordeling)
- `phase-4-route-mobile-api-contract-v1.md` — `apprenticeship_step`
