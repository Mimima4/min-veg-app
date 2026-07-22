# Phase 4 — Relocation geography contract owner decision record

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-GEOGRAPHY** |
| **Status** | **EFFECTIVE** — owner sign-off 2026-07-15 |
| **Date (UTC)** | 2026-07-15 |
| **Governs** | How `relocation_willingness` scopes **school institution** visibility per **education contour** and **primary vs alternative** layer |
| **Prerequisite** | `phase-4-multi-contour-truth-registry-owner-decision-record.md` (U-10); `phase-4-county-local-primary-route-completeness-owner-policy.md` (P-6) |

---

## 1. Phased rollout (binding)

| Phase | Scope | Status |
|-------|--------|--------|
| **Before P-8** | `relocation_willingness` **does not** filter VGS `programme_selection` school dropdowns | **Correct — keep** |
| **Bedrift** | `larebedrift-geography-scope.ts` already applies relocation to verified employers | **Live** |
| **P-8 pilot** | First VGS school geography activation — **sparse national VG2** for `anleggsteknikk` only | **Live / CLOSED** 2026-07-20 (`phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md`) |
| **Post P-8** | Same module reused when **C-FAGSKOLE** / other contours go live — separate alternative slots | **Planned** |

**Non-goal:** Turn on relocation for **all** VGS professions in one step. Dense professions (carpenter, electrician, …) must **not** start pulling national school lists.

---

## 2. Two user axes (do not merge)

| Axis | Field | Question |
|------|-------|----------|
| **Contour / outcome** | `filter_id` / `preferred_education_level` | Which education layer path (VGS fast_to_work, fagskole_after_vgs, long_academic, …) |
| **Geography** | `relocation_willingness` (`no` / `maybe` / `yes`) | How far the family accepts travel / relocation for **institution pickers** |

Matcher and multi-contour registry §4 still govern **which contours** appear. Relocation governs **geography within** a live contour.

---

## 3. Hard invariants (owner 2026-07-15)

| # | Invariant |
|---|-----------|
| G-1 | **Contours never mix in one dropdown** — VGS schools ≠ fagskole institutions ≠ høyskole (U-7). |
| G-2 | **P-6 primary chain** stays in **home fylke** when home has VG1+VG2 PSA — relocation does not relocate the primary *chain county*. |
| G-3 | **National / cross-fylke VGS schools** (outside scoped primary geography) → **alternative routes only**, never primary card bloat. |
| G-4 | **Sparse gate required** — relocation geography for VGS applies only when `sparse_vg2_alternative_eligible(profession)` is true (PSA-derived; see P-8 record). |
| G-5 | **Omit, don't stub** — if geography scope yields zero schools, hide alternative; no Vilbli outbound links (U-9). |
| G-6 | **Transport realism beats administrative adjacency** — see §5 and `route-engine-master-spec.md` §1.2. |
| G-7 | **Implementation fragility** — P-8+ code changes require **Claude Opus 4.8 or higher** model review before merge (owner gate). |

---

## 4. Geography layers

### 4.1 Primary layer (`layer: primary`)

Applies to **main route card** school pickers when P-6 primary is eligible.

| Child home region | Primary school geography (VGS) | Notes |
|-------------------|-------------------------------|-------|
| **North zone** (`55` Troms, `56` Finnmark) | Home fylke + **north friendly fylke** `{18 Nordland}` | Historical cross-fylke school access on the north coast; **not** national. Troms↔Finnmark↔Nordland service pattern. |
| **All other fylke** | **Home fylke only** | Standard P-6. |

**North zone does not widen the primary chain county** — it widens which **PSA-backed schools** may appear in primary VG1/VG2 pickers for **sparse-gated** professions only.

### 4.2 Alternative layer (`layer: alternative`)

Curated / sparse alternatives (`P-7`, `P-8`, Steigen, future post-VGS contours).

