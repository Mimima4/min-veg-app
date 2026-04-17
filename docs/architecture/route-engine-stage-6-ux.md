# Route Engine — Stage 6: UX / Interaction Contract (v1)

**Status:** SUPPORTING SPEC  
**Relationship:** This document elaborates a specific stage of the primary master spec.  
**Conflict rule:** In case of conflict, `route-engine-master-spec.md` is the governing reference, unless this file explicitly defines a narrower locked rule for its own scope (UX thresholds, interaction patterns, copy rules in Stage 6).

---

## 1. Статус блока

Статус: LOCKED v1

Этот блок фиксирует UX / interaction contract для Route Engine:

- как отображается маршрут
- как пользователь взаимодействует со step
- как открываются альтернативы
- как работает selector профессии
- как показываются warnings и explainability
- как сохраняются и переключаются route variants

Этот документ обязателен для product, design и frontend implementation.

---

## 2. Route Layout Contract

### Главный принцип

Route отображается как реальный путь к профессии, а не как абстрактная схема системы образования.

### Layout

- маршрут всегда горизонтальный
- маршрут состоит из компактных шагов (steps)
- по умолчанию пользователь видит уже собранный маршрут
- маршрут не стартует с пустого конструктора

### Step visual shape

Каждый шаг отображается как компактный блок:

- institution
- programme / stage

Примеры:

- VGS Voss · VG2
- Høyskole Bergen · Bachelor
- Work entry

### Правила

- нет длинных текстов внутри step
- нет перегрузки внутри основной линии маршрута
- дополнительная информация не живёт внутри линии маршрута
- при длинном маршруте используется горизонтальный скролл
- маршрут должен оставаться визуально чистым и читаемым

### Финальный принцип

Route отображается как горизонтальная последовательность компактных шагов, уже собранных системой, без перегрузки дополнительной информацией внутри основной линии.

---

## 3. Step Interaction Contract

### Главный принцип

Каждый шаг маршрута — это управляемый узел, а не просто отображение.

### Что содержит step

- текущий выбранный вариант
- альтернативные варианты
- статус варианта

### Поведение

При нажатии на step:

- step раскрывается вниз
- показываются альтернативные варианты
- не открывается новая страница
- не открывается modal

### Выбор варианта

При выборе нового варианта:

- маршрут пересчитывается
- step обновляется
- другие шаги маршрута тоже могут измениться

### Ограничения

- step не превращается в таблицу
- нет multi-select
- нет ручной “сборки маршрута с нуля”

### Финальный принцип

Каждый шаг маршрута является управляемым узлом, который позволяет выбрать альтернативный вариант без потери общего контекста маршрута.

---

## 4. Step Expansion Behavior

### Главный принцип

Раскрытие step не должно ломать горизонтальную структуру маршрута.

### Правила раскрытия

- step раскрывается только вниз
- overlay / modal не используются
- в каждый момент времени может быть раскрыт только один step

### Автозакрытие

Step закрывается если:

- пользователь нажал вне области
- пользователь открыл другой step
- пользователь сделал выбор
- пользователь повторно нажал на текущий исходный вариант

### UX-стабильность

- нет скролл-скачков
- нет хаотических перестроений интерфейса
- нет nested dropdown inside dropdown

### Финальный принцип

В каждый момент времени может быть раскрыт только один шаг маршрута, который открывается вниз под соответствующим блоком и не нарушает горизонтальную структуру пути.

---

## 5. Profession Selector Behavior

### Главный принцип

Route не должен превращаться в каталог профессий.

### Selector показывает только:

- сохранённые профессии конкретного ребёнка

### Не показывает:

- полный каталог профессий
- поиск по каталогу
- рекомендации новых профессий

### Поведение

- в каждый момент времени активна одна профессия
- при переключении selector меняется текущий route context
- если для выбранной профессии ещё нет route, система сразу строит baseline route
- пустые состояния не допускаются

### Финальный принцип

Selector профессии в Route показывает только сохранённые профессии ребёнка, переключает route context без превращения раздела Route в каталог и без пустых состояний.

---

## 6. Alternative Routes Behavior

### Главный принцип

По умолчанию пользователь видит один маршрут — optimal route.

### Альтернативы

Альтернативные маршруты показываются только по явному действию пользователя:

- “Показать альтернативные маршруты”

### Ограничение

- максимум до 3 альтернативных маршрутов

### Что считается альтернативой

Альтернативный маршрут должен реально отличаться:

- другое учреждение
- другой тип пути
- другая логика progression
- другая geography

Ключевое правило:

- другое учреждение = другой маршрут

### Отображение

- альтернативы показываются как отдельные route variants
- не смешиваются с основным маршрутом
- не превращаются в таблицу сравнения

### Финальный принцип

