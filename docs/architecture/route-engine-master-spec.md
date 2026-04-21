# Route Engine — Master Specification v1

**Status:** PRIMARY SOURCE OF TRUTH  
**Scope:** Route Engine baseline v1  
**Purpose:** This document consolidates stages 1–6 and is the main reference for product, design and implementation alignment.

---

## 0. Canonical document map

Этот документ — production-level точка входа и обзор этапов 1–6. Детальные правила живут в связанных spec-файлах:

| Область | Файл |
|--------|------|
| Stage 1 — production baseline / guardrails | `docs/architecture/route-path-engine-production-spec.md` |
| Stage 1 — execution boundary v1 | `docs/architecture/route-engine-implementation-boundary-v1.md` |
| Stage 2 — domain validity | `docs/architecture/route-engine-domain-validity-v1.md` |
| Stage model (stage types / codes) | `docs/domain/route-stage-model.md` |
| Adult / transition (future, не baseline v1) | `docs/architecture/route-engine-adult-transition-layer.md` |
| Stage 4 — data realism & ingestion | `docs/architecture/route-engine-stage-4-data-realism.md` |
| Stage 5 — legal / operational readiness | `docs/architecture/route-engine-stage-5-operational.md` |
| Stage 6 — UX / interaction contract | `docs/architecture/route-engine-stage-6-ux.md` |

**Приоритет при противоречиях:** этот master spec — главный ориентир для baseline v1. Supporting stage-документы детализируют свой scope; если в supporting spec явно зафиксировано более узкое **locked**-правило в границах этого scope (например, матрица переходов Stage 2 или числовой UX-порог Stage 6), оно действует внутри этого scope. Иначе при расхождении с master выигрывает формулировка master spec.

---

## 1. Overview

Route Engine — это система поддержки принятия решений (decision-support), которая помогает родителям и детям понимать и строить образовательные маршруты к выбранной профессии.

Система:

- не принимает решения за пользователя
- не заменяет школу или rådgiver
- помогает интерпретировать возможные пути

---

## 2. Core Principles

- decision-support, не decision-making
- пользователь сохраняет полный контроль
- маршрут должен быть читаемым и понятным
- система не создаёт ложной уверенности
- система не скрывает реальность
- UX остаётся простым и не перегруженным

---

## 3. Stage 1 — Contract First

Определяет:

- Route Read Model
- API contract
- Step / option contract
- Clone vs alternative rules
- Minor vs major route changes

Ключевой результат:

Route = структурированный объект, который сервер отдаёт как единый источник правды.

### Route Geography, Mobility and User-Locked Step Rules

#### 1. Geography as primary route constraint

Route construction must respect the child's selected geography.

- Primary geography truth is defined by selected municipality codes.
- Route engine must prefer options within selected municipalities first.
- If no valid options exist within selected municipalities, the engine may expand into a derived regional scope based on municipality-county relationships.
- Only after municipality-consistent and region-consistent options are exhausted may the engine consider broader Norway-wide options.
- The engine must never jump directly to unrelated nationwide defaults when geography-consistent options exist.

#### 1.1 Realistic Regional Scope Before Nationwide Fallback

#### 1A. Municipality scope remains the first priority

Route engine must always prefer valid options inside the selected municipality scope first.

If a valid route option exists inside selected municipalities, it must be preferred over broader regional or nationwide candidates.

#### 1B. County-only fallback is not always sufficient

For some professions, especially higher-education and geographically centralized professions, county-only fallback is too narrow and may exclude the most realistic nearby route options.

Therefore, the system must not treat county boundary as the final regional realism boundary in all cases.

#### 1C. Realistic regional scope must exist before nationwide fallback

If no valid option exists inside selected municipalities, the engine must expand into a realistic regional scope before using nationwide fallback.

Realistic regional scope may include:

- same county
- adjacent counties
- recognized metropolitan/catchment areas
- other geography-consistent nearby education clusters

This scope must be derived from route realism rules, not from random nationwide availability.

#### 1D. Nearby realistic route beats alphabetical nationwide fallback

