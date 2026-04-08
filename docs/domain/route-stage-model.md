# Route Engine — Stage Model v1

## Статус
LOCKED v1 (domain foundation)

Этот документ фиксирует базовую структуру этапов маршрута (stages) для Route Engine.
Он является source of truth для всех route calculations, transitions и UI-отображения.

---

# 1. Stage Type (уровень типа шага)

Stage type определяет категорию шага в маршруте.

Это фиксированный список, который не может расширяться произвольно.

## Список stage types v1:

- LOWER_SECONDARY
- UPPER_SECONDARY
- APPRENTICESHIP
- HIGHER_EDUCATION
- VOCATIONAL_COLLEGE
- REQUALIFICATION
- WORK_ENTRY

---

# 2. Stage Code (конкретный этап)

Stage code определяет конкретный уровень внутри stage type.

## Важное правило

Stage code:
- не существует без stage type
- не содержит programme
- не содержит institution
- не содержит географию

Он отвечает только за уровень образования.

---

# 3. Stage Codes v1

## LOWER_SECONDARY

- GRUNNSKOLE

---

## UPPER_SECONDARY (VGS)

- VG1
- VG2
- VG3
- VG3_STUDIES (påbygg)
- VG3_VOCATIONAL

---

## APPRENTICESHIP

- APPRENTICESHIP_STANDARD

Комментарий:
Apprenticeship — это формат прохождения обучения, а не отдельный образовательный уровень.
Вариативность (профессия, компания, доступность) учитывается через programme и feasibility, а не через stage code.

---

## HIGHER_EDUCATION

- BACHELOR
- MASTER
- INTEGRATED_MASTER

---

## VOCATIONAL_COLLEGE (Fagskole)

- FAGSKOLE

Комментарий:
Разные направления (engineering, health и т.д.) не кодируются в stage code.
Они задаются через programme.

---

## REQUALIFICATION

- REQUALIFICATION_PROGRAM
- BRIDGING_PROGRAM
- CERTIFICATION_PROGRAM

---

## WORK_ENTRY

- WORK_ENTRY

---

# 4. Структура одного шага

Каждый шаг маршрута описывается через:

- stage type
- stage code
- programme
- institution

Пример:

VGS Bergen · VG2 · Health programme

---

# 5. Жёсткие правила

1. Stage code не содержит бизнес-логики (конкуренция, вероятность и т.д.)
2. Stage code не содержит programme
3. Stage code не содержит institution
4. Stage code не может создаваться динамически
5. Все значения задаются через фиксированный справочник

---

# 6. Разделение ответственности

| Слой | Отвечает за |
|------|------------|
| Stage type | тип этапа |
| Stage code | уровень |
| Programme | направление |
| Institution | место |

---

# 7. Почему это важно

Этот слой:

- делает Route Engine структурно валидным
- позволяет строить реальные маршруты (Norway-first)
- является основой для:
  - transition rules
  - feasibility
  - scoring
  - explainability

---

# 8. Ограничение v1

Stage model не включает:

- admission requirements
- competition logic
- feasibility
- demand

Это отдельные слои системы.

---

# 9. Статус

Этот документ является locked baseline v1.

Любые изменения:
- только через явное обновление spec
- без неявных правок в коде
