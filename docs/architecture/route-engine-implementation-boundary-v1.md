# Route / Path Engine — Implementation Boundary v1

**Status:** DERIVED IMPLEMENTATION NOTE  
**Relationship:** This document is a condensed implementation-facing boundary note derived from the master spec.  
**Rule:** It must not contradict `docs/architecture/route-engine-master-spec.md`.

---

**Статус:** pre-implementation execution boundary  
**Назначение:** зафиксировать точный первый кодовый объём Route / Path Engine

---

## 1. Что такое v1

v1 — это первый production-minded execution slice Route Engine как server-truth decision-support layer.

Это не:
- demo,
- не временная логика,
- не web-only feature.

Это первый реальный backend/domain контур.

---

## 2. Главная цель v1

Дать системе возможность:

- построить маршрут по saved profession
- отдать explainable результат
- показать steps и options
- показать available professions
- сохранить route
- пересчитать при изменениях

---

## 3. Что входит в v1

### 3.1 Route read layer
- current route
- steps
- options
- warnings
- available professions
- alternatives summary
- assumptions snapshot
- confidence

---

### 3.2 Built route domain
- built_routes
- built_route_steps
- built_route_available_professions
- route_scoring_snapshots

---

### 3.3 Route generation
Используем текущие таблицы:
- child_profiles
- professions
- education_institutions
- education_programs
- profession_program_links

---

### 3.4 Filters / assumptions
- route_filter_profiles
- local assumptions
- save to profile
- rebuild on change

---

### 3.5 Explainability (minimal)
- why this route
- what supports it
- what makes it harder
- what improves it

---

### 3.6 Confidence
- early signal
- developing picture
- stronger evidence

---

### 3.7 Stability
- baseline route
- silent vs visible recalculation
- material change detection

---

### 3.8 Saved routes
- save
- edit
- reopen
- new variant on major change

---

## 4. Что НЕ входит в v1

### Не делаем сейчас:
- full Feide integrations
- full school automation
- полный competition engine
- полный demand engine
- owner analytics
- идеальные тексты объяснений

---

## 5. Technical boundaries

### 5.1 Server truth
Никакой логики маршрута в UI.

---

### 5.2 Generation → scoring
Сначала строим, потом оцениваем.

---

### 5.3 Hard filters
Обязательны уже в v1.

---

### 5.4 Route identity
Versioning обязателен сразу.

---

## 6. Data model (v1)

### Обязательно:
- child_evidence_inputs
- child_aggregated_signals
- route_filter_profiles
- built_routes
- built_route_steps
- built_route_available_professions
- route_scoring_snapshots

---

## 7. Порядок реализации

### Wave 1
- route entities
- generation
- read model
- save/edit

### Wave 2
- explainability
- confidence
- stability

### Wave 3
- scoring усиление
- alternatives
- feasibility слой

---

## 8. Definition of success

v1 успешен, если:

- есть current route
- есть шаги и options
- есть available professions
- есть explainability
- есть сохранение и версии
- есть server-side truth

---

## 9. Финальная граница

v1 — это первый реальный Route Engine,  
а не прототип, не UI и не обещание.
