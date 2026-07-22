# Phase 4 — Relocation `maybe` = Entur PT reach (700 km soft band) — OWNER-LOCKED

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-MAYBE-PT-REACH** |
| **Status** | **IMPLEMENTED** — Entur PT soft band live; **north-coast air** (Troms/Finnmark/Nordland 55/56/18) 2026-07-21 · **amended 2026-07-22** VG2 monthly/bi-monthly cadence + hub preference + Entur-empty haversine soft fallback for P-8 |
| **Date** | 2026-07-20 · decisions locked 2026-07-21 · north air + Nordland 2026-07-21 · VG2 cadence/hubs/fallback 2026-07-22 |
| **Parent** | `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5; `phase-4-route-kommune-transport-logistics-owner-record.md` |
| **Reuse scope** | Shared geography rule for VGS sparse alternatives **and later** fagskole / university / other contours |
| **Supersedes** | Road-km / car-as-equal-admit framing; 400 km haversine-as-truth; «Entur silent → haversine rescue» |

---

## 1. Owner-locked decisions

| # | Decision | Locked answer |
|---|----------|---------------|
| **1** | Admit source (default) | **Public transport via Entur** — modes **bus + rail** (+ ferry as connector) + **north-coast air**. Hub = airport/rail/ferry/terminal preferred; last-mile to lodging may be private car. **Not** private-car road-km as primary admit. |
| **1b** | North-coast air exception | Home fylke **Troms (55)**, **Finnmark (56)**, or **Nordland (18)**: if no ground PT admit, **air** may admit (Entur patterns with air legs). Owner: reduced student air fares on the north coast. Elsewhere air still denied. |
| **2** | Distance band (ground PT) | **≤ 700** → normal · **700–800** → soft · **> 800** → deny (widened 2026-07-22 for VG2 monthly visits) |
| **2b** | Duration band (north air) | One-way Entur duration **≤ 8 h** → air admit · **8–12 h** → air soft · **> 12 h** → deny (was 5/8h; VG2 adults visit home less often). |
| **3** | Entur unavailable / no usable pattern | Prefer better hubs first. If **still** zero admits for the whole P-8 candidate set → **haversine soft admit** (same sort as `yes`) so no kommune loses the alternative card when national sparse PSA seats exist. Per-pair Entur deny still omits that pair when other pairs admit. |
| **4** | Softness without AI | Numeric bands only (km or air duration). No LLM in the gate. |
| **5** | Future “loyal AI agent” | **Out of this step** — may later advise; **must not** silently override admit/deny. |
| **6** | Why not car as admit | Door-to-door private-car road-km is not the admit source. Hub→lodging last-mile car is OK. |
| **7** | Why air on north coast | Sparse national schools are unreachable by bus/rail within a realistic kollektiv path where student fares are reduced (Troms, Finnmark, Nordland). |
| **8** | Cadence (VG2) | **Monthly / bi-monthly** home visit is acceptable for adult VG2 students (was weekly/biweekly). Applies especially to north + island kommuner (Lofoten, Utsira-class ferry). |
| **9** | Nationwide Entur matrix cache | **Discussion only** — refresh 2×/week + rare-link history. **Not** in this implementation; live Entur + `relocation_maybe_pt_reach_cache` remain. |

---

## 2. Intent (plain language)

`relocation_willingness = maybe` means: child lives near the study city on weekdays; family travels home↔study on a **realistic kollektiv** cadence. For **VG2** (adult students) that cadence may be **monthly / bi-monthly**, not weekly — longer one-way trips and rarer connections (north, Lofoten, south islands such as Utsira) are acceptable.

Admit question (south / rest of Norway):

> Does Entur show a realistic **bus and/or rail** journey (no air) whose **travelled network distance** is within the soft 700 km band (hard ceiling 800 km)?

Admit question (Troms / Finnmark / Nordland home):

> Same ground PT rule first; if none, does Entur show a journey **including air** within **8–12 h** one-way?

If Entur cannot admit **any** P-8 candidate after hub resolution, fall back to haversine soft ranking so the alternative card is not empty when PSA seats exist.

---

## 3. Algorithmic bands (no AI)

### Ground PT

| Zone | `ptNetworkKm` | Effect |
|------|---------------|--------|
| **Normal** | `≤ 700` | Admit; normal sort |
| **Soft** | `> 700` and `≤ 800` | Admit; lower sort |
| **Deny** | `> 800` or no ground pattern | Omit (unless north air applies) |

### North-coast air (home 55 / 56 / 18)

| Zone | Entur `duration` | Effect |
|------|------------------|--------|
| **Air** | `≤ 8 h` | Admit; soft sort (after ground) |
| **Air soft** | `> 8 h` and `≤ 12 h` | Admit; soft sort |
| **Deny** | `> 12 h` or no air pattern | Omit |

Constants:

| Constant | Value |
|----------|-------|
| `MAYBE_PT_SOFT_MAX_KM` | **700** |
| `MAYBE_PT_HARD_MAX_KM` | **800** |
| North-coast air homes | `MAYBE_AIR_HOME_FYLKE_CODES` **55, 56, 18** |
| `MAYBE_AIR_SOFT_MAX_DURATION_SEC` | **8 × 3600** |
| `MAYBE_AIR_HARD_MAX_DURATION_SEC` | **12 × 3600** |
| `MAYBE_PT_REACH_POLICY_VERSION` | `v6-entur-pt-700-800-air-8-12-hubs` |

Haversine may remain a **coarse prefilter**. For P-8 only: if Entur admits **zero** candidates for the whole set, haversine soft admit applies (owner 2026-07-22) so every kommune can still build the alternative when PSA seats exist.

---

## 4. Implementation (live)

1. `evaluate-maybe-reach.ts` — ground km band; `homeAllowsMaybeAir` → air duration band.
2. Durable cache `(home, school, policy_version)` — fail-open if migration unapplied.
3. Wire: P-8 + `select-truth-candidate-for-route`.
4. Smokes: ground bands + air deny (south) / air admit (allowAir).

**Deferred:** loyal AI; private-car time mode (TR-4).

---

## 5. References

- `phase-4-relocation-geography-contract-owner-decision-record.md`
- `phase-4-route-kommune-transport-logistics-owner-record.md`
- `src/lib/planning/kommune-transport/evaluate-maybe-reach.ts`
- Owner: Entur PT 700/800; north air 8–12h; hub preference; P-8 Entur-empty haversine soft fallback (2026-07-22)
