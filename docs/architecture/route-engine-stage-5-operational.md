# Route Engine — Stage 5: Legal / Operational Readiness (v1)

**Status:** SUPPORTING SPEC  
**Relationship:** This document elaborates a specific stage of the primary master spec.  
**Conflict rule:** In case of conflict, `route-engine-master-spec.md` is the governing reference, unless this file explicitly defines a narrower locked rule for its own scope (governance, recalculation UX copy, export, freshness, integrity in Stage 5).

---

## 1. Статус блока

Статус: LOCKED v1

Этот блок фиксирует:

- governance posture
- роль пользователя и системы
- отсутствие автоматических решений
- поведение пересчётов
- bridge в офлайн
- актуальность и корректность данных

---

## 2. High-risk AI / Governance posture

Route Engine проектируется как decision-support система.

Система:

- не принимает финальные решения
- не заменяет человека
- не определяет “судьбу” ребёнка

Система:

- предлагает
- объясняет
- помогает интерпретировать

---

## 3. Human oversight rule

Во всех сценариях:

- финальное решение остаётся за пользователем (семьёй)

Система:

- не блокирует выбор
- не скрывает варианты
- не навязывает маршрут

Даже при низком feasibility:

- маршрут остаётся видимым
- помечается как alternative / risky

---

## 4. Consultation export / counselor handoff

Route Engine поддерживает экспорт маршрута для офлайн обсуждения.

Форматы:

- PDF (для печати)
- shareable read-only view внутри системы

---

### PDF включает:

- выбранную профессию
- маршрут (шаги)
- assumptions
- warnings / risks
- feasibility сигналы
- объяснение маршрута
- альтернативы

---

### Обязательный блок:

“Обратите внимание / Важные комментарии”

Включает:

- feasibility сигналы
- риски
- рекомендации по компетенциям
- рекомендации по оценкам
- что улучшит маршрут

---

### Shareable view:

- доступ к выбранному маршруту
- read-only
- без чатов
- без комментариев
- без редактирования

---

## 5. Recalculation ownership

Пересчёт выполняется системой:

- event-triggered (только при material изменениях)
- weekly recalculation
- monthly external refresh

---

### Важно

Сохранённый маршрут:

- не изменяется автоматически

Вместо этого:

- предлагается новый вариант маршрута

---

### UX правило

Система показывает:

“Появился новый вариант маршрута”

НЕ:

“Маршрут изменился”

---

## 6. Event-triggered recalculation (material-only)

Мгновенный пересчёт выполняется только при существенных изменениях:

- успешная обработка значимого school evidence
- значимые обновления оценок / тестов
- изменения профиля
- действия пользователя в Route

---

### Не триггерит пересчёт:

- частичные данные
- сырые данные
- слабые сигналы

---

→ такие изменения обрабатываются в weekly recalculation

---

## 7. Freshness flags

Используются лёгкие индикаторы актуальности на уровне маршрута:

- Up to date
- Recently updated
- Needs refresh

---

### Правила:

- показываются только на уровне маршрута
- не перегружают интерфейс
- не создают паники

---

## 8. Data Integrity Layer

Система обязана поддерживать корректность institution-level данных.

---

### Включает:

- ссылки на учебные заведения
- базовые institution данные

---

### Принцип:

Ошибки данных не показываются пользователю.

---

### Обработка:

- регулярная проверка (baseline: раз в квартал)
- проверка URL / редиректов
- обновление или удаление невалидных данных

---

### Поведение:

Если источник невалиден:

- обновляется автоматически
или
- скрывается

---

### Важно:

Freshness ≠ Data correctness

---

## 9. Implementation boundary (v1)

В v1 реализуется:

- decision-support модель
- автоматический пересчёт
- consultation export
- basic data validation

---

НЕ реализуется:

- чаты
- общение с учителями
- ручные комментарии школы
- live консультации

---

## 10. Финальный принцип

Route Engine:

- помогает принимать решения
- не принимает решения за пользователя
- остаётся стабильным
- не вводит в заблуждение
- не показывает некорректные данные

## 11. Implementation boundary (v1) — детализация

### Входит в v1:

Core:

- построение маршрута (Route Engine)
- 1 optimal маршрут
- до 3 alternative маршрутов
- управляемые шаги (step selection)
- фильтры (география, ограничения и т.д.)

---

Scoring:

- fit
- feasibility
- constraints match
- route relevance

(без отображения числовых значений пользователю)

---

Explainability:

- краткое объяснение маршрута
- предупреждения (feasibility)
- рекомендации по улучшению

---

Data:

- parent input
- parent-uploaded school data
- базовые external источники

---

Export:

- PDF (с полным контекстом)
- shareable read-only маршрут

---

Recalculation:

- event-triggered (только material изменения)
- weekly recalculation
- monthly external refresh

---

Safety:

- decision-support модель
- human oversight
- отсутствие принудительных решений

---

### НЕ входит в v1:

Коммуникация:

- чаты
- сообщения
- комментарии учителей
- live-консультации

---

Редактирование:

- ручное “переписывание маршрута”
- кастомная сборка маршрута с нуля

---

Аналитика:

- сравнение большого количества маршрутов (10+)
- сложные аналитические панели

---

Интеграции:

- real-time school integrations
- автоматическая загрузка оценок

---

### Принцип

Любая новая функция добавляется в v1 только если:

- усиливает принятие решения
- не усложняет UX
- не создаёт ложных ожиданий

---

### Финальный принцип

v1 — это минимально достаточный, но production-ready слой, который даёт пользователю конкретный, объяснимый и управляемый маршрут без перегрузки и без зависимости от внешних систем.

## Programme availability freshness and refresh policy

Programme-to-school mapping and related institution/programme links must support operational freshness.

### Required operational rules

- mapping refresh must run on a recurring schedule
- refresh cadence must be at least reviewable and configurable
- weekly or monthly refresh is allowed depending on source stability
- refreshed records must store freshness metadata
- system must be able to identify when mapping data was last updated

### Minimum freshness metadata

The system should store, directly or through related operational tables:

- source family
- last synced at
- last verified at
- version / snapshot marker where applicable

### Product rule

The route engine must not assume static long-term correctness for programme availability.

Availability truth must be refreshable, reviewable, and operationally visible.
