# Phase 4 — Relocation `maybe` = Entur PT reach (500 km soft band) — OWNER-LOCKED

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-MAYBE-PT-REACH** |
| **Status** | **IMPLEMENTED** — Entur PT soft band live; **north-coast air** (Troms/Finnmark/Nordland 55/56/18) 2026-07-21 |
| **Date** | 2026-07-20 · decisions locked 2026-07-21 · north air + Nordland 2026-07-21 |
| **Parent** | `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5; `phase-4-route-kommune-transport-logistics-owner-record.md` |
| **Reuse scope** | Shared geography rule for VGS sparse alternatives **and later** fagskole / university / other contours |
| **Supersedes** | Road-km / car-as-equal-admit framing; 400 km haversine-as-truth; «Entur silent → haversine rescue» |

---

## 1. Owner-locked decisions

| # | Decision | Locked answer |
|---|----------|---------------|
| **1** | Admit source (default) | **Public transport via Entur** — modes **bus + rail** (+ ferry as connector). **Not** private-car road-km as admit. |
| **1b** | North-coast air exception | Home fylke **Troms (55)**, **Finnmark (56)**, or **Nordland (18)**: if no ground PT admit, **air** may admit (Entur patterns with air legs). Owner: reduced student air fares on the north coast. Elsewhere air still denied. |
| **2** | Distance band (ground PT) | **≤ 500** → normal · **500–550** → soft · **> 550** → deny |
| **2b** | Duration band (north air) | One-way Entur duration **≤ 5 h** → air admit · **5–8 h** → air soft · **> 8 h** → deny. Sort air **after** all ground PT. |
| **3** | Entur unavailable / no usable pattern | **Deny** + loud diagnostic. **No** haversine (or car-km) rescue. |
| **4** | Softness without AI | Numeric bands only (km or air duration). No LLM in the gate. |
| **5** | Future “loyal AI agent” | **Out of this step** — may later advise; **must not** silently override admit/deny. |
| **6** | Why not car | ~7 h driving for a teenager is **unacceptable** for `maybe` home-visit framing. |
| **7** | Why air on north coast | Sparse national schools (e.g. Kirkenes) are unreachable by bus/rail within the weekly-visit band; air is the realistic kollektiv path where student fares are reduced (Troms, Finnmark, Nordland). |
| **8** | Cadence | Weekly / biweekly home visit — **not** daily morning commute. |

---

## 2. Intent (plain language)

`relocation_willingness = maybe` means: child lives near the study city on weekdays; family travels home↔study about once a week or every two weeks on ordinary **kollektivtransport**.

Admit question (south / rest of Norway):

> Does Entur show a realistic **bus and/or rail** journey (no air) whose **travelled network distance** is within the soft 500 km band (hard ceiling 550 km)?

Admit question (Troms / Finnmark / Nordland home):

> Same ground PT rule first; if none, does Entur show a journey **including air** within **5–8 h** one-way?

---

## 3. Algorithmic bands (no AI)

### Ground PT

| Zone | `ptNetworkKm` | Effect |
|------|---------------|--------|
| **Normal** | `≤ 500` | Admit; normal sort |
| **Soft** | `> 500` and `≤ 550` | Admit; lower sort |
| **Deny** | `> 550` or no ground pattern | Omit (unless north air applies) |

### North-coast air (home 55 / 56 / 18)

| Zone | Entur `duration` | Effect |
|------|------------------|--------|
| **Air** | `≤ 5 h` | Admit; soft sort (after ground) |
| **Air soft** | `> 5 h` and `≤ 8 h` | Admit; soft sort |
| **Deny** | `> 8 h` or no air pattern | Omit |

Constants:

| Constant | Value |
|----------|-------|
| `MAYBE_PT_SOFT_MAX_KM` | **500** |
| `MAYBE_PT_HARD_MAX_KM` | **550** |
| North-coast air homes | `MAYBE_AIR_HOME_FYLKE_CODES` **55, 56, 18** |
| `MAYBE_AIR_SOFT_MAX_DURATION_SEC` | **5 × 3600** |
| `MAYBE_AIR_HARD_MAX_DURATION_SEC` | **8 × 3600** |
| `MAYBE_PT_REACH_POLICY_VERSION` | `v5-entur-pt-500-550-north-air-nordland` |

Haversine may remain a **coarse prefilter only** but **never** grants admit when Entur fails.

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
- Owner: Entur PT 500/550; north air for education access (2026-07-21)
