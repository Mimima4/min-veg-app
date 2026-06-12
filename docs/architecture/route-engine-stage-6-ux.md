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
- Route outcome filter (user-facing layer of `preferred_education_level`)

These filters are duplicated from child/profile truth only as route-scoped controls for exploration and refinement.

**Governance:** catalog, ordering, and matcher contract are locked in `phase-4-route-outcome-filter-owner-decision-record.md`.

### Route outcome filter

`preferred_education_level` remains the internal technical field (`filter_id`).

User-facing labels must be **short Norwegian copy** (no instruction-style helper wall). Display order for barn/ungdom:

| `filter_id` | UI label (nb) |
|-------------|---------------|
| `open` | Åpen / Ikke valgt ennå |
| `fast_to_work` | Kort vei til fagbrev |
| `vg3_before_apprenticeship` | Velg fag på VG3 før læretid |
| `fagskole_after_vgs` | Fagskole etter VGS (1–2 år) |
| `long_academic` | Lang og spesialisert utdanning |
| `flexible` | Vis meg ulike realistiske veier |
| `pabygging_studiekompetanse` | Påbygging til generell studiekompetanse |

**Child / barn rules:**
- `pabygging_studiekompetanse` is **disabled** on child profiles and child route filters (separate etter-VGS contour).
- `fagskole_after_vgs` may appear as informational / neste steg; primary VGS construction remains VG1→VG2→(VG3)→lære.

Retired IDs (do not use in new UI): `practice_first`, `keep_study_options`, `short_after_vgs`, `school_then_work` — see owner record §2.

### Dynamic availability rule

Route outcome filter options must be dynamically filtered per profession and route family.

Only options that can produce valid and realistic routes for the current profession may be shown.

Examples:
- Lege / doctor path family -> no `fast_to_work`
- Driver -> no `long_academic` unless a real valid route exists
- Electrician / mechanic -> may show multiple valid filters when route reality supports them

### Behavior without active route-outcome filter

If no route-outcome filter is active (`open`):

- the system must NOT default to shortest-path-only logic
- the system should prefer realistic route diversity where available
- alternative routes must differ by **`filter_id`**, not near-duplicate path variants
- default alternative ordering (yrkesfag canon `fast_to_work`): **VG3 før læretid → fagskole etter VGS → lang og spesialisert utdanning**
- institution-level variation comes only after contour-level (`filter_id`) variation

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

### Route outcome filter impact on route selection

The filter does **not** replace the route engine or Vilbli truth pipeline.

It **does** determine:
- which **path contour / variant** is selected as primary (when implemented)
- how **alternatives** are prioritized (by different `filter_id`)
- **NAV / STYRK matcher scope** for the active profession route (when implemented)

Until matcher and contour wiring land, the field may still affect signature/staleness, legacy profession-fit pages, and display only — see owner record implementation note.

---

### Behavior WITH route-outcome filter

If a route-outcome filter is selected:

1. The selected `filter_id` contour becomes the primary route

2. Alternatives must use **other valid `filter_id` values** from the catalog (per owner record §3), in distance order from canon

3. Within the same `filter_id`, institution-level variation may be shown

---

### Constraint

Route outcome filter must never produce routes that do not exist in reality.

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
