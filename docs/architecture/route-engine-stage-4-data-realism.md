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