If a realistic nearby option exists inside the realistic regional scope, it must be preferred over a nationwide fallback candidate chosen only by stable ordering.

The engine must not jump to a distant route simply because it appears earlier in deterministic sorting.

#### 1E. This rule is especially important for centralized study routes

For professions with sparse or centralized education availability, including professional degree routes, the engine must prefer the nearest realistic education route cluster before considering nationwide fallback.

This applies especially where municipality-level availability is rare or absent.

#### 1F. Nationwide fallback remains the last layer

Nationwide fallback is allowed only after:

- municipality-consistent options are exhausted
- realistic regional scope options are exhausted

Nationwide fallback must remain the final fallback layer, not the immediate next step after county mismatch.

#### 1G. Realistic regional scope is a route realism layer, not a UI shortcut

This rule belongs to route selection truth and route realism logic.

It must not be implemented only as a presentation-layer convenience or a page-level workaround.

#### 1H. Better realistic-nearby than formally-regional but practically worse

If a nearby realistic route outside the home county is materially more coherent than a distant nationwide fallback, the nearby realistic route should be preferred.

Administrative boundaries must not override practical route realism where the product explicitly supports realistic route guidance.

#### 1.2 Full National Fylke Adjacency Model for Route Realism

Full National Fylke Adjacency Model for Route Realism

1. Regional route expansion must use a complete national fylke adjacency model

Realistic regional scope must not rely on isolated manual regional clusters.

The system must maintain a complete Norway-wide adjacency model at the fylke level.

This adjacency model must cover all current fylker in Norway and define which fylker are directly adjacent to each other.

2. Municipality remains the first route-selection layer

The engine must first prefer valid options within selected municipalities.

If no valid option exists within selected municipalities, the engine must expand through the fylke adjacency model.

3. Regional expansion must follow adjacency rings

Route selection must expand in deterministic geographic rings:

- selected municipalities
- home fylke
- adjacent fylker (ring 1)
- next adjacent layer (ring 2)
- further rings as allowed by relocation willingness
- nationwide fallback

The system must not jump directly from municipality mismatch to nationwide fallback where adjacency-ring expansion is still available.

4. Relocation willingness controls expansion depth

Relocation willingness must systematically control how far the engine may expand through the adjacency graph:

- Nei  
  Only selected municipalities and home fylke are allowed.

- Kanskje  
  The engine may expand into limited adjacency rings before nationwide fallback.

- Ja  
  The engine may continue through broader adjacency rings and eventually nationwide fallback.

5. Nationwide fallback remains valid and important

Nationwide fallback must remain available for cases where:

- regional rings do not yield a valid route
- the profession has sparse or centralized education availability
- admission realism makes a distant route materially more realistic
- the user is willing to relocate

Nationwide fallback is especially important for professions where distant options may provide better admission feasibility, quota access, or route realism than closer options.

6. Geographic realism must remain deterministic

The fylke adjacency model must be deterministic and shared server-side route truth.

It must not be implemented as page-level logic, manual one-off exceptions, or temporary clusters.

7. Better geographically progressive than arbitrary fallback

The engine must prefer routes discovered through geographic adjacency progression before arbitrary nationwide fallback ordering.

A distant option may still win eventually, but only after adjacency-based expansion has been exhausted according to relocation willingness.

#### Travel Realism Must Override Pure Fylke-Ring Progression

Travel Realism Must Override Pure Fylke-Ring Progression

1. Fylke adjacency alone is not sufficient for relocation realism

Fylke adjacency rings may be used as a technical helper, but they must not be the primary user-facing relocation logic for route construction.

Administrative proximity does not always reflect real travel proximity.

A route that is closer in travel distance or travel time may be more realistic than a route that sits in a “nearer” fylke ring.

2. Relocation scope must be evaluated through travel realism

For relocation-sensitive route construction, the system must prioritize:

- real travel distance
- approximate travel time
- practical accessibility
- island / ferry / remote-area constraints where relevant

before relying on pure fylke-ring depth.

3. “Kanskje” must mean realistic regional reach, not abstract graph depth

Relocation willingness = `kanskje` must represent:

