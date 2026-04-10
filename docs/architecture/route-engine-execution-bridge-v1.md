# Route Engine Execution Bridge v1

Status: Derived implementation spec  
Version: v1  
Scope: Implementation bridge between locked Route Engine baseline and first production implementation layer

---

## 1. Purpose of this document

This document defines the agreed execution bridge between the locked Route / Path Engine baseline and the first production implementation layer.

It does **not** replace the Route Engine master spec.  
It does **not** introduce a new architectural center.  
It does **not** reopen product-level debates that are already locked.

Its purpose is narrower and practical:

1. translate the locked Route Engine baseline into implementation-facing rules,
2. fix the Route Read Model v1,
3. fix the Route API Contract v1,
4. fix the Route Storage Boundary v1,
5. fix the execution order for the first production implementation step.

This document exists to prevent Route implementation from spreading across pages, client state, or ad hoc UI logic.

---

## 2. Document hierarchy and source-of-truth rule

### 2.1. Primary source of truth

`docs/architecture/route-engine-master-spec.md` remains the **primary source of truth** for Route Engine baseline v1.

This document is a derived implementation document and must not contradict the master spec.

### 2.2. Supporting relationship

This document operationalizes the master spec in the following areas:

- server read-model boundary,
- API surface,
- storage model,
- implementation sequence.

### 2.3. Conflict rule

Default rule: the master spec wins.

Exception: if a narrower implementation rule is explicitly fixed in this document within its own execution scope, that narrower rule governs implementation behavior for that scope only, while still staying consistent with the master spec.

---

## 3. Fixed baseline assumptions

The following assumptions are already locked and are not reopened by this document.

### 3.1. Product framing

Min Veg is not a simple profession picker, not a family-only tool, not a web-only product, and not a collection of disconnected pages.

It is a Norway-first, trust-first, parent-first / school-led / owner-ready civic-edtech platform with Route / Path Engine as a core decision-support layer.

### 3.2. Route framing

Route / Path Engine is:

- a shared backend/domain layer,
- a decision-support engine,
- a top-level product section,
- headless-friendly,
- serializable,
- client-agnostic,
- designed for both web and future native clients.

Route is not a UI feature, not a page-local helper, and not an education-links widget.

### 3.3. Family and billing baseline

Family billing/access is already considered closed at agreed production scope and is not reworked in this document.

### 3.4. Documentation baseline

Route documentation is already fixed and synced. The master spec remains the primary source of truth. This document is part of that hierarchy, not a replacement for it.

---

## 4. Fixed execution laws

### 4.1. Route is a top-level section

Route must be implemented as a distinct top-level section inside the child/app contour.  
It must not be hidden inside education pages, summary pages, or compare pages.

### 4.2. Route target entry is restricted

A Route may only be created for a **saved profession**.  
Viewing a profession in the catalog does not create a route.  
Available professions opened by a route do not become route targets automatically.

### 4.3. Route truth lives in the server/domain layer

The authoritative Route truth must live in backend/domain logic.

It must not live in:

- localStorage,
- query params,
- page-level state,
- client-only reducers,
- page-flow assumptions,
- UI flags.

### 4.4. Route state must be serializable

Route state must support stable server assembly, stable export, stable history behavior, and future native consumption.

### 4.5. Major shift cannot silently overwrite current route

A major route change must create a new variant or a new candidate state.  
The system must not silently rewrite the currently saved route.

### 4.6. New route available is not route changed

When significant recalculation produces a meaningfully different route, the correct user-facing state is:

`new route available`

not:

`route changed`

### 4.7. Snapshot layer is mandatory

Stable read behavior, export behavior, history behavior, and auditability require a snapshot layer.  
Runtime-only route rebuilding is not sufficient as the sole route truth model.

### 4.8. Execution order is fixed

The implementation order is:

1. storage backbone,
2. shared route types,
3. server/domain read and action layer,
4. API layer,
5. app/UI integration.

UI must not lead the implementation.

---

## 5. Route Read Model v1

### 5.1. Purpose

Route Read Model v1 is the server-assembled representation of a route used by Route screens and future native clients.

The frontend must not construct route truth itself.  
The frontend may only render the server-assembled model and trigger server actions.

### 5.2. Where Route Read Model lives

