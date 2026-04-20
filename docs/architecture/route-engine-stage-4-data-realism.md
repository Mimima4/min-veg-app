# Route Engine — Stage 4: Data Realism & Ingestion (v1)

**Status:** SUPPORTING SPEC  
**Relationship:** This document elaborates a specific stage of the primary master spec.  
**Conflict rule:** In case of conflict, `route-engine-master-spec.md` is the governing reference, unless this file explicitly defines a narrower locked rule for its own scope (data trust tiers, ingestion boundary, Feide role, confidence framing in Stage 4).

---

## 1. Статус блока

Статус: LOCKED v1

Этот блок фиксирует:

- какие данные реально доступны;
- какие источники используются;
- где есть ограничения;
- как система работает без полной информации;
- как обрабатываются school данные;
- как учитывается уровень доверия к данным.

Этот блок является обязательным для:

- product logic
- scoring interpretation
- UX формулировок
- legal/gov readiness

---

## 2. Главный принцип

Система не придумывает профиль ребёнка.

Она:

- использует только реальные данные;
- явно различает уровень уверенности;
- работает даже при отсутствии school data;
- усиливается при появлении данных.

---

## 3. Data Trust Tiers (v1)

### Tier A — School evidence

Включает:

- оценки
- тесты
- school reports
- structured exports

Разделяется на:

#### A1 — Verified

- интеграции
- официальные источники

Максимальный уровень доверия

---

#### A2 — Parent-uploaded

- PDF
- отчёты
- документы от школы

Правила:

- классифицируется как school-type data
- используется в модели
- НЕ требует подтверждения школы

Ограничения:

- не считается fully verified
- имеет более низкий уровень доверия
- не может быть единственной основой для жёстких выводов

---

### Tier B — Parent input

- интересы
- предпочтения
- выбранная профессия

Правило:

- основной источник при отсутствии school data
- субъективен
- не может переопределять реальность маршрута

---

### Tier C — System intelligence

- структура образования
- требования к профессиям
- route logic
- конкуренция (агрегированная)
- рынок труда

Правило:

- не моделирует ребёнка
- не делает предположений о способностях
- используется для проверки и построения маршрута

---

## 4. Ключевые правила

- система не делает сильных выводов без school data
- system intelligence не заменяет профиль ребёнка
- тип данных важнее источника, но confidence зависит от способа получения
- слабые данные не могут давать сильные выводы

---

## 5. School Ingestion Boundary (v1)

### Поддерживается:

- manual upload (PDF)
- parent-uploaded school evidence
- ограниченный structured import (CSV)

---

### НЕ поддерживается:

- автоматическая загрузка оценок через Feide
- real-time school sync
- гарантированные интеграции со школами

---

## 6. Feide

Feide используется как:

- identity / access federation

Feide НЕ является:

- источником оценок
- источником тестов
- источником school evidence

---

## 7. Контуры взаимодействия

### Family contour

Школа:

- не заполняет формы
- не пишет комментарии
- не тратит время в системе

Допустимо:

- загрузка файла
- передача документа

---

### Kommune / owner contour

Школа может:

- делать batch ingestion
- передавать structured данные
- работать через интеграции

Это отдельный operational слой.

---

## 8. Data availability matrix

### Education structure

- Udir
- vilbli

Статус: available

---

### Admission / competition

- Samordna opptak

Статус: partial

---

### Labour market

- NAV
- SSB

Статус: available

---

### School data

- uploads
- потенциальные интеграции

Статус: limited

---

### Parent input

Статус: available

---

### Real-time institutional data

Статус: not available

---

## 9. Dependency model

Route Engine:

- не зависит от school integrations
- не блокируется отсутствием данных
- работает в любом сценарии

---

## 10. System behavior

Без school data:

- маршрут строится
- confidence ниже
- выводы мягче

---

С school data:

- усиливается точность
- может появиться новый маршрут
- усиливается explainability

---

## 11. No fake automation rule

Запрещено:

- утверждать автоматическую загрузку данных без интеграции
- создавать ложное ожидание полной синхронизации
- маскировать manual upload как automation

---

## 12. Confidence framing

Система обязана различать:

- early signal
- developing picture
- stronger evidence-backed route

Уровень уверенности зависит от:

- наличия school data
- качества данных
- типа источника

---

## 13. Финальная формулировка

Route Engine работает на основе реальных доступных данных, не зависит от внешних интеграций, не создаёт ложного ощущения полной точности, корректно учитывает уровень доверия к данным и усиливает свою точность при появлении дополнительных источников, оставаясь полностью функциональным даже при минимальном вводе.

## Programme-to-school availability mapping

For VGS / school-based routes, programme availability must be treated as a structured data layer.

The system must maintain programme -> school availability mapping scoped by fylke / municipality where relevant.

This mapping must not be treated as static seed-only truth.

### Requirements

- programme-to-school availability must be ingested from approved official sources
- mapping must be refreshable
- mapping must remain geography-aware
- route engine must use refreshed mapping when constructing and ranking routes
- if source availability changes, route realism must reflect that change after refresh

