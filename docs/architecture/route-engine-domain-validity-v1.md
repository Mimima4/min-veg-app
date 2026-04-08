# Route / Path Engine — Domain Validity v1

**Статус:** LOCKED BASELINE v1  
**Назначение:** зафиксировать domain validity layer для Route / Path Engine:
- canonical stage types
- canonical stage codes
- allowed transitions
- structural invalidation rules
- legacy boundary for old saved routes

Этот документ обязателен для backend/domain implementation и не может нарушаться UI или локальной page logic.

---

## 1. Canonical stage-type map v1

Допустимые типы шагов:

- LOWER_SECONDARY
- UPPER_SECONDARY
- APPRENTICESHIP
- HIGHER_EDUCATION
- VOCATIONAL_COLLEGE
- REQUALIFICATION
- WORK_ENTRY

### Правила
- Stage type — закрытый справочник.
- Новые типы не добавляются “по ситуации”.
- Один шаг маршрута = один stage type.
- Stage type определяет категорию шага, но не programme, institution, geography или feasibility.

---

## 2. Canonical stage-code map v1

Stage code задаёт конкретный уровень/этап внутри stage type.  
Stage code не существует без stage type.

### LOWER_SECONDARY
- GRUNNSKOLE

### UPPER_SECONDARY
- VG1
- VG2
- VG3
- VG3_STUDIES
- VG3_VOCATIONAL

### APPRENTICESHIP
- APPRENTICESHIP_STANDARD

Комментарий:
Apprenticeship в v1 не дробится на множество stage codes.
Специализация учитывается через programme, feasibility и route relevance, а не через отдельные apprenticeship codes.

### HIGHER_EDUCATION
- BACHELOR
- MASTER
- INTEGRATED_MASTER

Комментарий:
Расширенные переходы higher-education-to-higher-education beyond baseline фиксируются отдельно как future adult/transition logic.

### VOCATIONAL_COLLEGE
- FAGSKOLE

Комментарий:
Направление внутри fagskole хранится через programme, а не через отдельные stage codes.

### REQUALIFICATION
- REQUALIFICATION_PROGRAM
- BRIDGING_PROGRAM
- CERTIFICATION_PROGRAM

### WORK_ENTRY
- WORK_ENTRY

### Жёсткие правила
- Stage code не содержит programme.
- Stage code не содержит institution.
- Stage code не содержит geography.
- Stage code не содержит demand, competition или admission chance.
- Все значения stage code задаются только через фиксированный справочник.

---

## 3. Allowed transition rules v1

### Главный принцип
Сначала проверяется structural validity маршрута.
Только после этого маршрут может участвовать в scoring, ranking и UI.

### Разрешённые переходы baseline v1

- GRUNNSKOLE -> VG1
- VG1 -> VG2
- VG2 -> VG3
- VG2 -> VG3_STUDIES
- VG2 -> VG3_VOCATIONAL
- VG2 -> APPRENTICESHIP
- VG3_VOCATIONAL -> APPRENTICESHIP
- APPRENTICESHIP -> WORK_ENTRY
- VG3 -> BACHELOR
- VG3_STUDIES -> BACHELOR
- VG3 -> INTEGRATED_MASTER (только если programme/eligibility path это допускает)
- BACHELOR -> MASTER
- BACHELOR -> WORK_ENTRY
- MASTER -> WORK_ENTRY
- INTEGRATED_MASTER -> WORK_ENTRY
- VG2 -> FAGSKOLE
- VG3 -> FAGSKOLE
- VG3_VOCATIONAL -> FAGSKOLE
- FAGSKOLE -> WORK_ENTRY
- WORK_ENTRY -> REQUALIFICATION_PROGRAM
- WORK_ENTRY -> BRIDGING_PROGRAM
- WORK_ENTRY -> CERTIFICATION_PROGRAM
- BACHELOR -> REQUALIFICATION_PROGRAM
- BACHELOR -> BRIDGING_PROGRAM
- MASTER -> REQUALIFICATION_PROGRAM
- REQUALIFICATION_PROGRAM -> WORK_ENTRY
- BRIDGING_PROGRAM -> WORK_ENTRY
- CERTIFICATION_PROGRAM -> WORK_ENTRY
- VG3 -> WORK_ENTRY (ограниченно допустимый edge-case baseline)

