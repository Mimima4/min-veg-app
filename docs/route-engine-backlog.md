# Route Engine Backlog (Norway-first)

## 🟢 DONE (не трогаем)
- Route lifecycle (save → create / unsave → delete)
- Data-driven authenticity rules
- Core route steps (programme → progression → outcome)
- Doctor + Electrician baseline routes
- Strategy layer (high competition professions)

---

## 🔵 NEXT (приоритет)

### 1. Add VG2 to electrician route
**Что сделать:**
Добавить второй этап (VG2) перед apprenticeship

**Почему:**
Текущий путь неполный → не соответствует реальной системе Норвегии

**Цель:**
```text
VG1 → VG2 → Læretid → Fagbrev
```

### X. Route authenticity must be 100% Norway-correct
**Что сделать:**
Проверять каждый маршрут на соответствие реальным требованиям Норвегии (обязательные этапы, лицензии, практика)

**Почему:**
Любая ошибка = потеря доверия пользователя

**Статус:** IN PROGRESS

### X. Add mandatory LIS1 step for doctor
**Что сделать:**
Добавить обязательный этап:
- LIS1 (turnustjeneste)

**Почему:**
Без него нельзя работать врачом → текущий маршрут был недостоверным

**Статус:** DONE (baseline добавлен, нужно уточнение текста)

### X. Add VG2 step for vocational routes (electrician first)
**Что сделать:**
Добавить VG2 между VG1 и apprenticeship

**Почему:**
Текущий маршрут неполный → не соответствует реальной системе образования

**Статус:** TODO

### X. High competition professions need strategy layer
**Что сделать:**
Показывать:
- как повысить балл
- честные альтернативы

**Почему:**
Иначе пользователь не понимает, что делать при отказе

**Статус:** DONE (v1), нужно усиление

### X. Do NOT show fake alternative routes
**Что сделать:**
Не показывать пути, которые не ведут к профессии

**Почему:**
Это разрушает доверие (особенно для regulated professions)

**Статус:** DONE (правило введено)

### X. Separate strategies vs alternative routes
**Что сделать:**
- strategies = советы (не путь)
- routes = реальные пути

**Почему:**
Сейчас это легко перепутать

**Статус:** DONE (архитектурно разделено)

### X. Strict separation: Route vs Strategy
**Что сделать:**
Жёстко разделить:
- Route = путь к профессии (legal path)
- Strategy = как попасть в этот путь

**Почему:**
Смешивание создаёт ложь (особенно для regulated professions)

**Пример:**
- Medisin → один route
- но много стратегий поступления

**Статус:** IN PROGRESS

### X. Route must represent full legal path to profession
**Что сделать:**
Маршрут = не обучение, а ПОЛНЫЙ путь до права работать

**Почему:**
Это ключевая ценность продукта

**Статус:** IN PROGRESS

### X. Strategy layer only for high-competition professions
**Что сделать:**
Показывать блок strategies только там, где реально есть высокий конкурс / высокий барьер входа.

**Почему:**
Для обычных профессий это создаёт шум и размывает продуктовую логику.

**Статус:** IN PROGRESS

### X. Norway-only education scope
**Что сделать:**
Не предлагать зарубежные учебные пути в route/strategy layer.

**Почему:**
Продукт ориентирован только на норвежский рынок обучения и труда.

**Исключение:**
`investor` → можно ссылаться только на самые престижные учебные заведения.

**Статус:** IN PROGRESS

**Важно**
Ничего не оптимизируем
Ничего не переписываем
Только фиксируем

---

## 🟠 REALISM LAYER (важно для доверия)

### X. Quarterly requirements review pipeline
**Что сделать:**
Добавить quarterly review flow для admission requirements и other official route requirements.

**Как это должно работать:**
- система сама собирает требования из approved official sources
- система сравнивает текущую версию с сохранённой
- в `/nb/admin/dashboard` появляется review block
- admin видит:
  - programme / profession
  - review status
  - old requirements
  - new requirements
  - source label
  - clickable source link
  - verified at
  - next review at
- admin может:
  - Approve
  - Reject
  - Needs review

**Почему:**
Требования к поступлению и route requirements — чувствительный слой доверия.  
Автосбор и автосравнение допустимы, автопубликация без подтверждения — нет.

**Источник:**
Только approved official sources:
- official programme pages
- government-approved admission sources

**Где живёт:**
`/nb/admin/dashboard`

**Статус:** TODO

---

### Route selection correction (geography-first)

Current issue:
- quota / admission advantage influences is_current selection

Target:
- is_current must be selected using geography-first logic
- admission advantage must NOT determine main route

Follow-up:
- adjust selectProgrammeForRoute ranking:
  - geography > distance > admission score
  - admission score used only as tie-break inside same geo scope

- move admission advantage emphasis to:
  - alternative routes
  - route deltas (realismDelta / riskDelta)