### Source model

For VGS / school-based routes:
- official source families may include Vilbli and other approved official education structure sources

### Important rule

If programme availability changes in the official source, the local mapping must be able to update on refresh.

Static one-time import is not sufficient for production truth.

## Availability data model

Programme-to-school availability must be represented as a dedicated data model.

### Table: education_programme_availability

This table defines where a programme is actually available.

Each row represents a single availability record for a programme in a specific institution and geography.

### Core fields

- id (uuid)
- program_slug (text, required)
- institution_id (uuid, required)

### Geography

- fylke_code (text, nullable)
- municipality_code (text, nullable)

Geography must allow filtering by:
- municipality (first priority)
- fylke (fallback level)

### Source tracking

- source_family (text, required)
  (e.g. vilbli, official education registry)

- source_url (text, nullable)
  (link to the source page for this programme in this school)

### State

- is_active (boolean, required)
  (whether the availability is currently valid)

### Freshness

- last_synced_at (timestamp with time zone, required)

### Identity rule

The canonical identity of an availability record is:

`program_slug + institution_id`

There must not be multiple active rows for the same pair.

### Important constraints

- availability must not be inferred from education_programs alone
- availability must be explicitly stored
- availability must be geography-aware
- availability must be refreshable

### Product rule

Route engine must rely on availability data when selecting:

- primary school
- alternative schools
- route realism

If no availability records exist:
- the system must treat the route as incomplete
- fallback logic must be explicit (not silent)

## Availability ingestion contract (Vilbli)

Programme-to-school availability for VGS must be ingested from Vilbli as a structured source.

This ingestion defines how external data becomes internal availability truth.

---

### Ingestion unit

One availability record must represent:

- one programme
- in one institution
- in a конкретном fylke-контексте

---

### Source flow (Vilbli logic)

The ingestion must follow Vilbli navigation structure:

1. select fylke
2. select education area
3. select profession / programme path
4. open "Skoler og lærebedrifter"
5. extract institutions
6. extract "Nettstad" (school/programme link)

---

### Required extracted fields

Each ingested record must populate:

- program_slug
- institution_id
- fylke_code
- municipality_code (if available)
- source_family = 'vilbli'
- source_url (link from "Nettstad")
- is_active = true
- last_synced_at = now()

---

### Matching rules (critical)

#### Programme matching

Vilbli programme must be matched to internal programme via:

- program_slug (preferred)
- fallback: normalized title matching

If confident match is not possible:
- record must NOT be inserted

---

#### Institution matching

Vilbli institution must be matched via:

- normalized institution name
- municipality context

If multiple matches or ambiguity:
- record must be skipped (not guessed)

---

### Update strategy

Ingestion must NOT blindly overwrite data.

Instead:

- existing records for (program_slug + institution_id) must be updated:
  - is_active = true
  - last_synced_at refreshed

- newly discovered pairs must be inserted

- previously existing but no longer present pairs must be:
  - marked is_active = false

---

### Freshness rule

Every ingestion run must:

- update last_synced_at
- allow tracking of stale records

---

### Failure safety

The system must prefer missing data over incorrect data.

It is acceptable to:
- skip uncertain matches

It is NOT acceptable to:
- create incorrect programme-school mappings

## Vilbli ingestion unit: programme-in-fylke

Vilbli must be ingested using a programme-in-fylke approach.

### Core principle

Availability must NOT be constructed by searching for schools directly.

Instead, availability must be derived from:

- a specific programme
- within a specific fylke
- using the official Vilbli navigation flow

---

### Why school-first ingestion is invalid

School-first approaches (e.g. guessing URLs or matching schools independently) are not reliable because:

- Vilbli school URLs are not consistently derivable from names
- the same school may appear differently across contexts
- availability is defined per programme, not per institution globally

Therefore:

- direct school lookup is not a valid ingestion strategy
- guessed URLs must not be used as production logic

---

### Valid ingestion flow (Vilbli-aligned)

For each programme and fylke:

1. select fylke
2. select education area
3. select programme / profession path
4. open "Skoler og lærebedrifter"
5. extract list of institutions
6. extract "Nettstad" links where available

---

### Ingestion unit definition

One ingestion unit must represent:

- one programme
- in one fylke
- producing a list of institutions

Each institution becomes one availability record.

---

### Data mapping

For each extracted institution:

- map to internal `institution_id`
- attach:
  - program_slug
  - fylke_code
  - municipality_code (if available)
  - source_family = 'vilbli'
  - source_url (Vilbli page or Nettstad link)

---

### Important rule

Availability truth is defined by:

programme + fylke + institution

NOT by:

institution alone

---

### Product implication

The system must reflect that:

- a programme may exist in one fylke but not another
- availability must always be geography-aware
- route construction must depend on this availability layer

---

### Automation rule

All ingestion must be:

- repeatable
- non-manual
- source-driven

Temporary or guessed data must not be persisted in production.

## Programme contour typing

To support route-level learning-depth filtering, each programme must belong to a structured contour type.

This contour typing is an internal route-engine classification layer.

