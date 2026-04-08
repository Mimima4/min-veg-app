# Route Engine Next Steps

Этот документ разгружает основной production spec и фиксирует слои точной калибровки, которые остаются открытыми, но не меняют базовую архитектуру.

## Thresholds

- Зафиксировать точные decision thresholds между `optimal`, `recommended`, `alternative`.
- Согласовать граничные условия при близких score (tie-break rules).
- Определить правила деградации статуса при падении feasibility.

## Formulas

- Детализировать формулы внутри подфакторов Fit.
- Зафиксировать итоговую нормализацию подфакторов до общего route score.
- Уточнить веса и правила их будущей калибровки без изменения core-модели.

## Geography Logic

- Уточнить granularity rules для географии (регион, kommune, commute radius и т.д.).
- Формализовать переход между "строгой локальностью" и "расширением региона".
- Определить как geography ограничения влияют на hard filters и soft penalties.

## VGS Competition Model

- Описать competition model specifically for VGS layer.
- Зафиксировать входные сигналы (admission pressure, capacity, historical volatility).
- Уточнить влияние competition на feasibility и итоговый route ranking.

## Explanation Layer

- Спроектировать explanation text layer для родителя и ребёнка.
- Установить формат объяснений: почему маршрут в этом статусе и какие факторы ключевые.
- Согласовать баланс между прозрачностью модели и UX-краткостью.

## Stage 3 — Scoring & Explainability Layer

### 5. Interest vs Evidence Conflict Policy (v1)

#### 5.1. Core principle

The system must never remove or invalidate a child's interest (aspiration), even if it conflicts with current evidence.

Interest (aspiration) and evidence (proven performance) are separate layers and must not be collapsed into a single deterministic conclusion.

---

#### 5.2. Conflict definition

A conflict occurs when:

- child interest (selected profession) is not supported by current:
  - academic performance
  - test results
  - structured school evidence

---

#### 5.3. System behavior on conflict

When a conflict is detected:

- selected profession remains visible and active
- route is still generated
- route status is downgraded:
  - optimal -> recommended or alternative
- feasibility and/or fit signals reflect the gap

The system must not:

- remove the profession
- hide the route
- block user progression

---

#### 5.4. Explainability requirement

Conflict must always produce explanation:

The system must show:

- which factors are not aligned:
  - subjects (e.g. math, science)
  - skills
  - test signals

---

#### 5.5. Mandatory improvement guidance

Every conflict must include:

"What improves this route" block

This block must contain:

- concrete, actionable improvements
- no generic advice

Examples:

- improve grades in specific subjects
- choose a more aligned VGS track
- consider a longer or alternative path

Hard rule:
Warning without improvement guidance is incomplete guidance.

---

#### 5.6. UX communication rules

Conflict must not be presented as failure.

The system must avoid:

- "not suitable"
- "not possible"
- "you cannot"

Instead use:

- preparation gap framing
- development-oriented language

---

#### 5.7. 3-layer interpretation (mandatory)

Every conflict must be represented as:

- Aspiration layer -> what the child wants
- Readiness layer -> current preparation level
- Admission reality layer -> external constraints (competition, capacity)

These layers must remain visible and not collapse into a single verdict.

---

#### 5.8. Soft override policy

The family may choose to proceed with the selected profession despite conflict.

System behavior:

- does not block the route
- does not artificially increase score
- does not hide risks

The route remains visible with full transparency.

---

#### 5.9. Guardrail rule

The system must not automatically:

- replace the selected profession
- redirect the child to another profession without explicit user action

Alternative professions may be suggested, but never enforced.

---

#### 5.10. Outcome summary

In case of conflict:

- profession remains
- route remains
- status may downgrade
- explanation is shown
- improvement guidance is provided
- alternatives are available

## Stage 3 — Scoring Safety Layer (v1)

### 1. Minimal scoring payload v1