Route Read Model v1 must live in the server/domain read layer, not:

- in `page.tsx`,
- in client components,
- in local state,
- in query params,
- in browser cache as source of truth.

Correct flow:

1. child profile + saved professions + family context + realism layers,
2. route domain assembly,
3. Route Read Model,
4. Route page / native screen rendering.

### 5.3. Read-model identity rule

One Route unit in v1 represents:

- one child,
- one saved target profession,
- one route container,
- one current variant,
- one current snapshot.

Route is not equivalent to profession, compare selection, or education view.

### 5.4. Required read-model blocks

Route Read Model v1 must contain the following blocks.

#### A. Route identity

Contains the identity and lifecycle anchor of the route.

Expected fields:
- routeId
- childId
- targetProfessionId
- targetProfessionSlug
- routeVariantId
- status
- isCurrent
- isEditable
- generatedAt
- lastMeaningfulChangeAt

#### B. Route header summary

Contains the compact top-level summary shown before the route details.

Expected contents:
- profession title
- short route label
- current stage / age context
- overall fit label
- feasibility label
- realism label
- steps count
- warnings count
- new route available flag

#### C. Ordered route steps

Contains the main horizontal path of the route.

Each step must be a serializable node with fields such as:
- stepId
- stepType
- stageCode
- title
- subtitle
- description
- programme
- institution
- region context
- timing / duration
- requirements summary
- feasibility badge
- step warnings
- editability info
- step options count

Baseline step types:
- current stage
- next education stage
- programme selection
- institution choice
- qualification / transition step
- profession entry step

#### D. Route signals

Contains decision-support signals.

Must include:
- fit summary
- confidence summary
- feasibility summary
- warning set
- improvement guidance
- evidence composition

Warning without improvement guidance is not allowed.

#### E. Available professions from this route

Contains professions that become reachable from the selected path.

This block must:
- remain separate from route target switching,
- lead the user to the catalog,
- not auto-switch the current route.

#### F. Alternative routes teaser

Contains teaser-level alternative route information.

Alternative routes must:
- remain secondary,
- open on user action,
- not clutter the main route by default.

#### G. Allowed actions

The server must explicitly provide the allowed action set for the route.

Examples:
- canEditRoute
- canOpenAlternatives
- canSaveAsNewVariant
- canReplaceCurrentVariant
- canOpenAvailableProfessions
- canExportConsultationPdf
- canShareReadOnlyRoute
- canRemoveSavedRoute

### 5.5. Read-model status scope

Read-model status must be based on route lifecycle and variant/snapshot state.

Baseline status vocabulary:
- draft
- saved
- needs_review
- outdated
- superseded

### 5.6. Frontend restriction

The frontend must not compute:
- overall fit,
- realism,
- feasibility,
- route status,
- warning counts,
- alternatives grouping,
- available professions logic,
- new route available state,
- allowed actions.

These are server/domain responsibilities.

---

## 6. Route API Contract v1

### 6.1. Purpose

Route API Contract v1 defines the server interface used by Route screens and future native clients.

Its job is to separate:
- read operations,
- user actions,
- server recomputation.

### 6.2. Contract principle

Read endpoints, action endpoints, and recompute behavior must be separated conceptually and structurally.

The system must not use page-load side effects as hidden route mutation logic.

### 6.3. Read contracts

#### A. Get child routes overview

Purpose: return the route list for one child.

Must return:
- child summary
- saved routes list
- target profession title
- short fit/feasibility teaser
- warning count
- newRouteAvailable flag

#### B. Get route detail

Purpose: return the full Route Read Model v1 for one route.

Input:
- childId
- routeId
- optional variantId

Output:
- full Route Read Model v1

#### C. Get route alternatives

Purpose: return alternative variants for the same target profession.

Input:
- childId
- routeId

Output:
- route variants list
- main difference
- realism delta
- risk delta
- changed steps count
- allowed preview/save actions

#### D. Get available professions from route

Purpose: return professions opened by the current route.

Input:
- childId
- routeId

Output:
- profession cards minimal shape
- why-opened reason
- adjacency/similarity hint
- catalog CTA data

#### E. Get route export payload

Purpose: return export-safe route data for PDF and read-only sharing.