It is not shown to the user directly, but is used for:

- learning-depth filter behavior
- primary route ranking
- alternative route prioritization
- route badges / contour labels
- study-time grouping

### Minimum rule

Each route-relevant programme must map to one contour type.

Example contour types may include:

- vocational_fast
- vocational_extended
- study_preparatory
- higher_ed
- professional_degree

### Important rule

Contour typing must not invent educational paths.

It only classifies already valid programmes into meaningful route families.

### Product rule

Learning-depth filter does not construct new routes.

It changes which contour becomes primary and how alternatives are ordered.

### Availability rule

If a profession only supports one valid contour type, the filter must shrink accordingly.

The system must not show artificial depth options.

## Programme-school admission realism (next layer)

Admission realism for a specific programme in a specific institution must be treated as a separate realism layer.

It must NOT be merged into baseline availability truth.

### Why this layer is separate

Availability answers:

- is this programme available in this school / region?

Admission realism answers:

- how realistic is admission to this programme in this school?
- how strong is competition?
- what are the relevant thresholds / pressure signals?
- how constrained is entry?

These are different kinds of truth and must remain separated.

### Examples of admission realism signals

This next realism layer may later include:

- competition level
- admission threshold signals
- seat / capacity pressure
- quota-related realism where official sources allow it

### Important rule

Programme availability must be implemented first.

Admission realism may enrich ranking and guidance later, but must not block baseline route availability logic.

### Product sequencing rule

v1 baseline:
- programme-to-school availability

next realism layer:
- programme-school admission realism

## Shared pair identity for future realism layers

The canonical identity for school-level route realism must be:

`program_slug + institution_id`

This pair identity must be stable and reusable across future realism layers, including:

- programme availability
- admission realism
- competition signals
- threshold updates
- future capacity-related signals

This allows the system to extend realism without redesigning the availability layer.

## NSR school relevance boundary for route v1

NSR school import may contain institutions that are valid in registry truth but are not route-relevant for the current family/child route contour.

Examples may include:
- examination offices
- privatisteksamen entities
- prison-based branches
- special/non-standard upper-secondary entities
- entities that may become relevant in later adult / special contours

### Important rule

Such institutions must NOT be deleted or cleaned out of the source-based school layer.

They must remain stored as valid registry entities.

### v1 product rule

For baseline family/child route v1, non-route-relevant NSR institutions must be:

- excluded from route selection
- excluded from route alternatives
- excluded from default school display in route UI

They may remain available for:
- future adult contour
- future special route layers
- future operational/admin use

### Principle

Store broadly.
Use narrowly.

Registry truth may be wider than route truth.

### Route-relevant use rule

Only route-relevant schools should participate in:

- programme-to-school availability for route v1
- school display inside route detail
- alternative school presentation
- route realism calculations tied to school choice

### Website validation rule

A value may be used as `website_url` only if it is a valid web address.

Email-like values, mailbox strings, or non-web contact values must not be used as school website links in route UI.

Such values may remain in raw source truth if needed for future operational use, but must not be presented as websites.

## NSR route relevance and school classification (v1)

### Scope

This defines which NSR schools are considered valid for family/child route construction in Norway (v1).

The system stores full NSR truth, but only a subset participates in route logic.

---

### Core principle

Not all registry-valid schools are route-valid.

System must:

- store all NSR schools
- use only route-relevant schools for route v1

---

### Route-relevant schools (v1)

A school is considered route-relevant if:

- located in Norway (country_code = 'NO')
- is active (ErAktiv = true)
- is a videregående skole (ErVideregaaendeSkole = true)
- represents a standard education path accessible to families

This includes:

- public videregående schools
- private/independent videregående schools (e.g. Akademiet, Wang)
- alternative but valid VGS institutions

---

### Excluded from route v1

The following entities must NOT participate in route construction:

- foreign Norwegian schools (schools located outside Norway)
- privatisteksamen entities
- examination offices (eksamenskontor)
- prison-based or institutional branches
- non-standard or operational units that are not actual study paths

These entities must:

- remain stored in the database
- have `is_route_relevant = false`
- not appear in route UI or alternatives

---

### Special / edge schools

Some schools may be valid but not universally applicable:

Examples:
- specialized schools (e.g. Signo)
- competence centers
- niche or restricted-access institutions

Rule:

- store them
- allow them to be flagged as route-relevant
- but do not prioritize them in default route selection
- future contours (adult/special) may use them differently

---

### Private / paid schools

Private schools are considered route-relevant.

However:

- they may require tuition
- they may not be accessible to all families

---

### UI rule for private schools

If a school is private or potentially paid:

- route UI must display a small badge

Recommended label:
- "Paid option"

Purpose:

- transparency for families
- avoid misleading assumption that all options are free

---

### Technical field usage

`is_route_relevant` is:

- an internal technical field
- not exposed to the user
- not shown in UI

Used for:

- filtering schools in route construction
- filtering alternatives
- controlling school availability layer

---

### Principle

Store broadly.  
Use narrowly.

NSR = registry truth  
Route v1 = filtered, product-relevant truth