- one realistic relocation
- a locally/regional reachable radius
- a human-plausible move

It must not expand merely because a destination appears within a deeper fylke ring if there is a materially closer and more realistic destination.

4. “Ja” may expand further, but still through travel realism

Relocation willingness = `ja` may allow a broader national search,
but broader search must still be ordered by travel realism and route coherence,
not by administrative ring depth alone.

5. Travel realism has priority over administrative adjacency

If destination A is significantly closer in travel distance/time than destination B,
destination A should be preferred,
even if destination B appears in a “closer” fylke-ring interpretation.

6. Fylke graph remains a helper, not the final truth

The national fylke adjacency graph may remain useful for:
- fallback grouping
- coarse regional clustering
- technical narrowing

But final relocation-sensitive ranking must be guided by travel realism rather than pure graph order.

7. Route engine must reflect human geographic intuition

The system must avoid outcomes where:
- a technically nearer fylke-ring option is much farther in practice
- the user sees a destination that feels obviously less reachable than another available option

The route engine must align with how a human understands distance and travel burden.

#### All-Professions Official-Source Admission and Requirements Realism Layer

All-Professions Official-Source Admission and Requirements Realism Layer

1. Admission and requirements realism must be profession-agnostic

The system must not implement admission realism as doctor-only, medicine-only, or institution-specific exception logic.

Admission realism must be modeled as a general route engine layer that can apply across all professions and all relevant route types.

2. Official-source-first architecture

Admission and requirements realism must be based on official sources wherever such sources exist.

This includes, where relevant:
- centralized admission sources
- institution programme pages
- official programme requirement pages
- official quota/eligibility descriptions
- official historical admission threshold sources where available

The system must not rely on hand-written route text or hardcoded one-off admission hacks as its long-term truth layer.

3. One unified realism framework, multiple source families

The system must not assume that one source covers all professions and all education types.

Instead, it must support a unified admission realism framework that can ingest multiple official source families depending on route type.

4. Structured admission advantages, not free-text exceptions

Quota effects, regional admission advantages, category-specific eligibility, and lower threshold contexts must be modeled as structured admission realism inputs.

They must not be represented as ad hoc free-text route exceptions.

5. Existing route signals only

Admission advantages must not introduce separate UI signal systems.

They must influence only existing route signals, including:
- competition level
- requirements interpretation
- feasibility / guidance

No parallel visual badge system may be introduced for admission advantages.

6. Geography-first route priority remains intact

Admission realism must not override the primary route construction order:

- municipality
- home fylke
- adjacency progression
- nationwide fallback

The main route must remain geography-first and route-coherent.

7. Admission advantages may strengthen alternative routes

If a geographically more distant option provides materially stronger admission realism,
it may appear as an alternative route,
but it must not silently replace the main geography-first route.

Differences between main and alternative routes must be communicated only through existing route signals.

8. Route-level interpretation only

Admission realism must be evaluated at full route level.

The system must not optimize a single step in isolation if this weakens the route as a coherent whole.

A locally easier admission path must not win if it creates a worse overall route.

9. Automatic refresh and reviewable truth

Admission realism data must be:
- source-linked
- refreshable
- reviewable
- timestamped
- confidence-aware

If official-source coverage is incomplete, the system must surface limited realism confidence rather than pretending full certainty.

10. Engine-ready structured integration

Admission realism must be integrated as structured engine inputs that can influence:
- selection ranking inside one allowed geography scope
- existing route signals
- alternative route comparison

It must not require route-engine redesign each time a new official source family is connected.

#### 2. Relocation willingness as whole-route constraint

Relocation willingness applies to the entire route, not only to the first step.

- The engine must evaluate mobility constraints across all steps in the route.
- Route construction must not optimize individual steps in isolation while ignoring overall route feasibility.

Relocation semantics:

- `Nei`
  - Only selected municipalities and their derived regional scope are allowed.
  - Nationwide fallback is not allowed.
  - If no valid route exists, the system must return constrained output with warning rather than an unrealistic route.
- `Kanskje`
  - Broader search is allowed.
  - The engine must prefer geographically coherent and low-friction routes.
  - Dispersed multi-location routes should be penalized.
