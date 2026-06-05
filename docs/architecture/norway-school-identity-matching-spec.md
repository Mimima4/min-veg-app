# Norway School Identity Matching Spec

## Status

Production domain spec. Not temporary notes.

## Purpose

This spec protects the app from false education availability data when matching Vilbli schools to NSR institutions.

## Core risk

Incorrect matching can make Min Veg show education routes that do not exist or point to the wrong school/campus. This is unacceptable.

## Current invalid assumption

Current VGS truth pipeline assumes:

**1 Vilbli school row → 1 NSR institution_id**

This is not always true in Norway.

## Core model

### 1. School identity

A school identity is the canonical school brand/administration.

Examples:

- Alta videregående skole  
- Nord-Troms videregående skole  
- Nord-Salten videregående skole  

### 2. Aliases

One school identity can have multiple official names. This includes Norwegian/Sámi names and slash-separated Vilbli labels.

Example:

`Alta videregående skole / Àlttà joatkkaskuvla`

This must be treated as one school identity, not two schools.

### 3. Locations / avdelinger

One school identity can have multiple study locations/campuses/avdelinger.

Examples:

- Nord-Troms videregående skole → Nordreisa + Skjervøy  
- Nord-Salten videregående skole → Hamarøy + Steigen  

These may be separate NSR institution rows, but one school identity.

### 4. LOSA

LOSA is a special education delivery/location model.

It must not be treated as ordinary 1:1 school matching until explicitly designed.

## Mandatory matching behavior

**CASE 1:**  
One Vilbli row resolves to one school identity and one NSR institution/location.  
→ **Allowed.**

**CASE 2:**  
One Vilbli row resolves to one identity but multiple valid NSR locations (`avd` / campus) and Vilbli does not specify exact campus/location.  
→ **Matcher links all tied NSR `avd` rows** (`multi_avd_identity`). **PSA emission and route options stay 1:1 with Vilbli / VIGO school-brand** until Tier 2+ evidence confirms programme×stage on a specific campus. **Do not** publish per-`avd` programme availability as verified truth without that evidence.

**CASE 3:**  
Slash-separated names are aliases of the same school identity.  
→ **Do not split them into multiple schools.**

**CASE 4:**  
LOSA rows are unsupported for now.  
→ **Abort / mark unsupported.**

## Forbidden

- No random campus selection for **matching** or for claiming **programme×stage availability on a specific campus**.  
- No choosing first candidate by sort order to **resolve ambiguous ties across different school identities** or to assert **which campus offers the programme**.  
- No manual internet-derived lookup tables.  
- No region-specific hacks.  
- No weakening fuzzy matching.  
- No treating Sámi/Norwegian aliases as separate schools.  
- No publishing PSA truth if identity/location is unresolved.  
- No publishing **per-`avd` programme options** without Tier 2+ campus+programme+stage evidence.

## Allowed

- Alias-aware matching.  
- Conservative matching.  
- Abort on ambiguity (weak fuzzy ties across **different** identities).  
- **CASE 2:** `multi_avd_identity` matcher linkage (1:N NSR `avd` rows) with **1:1** Vilbli / VIGO school-brand PSA emission (`pickInstitutionsForPsaEmission`) and route display.  
- Deterministic **emission anchor** institution for school-brand PSA only — not a campus programme-truth claim.  
- Future **per-campus** PSA rows after explicit product approval **and** Tier 2+ programme×stage evidence per campus.  
- Future LOSA model after explicit contract.

## Test cases

### 1. Alta videregående skole / Àlttà joatkkaskuvla

**Expected:** one school identity, aliases, one NSR institution — match via slash **alias segment** (`classifyInstitutionMatchForVilbliSchool`), not the raw combined Vilbli string.

### 2. Nuortta-Sálto joarkkaskåvllå / Nord-Salten videregående skole

**Expected:** one school identity with multiple locations/campuses. Slash-alias campus hints may resolve to one NSR `avd` (`resolveSlashAliasNsrTie`). Otherwise **CASE 2:** matcher may link multiple `avd` rows; PSA / route options stay **1:1** school-brand until per-campus programme proof exists.

### 3. Nord-Troms videregående skole

**Expected:** one school identity with multiple NSR locations (Nordreisa, Skjervøy). Matcher **1:N** linkage; **one** Vilbli-aligned PSA / route option until per-campus programme proof exists.

### 4. Stangnes Rå videregående skole

**Expected:** one school identity with multiple NSR locations (Rå, Stangnes). Matcher **1:N** linkage; **one** Vilbli-aligned PSA / route option until per-campus programme proof exists.

### 5. Nordkapp videregående skole – LOSA Vadsø

**Expected:** LOSA/special delivery model. Do not match as ordinary school until LOSA is designed.

## Phase 1 policy (current)

- Add alias awareness.  
- Detect LOSA and abort.  
- **CASE 2:** **1:N** matcher linkage for same-identity multi-`avd` ties (`multi_avd_identity`); **1:1** Vilbli school-brand PSA emission and route options (`pickInstitutionsForPsaEmission`).  
- Weak fuzzy ties across **different** school identities remain ambiguous (abort).  
- PSA schema unchanged (one row per emitted institution × programme × stage).  
- Route `programme_selection.options` dedupes by school brand; display strips unverified `avd` suffix.

## Phase 2 future

- school identity layer (parent/department grouping in UI)  
- NSR parent/department import if official data supports it  
- LOSA availability model (separate from CASE 2)  
- UI representation for school identity vs location label  

## Implementation boundary

Any future changes to `scripts/run-vgs-truth-pipeline.mjs`, `scripts/classify-vgs-truth-readiness.mjs`, `scripts/cleanup-vgs-truth-contamination.mjs`, Vilbli extraction, or PSA emission must respect this spec.