По умолчанию Route показывает один основной маршрут, а альтернативные маршруты (до трёх) отображаются только по запросу пользователя и только если они реально отличаются по логике или учреждению.

---

## 7. Available Professions Behavior

### Главный принцип

Available professions показывают карьерные исходы текущего маршрута и расширяют понимание возможностей, но не меняют текущую цель автоматически.

### Поведение

Блок открывается только по явному действию пользователя:

- “Доступные профессии”

По умолчанию он скрыт.

### Содержимое

Показывается список профессий:

- доступных из текущего маршрута
- связанных с текущим образовательным путём

Текущая выбранная профессия:

- всегда остаётся в списке
- помечается как Selected

### Формат

- компактный список
- без перегруженных карточек
- без превращения в каталог

Названия профессий:

- должны совпадать с каталогом профессий

### Клик по профессии

При выборе профессии из списка система:

- НЕ переключает текущий маршрут
- НЕ меняет selector
- НЕ пересчитывает route автоматически

Вместо этого:

- ведёт в карточку профессии (каталог)

Дальше пользователь может:

- изучить профессию
- сравнить с текущей
- сохранить её

Только после сохранения эта профессия появляется в Route selector как отдельная route target.

### Финальный принцип

Available professions отображаются как список карьерных исходов текущего маршрута, не меняют активный route context автоматически и при выборе ведут в каталог профессий для изучения и сравнения.

---

## 8. Too-many-options Behavior (UX)

### Главный принцип

Если вариантов слишком много, система не раскрывает список.

### Порог v1

- максимум 10 вариантов

Если вариантов больше 10:

- step не раскрывается

### Вместо списка

Показывается сообщение:

- “Слишком много вариантов — сузьте фильтры”

### Запрещено

- автоматически обрезать список до случайного подмножества
- скрывать часть реальности без явного объяснения

### Роль пользователя

Система предлагает пользователю:

- сузить географию
- изменить ограничения
- уточнить фильтры

### Финальный принцип

Если количество вариантов превышает порог v1 (10), step не раскрывается, а пользователь получает предложение сузить фильтры без автоматического обрезания списка.

---

## 9. Warning / Feasibility UX

### Главный принцип

Risk должен быть виден сразу, но не превращать интерфейс в тревожный экран.

### Где показывается

Warnings / feasibility сигналы показываются:

- на уровне маршрута
- на уровне критичных шагов

### Формат

Используются compact badges, например:

- high competition
- limited places
- low feasibility
- risk of delay

### Поведение

Подробности открываются:

- по нажатию на саму плашку / badge

Не используются:

- отдельные “?” как primary entry point

### Что раскрывается

В раскрытии обязательно есть:

1. Что происходит
2. Почему
3. Что можно сделать

### Жёсткое правило

Warning без рекомендаций = incomplete guidance

### Тон коммуникации

Запрещены формулировки:

- “невозможно”
- “вы не пройдёте”
- “не подходит”

Используются формулировки:

- “есть риск”
- “маршрут выглядит сложным”
- “риск можно снизить через …”

### Финальный принцип

Feasibility и warnings отображаются через компактные плашки, раскрывающиеся по нажатию и содержащие объяснение причин и конкретные рекомендации без перегруза интерфейса.

---

## 10. Explainability UX

### Главный принцип

Пользователь должен понимать, почему показан этот маршрут, но без длинных аналитических полотен.

### Формат

Explainability доступна по запросу пользователя:

- “Почему этот маршрут?”
- “Объяснение”

Она не находится на экране постоянно.

### Структура

Explainability показывает:

1. Что повлияло
2. Почему выбран этот путь
3. Что может изменить маршрут

### Формат подачи

- короткие структурированные блоки
- без длинных текстов
- без “AI-рассуждений”

### Связь с warnings

- warnings = быстрые сигналы
- explainability = полный контекст по запросу

### Финальный принцип

Explainability предоставляется как компактный раскрываемый блок по запросу пользователя и объясняет маршрут структурированно, без перегруза основного интерфейса.

---

## 11. Save / Route Variants UX

### Главный принцип

Пользователь управляет маршрутами, а система не допускает хаоса.

### Saved route

Saved route — это зафиксированный пользователем вариант маршрута.

Он:

- не меняется автоматически
- остаётся стабильным

### Когда появляется новый saved route

Только если:

1. пользователь явно нажал “Сохранить маршрут”
2. пользователь выбрал альтернативный маршрут и сохранил его

### Запрещено

- автосохранять каждый новый вариант
- создавать новый route на каждое изменение

### Где хранятся маршруты

Маршруты хранятся в разделе:

Child Profile → Saved study routes

Это:

- единое место хранения всех маршрутов
- не привязано к текущему экрану Route
- доступно из профиля ребёнка

Важно:

- каждый маршрут связан с конкретной профессией
- но хранится в общем списке профиля

### Как пользователь переключается

Существует два сценария:

