# Min Veg — Architecture Guide

## 1. Product reality

Min Veg is not a web-only app and not a family-only career tool.

It is a Norway-first, trust-first, parent-first / school-led / owner-ready platform that must support:

- web application
- native iOS application
- native Android application
- later school / owner / platform operational layers

Important:
native mobile means real native apps later, not wrappers, not webviews, not shell apps.

Because of that, architecture must always be designed around one shared product truth with multiple clients.

---

## 2. What must stay unified across web + iOS + Android

The following must stay shared across clients:

- auth and identity
- child profiles
- planning state
- derived strengths logic
- profession matching logic
- study route logic
- saved professions
- saved study routes
- parent / school / owner permissions
- subscription and access state
- audit and server-side history
- backend data truth

The following do NOTeed to be pixel-identical across clients:

- UI layouts
- navigation patterns
- micro-interactions
- platform-specific presentation details

Rule:
same product truth, different client interfaces.

---

## 3. Current stack

Current implementation:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase

This stack remains valid for the current phase.

Important:
Next.js is currently the web client and part of the orchestration layer, but it must NOT become the place where core product truth gets trapped.

Supabase remains the shared backend foundation for:

- auth
- database
- RLS
- permissions
- later server functions / contract layer

---

## 4. Architecture direction

Min Veg must evolve as a multi-client platform:

- Web client
- Native iOS client
- Native Android client

That means architecture must move away from page-heavy web logic and toward reusable server-side use cases.

Correct direction:

