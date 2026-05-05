# Norway School Identity Matching Execution Plan

## Status

Temporary planning artifact. **Delete after completion.**

**Canonical spec:** `docs/architecture/norway-school-identity-matching-spec.md`

## Purpose

Plan implementation phases for Vilbli → NSR → PSA matching without hacks, manual mappings, or architecture drift.

## Hard principles

- No manual internet-derived lookup tables.  
- No region-specific hacks.  
- No weakening fuzzy matching.  
- No random campus selection.  
- No PSA truth when identity/location is unresolved.  
- Abort is safer than false education availability.  
- All changes must follow `norway-school-identity-matching-spec.md`.

---

## Phase 0 — Current state

Document:

- **Existing conservative fuzzy patch** — generic school tokens stripped for fuzzy overlap; distinctive token overlap required; exact / core name tiers preserved.  
- **Current truth-ready counties for electrician** (`apply-route-selection-boundary` allowlist):  
  - `03` Oslo  
  - `11` Rogaland  
  - `15` Møre og Romsdal  
  - `46` Vestland  
  - `50` Trøndelag  
- **Current unsupported / problem counties** (VGS truth pipeline matching):  
  - `18` Nordland  
  - `55` Troms  
  - `56` Finnmark  
- **Current invalid assumption:**  
  **1 Vilbli school row → 1 NSR `institution_id`** (implemented via `matchedBySchoolCode` map and single PSA write per school row in `run-vgs-truth-pipeline.mjs`).

---

## Phase 1 — Safe identity parsing and abort semantics

### Goal

Implement school identity awareness **without** changing PSA schema or emitting multiple institutions.

### Scope

- Slash **alias** parsing (`/` = same identity, not two schools).  
- **LOSA** detection → unsupported / abort.  
- **Multi-location ambiguity** detection → abort.  
- **Shared helper** for matching logic used by pipeline, readiness, and cleanup scripts.  
- Preserve **exact** / **core** matching behaviour.  
- Preserve existing **green** counties (`03`, `11`, `15`, `46`, `50`).

### Files likely affected

- `scripts/run-vgs-truth-pipeline.mjs`  
- `scripts/classify-vgs-truth-readiness.mjs`  
- `scripts/cleanup-vgs-truth-contamination.mjs`  
- **New** helper under `scripts/` (e.g. shared parse + match orchestration).

### Success criteria

- `03`, `11`, `15`, `46`, `50` remain **green**.  
- `18` / `55` / `56` **fail honestly** with explicit reasons, not false matches.  
- **No PSA writes** for LOSA.  
- **No random campus** selected.

---

## Phase 2 — School identity / location model

### Goal

Introduce explicit conceptual separation: **school identity** vs **NSR location / avdeling**.

### Possible approaches

- Derive identity clusters from NSR names (rules-based, reproducible).  
- Import official NSR parent/department relationships **if** available in API and schema.  
- Avoid manual mappings.  
- No internet-derived hardcoded tables.

### Open questions

- Does NSR API expose parent/child enhet relationship?  
- Can institution rows be grouped by official identifiers?  
- Does PSA need a `school_identity_id` later, or can it remain location-based?

### Success criteria

- System can distinguish **one school with multiple locations** from **multiple unrelated schools**.  
- Ambiguity remains **visible**, not hidden.

---

## Phase 3 — Controlled 1:N PSA emission

### Goal

Allow one Vilbli school identity row to produce **multiple** PSA rows when official data supports multiple valid locations.

### Rules

- Only when identity and location set are **officially** supported.  
- Never infer from weak fuzzy.  
- No single random institution selected.  
- UI must clearly show location/campus options.

### Potential files

- `scripts/run-vgs-truth-pipeline.mjs`  
- `scripts/classify-vgs-truth-readiness.mjs`  
- `scripts/cleanup-vgs-truth-contamination.mjs`  
- Route option payload  
- Route UI if location grouping is needed  

### Success criteria

- Multi-location schools produce **complete and honest** options.  
- Saved route and compare still work.  
- No duplicate / noisy PSA rows.

---

## Phase 4 — LOSA model

### Goal

Model LOSA as a **special** delivery/location type, not ordinary school matching.

### Open questions

- Is LOSA a location, delivery model, or partner institution in product UX?  
- Should PSA get a new `availability_scope`?  
- How should UI explain LOSA to parents?

### Success criteria

- LOSA rows are **no longer discarded** if safely modelled.  
- No misleading institution attribution.  
- UI labels LOSA clearly.

---

## Phase 5 — Higher education automation

### Goal

Separate from VGS/Vilbli. **Do not** mix doctor/higher-ed with the VGS Vilbli pipeline.

### Sources to investigate

- Samordna opptak  
- Official institution programme pages  
- Admission realism records  

### Success criteria

- Doctor/higher-ed no longer relies on legacy single-program seed as production truth.  
- Separate ingestion policy exists.

---

## Phase 6 — Legacy cleanup

### Goal

Remove or freeze legacy education layer **only after** canonical truth covers required flows.

### Targets

- `education_programs` runtime dependency  
- `education_institutions` runtime dependency where replaced  
- `profession_program_links` where replaced  
- `child_saved_education_routes` legacy save flow  

### Rules

- Do not remove while route/study-options still require these tables.  
- No UI should show fake/starter education availability as truth.

---

## Validation checklist

- Build passes.  
- Green counties stay green.  
- Unsupported counties fail honestly.  
- Saved routes / dedup unaffected.  
- Compare unaffected.  
- Private school badge unaffected.  
- No route generation regression.

---

## Deletion rule

**Delete this execution plan file** after phases are implemented and validated.

**Do not delete** the canonical spec: `docs/architecture/norway-school-identity-matching-spec.md`.
