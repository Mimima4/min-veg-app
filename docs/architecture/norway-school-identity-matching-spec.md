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
→ **Emit all tied NSR locations** (controlled **1:N** PSA / route options). **Do not** pick one at random or by sort order. Applies uniformly — not per county or school.

**CASE 3:**  
Slash-separated names are aliases of the same school identity.  
→ **Do not split them into multiple schools.**

**CASE 4:**  
LOSA rows are unsupported for now.  
→ **Abort / mark unsupported.**

## Forbidden

- No random campus selection.  
- No choosing first candidate by sort order.  
- No manual internet-derived lookup tables.  
- No region-specific hacks.  
- No weakening fuzzy matching.  
- No treating Sámi/Norwegian aliases as separate schools.  
- No publishing PSA truth if identity/location is unresolved.

## Allowed

- Alias-aware matching.  
- Conservative matching.  
- Abort on ambiguity.  
- Future 1:N PSA emission after explicit product/domain approval.  
- Future LOSA model after explicit contract.

## Test cases

### 1. Alta videregående skole / Àlttà joatkkaskuvla

**Expected:** one school identity, aliases, likely one NSR institution.

### 2. Nuortta-Sálto joarkkaskåvllå / Nord-Salten videregående skole

**Expected:** one school identity with multiple locations/campuses. Without explicit campus signal, do not choose one randomly.

### 3. Nord-Troms videregående skole

**Expected:** one school identity with multiple locations: Nordreisa and Skjervøy. **1:N** — both NSR `avd` rows enter PSA / route options.

### 4. Stangnes Rå videregående skole

**Expected:** one school identity with multiple locations: Rå and Stangnes. **1:N** — both NSR `avd` rows enter PSA / route options.

### 5. Nordkapp videregående skole – LOSA Vadsø

**Expected:** LOSA/special delivery model. Do not match as ordinary school until LOSA is designed.

## Phase 1 policy (current)

- Add alias awareness.  
- Detect LOSA and abort.  
- **CASE 2:** controlled **1:N** PSA emission for same-identity multi-`avd` ties (`multi_avd_identity` in matcher).  
- Weak fuzzy ties across **different** school identities remain ambiguous (abort).  
- PSA schema unchanged (one row per institution × programme × stage).  
- Route `programme_selection.options` consumes all active PSA rows.

## Phase 2 future

- school identity layer (parent/department grouping in UI)  
- NSR parent/department import if official data supports it  
- LOSA availability model (separate from CASE 2)  
- UI representation for school identity vs location label  

## Implementation boundary

Any future changes to `scripts/run-vgs-truth-pipeline.mjs`, `scripts/classify-vgs-truth-readiness.mjs`, `scripts/cleanup-vgs-truth-contamination.mjs`, Vilbli extraction, or PSA emission must respect this spec.
