# Phase 4 — Nordland Steigen × Carpenter Vekslingsmodell Pilot Charter (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **DRAFT** — owner agreed 2026-06-15; **no code / no PSA / no apply** |
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

| Gate | Requirement |
|------|-------------|
| T-1 | Tier 1 legal frame **signed** in parent record §8 |
| T-2 | Evidence for trade offer: NFK confirms **0+4 (Steigenmodellen)** rights for pupils from **Steigen + Hamarøy** in **2025–2029**; local Steigenmodellen operator page lists **Tømrerfaget** among available trades for the program |
| T-3 | **No** `losa_fjern_delivery_municipality` scope |
| T-4 | Curated evidence pack (URLs + owner-held PDF/snippet if needed) — not Vilbli HTML alone |
| T-5 | Child eligibility rule: `home_municipality_code = 1848` (or configurable Steigen set) |
| T-6 | `NOT_READY_FOR_APPLY` unchanged; no Phase 2 RLS apply |

---

## 5. Implementation phases (future — not authorized now)

| Phase | Deliverable |
|-------|-------------|
| **P0** | Static **info card** on child profile / route compare when Steigen + carpenter — no route engine change |
| **P1** | Second **path variant** in route builder (read-only curated JSON, not PSA) |
| **P2** | Employer entity + `apprenticeship_options` curation table (separate from PSA) |
| **P3** | E2E owner checklist Steigen child × carpenter × variant B |

**Stop rule:** if Tier 2 bedrift list cannot be sourced with auditable evidence → stay at **P0 info card** only.

---

## 6. Success criteria (pilot closure)

- [ ] Child **Steigen `1848`** sees **both** campus carpenter route (A) and Steigenmodellen path (B) with clear labels
- [ ] No LOSA badge; no fake Vilbli school rows for avd Steigen on strukturkart
- [ ] Owner browser E2E: save/recompute **200** for variant A unchanged; variant B per charter
- [ ] NAV matcher still **Tømrer** for carpenter family

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

**Sign-off:** _____________ Date: _____________

---

## 9. References

- [levisteigen.no — Steigenmodellen + Tømrerfaget](https://www.levisteigen.no/utdanning-i-steigen.html)
- [Nordland fylkeskommune (NFK) — 0+4 / Steigenmodellen on nearest VGS (2025–2029)](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx)
- [Udir — vekslingsmodeller evaluering](https://www.udir.no/tall-og-forskning/finn-forskning/rapporter/evaluering-av-vekslingsmodeller-i-fag--og-yrkesopplaringen/)
- [Udir — fleksibilitet / vekslingsmodell](https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/veiledning-fleksibilitet-i-fag--og-timefordeling)
- `phase-4-route-mobile-api-contract-v1.md` — `apprenticeship_step`
