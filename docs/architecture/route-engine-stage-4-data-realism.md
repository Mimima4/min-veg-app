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