### Что важно
Allowed transition = structural possibility.
Это не означает:
- high feasibility
- guaranteed admission
- strong recommendation

---

## 4. Structural invalidation rules

Маршрут считается structurally invalid, если выполняется хотя бы одно из условий ниже.

### 4.1 Нарушение transition rules
Если хотя бы один переход не входит в allowed transition matrix, маршрут invalid.

### 4.2 Пропуск обязательного этапа
Если маршрут перепрыгивает обязательную ступень, он invalid.

Примеры:
- GRUNNSKOLE -> BACHELOR
- VG2 -> BACHELOR
- APPRENTICESHIP -> MASTER как прямой шаг

### 4.3 Programme / route relevance hard mismatch
Если programme или stage structurally не ведёт к выбранной профессии, маршрут invalid.
Это hard filter, а не soft penalty.

### 4.4 Нарушение обязательных требований этапа
Если этап требует определённый предыдущий stage / track / programme, а его нет, маршрут invalid.

### 4.5 Циклы
Любые циклы invalid.

Примеры:
- VG2 -> VG1
- BACHELOR -> BACHELOR как progression loop
- WORK_ENTRY -> WORK_ENTRY как route loop

### 4.6 Разорванная цепочка
Если между шагами есть логический разрыв, маршрут invalid.

### 4.7 Нарушение hard user constraints
Если маршрут нарушает жёсткие ограничения пользователя, он invalid, а не просто понижается.

Примеры:
- запрет на переезд, но маршрут уводит в неподходящую geography
- запрет определённого path type, но маршрут всё равно его использует

### 4.8 Empty step
Если шаг не имеет ни одной допустимой option, маршрут invalid.

### Что НЕ является invalid
Ниже — не invalid, а weak/risky route:
- плохие оценки
- высокая конкуренция
- мало мест
- длинный путь
- конфликт aspiration и evidence

### UX-правило
Если маршрут invalid:
- выбранная профессия не исчезает
- система должна объяснить, что именно сломано
- система должна предложить альтернативу или корректировку assumptions

---

## 5. Legacy boundary for child_saved_education_routes

### 5.1 Source of truth
Новый Route Engine (`built_routes` и связанные сущности) — единственный source of truth.

Legacy слой:
`child_saved_education_routes`
не участвует в:
- route generation
- scoring
- explainability
- ranking
- recalculation

### 5.2 Что такое legacy routes
Legacy routes — это:
- исторически сохранённые пользовательские маршруты
- маршруты старого формата
- маршруты без новой structural validation / explainability / feasibility logic

Это не равнозначно новому built route.

### 5.3 UI treatment
Legacy route нельзя удалять автоматически, если он был сохранён пользователем.

Но система обязана явно и заметно пометить его как:
- outdated
- not validated by current route model
- not using current explainability / feasibility logic

### 5.4 Migration through rebuild
При открытии legacy route система предлагает:
- пересобрать маршрут по новой модели

После rebuild:
- создаётся новый `built_route`
- старый legacy route остаётся как архив

### 5.5 Post-rebuild cleanup
После успешной пересборки система должна предложить пользователю:
- удалить старый legacy route (опционально)

Удаление — только по явному действию пользователя.

### 5.6 Strict rule
Новый код:
- никогда не пишет в `child_saved_education_routes`
- никогда не использует legacy routes как input for Route Engine truth

---

## 6. Boundary note

Adult / transition logic intentionally excluded from this baseline.
See:
`docs/architecture/route-engine-adult-transition-layer.md`

---

## 7. Статус
Этот документ является locked baseline v1.
Любые изменения:
- только через явное обновление spec
- не через неявную backend/UI логику
