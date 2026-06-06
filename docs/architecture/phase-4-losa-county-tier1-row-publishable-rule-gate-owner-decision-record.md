# Phase 4 LOSA — County Tier 1 Row-Publishable Rule Gate (P4LS4A1)

| Field | Value |
|--------|--------|
| **Status** | Owner policy **adopted** — county Tier 1 CONFIRMED satisfies row-level Tier 1 claims |
| **Section** | **P4-LOSA-COUNTY-TIER1-ROW-RULE** |
| **Closure label** | `PHASE_4_LOSA_COUNTY_TIER1_ROW_PUBLISHABLE_RULE_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-CONFIRMED-UDIR-FJERN-post**; **P4-LOSA-CONFIRMED-REGJERINGEN-3C-post**; **P4-LOSA-CONFIRMED-LOVDATA-14-4-post** |

**Does NOT:** clear `publication_supporting_evidence`, PSA write, Route **#3**, or `NOT_READY_FOR_APPLY`.

---

## Policy (binding)

When **≥1** repo `LOSA_FINNMARK_CONFIRMED_INDEX` row exists with:

- `scope: county_reference`
- `claim_class: legal_status` or `fjernundervisning_rules`

…then that claim is **`publishable: true`** on **every** manifest row in the reference county session (`56` proof), with status remaining `county_reference_confirmed`.

**Nationwide rule:** same policy applies when a county reference CONFIRMED index exists for any future county module — no Finnmark-only SQL/runtime hack.

---

## Owner decisions (P4LCT1R0–P4LCT1R5)

| # | Decision | Answer |
|---|----------|--------|
| P4LCT1R0 | Adopt P4LS4A1 in Alta §4 pilot? | **Yes** |
| P4LCT1R1 | County Tier 1 does **not** replace Tier 2 row claims | **Yes** |
| P4LCT1R2 | `publishable: true` only — not PSA write authorization | **Yes** |
| P4LCT1R3 | Evidence-link sync in `losa-finnmark-evidence-link.mjs` | **Yes** |
| P4LCT1R4 | **No** new CONFIRMED rows in this gate | **Yes** |
| P4LCT1R5 | CLI: Alta row no longer blocks on `legal_status` / `fjernundervisning_rules` | **Yes** |

---

## Final boundary

Tier 1 legal frame is **row-satisfied via county reference** for Finnmark ref manifest rows; combined supporting evidence and publication decision remain separate gates.