Input:
- childId
- routeId
- optional variantId

Output:
- export-safe summary
- steps
- warnings
- improvement guidance
- feasibility notes
- alternatives summary

### 6.4. Action contracts

#### A. Create initial route for saved profession

Purpose: create the first route for a saved target profession.

Input:
- childId
- targetProfessionId

Output:
- created routeId
- initial route summary
- open/redirect data

#### B. Update route step selection

Purpose: update one route step choice through server truth.

Input:
- childId
- routeId
- stepId
- selectedOptionId

Output:
- mutation result
- minor update vs new variant candidate indicator
- updated summary
- updated affected steps
- updated warnings/signals

#### C. Save as new route variant

Purpose: persist a newly chosen route path as a new variant.

Input:
- childId
- routeId
- mutation context / selected path state

Output:
- new routeVariantId
- saved result
- route summary

#### D. Replace current route with chosen variant

Purpose: explicitly switch the current active variant.

Input:
- childId
- routeId
- variantId

Output:
- switch result
- current variant summary
- old variant supersede effect if applicable

#### E. Remove saved route

Purpose: delete or archive a saved route.

Input:
- childId
- routeId

Output:
- removal result
- updated overview state

#### F. Trigger route recompute

Purpose: ask the server to recompute the route under controlled rules.

Input:
- childId
- routeId
- recomputeReason

Output:
- recompute started/completed state
- new route available flag
- refreshed summary

### 6.5. Recompute reasons

Baseline recompute reasons:
- child_profile_changed
- saved_profession_changed
- route_step_changed
- regional_context_changed
- evidence_updated
- system_refresh

### 6.6. Access rules

#### Family contour
- primary parent: full route access
- family partner/co-parent: inherited family access
- child: no autonomous baseline account in v1

#### School contour
School-linked route actions are not part of the first implementation bridge.  
This document preserves future school evidence integration direction but does not turn Route API v1 into a teacher-owned mutation surface.

### 6.7. Response-shape rule

#### Read responses
Must use a stable shape:
- ok
- data
- meta

#### Action responses
Must use a stable shape:
- ok
- result
- updated
- meta

#### Error responses
Must use a stable shape:
- ok: false
- error.code
- error.message
- optional error.details

### 6.8. Required error cases

The contract must support:
- route_not_found
- profession_not_saved_for_child
- route_access_denied
- route_variant_conflict
- route_readonly_state
- route_recompute_pending
- invalid_step_option

---

## 7. Route Storage Boundary v1

### 7.1. Purpose

Route Storage Boundary v1 defines what is stored as canonical route truth and what is assembled or derived at read time.

The purpose is to prevent:
- page-driven route truth,
- browser-driven route identity,
- unstable export/history behavior,
- hidden overwrite behavior.

### 7.2. Storage principle

The system must store domain route state, not a pre-rendered page.

Storage truth must consist of:
- route identity,
- route target,
- selected path choices,
- lifecycle state,
- snapshot references,
- recompute records.

### 7.3. Required stored entities

#### A. Saved route

The top-level route container.

Must store fields such as:
- id
- child_id
- target_profession_id
- status
- current_variant_id
- created_at
- updated_at
- last_meaningful_change_at
- created_by_type
- created_by_user_id
- archived_at optional

#### B. Route variant

The concrete path variant toward the same target profession.

Must store fields such as:
- id
- route_id
- variant_label
- variant_reason
- is_current
- status
- based_on_variant_id optional
- created_at
- updated_at
- superseded_at optional
- created_by_type
- created_by_user_id

#### C. Route snapshot

The serializable route state fixed at a given moment.

Must store fields such as:
- id
- route_variant_id
- snapshot_version
- snapshot_kind
- generation_reason
- stage_context
- selected_steps_payload
- signals_payload
- available_professions_payload
- alternatives_teaser_payload
- generated_at
- is_current_snapshot

#### D. Route recompute record

The recompute/audit run record.

Must store fields such as:
- id
- route_id
- route_variant_id optional
- trigger_reason
- triggered_by_type
- triggered_by_user_id
- started_at
- completed_at
- result_status
- new_variant_created
- new_route_available
- error_code optional
- error_message optional

### 7.4. Derived but not canonical storage truth