#### 1. Внутри Route

Если для текущей профессии есть сохранённые маршруты:

- отображается selector маршрутов
- пользователь может переключаться между ними без выхода из Route

#### 2. Через Child Profile → Saved study routes

Пользователь открывает список всех маршрутов и может:

- выбрать маршрут
- открыть его

После этого система:

- переводит пользователя в Route
- активирует выбранный маршрут
- устанавливает соответствующую профессию как активную

### Принцип

- Route = место работы с маршрутом
- Profile = место хранения маршрутов

### Ограничение

- допустимо ограничение количества saved routes на профессию
- система может предлагать удалить старые маршруты, но не делает это автоматически

### Legacy routes

Legacy маршруты:

- остаются доступны
- помечаются как outdated
- могут быть пересобраны
- после пересборки пользователь может удалить старый маршрут по явному действию

### Финальный принцип

Route Engine позволяет сохранять ограниченное количество route variants, хранит их в Child Profile → Saved study routes и разделяет storage и interaction, сохраняя контроль пользователя и избегая перегрузки интерфейса.

---

## 12. Финальный принцип этапа

UX / Interaction Contract Route Engine строится вокруг одного правила:

- путь должен быть читаемым,
- взаимодействие — предсказуемым,
- риск — видимым,
- объяснение — доступным,
- а пользователь — сохранять контроль без перегруза интерфейса.

## Route-level filters (profession-scoped)

Route filters are scoped per target profession and must NOT exist on the global child route level.

They belong only to the concrete route page:

`/[locale]/app/children/[childId]/route/entry/[targetProfessionId]`

and later to the concrete saved/current route detail surface for the same profession.

### Available filters

The following filters must be available on the route-level page:

- Relocation willingness
- Commune filter
- Learning depth (user-facing layer of `preferred_education_level`)

These filters are duplicated from child/profile truth only as route-scoped controls for exploration and refinement.

### Learning depth

`preferred_education_level` remains the internal technical field.

User-facing presentation on the route page must use human-readable options:

- Fastest path to work
- Balanced path
- Broad future options
- Highest academic depth

Helper text may be shown in small text below the filter when expanded:

"How long and how deeply should this path invest in education before work?"

### Dynamic availability rule

Learning depth options must be dynamically filtered per profession and route family.

Only options that can produce valid and realistic routes for the current profession may be shown.

Examples:
- Doctor -> no "Fastest path to work"
- Driver -> no "Highest academic depth" unless a real valid route exists
- Electrician -> may show multiple valid depths if route reality supports them

### Behavior without active learning-depth filter

If no learning-depth filter is active:

- the system must NOT default to shortest-path-only logic
- the system should prefer realistic route diversity where available
- alternative routes should prioritize materially different education contours before school-only variation

This means alternatives should first reflect different valid programme/education contours, if such contours exist.

### Persistence controls

Route-level filters support two persistence modes:

#### Save locally

- applies only to the current profession route
- does NOT modify child profile truth
- is used for local exploration
- resets automatically when:
  - target profession changes
  - child changes
  - local route session expires

TTL / exact expiry policy is implementation-defined and should be fixed later in execution docs.

#### Save to profile

- writes the selected route filter state into child-profile truth
- affects future route construction across the child profile
- must show confirmation before saving

Suggested confirmation text:

"This will affect future route suggestions across the child profile."

### Override rule

Local route filters override profile-level settings only inside the current profession route session.

They must not silently overwrite profile truth unless the user explicitly chooses "Save to profile".

### Learning depth impact on route selection

Learning depth does not change route construction logic.

It only affects:
- which route contour is selected as primary
- how alternatives are prioritized

---

### Behavior WITHOUT learning-depth filter

If no learning-depth filter is selected:

1. The system must construct the most realistic and complete route first
   (master-spec-first, geography-aware, feasibility-aware)

2. Alternatives must be generated contour-first:
   - shorter path (if valid)
   - broader path (if valid)
   - deeper academic path (if valid)

3. Only after contour-level variation:
   institution-level variation may be shown

This ensures:
- diversity of real educational strategies
- alignment with real-world decision-making
- no collapse into shortest-path bias

---

### Behavior WITH learning-depth filter

If a learning-depth filter is selected:

1. The selected contour becomes the primary route

2. Alternatives are prioritized as:

   a) Same programme / same structure, different institutions

   b) Neighbouring valid contours (if realistic and allowed)

---

### Constraint

Learning depth must never produce routes that do not exist in reality.

If only one valid contour exists:
- filter options must be reduced accordingly
- no artificial alternatives should be generated

### Alternative route explanation baseline

Alternative routes do not require a heavy explanation layer in baseline v1.

Minimal explanation through:
- contour/depth badge
- study time
- existing route signals

is sufficient.

The system supports family understanding and preparation, but does not replace counselor interpretation.
