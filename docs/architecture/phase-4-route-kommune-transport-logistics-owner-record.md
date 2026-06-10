# Phase 4 — Route kommune transport logistics owner record

| Field | Value |
|-------|--------|
| **Status** | **PILOT IMPLEMENTED** — Vestland (`46`) active in route sort |
| **Date (UTC)** | 2026-06-10 |
| **Pilot scope** | **Vestland (`46`) first** |
| **Applies to** | All professions (electrician, mechanic, …) — **one shared contour** |

---

## Owner decisions (signed 2026-06-10)

| # | Decision | Status |
|---|----------|--------|
| T-1 | Transport layer is **enrichment**, not a gate — if logistics cannot be computed, **skip** and continue approved route-build algorithm | **OK** |
| T-2 | **No temporary fallbacks** (no silent centroid downgrade when Entur/Skyss unavailable) | **OK** |
| T-3 | **Never** use child address or address→nearest stop (Norway privacy) — **kommune only** | **OK** |
| T-4 | **Same kommune** (child home = school kommune) → **do not** run logistics | **OK** |
| T-5 | **Different kommune** → run logistics (Askøy→Bergen yes; Bergen→Bergen no) | **OK** |
| T-6 | Schedule source: **Entur** national registry (Skyss = Vestland operator, not sole API) | **OK** |
| T-7 | Kommune hub: **public Entur/Skyss stop registry** (not custom owner list) | **OK** |
| T-8 | School start time: tier A school public pages → tier B fylke/skoleskyss → tier C fylke-default (sort only) | **OK** |
| T-9 | Normal inter-kommune: **5 min** arrival buffer before start time | **OK** |
| T-10 | Exception kommuner: **arrive + depart same day**, not buffer-first | **OK** |
| T-11 | Priority order: **reachability → VG1+VG2 integrity → tie-break** | **OK** |
| T-12 | Mobile: server-side only; same JSON API as web; compact fields; no web-only pipeline | **OK** |
| D-1 | Remove duplicate `mechanic-vg1-teknologi-og-industrifag-vestland` (keep `mechanic-vg1-teknologi-vestland`) | **OK** |
| D-2 | Pilot ingest/transport: **Vestland first** | **OK** |

---

## Reachability algorithm (norm)

1. If `child_kommune === school_kommune` → skip transport layer.
2. Else resolve **primary hub** for child kommune from Entur stop registry:
   - Prefer railway station in kommune if present.
   - Else StopPlace with highest weekday departures before 09:00.
3. Query Entur morning itinerary: hub → school stop (train + bus legs).
4. Compare arrival vs **school start time** (tier A/B/C) minus **5 min** buffer.
5. Among reachable schools → prefer **VG1+VG2 same institution** → distance tie-break.

**UI:** constructor — all schools remain selectable; logistics affects **default sort / hints only**.

---

## Exception mode (not norm)

When **child kommune OR school kommune** is on the exception list **and** kommunes differ:

- Do **not** use 5 min buffer as primary test.
- Test: **can arrive morning and depart evening** same weekday (round trip feasible).
- Bestillingstransport / skoleskyss-only corridors: exception rules apply; do not mix into mass buffer logic.

**Dynamic supplement:** if Entur shows **≤2 departures 06:00–09:00** on weekday for **hub→school** (per corridor, not home-hub global count), treat pair as exception **only when norm buffer fails**. Norm on-time arrival always wins (e.g. Vaksdal→Voss train). Logic version `v3-norm-before-exception`.

### Static exception list (~50 kommuner)

**Finnmark** — all except regional hubs Alta `5601`, Hammerfest `5603`, Sør-Varanger `5605`:  
Vadsø `5607`, Karasjok `5610`, Kautokeino `5612`, Loppa `5614`, Hasvik `5616`, Måsøy `5618`, Nordkapp `5620`, Porsanger `5622`, Lebesby `5624`, Gamvik `5626`, Tana `5628`, Berlevåg `5630`, Båtsfjord `5632`, Vardø `5634`, Nesseby `5636`

**Troms (north/island sparse):** Gratangen `5516`, Dyrøy `5528`, Karlsøy `5534`, Lyngen `5536`, Kåfjord `5540`, Skjervøy `5542`, Nordreisa `5544`, Kvænangen `5546`

**Nordland:** Bindal `1811`, Dønna `1827`, Grane `1825`, Hattfjelldal `1826`, Træna `1835`, Lurøy `1834`, Nesna `1836`, Rødøy `1836`, Meløy `1837`, Gildeskål `1838`, Røst `1856`, Flakstad `1859`, Værøy `1857`, Moskenes `1874`

**Innlandet:** Folldal `3429`, Rendalen `3424`, Engerdal `3425`, Etnedal `3450`, Os `3440`, Lierne `5042`, Namsskogan `5044`

**Møre og Romsdal:** Sandøy `1514`, Giske `1532`, Aukra `1547`, Hustadvika `1579` (distrikt zones without rutebuss)

**Vestland (pilot):** Fedje `4633`, Solund `4636` only — **Vaksdal `4628` → Voss `4621` is norm (train corridor)**

**Agder:** Valle `4221`, Bygland `4222`

**Rogaland:** Sokndal `1111`

---

## Data fix — mechanic VG1 duplicate (executed)

| Slug | Action |
|------|--------|
| `mechanic-vg1-teknologi-vestland` | **KEEP** (canonical: «VG1 Teknologi- og industrifag») |
| `mechanic-vg1-teknologi-og-industrifag-vestland` | **REMOVED** — duplicate PSA/link/programme row |

Expected PSA after cleanup: **VG1 28** / **VG2 11** (not 56/11).

---

## Vestland E2E owner verify (2026-06-10)

| Case | Expected | Owner |
|------|----------|-------|
| Vaksdal `4628` → Voss (inter-kommune, train) | Default VG1/VG2 **Voss** (not Østerøy/Bergen centroid) | ☑ |
| Askøy → Bergen (inter-kommune) | Transport sort toward reachable Bergen schools | ☑ |
| Bergen home ↔ Bergen school (same kommune) | Transport layer **skipped** | ☑ |

**Sign-off:** owner browser verify in chat, 2026-06-10. Post-verify code fix `6f26347` (`v3-norm-before-exception`) for Vaksdal sparse-hub mis-rank.

**Scope reminder:** rules apply to **all VGS professions/regions** on the shared contour — not per-profession exceptions. Higher-ed institutions are out of scope here.

---

## Implementation gate

- [x] Entur hub resolver (kommune → primary StopPlace) — `src/lib/planning/kommune-transport/entur-client.ts`
- [x] Morning itinerary + start-time tier C — `school-start-time.ts`, `evaluate-reachability.ts`
- [x] Exception list + dynamic ≤2-departure rule — `exception-kommuner.ts`
- [x] Norm-before-exception + per-corridor sparse (`v3-norm-before-exception`) — `evaluate-reachability.ts`
- [x] Wire into `selectTruthCandidateForRoute` / `buildStepsFromAvailabilityTruth` (sort only, non-gating)
- [x] VG2 anchors to resolved VG1 step row (chain before transport tie-break)
- [x] Vestland E2E browser: Vaksdal→Voss, Askøy→Bergen, Bergen intra-kommune skip
- [x] Mobile API contract review — `phase-4-route-mobile-api-contract-v1.md` (signed 2026-06-10)

---

## References

- `route-engine-master-spec.md`
- `phase-4-route-mobile-api-contract-v1.md`
- `phase-0-6-contour-b-mechanic-vilbli-branch-owner-record.md`
- Entur developer: https://developer.entur.org/
