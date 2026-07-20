# Phase 4 — Relocation `maybe` = Entur PT reach (500 km soft band) — DRAFT → OWNER-SEEDED

| Field | Value |
|-------|--------|
| **Section** | **P4-RELOCATION-MAYBE-PT-REACH** |
| **Status** | **IMPLEMENTED 2026-07-21** — Entur PT soft band live (P-8 + select-truth); hub resolve uses centroid focus + reverse fallback; durable cache migration present (fail-open until applied) |
| **Date** | 2026-07-20 · decisions locked 2026-07-21 |
| **Parent** | `phase-4-relocation-geography-contract-owner-decision-record.md` §4.2 / §5; `phase-4-route-kommune-transport-logistics-owner-record.md` |
| **Reuse scope** | Shared geography rule for VGS sparse alternatives **and later** fagskole / university / other contours |
| **Supersedes** | Road-km / car-as-equal-admit framing; 400 km haversine-as-truth; «Entur silent → haversine rescue» |

---

## 1. Owner-locked decisions (2026-07-21)

| # | Decision | Locked answer |
|---|----------|---------------|
| **1** | Admit source | **Only public transport via Entur** — modes **bus + rail** (+ ferry as connector). **Not** private-car road-km as admit. **Not** air. |
| **2** | Distance band (travelled network km on Entur legs, excl. air) | **≤ 500** → normal admit · **500–550** → **soft admit** (allowed, ranked lower / “on the edge”) · **> 550** → **deny** for `maybe` |
| **3** | Entur unavailable / no bus+rail pattern after retries | **Deny** + loud diagnostic. **No** haversine (or car-km) rescue as product norm. Entur must not be treated as optional. |
| **4** | Softness without AI | **Numeric soft band only** (500 / 550). No LLM in the gate. |
| **5** | Future “loyal AI agent” | **Out of this step** — may later advise / re-rank with personal context; **must not** silently override admit/deny. |
| **6** | Why not car | ~7 h driving for a teenager is **unacceptable** for `maybe` home-visit framing; product orients on **kollektivtransport**. |
| **7** | Cadence | Weekly / biweekly home visit — **not** daily morning commute (morning Entur school-start stays a separate sort/default layer). |

---

## 2. Intent (plain language)

`relocation_willingness = maybe` means: child lives near the study city on weekdays; family travels home↔study on ordinary **bus/train** about once a week or every two weeks.

Admit question:

> Does Entur show a realistic **bus and/or rail** journey (no air) whose **travelled network distance** is within the soft 500 km band (hard ceiling 550 km)?

---

## 3. Algorithmic soft band (no AI required)

| Zone | `ptNetworkKm` (Entur bus+rail+ferry legs) | Effect |
|------|-------------------------------------------|--------|
| **Normal** | `≤ 500` | Admit; normal sort weight |
| **Soft** | `> 500` and `≤ 550` | Admit; **lower sort priority** (and optional UI “på grensen” later) |
| **Deny** | `> 550` **or** no usable Entur PT pattern | Omit from `maybe` alternatives |

Constants (proposed code names):

| Constant | Value |
|----------|-------|
| `MAYBE_PT_SOFT_MAX_KM` | **500** |
| `MAYBE_PT_HARD_MAX_KM` | **550** |

Stavanger-class ~550 km corridors land in **soft** automatically — no manual exception list, no agent.

Haversine may remain a **coarse prefilter only** (e.g. drop absurdly far pairs before Entur) but **never** grants admit when Entur fails.

---

## 4. Calibration (illustrative)

Long-distance NO schedule averages (~66–73 km/h bus, ~76–82 km/h rail):

| Band | Rough PT clock time (illustrative) |
|------|-------------------------------------|
| 500 km | bus ~7–8 h · rail ~6–6.5 h |
| 550 km | bus ~7.5–9 h · rail ~6.5–7 h |

Gate unit is **Entur travelled km**, not driving hours. Time is for UX copy / owner intuition only.

---

## 5. Implementation sketch (after «го кодить» — not started)

1. Shared module `evaluateMaybeReach` — Entur hub→hub, bus+rail, exclude air; return `{ admitted, soft, ptNetworkKm, reason }`.
2. Durable cache `(home_kommune, school_kommune, policy_version)` — required for cold path and future fagskole/uni scale.
3. Entur client: timeouts/retries as reliability (not “speed spike revival”); fail → deny + log `[maybe-pt-reach]`.
4. Wire: P-8 distance filter + align `select-truth-candidate-for-route` maybe policy to same helper / constants.
5. Update geography contract §4.2 wording to Entur PT soft band.
6. Smokes: Oslo→Kristiansand (normal); Oslo→Bergen (normal/soft by measured km); ~550 soft; Kirkenes deny; air-only deny; Entur-empty → deny.
7. QA build; no Contour B relay.

**Explicitly deferred:** loyal AI advice agent; private-car time mode (TR-4); dense-profession national lists.

---

## 6. Still needed before coding

Owner says **«го кодить»** (this record is seeded; implementation gate not opened until that phrase).

Optional UX later: copy for soft band / weekly visit — not blocking code.

---

## 7. References

- `phase-4-relocation-geography-contract-owner-decision-record.md`
- `phase-4-route-kommune-transport-logistics-owner-record.md`
- `phase-4-relocation-maybe-weekly-road-km-owner-draft.md` (historical)
- `src/lib/regional-delivery/anleggsteknikk-sparse-vg2-distance-rank.ts` (v1 haversine — to be replaced)
- Owner lock 2026-07-21: Entur-only admit; soft 500 / hard 550; deny on Entur miss; no AI in gate; no car-km admit
