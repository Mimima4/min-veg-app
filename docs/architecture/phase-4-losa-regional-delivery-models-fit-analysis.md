# Phase 4 LOSA — Regional Delivery Models Fit Analysis (Read-Only)

| Field | Value |
|-------|--------|
| **Status** | **ANALYSIS ONLY** — no code/app changes without owner approval |
| **Date (UTC)** | 2026-05-29 |
| **Reference contour** | Finnmark LOSA: `provider` + `delivery_municipality` → `losa_fjern_delivery_municipality` |

**Owner action required:** confirm whether each model warrants a **new slice** or a **different product scope** (apprenticeship / hybrid / campus) before any implementation.

---

## What our LOSA contour actually models

| Dimension | Finnmark LOSA (built) |
|-----------|------------------------|
| Vilbli signal | `Nordkapp VGS – LOSA {kommune}` |
| Provider | One VGS (Nordkapp) |
| Delivery unit | **Kommune** (18 rows) |
| Legal frame | Fjernundervisning / LOSA (Tier 1) |
| PSA scope | `losa_fjern_delivery_municipality` |
| UI | Provider title + kommune line + **LOSA** badge |
| **Not modeled** | Lærling/Y-path days, local employer host, studiesenter room, Nettskole brand |

---

## 1. Nordland — Steigenmodellen (Steigen + neighbours)

**Description:** From day 1: students at **local businesses**; 2 days theory in **local VGS branch** (Knut Hamsun VGS); 3 days work — fish/construction workforce retention.

| Fit vs LOSA contour | Assessment |
|---------------------|------------|
| Same problem (sparse geography)? | **Yes** — retention in small kommune |
| Same **entity** model? | **No** — this is **work-based learning / veksling / lære**, not fjern LO SA kommune delivery |
| Provider + delivery kommune split? | **Partial** — provider is Knut Hamsun; delivery is Steigen area, but **employer** is first-class actor we don't represent |
| Vilbli label shape? | **Unknown** — need manifest extract (`18` Nordland electrician); unlikely to be `– LOSA {kommune}` ×18 |
| Reuse `losa_fjern_delivery_municipality`? | **Risky** — would mis-label apprenticeship/hybrid as fjern LOSA |
| Same 5 sub-gates? | **Only if** claim classes match; likely needs **`apprenticeship_step`** or new **hybrid_delivery** scope |

**Verdict:** **Analogous policy goal, not same technical contour.** Investigate as **Y-path / vekslingsmodell** slice, not copy-paste Finnmark LOSA pipeline.

**Next analysis (no code):** Vilbli rows for Steigen area; Udir/operator docs on Steigenmodellen vs LOSA legal status.

---

## 2. Troms — Decentralized classes / studiesentre

**Description:** Post-split Troms/Finnmark; remote kommuner use **studiesentre** or hybrid classes — students in equipped local rooms, lessons **streamed** from base school.

| Fit vs LOSA contour | Assessment |
|---------------------|------------|
| Geographic pattern | **Close** to Finnmark LOSA (hub school + distant kommune) |
| Delivery site | Often **studiesenter** or kommune facility — may or may not map 1:1 to **kommune** Vilbli row |
| Provider | Regional VGS (not necessarily single Nordkapp-style provider for all rows) |
| Fjernundervisning / LOSA legal frame? | **Maybe** — streaming + samling can be LOSA-shaped; needs Tier 1 proof per county |
| Reuse contour? | **Plausible per row** *if* Vilbli uses LOSA-like labels **and** evidence separates provider vs delivery site |
| Troms–Finnmark history | Pre-split LOSA experience may mean **different** Vilbli/operator naming — must not assume Finnmark manifest pattern |

**Verdict:** **Closest candidate** for same contour **after** Vilbli manifest + evidence pass on **`55` Troms**. Not automatic — verify label grammar and provider multiplicity.

**Next analysis (no code):** `npm run losa:finnmark-manifest` equivalent for Troms; count `isLosa` rows; map studiesentre vs kommune-only delivery.

---

## 3. Innlandet — Vekslingsmodell + Nettskolen / Y-veien

**Description:** Large distances; **Vekslingsmodell** from course start (not 2+2 block); digital support via **Nettskolen**; Y-veien hybrid courses.

| Fit vs LOSA contour | Assessment |
|---------------------|------------|
| Distance / decentralization | **Yes** |
| Dominant pedagogy | **Alternation + digital hybrid + Y-path** — not kommune-scoped fjern LOSA |
| Nettskolen | **Digital school brand** — third entity type (neither campus VGS nor LOSA kommune row) |
| Reuse `losa_fjern_delivery_municipality`? | **No** without forcing hybrid/Y into LOSA scope — same mis-model risk as Steigen |
| Same 5 sub-gates? | **Unlikely** — needs programme_in_school + apprenticeship_step + possibly **external_delivery** state |

**Verdict:** **Not the same contour.** Policy cousin (rural access), product sibling (route step types), not Finnmark LOSA clone.

**Next analysis (no code):** Map Innlandet offerings to existing route step types (`programme_selection` vs `apprenticeship_step`); check Phase 2 `external_delivery` / `remote_or_local_delivery` states.

---

## Summary table

| Model | County | Reuse Finnmark LOSA contour? | Likely path |
|-------|--------|------------------------------|-------------|
| Steigenmodellen | **18** Nordland | **No** (as-is) | Apprenticeship / veksling product slice |
| Studiesentre / streamed | **55** Troms | **Maybe** (verify) | Same contour **if** Vilbli+evidence match |
| Vekslingsmodell + Nettskolen | **34** Innlandet | **No** (as-is) | Hybrid/Y-path + digital school entity |

---

## Decision rule (owner)

Before any new county work:

1. Run **manifest extract** → count LOSA-shaped Vilbli labels.
2. Classify **legal frame** (LOSA/fjern vs lære/veksling vs nettskole).
3. If entity model ≠ provider+kommune fjern → **do not** reuse `losa_fjern_delivery_municipality` without new gate.
4. Only then charter per-row §4 (Finnmark pattern) or charter **new scope**.

**No implementation authorized by this document.**