- `Ja`
  - Nationwide search is allowed.
  - The engine must still prefer routes with fewer relocations and stronger geographic continuity.

#### 3. Route coherence over step-level optimization

Route engine must prioritize whole-route coherence over local step-level optimality.

- A geographically consistent route is preferred over a route that is optimal at individual steps but fragmented across locations.
- The system should prefer:
  - fewer relocations
  - stable geographic progression
  - single-destination or low-friction route chains where possible

Better empty than geographically incoherent.

#### 4. User-selected steps as locked route truth

When a user explicitly selects a step option, it becomes part of the route's authoritative state.

- User-selected steps must not be silently overridden by recompute, optimization, or refresh logic.
- Locked steps remain fixed unless explicitly changed by the user.

#### 5. Non-optimal but user-owned routes

A route with user-locked steps may become less optimal.

- The system must surface clear warnings regarding:
  - geography inconsistencies
  - unmet requirements
  - reduced feasibility
- The system must not override user decisions.

Example warning pattern:

This route may be less optimal than recommended. Please review geography, requirements, and overall route conditions.

#### 6. Recompute behavior with locked steps

Route recompute must respect user-locked steps.

- Recompute may update:
  - downstream steps
  - signals
  - guidance
- Such recompute updates may refresh preview/read-model guidance and options, but must not silently mutate or overwrite saved route state without explicit user action.
- Recompute must not replace locked steps.

#### 7. Decision-support, not forced decision-making

Route Engine provides guidance, not enforced decisions.

- User-controlled routes remain valid even if suboptimal.
- System suggestions must not replace user intent.

---

## 4. Stage 2 — Domain Validity

Определяет:

- типы шагов (stage types)
- канонические stage codes
- допустимые переходы
- structural invalidation rules
- границу legacy маршрутов

Ключевой результат:

Система не строит невозможные или нелогичные маршруты.

---

## 5. Stage 3 — Scoring Safety

Определяет:

- minimal scoring payload
- explainability contract
- pedagogical safety
- feasibility wording
- conflict: interest vs evidence
- soft override
- стабильность маршрута
- порог видимых изменений

Ключевой результат:

Система объясняет, но не судит.

---

## 6. Stage 4 — Data Realism

Определяет:

- cold-start поведение
- минимальный ввод
- data trust tiers
- school ingestion boundary
- зависимость от внешних источников

Ключевой результат:

Система даёт value даже без полного набора данных.

### 4.X School/Programme Availability Truth Contract (VGS contour)

For VGS programme -> school availability, the system MUST use a source-scoped truth contract linked to canonical school identity.

#### Source roles

- NSR is authoritative for school registry identity (canonical institution truth).
- Vilbli is the primary source for VGS programme -> school availability.
- Utdanning.no is the secondary confirmation source and preferred display layer when verified.
- Vigo / Samordna opptak are supporting sources, not primary truth for this VGS contour.

#### Canonical identity vs display naming

- Canonical school identity MUST be internal and NSR-linked.
- User-facing display name MAY differ from canonical registry name.
- Preferred display name SHOULD come from verified Utdanning school page when available.
- Name mismatch alone MUST NOT be treated as a conflict; legal name, display name and campus name may differ across sources.

#### Matching rules (Vilbli row -> canonical school)

- Vilbli school rows MUST be matched to canonical NSR-linked school identity before publishable availability.
- Matching MUST NOT rely on raw name equality only.
- Matching signals MAY include normalized name, fylke/county, address, school page path, website/domain, phone and email.

#### Availability and verification state

- Vilbli-confirmed programme availability is primary truth for VGS.
- Absence in Vilbli SHOULD be treated as absence for VGS availability, UNLESS a confirmed and authoritative secondary source explicitly indicates an active offer.
- School identity ambiguity MUST result in `verification_status = "needs_review"` until identity is confidently resolved.

### Verification state rules (Vilbli + Utdanning)

The system MUST assign `verification_status` from combined Vilbli + Utdanning signals:

#### verified

Set `verification_status = "verified"` when all are true:

