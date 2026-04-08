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