| `relocation_willingness` | Alternative geography (P-8 sparse VG2) |
|--------------------------|----------------------------------------|
| `no` | **Omit** P-8 national alternative (north zone schools already in primary scope where applicable) |
| `maybe` | Schools outside primary scope within **Entur public-transport reach** — bus+rail network km soft band ≤**700** (soft admit **700–800**; deny **>800**). **North-coast homes (Troms 55, Finnmark 56, Nordland 18):** if no ground PT admit, **air** allowed by one-way duration ≤**8h** (soft ≤**12h**). Prefer airport/rail/ferry hubs; last-mile car OK. If Entur admits zero P-8 candidates → haversine soft fallback. See `phase-4-relocation-maybe-public-transport-reach-owner-draft.md`. **Not** private-car km as primary admit. |
| `yes` | **All PSA-backed national sparse VG2** schools for profession, ordered by transport realism |

---

## 5. Transport ordering (signed direction)

| # | Rule | Status |
|---|------|--------|
| TR-1 | Use existing **C-TRANSPORT-KOMMUNE** (`buildKommuneTransportSortContext`, `compareInstitutionTransportRank`) as **primary sort** when child kommune ≠ school kommune | **Live** |
| TR-2 | **Fylke adjacency rings** are tie-break / coarse filter only — never override shorter travel time (example: neighbor fylke 4h by bus must not rank above reachable fylke 2h) | **Binding** |
| TR-3 | **Public transport** (Entur) is the v1 mode — aligns with `phase-4-route-kommune-transport-logistics-owner-record.md` | **Live** |
| TR-4 | **Private car / own transport** mode — **TBD** (`P4-TRANSPORT-PRIVATE`); document before UI toggle; do not invent times | **Deferred** |

**Prototype note (owner 2026-07-15):** unified `education_contour_truth` table with `contour_id` remains a **documented prototype only** (`phase-4-multi-contour-truth-registry-owner-decision-record.md` §6) — no migration in P-8.

---

## 6. What changes for families (examples)

Relocation **already** triggers route recompute via `route_input_signature`. Before P-8 it barely changed VGS school lists. After P-8 **only for sparse-gated professions**:

| Scenario | Before P-8 | After P-8 |
|----------|------------|-----------|
| **Anlegg, Finnmark, relocation `no`** | Primary: local VG1+VG2; no other VG2 schools | **Same** — north-zone schools in primary picker; no national alternative card |
| **Anlegg, Finnmark, relocation `yes`** | Primary unchanged; **no** other VG2 schools anywhere | Primary: home + Nordland VG2 in picker (RG-2); **alternative** «VG2 andre steder» with national sparse VG2 outside that scope (Agder, Vestland, …) sorted by transport |
| **Carpenter, Vestland, relocation `no`→`yes`** | County-local dropdown only | **No change** — sparse gate false |
| **Anlegg, Oslo, primary empty (P-6)** | Empty primary | Alternatives per P-8 when relocation `maybe`/`yes`; still empty at `no` |
| **Child profile: toggle relocation** | Signature changes; VGS lists unchanged | Alternatives appear/disappear — **no UI explanation of rings**; truth matches setting |

---

## 7. Owner sign-off

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| RG-0 | VGS relocation geography **inactive** until P-8 — current behaviour correct | **Yes** | ☑ 2026-07-15 |
| RG-1 | Sparse PSA-derived gate before any national VGS geography | **Yes** | ☑ |
| RG-2 | North zone primary scope `{55,56}` + `{18}` for sparse professions | **Yes** | ☑ |
| RG-3 | National sparse VG2 → alternatives only; transport sort over adjacency | **Yes** | ☑ |
| RG-4 | Opus 4.8+ review gate for P-8 implementation | **Yes** | ☑ |
| RG-5 | Private transport mode deferred (`P4-TRANSPORT-PRIVATE`) | **Yes** | ☑ |

---

## 8. References

- `phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md` — P-8 pilot
- `phase-4-multi-contour-truth-registry-owner-decision-record.md` — U-10
- `phase-4-route-kommune-transport-logistics-owner-record.md` — C-TRANSPORT-KOMMUNE
- `src/lib/larebedrift/larebedrift-geography-scope.ts` — bedrift precedence
- `src/server/children/routes/select-truth-candidate-for-route.ts` — legacy anchor (not dropdown scope)