- Vilbli confirms programme availability for the school,
- Utdanning school page is found,
- and the corresponding programme/stage is clearly present in Utdanning (`confirmed` extraction).

#### needs_review

Set `verification_status = "needs_review"` when Vilbli confirms availability and at least one of the following applies:

- Utdanning page is found but extraction is `partial` (only some stages confirmed),
- Utdanning page is found but extraction is `unclear` (parser uncertainty / structure ambiguity),
- Utdanning page exists but source alignment is not yet complete.

`unclear` MUST be treated as `needs_review`, NEVER as absence.

#### mismatch

Set `verification_status = "mismatch"` only when all are true:

- school identity is confidently matched (NSR-linked),
- Utdanning page is successfully parsed,
- and the programme/stage is clearly not present in Utdanning.

`mismatch` MUST NOT be triggered by parsing failures, incomplete extraction, or page-discovery failures.

#### not_found

`not_found` is a technical pipeline-diagnostic state only:

- used when Utdanning page discovery fails,
- not persisted as final published availability truth by itself.

#### User-facing transparency

- Uncertain but relevant availability MUST NOT be silently dropped.
- Records with `needs_review` MUST be shown with an explicit verification badge (for example: "Information is being verified / updated").
- Verification incompleteness alone MUST NOT silently hide otherwise relevant availability.
- The system MUST NOT present uncertain availability as fully confirmed.
- Only `verified` records are treated as fully confirmed.

#### Source priority clarification

- Vilbli remains the primary availability source.
- Utdanning remains a secondary verification + display layer.
- Utdanning absence MUST NOT override Vilbli unless `mismatch` is confirmed under strict conditions above.

#### Publishable truth rule

Publishable school/programme availability requires all of:

- matched canonical school identity (NSR-linked),
- availability from the primary source (Vilbli),
- recorded verification state (`verified` / `needs_review`).

Runtime Route Engine and app reads MUST use internal DB truth only and MUST NOT depend on live external source calls.

---

## 7. Stage 5 — Legal / Operational Readiness

### Governance

- система не принимает финальные решения
- не заменяет человека

---

### Human oversight

- финальное решение всегда за пользователем
- система не блокирует выбор

---

### Consultation export

- PDF (с полным контекстом)
- shareable read-only маршрут
- без чатов и общения

---

### Recalculation

- event-triggered (material only)
- weekly
- monthly

Сохранённый маршрут не изменяется автоматически.

---

### Freshness

- лёгкие индикаторы актуальности
- не перегружают интерфейс

### Route Freshness, Input Signature, and Auto-Refresh Behavior

#### 1. Route Input Signature (source-of-truth)

Each route snapshot MUST be built from a deterministic set of route-relevant inputs.

This set MUST include:

- preferred_municipality_codes
- relocation_willingness
- interest_ids
- observed_trait_ids
- desired_income_band
- preferred_work_style
- preferred_education_level

The system MUST derive a deterministic route_input_signature from these values.

The signature MUST:

- be stable (same inputs -> same signature)
- be order-independent for arrays
- be used as a truth marker for route freshness

Each snapshot MUST store:

- the route_input_signature used for its generation

---

#### 2. Working Route vs Saved Route

The system MUST distinguish between:

A. Working route (generated, not explicitly saved by user)
B. Saved route (explicitly saved by user or containing locked steps)

Rules:

- Working route MAY be automatically recomputed
- Saved route MUST NOT be silently overwritten
- Routes with user-selected (locked) steps MUST NOT be silently mutated

If a saved or locked route becomes stale:

- the system MUST NOT overwrite it
- the system MUST surface:
  - "new route available"
  - or a warning about outdated route

---

#### 3. Route Freshness (stale detection)

A route snapshot is considered stale if:

current_route_input_signature != snapshot.route_input_signature

The system MUST NOT rely on timestamps as the primary freshness mechanism.

---

#### 4. Recompute Triggers

The system MUST trigger recompute of working routes when:

A. Route-relevant inputs change (after child profile save)
B. A route is opened and detected as stale

---

#### 5. Route Entry Behavior

On Route page entry:

