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
One Vilbli row resolves to one identity but multiple valid NSR locations and Vilbli does not specify exact campus/location.  
→ **Do not choose one.** Abort / mark ambiguous.

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

**Expected:** one school identity with multiple locations: Nordreisa and Skjervøy. Without explicit location, abort under current 1:1 model.

### 4. Stangnes Rå videregående skole

**Expected:** one school identity with multiple locations: Rå and Stangnes. Without explicit location, abort under current 1:1 model.

### 5. Nordkapp videregående skole – LOSA Vadsø

**Expected:** LOSA/special delivery model. Do not match as ordinary school until LOSA is designed.

## Phase 1 policy

- Add alias awareness.  
- Detect LOSA and abort.  
- Preserve abort for multi-location identities without explicit location.  
- Do not change PSA schema.  
- Do not emit multiple institutions yet.  
- Do not modify app runtime.

## Phase 2 future

- school identity layer  
- NSR parent/department import if official data supports it  
- controlled 1:N PSA emission  
- LOSA availability model  
- UI representation for school identity vs location  

## Implementation boundary

Any future changes to `scripts/run-vgs-truth-pipeline.mjs`, `scripts/classify-vgs-truth-readiness.mjs`, `scripts/cleanup-vgs-truth-contamination.mjs`, Vilbli extraction, or PSA emission must respect this spec.