The system stores full scoring internally, but does not expose raw numeric scores to users.

User-facing representation:

- route status:
  - optimal
  - recommended
  - alternative
- key signals (badges):
  - competition
  - risk level
  - constraints mismatch

Numeric score remains internal for ranking and comparison only.

---

### 2. Explainability contract v1

Explainability is not always-on.

It is condition-based.

Explanation is required only when:

- route status ухудшается (e.g. optimal -> alternative)
- появляется риск (feasibility drop)
- возникает конфликт (interest vs evidence)

Explanation must include:

- what factors caused the change
- grouped by:
  - fit
  - feasibility
  - constraints
  - relevance
  - demand

Explanation must remain concise and not overload UI.

Detailed explanation is accessed via interaction with route elements (e.g. badge), not via persistent UI blocks.

---

### 3. Pedagogical safety rules

The system must never act as a deterministic judge.

It must:

- preserve aspiration (interest)
- avoid fixed labels
- avoid "not suitable" / "impossible" language

All outputs must be guidance-oriented.

The system operates as decision-support, not decision-maker.

---

### 4. Feasibility wording policy

Feasibility is communicated as risk, not prohibition.

User always sees:

- status badge
- short signal (e.g. high competition)

Detailed explanation opens on badge interaction.

Every low-feasibility route must include:

"What improves this route"

This block must contain:

- concrete actions
- no generic advice

Hard rule:
Warning without improvement guidance is incomplete guidance.

---

### 5. Interest vs Evidence Conflict Policy

#### Core principle

Interest is never removed.

Interest and evidence are separate layers.

#### Behavior

When conflict occurs:

- profession remains selected
- route remains visible
- route status may downgrade
- system does not block progression

#### Explainability

System must show:

- which factors are misaligned
- which subjects / signals are weak

#### Improvement guidance

Mandatory block:

"What improves this route"

#### UX rule

Conflict must not be presented as failure.

#### 3-layer model

Every conflict must show:

- Aspiration layer
- Readiness layer
- Admission reality layer

#### Guardrail

System must not:

- replace selected profession
- auto-redirect user

---

### 6. Soft override policy

User may proceed with chosen profession despite system recommendation.

Override behavior:

- does not change score
- does not hide risks
- does not upgrade route status

Override creates:

- user-priority route

Override fixes route as baseline reference.

System must not override user choice automatically.

---

### 7. Baseline route stability policy

Baseline route = current user-selected route.

It is not automatically replaced.

System continuously recalculates candidate routes but:

- does not overwrite baseline
- compares new routes against baseline

Changes:

Minor:
- not visible

Major:
- trigger suggestion of new route

Critical rule:

System must not say:
"route changed"

System must say:
"new route available"

User decides whether to adopt new route.

---

### 8. Weekly change visibility threshold

Recalculation happens regularly.

Visibility is limited.

Three levels:

1. Invisible:
- micro changes
- no UI impact

2. Minor:
- small internal improvements
- no notifications

3. Major:
- status change
- new route available
- risk introduced

Only major changes are shown.

System must avoid:

- weekly notifications
- micro-change exposure

Key rule:

Visibility != recalculation

## Data Trust Tiers

### Parent-uploaded school evidence (v1 extension)

При отсутствии интеграций со школой родитель может загружать академические данные ребёнка:

- оценки
- тесты
- отчёты
- school-issued PDF документы

Эти данные:

- классифицируются как school-type evidence
- используются в Route Engine для усиления модели
- НЕ требуют подтверждения школы для базового использования

При этом:

- такие данные не считаются fully verified
- уровень доверия ниже, чем у интегрированных school systems
- система не должна делать максимально жёсткие выводы только на их основе

Правило:

- тип данных важнее источника (academic signal остаётся academic signal)
- но confidence зависит от способа получения

Таким образом:

- parent-uploaded evidence усиливает модель
- но не приравнивается к fully verified school data