- The system MUST compute current_route_input_signature
- Compare it with snapshot.route_input_signature

If signatures match:
-> Route is considered fresh
-> No recompute is executed

If signatures differ:
-> Route is considered stale
-> The system MUST automatically recompute the working route

If recompute fails:
-> The system MUST NOT present the stale route as fully up-to-date
-> The UI MUST reflect that the route may be outdated

---

#### 6. Locked Step Safety

If a route contains user-selected steps:

- Recompute MUST NOT override those steps silently
- Recompute MAY update:
  - downstream steps
  - signals
  - guidance

If recompute would invalidate a locked step:
-> The system MUST produce:
  - "new route available"
  - NOT silent mutation

---

#### 7. System Behavior Principle

The system MUST:

- never present stale route data as current truth
- never silently override user decisions
- always prefer explicitness over hidden mutation

Better outdated + visible
than silently wrong

---

### Data integrity

- система скрывает broken data
- регулярно проверяет источники
- не показывает ошибки пользователю

---

### Implementation boundary v1

Включает:

- Route Engine
- explainability
- export
- базовый scoring

Не включает:

- чаты
- teacher interaction
- сложные кастомные сценарии
- real-time интеграции

---

## 8. Stage 6 — UX / Interaction Contract

### Route layout

- горизонтальный маршрут
- компактные шаги
- уже собранный путь

---

### Step interaction

- шаг раскрывается вниз
- можно выбрать альтернативу
- выбор влияет на маршрут

---

### Step expansion

- открыт только один шаг
- auto-close поведение
- стабильный интерфейс

---

### Profession selector

- только сохранённые профессии
- не каталог
- нет пустых состояний

---

### Alternative routes

- 1 основной маршрут
- до 3 альтернатив
- только по действию пользователя

---

### Available professions

- показывает career outcomes
- не меняет маршрут
- ведёт в каталог профессий

---

### Too many options

- порог: 10
- нет обрезания
- пользователь сужает фильтры

---

### Warnings / feasibility

- плашки (badges)
- раскрытие по клику
- всегда есть рекомендации

---

### Explainability

- по запросу
- 3 блока:
  - что повлияло
  - почему выбран путь
  - что может изменить

---

### Saved routes

- хранятся в Child Profile → Saved study routes
- Route = работа
- Profile = storage

---

## 9. System Boundaries (v1)

Система:

- строит маршруты
- объясняет
- показывает риски
- даёт альтернативы

---

Система НЕ:

- принимает решения
- не общается с пользователями
- не заменяет школу
- не гарантирует результат

---

## 10. Future Layers (Not in v1)

- Adult transition routes
- Deep integrations с school systems
- Advanced analytics
- Requalification layer
- Career switching constructor

---

## 11. Final Principle

Route Engine — это система, которая делает сложную образовательную реальность понятной, управляемой и прозрачной, не перегружая пользователя и не забирая у него контроль.

---

## Supporting Documents

| Файл | Роль |
|------|------|
| `docs/architecture/route-engine-domain-validity-v1.md` | Supporting stage spec (Stage 2 — domain validity, locked rules в своём scope) |
| `docs/architecture/route-engine-stage-4-data-realism.md` | Supporting stage spec (Stage 4 — data realism & ingestion) |
| `docs/architecture/route-engine-stage-5-operational.md` | Supporting stage spec (Stage 5 — legal / operational readiness) |
| `docs/architecture/route-engine-stage-6-ux.md` | Supporting stage spec (Stage 6 — UX / interaction contract) |
| `docs/architecture/route-engine-adult-transition-layer.md` | Future layer (не baseline v1) |
| `docs/architecture/route-engine-next-steps.md` | Backlog / open decisions (не locked baseline) |
| `docs/architecture/route-engine-implementation-boundary-v1.md` | Derived implementation note (сжатый execution-facing boundary) |

Дополнительно (не в таблице выше как отдельная роль, но связаны): `docs/architecture/route-path-engine-production-spec.md` (Stage 1 — расширенный production baseline + guardrails), `docs/domain/route-stage-model.md` (справочник stage type / code).