The following must not be treated as the sole canonical stored truth:
- overall fit label
- feasibility label
- realism label
- warning count
- new route available teaser text
- allowed actions
- UI-expanded/collapsed state

Some of these may be frozen inside snapshots for stable history/export behavior, but they must not replace the route/variant/snapshot lifecycle model.

### 7.5. Storage anti-patterns

The system must not use the following as the route foundation:
- saved profession rows alone,
- old study-route save rows without variant/snapshot separation,
- page-derived JSON blobs without lifecycle,
- browser state,
- runtime-only rebuilt route with no snapshot support.

### 7.6. Relationship to current codebase

The current saved profession and old saved study-route flow may remain as predecessor contours during transition, but the new route storage layer becomes the canonical truth for the Route section.

### 7.7. Storage statuses

#### Saved route statuses
- saved
- needs_review
- outdated
- archived

#### Route variant statuses
- draft
- saved
- superseded
- archived

#### Snapshot statuses
- current
- historical
- superseded
- failed_generation optional as audit-only case

### 7.8. New route available rule

`new route available` must mean:
- current saved route remains intact,
- recompute has produced a meaningful candidate shift,
- user review is required before current route changes.

It must not mean:
- current route silently replaced,
- current snapshot overwritten without review,
- old route semantics lost.

---

## 8. Execution order v1

### 8.1. Goal of the first implementation step

The goal of the first implementation step is not full Route Engine completion.

The goal is to establish the first production-ready execution bridge:
- storage backbone,
- shared route types,
- server read/action layer,
- API contract implementation,
- minimal Route section integration.

### 8.2. Fixed implementation order

#### Step 1. Database foundation
Create Route storage tables, constraints, indexes, and RLS.

#### Step 2. Shared route types
Create route-domain shared types and contract shapes.

#### Step 3. Server/domain layer
Create server readers, assemblers, snapshot serializers, and mutation/recompute baseline functions.

#### Step 4. API layer
Expose read and action routes through internal API.

#### Step 5. App/UI integration
Introduce Route overview/detail screens and connect them to existing child flow.

### 8.3. Why UI does not come first

UI-first implementation is explicitly disallowed because it would pull route truth into page structure and client state before storage and server boundaries are fixed.

---

## 9. Codebase execution boundary

### 9.1. Storage layer
Planned under:
- `scripts/sql/*`

### 9.2. Shared route types
Planned under:
- `src/lib/routes/*`

### 9.3. Server/domain route contour
Planned under:
- `src/server/children/routes/*`

### 9.4. Internal API contour
Planned under:
- `src/app/api/internal/routes/*`

### 9.5. App route section
Planned under:
- `src/app/[locale]/(app)/app/children/[childId]/route/*`

### 9.6. Existing files that may be strengthened but not collapsed into route truth
Examples:
- child page
- child summary page data
- planning state
- existing save-study-route flows
- navigation

These may expose route teasers or entry points, but they must not become the implementation center of Route Engine.

---

## 10. Non-goals of this document and this implementation step

The following are intentionally outside the scope of this execution bridge:

1. full Feide ingestion implementation
2. batch class import implementation
3. advanced route calibration formulas
4. labour-market refresh jobs
5. adult transition implementation
6. Tripletex integration work
7. full school-side active route editing contour
8. deep explanation prose generation layer

These remain future or separately frozen layers and must not block Route backbone implementation.

---

## 11. Practical acceptance criteria for the first implementation step

The first implementation step is considered successful when:

1. Route exists as a real stored domain entity.
2. One child can have a route container tied to one saved profession.
3. One route can have multiple variants.
4. One variant can have stable snapshots.
5. Recompute runs are recorded.
6. Route overview can be read from server truth.
7. Route detail can be read from server truth.
8. Step change actions go through server logic.
9. Major route shifts do not silently overwrite current route.
10. UI renders server-assembled route truth rather than inventing it.

---

## 12. Final implementation rule

Everything agreed in this document must be treated as the execution baseline for Route implementation v1.

From this point forward:
- Route implementation should proceed by execution layer,
- not by reopening product framing,
- not by moving truth into UI,
- not by skipping snapshot/variant structure,
- and not by building a web-only shortcut model.

This document exists so the first implementation stage can move cleanly from architecture to production code.