- page.tsx = screen composition only
- src/server/* = orchestration and use-case layer
- src/lib/planning/* = reusable product/domain helpers
- Supabase = shared backend truth

Wrong direction:

- heavy business logic inside page.tsx
- repeated child planning parsing in multiple screens
- screen-specific rules that cannot be reused by native clients
- product logic tied to Tailwind/UI structure

---

## 5. Current project layers

### `src/app`
Route layer and screen entrypoints.

Allowed here:
- routing
- redirect handling
- calling server use-cases
- rendering UI
- simple presentation-only helpers

Not allowed here:
- large orchestration logic
- duplicated loading logic
- repeated planning derivation
- screen-owned business rules

### `src/components`
Presentation layer.

Allowed here:
- reusable UI blocks
- interaction components
- small client-side UX helpers

Not allowed here:
- backend loading logic
- business truth
- server orchestration
- duplicated matching logic

### `src/lib/planning`
Reusable domain logic.

Examples:
- child tag catalogs
- profession fit helpers
- education route labels
- shared planning calculations

This layer is allowed to hold reusable logic that is not tied to a single page.

### `src/server`
Server-side orchestration layer.

This is the main architectural direction for all future complex data loading.

Examples:
- family overview use-cases
- child planning page data
- profession study options
- adjacency logic
- later school / owner dashboards

### Supabase
Shared backend truth.

Use Supabase for:
- persistent data
- access policies
- server-side authorization
- later analytics source layers
- later audit and institutional infrastructure

---

## 6. Current server structure

Current direction:

\`\`\`
src/server/
  children/
    planning/
      get-child-planning-state.ts
      get-child-profile-page-data.ts
  family/
    overview/
      get-family-page-data.ts
  professions/
    adjacency/
      get-adjacent-professions-for-program.ts
    study-options/
      get-profession-study-options.ts
\`\`\`

This structure is correct and should be continued.

---

## 7. Mandatory architectural rules

### Rule 1 — page files stay thin
Every complex screen must become a thin page over time.

Meaning:
- page loads route params
- page calls server use-case
- page renders UI
- page handles redirect/error result

A page must NOT become the place where all product logic lives.

### Rule 2 — planning truth is shared
Child planning state must be derived in one shared place.

Current shared helper:
- `src/server/children/planning/get-child-planning-state.ts`

If a screen needs:
- interests
- observed traits
- derived strengths
- education preference
- work style preference
- income preference
- selected municipalities

it should use shared planning state, not rebuild this separately.

### Rule 3 — orchestration belongs in `src/server`
If a feature needs:
- multiple queries
- derived output
- sorting / filtering logic
- screen-ready payload building
- combining child + profession + institution + route data

it belongs in `src/server/*`, not in page.tsx.

### Rule 4 — reusable domain helong in `src/lib/planning`
If a helper is:
- reusable
- product-oriented
- not tied to one route
- not directly tied to a single query orchestration

it belongs in `src/lib/planning/*`.

### Rule 5 — UI does not own product truth
A button, card, or component can present product logic, but cannot be the source of it.

### Rule 6 — always think multi-client
Before adding new logic, ask:

Can this same logic be needed by:
- web?
- iOS?
- Android?
- school layer?
- owner layer?

If yes, it should not be trapped in one screen file.

---

## 8. How to decide where new code goes

### Put code in `page.tsx` only if:
- it is route wiring
- it is redirect handling
- it is view composition
- it is clearly screen-local and presentation-only

### Put code in `src/components` if:
- it is UI reuse
- it is client interaction UI
- it is visual composition

### Put code in `src/lib/planning` if:
- it is reusable domain logic
- it is product matching logic
- it is shared labeling / categorization / fit calculation

### Pute in `src/server` if:
- it needs multiple data sources
- it prepares view-ready output
- it combines business context
- it should later be reusable by multiple clients

---

## 9. File organization rules going forward

### Children domain
Use for:
- planning state
- profile data
- summary data
- saved routes data
- roadmap data
- future shared planning mode

Recommended future subfolders:
- planning
- summary
- saved-routes
- roadmap

### Family domain
Use for:
- family overview
- child limit / subscription awareness
- billing entry logic
- parent account overview

Recommended future subfolders:
- overview
- billing
- account

### Professions domain
Use for:
- study options
- adjacency
- profession detail payloads
- search payloads

Recommended future subfolders:
- study-options
- adjacency
- details
- search

### Future domains
Later add:
- school
- owner
- platform
- billing
- analytics

Do not mix these into existing folders without reason.

---

## 10. Existing examples that represent the correct direction

These are good current examples:

- `src/server/children/planning/get-child-planning-state.ts`
- `src/server/children/planning/get-child-profile-page-data.ts`
- `src/server/professions/study-options/get-profession-study-options.ts`
- `src/server/professions/adjacency/get-adjacent-professions-for-program.ts`
- `src/server/family/overview/get-family-page-data.ts`

These are the reference style for future work.

---

## 11. Mobile-readiness principle

Web UI will NOT be reused directly in native apps.

Native apps later will have their own UI layers:
- iOS UI
- Android UI

What must be reusable is:

- backend truth
- server-side contracts
- planning logic
- route logic
- permissions
- saved state
- institutional data logic

Because of that, every new feature must be evaluated by this question:

If web disappeared tomorrow, would the product logic still exist cleanly enough to power native clients?

If the answer is no, the architecture is going in the wrong direction.

---

## 12. Current anti-patterns that must be avoided

Do NOT:

- put large data orchestration into page.tsx
- duplicate child planning parsing in multiple files
- make a UI component compute backend truth
- hardcode route logic inside one screen only
- create web-only business logic that native clients cannot share
- let server layer become a random dump of unrelated helpers

---

## 13. Preferred development workflow

For each meaningful new feature:

### Step 1
Define the product use-case.

Example:
- saved study routes overview
- profession study options
- route adjacency
- child roadmap block

### Step 2
Decide if this is:
- UI-only
- domain helper
- server orchestration
- backend schema change

### Step 3
If it combines data and prepares a payload:
create or extend `src/server/*`

### Step 4
If it is reusable product logic:
put it in `src/lib/planning/*`

### Step 5
Keep page.tsx thin and presentation-oriented

---

## 14. What this guide protects against

This guide exists so the project does NOT drift back into:

- web-only architecture
- heavy route files
- duplicated planning logic
- UI-owned product truth
- messy server folder growth

The project must keep evolving as:

- institution-ready
- mobile-ready
- server-driven
- trust-first
- platform-oriented

---

## 15. Short version to remember

Min Veg is one product with multiple clients.

So:

- UI can differ by platform
- product truth must stay shared
- orchestration belongs in `src/server`
- reusable planning logic belongs in `src/lib/planning`
- page files stay thin
- every important new feature must be built as web + native-ready
