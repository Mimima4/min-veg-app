# Integrations — Expansion Layer (v1 → future)

## 1. Статус блока

Статус: expansion layer (НЕ часть v1 baseline)

Это означает:

- интеграции не являются необходимыми для работы продукта;
- Route Engine полностью функционирует без них;
- интеграции рассматриваются как слой усиления системы, а не как зависимость;
- любые claims об автоматических данных запрещены вне подтверждённых интеграций.

---

## 2. Главный принцип

Система должна:

- работать без интеграций;
- усиливаться при наличии интеграций;
- не зависеть от них для core functionality.

---

## 3. Контуры использования (важное разделение)

### 3.1 Family contour

В семейном сценарии:

- школа НЕ является активным пользователем продукта;
- школа:
  - не заполняет формы;
  - не пишет комментарии;
  - не тратит время в системе;
- допустимые действия:
  - загрузка PDF;
  - передача файла;
  - предоставление structured export.

---

### 3.2 Kommune / Owner contour

В муниципальном/системном контуре:

- школа становится data-actor;
- возможны:
  - batch ingestion (класс / школа);
  - системные выгрузки;
  - интеграции на уровне платформ;

НО:

- это не влияет на UX family напрямую;
- это остаётся отдельным operational layer.

---

## 4. Типы интеграций (структурно)

### 4.1 Identity layer

Primary:

- Feide

Важно:

- используется только для identity / access;
- НЕ является источником оценок или school data.

---

### 4.2 School systems (потенциальные интеграции)

Возможные платформы:

- Visma InSchool
- Vigilo
- IST Everyday
- SkoleArena
- Canvas (частично, ограниченно)

Важно:

- доступ к данным зависит от:
  - vendor cooperation;
  - municipality agreements;
  - API availability;
- нет гарантии доступа к данным в v1.

---

### 4.3 Data formats

Поддерживаемые форматы:

- PDF (основной сценарий v1)
- CSV / Excel (semi-structured)
- API (future)

---

### 4.4 National / official datasets

Используются как system intelligence, не как child-level ingestion:

- Udir
- vilbli
- Samordna opptak
- NAV
- SSB

---

## 5. V1 ingestion boundary (жёстко)

В v1:

✔ поддерживается:

- manual upload (PDF)
- optional structured import (CSV, если доступно)

Дополнительно поддерживается:

- parent-uploaded academic evidence (PDF, reports, grades)

Это является:

- допустимым способом получения school-type data без интеграций
- частью базового ingestion слоя v1

Ограничение:

- такие данные не считаются fully verified
- используются с пониженным уровнем доверия

❌ НЕ поддерживается:

- автоматическая загрузка оценок через Feide
- real-time school sync
- guaranteed integration с school systems

---

## 6. No fake automation rule

Запрещено:

- утверждать, что данные “подтянутся автоматически”;
- создавать ожидание полной интеграции без факта;
- маскировать manual upload как automation.

---

## 7. Dependency model

School data:

- не гарантированы;
- не обязательны;
- не должны блокировать работу Route Engine.

---

## 8. System behavior

Без интеграций:

- система работает;
- маршруты строятся;
- confidence ниже.

С интеграциями:

- усиливается точность;
- может появиться новый маршрут;
- усиливается explainability.

---

## 9. Future expansion (не v1)

Интеграции могут развиваться через:

- municipality-level agreements;
- vendor partnerships;
- API access;
- batch ingestion pipelines;
- Feide-linked identity flows + external data layers.

---

## 10. Финальная формулировка

Integrations layer — это не обязательный компонент системы, а слой расширения, который усиливает качество данных и точность маршрутов при наличии внешних подключений, но не влияет на базовую работоспособность Route Engine.
