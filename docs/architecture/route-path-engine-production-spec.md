Status: LOCKED BASELINE v1 (Production direction confirmed)
Route / Path Engine — Production Spec (Actualized)
0. Статус блока
Статус: production-minded прототип, проектируемый сразу как боевой блок.
Это означает:
* логика, структура, роли данных и поведение задаются сразу как production-grade;
* блок не проектируется как временная web-фича или промежуточная демо-логика;
* все решения должны быть:
    * server-truth,
    * mobile-ready,
    * institution-ready,
    * automation-ready;
* допустимы уточнения:
    * формул,
    * порогов,
    * UX-текста,
    * внутренних моделей,но не возврат к упрощённой “каталожной” или “временной” логике.
Route / Path Engine должен мыслиться как shared backend/domain block, а не как web-only UX-надстройка.

1. Главная цель блока
Цель блока — не просто показать профессии и не просто дать ещё один экран про образование.
Цель блока:
построить для конкретного ребёнка реалистичный, объяснимый, редактируемый и автоматически пересчитываемый путь к выбранной профессии в контексте Норвегии.
Этот путь должен:
* учитывать самого ребёнка;
* учитывать семью и её ограничения;
* учитывать устройство норвежского образовательного маршрута;
* учитывать учебные заведения, программы и ступени;
* учитывать доступность мест и конкуренцию;
* учитывать дальнейшие альтернативные профессии, которые открываются через выбранный путь;
* автоматически пересчитываться при изменении входных данных;
* быть пригодным для web, future native iOS и future native Android без смены ядра логики.

2. Главный продуктовый принцип
Пользователю не показывается “система образования как теория”.
Пользователю показывается:
* рекомендованный путь;
* реалистичные альтернативы;
* доступные профессии из уже выбранного пути;
* настройки, которые меняют маршрут.
Внутри системы может жить сложная доменная модель:
* route templates;
* route stages;
* stage requirements;
* scoring;
* fit;
* feasibility;
* demand;
* route generation;
* evidence ingestion;
* recalculation logic.
Но для пользователя всё должно складываться в ответ на простой вопрос:
“Что дальше делать, если мы хотим прийти к этой профессии?”

3. Место блока в продукте
Это не кнопка на карточке профессии.
Это отдельный top-level раздел рядом с текущими разделами:
Profile | Family | Professions | Route
Логика разделения:
* Professions — место, где семья работает с профессиями и сохраняет подходящие;
* Route — место, где из уже сохранённых профессий строятся, сравниваются, сохраняются и переоцениваются пути.
Таким образом Route:
* не размывает каталог профессий;
* не превращается в вторичный экран карточки;
* становится самостоятельным режимом планирования.

4. Кто и с чем попадает в Route
В Route попадают только сохранённые профессии.
Это жёсткое правило.
Если профессия не сохранена, она не должна становиться входом в route engine.
На странице Route обязательно есть пояснение, что:
* здесь показываются пути только для сохранённых профессий;
* чтобы строить и сравнивать маршруты, профессию нужно сначала сохранить.
Это важно, потому что:
* не размывается сценарий;
* route engine не строит бесконечные маршруты “на всё подряд”;
* блок остаётся инструментом принятия решений, а не каталогом.

5. Верх страницы Route
Верх страницы содержит selector профессии.
Этот selector показывает только сохранённые профессии конкретного ребёнка.
Логика:
* одна профессия выбрана как текущая;
* другие сохранённые доступны через dropdown;
* вне saved-layer ничего не подтягивается.
Это удерживает фокус и не даёт Route превратиться в ещё один браузер профессий.

6. Основной UX-принцип маршрута
6.1. Базовый режим
Маршрут живёт по горизонтали.
Но не как абстрактная схема “образование → работа”, а как набор реальных рабочих шагов.
Изначально маршрут отображается как нумерованные шаги:
* Сейчас
* Шаг 1
* Шаг 2
* Шаг 3
* и далее по необходимости
Почему не подписывать каждый шаг заранее крупным термином:
* состав маршрута у разных профессий разный;
* первый шаг может быть VGS;
* следующий шаг может быть:
    * apprenticeship,
    * university,
    * høyskole,
    * fagskole,
    * requalification,
    * direct work entry;
* пользователь сам раскрывает шаг и видит его конкретное содержание.
6.2. После выбора
Когда шаги определены, маршрут превращается в горизонтальный конструктор из маленьких понятных блоков.
Примеры:
* VGS Voss · VG2
* Høyskole Bergen · Bachelor
* Work entry
или:
* VGS Oslo · VG1
* Læreplass
* Fagbrev
* Work
Смысл:
* сначала интерфейс помогает собрать путь;
* потом показывает его как собранную, читаемую и управляемую структуру.

7. Изначальное состояние маршрутов
Маршрут не должен быть пустым.
Для каждой сохранённой профессии система должна сразу показывать:
* оптимальный маршрут;
* уже собранный;
* в виде маленьких блоков;
* с возможностью раскрыть любой шаг и посмотреть альтернативы.
Это ключевой принцип:
пользователь не должен приходить в пустой конструктор и думать с нуля.

8. Каждый шаг маршрута — управляемый узел
Каждый шаг — это не просто блок, а выбираемый узел.
У каждого шага есть:
* текущая выбранная опция;
* альтернативные варианты;
* статус:
    * optimal,
    * recommended,
    * alternative.
При раскрытии шаг выпадает вниз, а не раздвигает маршрут в стороны.
Это нужно, чтобы:
* не ломать обзор;
* не захламлять экран;
* не превращать Route в таблицу.

9. Учебные заведения учитываются вместе с программой и ступенью
Это одно из самых жёстких правил блока.
Нельзя мыслить маршрут как:
* “школа”,
* “институт”,
* “колледж”.
Нужно мыслить его как:
учреждение + программа + ступень/этап
Примеры:
* VGS Voss · VG2
* VGS Bergen · Vg1 Health
* University College X · Bachelor track
* Fagskole Y · Technical programme
Почему это критично:
* одно и то же заведение может вести в разные траектории;
* программа и ступень влияют на то, подходит ли путь к профессии;
* для VGS это особенно важно, потому что route строится не по “школе вообще”, а по конкретной программе и trinn.

10. Образовательное покрытие блока
Route engine должен уметь строить пути не только через “школа → университет”.
Он должен покрывать весь релевантный для Норвегии образовательный и карьерный ландшафт.
Как минимум:
* VGS;
* apprenticeship / læreplass;
* university;
* høyskole / university college;
* fagskole;
* requalification / later education;
* direct work entry.
Не каждая профессия будет использовать все эти типы шагов, но движок обязан уметь работать с ними как с допустимыми route components.

11. Фильтры маршрута
11.1. Где они находятся
Фильтры находятся над маршрутом, а не под ним.
Причина:
* сначала ограничиваем пространство решений;
* потом строим маршрут.
Иначе:
* пользователь получает простыню нерелевантных учреждений;
* route engine начинает показывать пол-страны;
* экран теряет управляемость.
11.2. Откуда берутся значения по умолчанию
Начальные значения фильтров берутся из профиля ребёнка.
Это значит:
* Route не стартует с пустых допущений;
* он использует уже существующие настройки семьи и ребёнка.
11.3. Как меняются фильтры
Изменения на Route page изначально локальны для текущего маршрута.
Но есть отдельная кнопка:
* Save to profile
Если пользователь её нажимает:
* route assumptions записываются обратно в профиль ребёнка;
* это может повлиять на рекомендации в других местах продукта.
11.4. Подтверждение сохранения в профиль
Перед сохранением обязательно нужно предупреждение, что:
* изменения затронут профиль ребёнка;
* это может изменить рекомендации в других частях системы.
Сообщение должно быть человеческим, а не техническим.

12. Показ альтернативных профессий
Alternative professions не должны постоянно висеть под маршрутом.
Они открываются через отдельную кнопку/режим, например:
* Available professions
После открытия пользователь видит dropdown/список профессий, которые становятся доступны из текущего маршрута.
Правила:
* текущая выбранная профессия всегда остаётся в списке;
* даже если после изменения маршрута она стала не optimal, а alternative, она не исчезает;
* на ней появляется соответствующий маркер:
    * Selected
    * Alternative
Ранжирование:
* сверху самые сильные / рекомендуемые;
* ниже более слабые / широкие.

13. Альтернативные маршруты
По умолчанию система показывает один главный маршрут.
Если пользователь хочет расширить обзор, он нажимает кнопку вроде:
* Show alternative routes
После этого система показывает до трёх реальных альтернативных маршрутов.
Важное правило
Эти маршруты не должны быть косметическими копиями.
Разница должна быть реальной:
* другое учебное заведение;
* другой VGS/program/stage path;
* другой тип следующего шага;
* другая географическая логика;
* другой route template.
Критически важно:
другое учреждение = другой маршрут.
Даже если программа и путь логически похожи, для семьи это другой маршрут, потому что меняется:
* место,
* среда,
* реалистичность,
* доступность,
* жизненный контекст.

14. Если вариантов слишком много
Если на шаге после текущих фильтров получается 10–15 или больше вариантов:
* не показываем простыню;
* не заставляем пользователя скроллить;
* показываем предупреждение:
    * сузьте фильтры.
Логика:
* возможно, не указана география;
* возможно, assumptions слишком широкие;
* система не должна предлагать пол-страны, если это уже не помогает принять решение.

15. Сохранение маршрутов
Каждый маршрут можно:
* сохранить;
* позже удалить.
Сохранённые маршруты отображаются у ребёнка в:
* Saved study routes
Из профиля ребёнка можно открыть любой сохранённый маршрут и перейти прямо в Route.
Важно
Сохранённый маршрут:
* не frozen snapshot;
* остаётся полностью редактируемым;
* внутри него доступны фильтры и выборы шагов.
Но если пользователь меняет существенный пункт:
* это уже новый маршрут;
* его можно сохранить отдельно.
Это критично для контроля, истории решений и сравнения вариантов.

16. Главный принцип scoring
Система не считает “лучшее образование вообще”.
Она считает:
наиболее реалистичный и подходящий путь к выбранной профессии для конкретного ребёнка в текущих условиях.

17. Route scoring model
Общая формула:
Total Route Score = Fit + Feasibility + Constraints Match + Route Relevance + Efficiency + Demand Outlook
Baseline weights v2:
* Fit = 30
* Feasibility = 25
* Constraints Match = 20
* Route Relevance = 15
* Efficiency = 5
* Demand Outlook = 5
Это production-minded baseline, который ещё может калиброваться, но уже задаёт жёсткую структуру.

18. Fit
Fit — это не ручное поле и не пара тегов от родителя.
Fit — это агрегированный профиль ребёнка.
В Fit входят:
* parent input;
* school data;
* test results;
* grades;
* school uploads;
* counselor/school-side structured inputs;
* history of child profile.
18.1. Parent input остаётся всегда
Ручное заполнение родителями обязательно остаётся в системе.
Но оно не должно быть:
* единственным источником,
* доминирующим источником на старших этапах.
18.2. birth_year учитывается всегда
birth_year обязателен и всегда влияет на:
* stage weighting;
* expected school stage;
* eligibility windows;
* вес источников в fit;
* видимость некоторых блоков в UI.
18.3. Возрастной сдвиг влияния
По мере взросления ребёнка:
* возрастает вес school/test evidence;
* снижается относительная доминация только родительского описания.
Прототип baseline
До 8 класса:
* parent input имеет сильный вес;
* school/test signals используются осторожнее.
С 8 класса:
* school grades/results становятся сильно значимыми;
* test/structured evidence резко усиливаются.
В VGS и дальше:
* объективные результаты и progression data становятся ещё важнее.
18.4. Разделение склонностей и доказанных результатов
Это два разных слоя и их нельзя смешивать.
Inclinations / interests
Это:
* что ребёнку нравится;
* к чему тянется;
* что выбирает;
* что вызывает вовлечение.
Proven performance / evidence
Это:
* реальные оценки;
* тесты;
* структурированные школьные результаты;
* подтверждённые академические сигналы.
18.5. Age gating для evidence block
Блок Documented strengths / academic evidence не должен показываться родителям слишком рано.
Правило:
* до 8 класса он в UI скрыт;
* внутри системы данные могут копиться, но не подаются как отдельный “академический блок” для семьи;
* с 8 класса блок становится видимым;
* в VGS становится полноценной значимой частью decision layer.
18.6. Time decay weighting
Старые сигналы не должны жить вечно с одинаковым весом.
Нужно использовать time decay weighting:
* более свежие данные сильнее;
* старые неудачи постепенно теряют влияние;
* устойчивые повторяющиеся сигналы затухают медленнее.
Это защищает от “ошибок прошлого”.
Time decay применяется в developmental interpretation layer и не отменяет formal cumulative admission reality.
18.7. Late bloomer / emerging talent detection
Система должна отслеживать ускоренный рост в конкретной области.
Если у ребёнка:
* за последние месяцы идёт рост выше собственного базового темпа,
* система отмечает навык как Emerging Talent или Accelerating.
Это:
* усиливает вес навыка в fit;
* помогает не занижать ребёнка старой историей;
* позволяет маршрутам реагировать на развитие, а не консервировать прошлое.
18.8. Controlled exploration
Система должна иметь exploration layer:
* не зацикливаться только на текущем узком профиле;
* иногда подмешивать смежные, но реалистичные направления.
Но это должен быть controlled exploration, а не случайные джокеры.

19. Feasibility
Feasibility — это реалистичность маршрута.
В него входят:
* наличие мест;
* конкуренция;
* admission pressure;
* риск не попасть сразу;
* риск застрять;
* наличие læreplass, если маршрут этого требует.
Это не “позже” и не декоративный коэффициент.Он должен быть в системе с первого дня.
19.1. Пороговые зоны
Прототип baseline:
* 70–100 → normal
* 50–69 → medium risk
* 30–49 → high risk
* 0–29 → critical
19.2. UI-правило
Если Feasibility низкий, система показывает яркую розовую warning badge на маршруте и/или на критическом шаге.
Она должна ясно сигнализировать:
* high competition,
* limited places,
* low route feasibility,
* possible delay risk.
19.3. Если очень низкий
Если feasibility критически слабый:
* маршрут может остаться видимым,
* но не может становиться Optimal.

20. Constraints Match
Это соответствие ограничениям семьи.
Сюда входят:
* география;
* готовность к переезду;
* готовность расширить регион позже;
* предпочтение более короткого или длинного пути;
* openness to apprenticeship;
* openness to higher education.
Главное правило
Фильтры пользователя сильнее рекомендаций системы.
Если семья не готова к переезду, система не должна “перехитрить” пользователя и уводить маршрут в другой конец страны просто потому, что там красивее score.

21. Route Relevance
Это соответствие образования выбранной профессии.
Сюда входит:
* подходит ли программа к профессии;
* подходит ли конкретная ступень;
* прямой ли это путь или более широкий;
* primary это этап или alternative.
Must-have rule
Если программа или ступень не подходит профессии, это:
* hard filter,
* а не мягкий штраф.

22. Efficiency
Efficiency оценивает:
* длину маршрута;
* количество переходов;
* время до первого реального входа в профессию.
Вес низкий, потому что:
* короткий путь не всегда лучший;
* efficiency не должен побеждать fit и feasibility.

23. Demand Outlook
Этот фактор учитывает:
* спрос на профессию;
* стабильность;
* зарплатные сигналы;
* labour outlook.
Вес низкий, потому что на уровне конкретного ребёнка важнее:
* fit,
* feasibility,
* constraints.
Но demand обязателен и должен обновляться регулярно.

24. Hard filters и soft penalties
Hard filters
Маршрут или шаг не показываются, если:
* путь структурно невалиден;
* программа не ведёт к профессии;
* нарушены жёсткие пользовательские ограничения;
* вариантов слишком много и сначала надо сузить фильтры.
Soft penalties
Маршрут можно показывать, но понижать, если:
* конкуренция высокая;
* мест мало;
* маршрут длиннее;
* риск выше;
* география хуже совпадает;
* путь менее прямой.

24A. Route / Path Engine — Pedagogical Safety, Explainability, Stability and Progressive Activation
Это обязательный guardrail layer внутри основного Route Engine spec.
Это не appendix, не optional note и не future add-on.
Этот раздел — единый source of truth для safety/explainability/stability правил.
Повторяющиеся упоминания в других секциях считаются только контекстом и не могут противоречить этому слою.

1. Pedagogical Safety Layer
* Route engine не может коммуницироваться как финальный verdict о ребёнке.
* Формулировки в UI и API должны быть guidance-oriented, а не label-oriented.
* Нельзя использовать language patterns, которые фиксируют ребёнка как “неподходящего навсегда”.

1A. 3-layer interpretation model (mandatory)
* Любая интерпретация route outcome обязана раскладываться на три слоя:
  * Aspiration layer (куда ребёнок и семья хотят двигаться),
  * Readiness layer (текущая подготовленность и динамика),
  * Admission reality layer (формальные и рыночные ограничения входа).
* Эти три слоя не схлопываются в один final verdict.
* Ни UI, ни API, ни внутренние decision outputs не должны трактовать их как “один итоговый приговор”.
* Конфликт между слоями решается через explainability и alternatives, а не через стирание aspiration layer.

2. Explainability Layer
* Каждый route outcome должен иметь объяснение: какие факторы повысили/понизили результат.
* Объяснение должно быть traceable до групп факторов (fit, feasibility, constraints, relevance, efficiency, demand).
* Система обязана давать понятные причины изменения статуса между optimal/recommended/alternative.

3. Feasibility Communication Layer
* Feasibility должен показываться как риск и условия, а не как запрет мечты.
* Низкий feasibility требует явной коммуникации причин (competition, capacity, geography, progression risk).
* При низком feasibility система обязана показывать, что можно изменить, чтобы улучшить реализм маршрута.
* Hard rule: warning without improvement guidance is incomplete guidance.
* Обязательный output block: What improves this route.
* Block What improves this route должен содержать конкретные, выполнимые улучшения, а не общие советы.

4. Interest vs Evidence Conflict Layer
* Интерес ребёнка не удаляется из модели при конфликте с evidence.
* Конфликт интереса и evidence решается через понижение ранга/статуса и альтернативы, а не через стирание aspiration.
* В конфликтных кейсах система обязана сохранить видимость выбранной профессии и объяснить компромисс.

5. Stability Layer
* Route UX должен быть стабильным для семьи и не менять рекомендацию без значимого изменения входных данных.
* Незначительные колебания сигналов не должны вызывать резкие прыжки статусов.
* Смена статуса должна сопровождаться объяснением “что изменилось”.
* Для каждой выбранной профессии должен существовать Baseline Route как reference snapshot.
* Recalculation делится на:
  * silent recalculation (внутренний пересчёт без видимого изменения),
  * visible change (изменение, показанное семье).
* Not every recomputation becomes visible.
* Material route shift (изменение ключевого шага, статуса маршрута или критичных предупреждений) должен быть явно помечен и объяснён.
* Должен применяться weekly visibility threshold: мелкие weekly флуктуации не публикуются как отдельные “новые решения”.

6. Progressive Activation Layer
* Более чувствительные и сложные блоки активируются прогрессивно по stage/age readiness.
* До достаточной зрелости контекста система не должна перегружать семью heavy analytical layers.
* Progressive activation — обязательное правило product behavior, а не UI-опция.
* Demo и trial — разные activation states и не должны смешиваться в одной логике ожиданий.
* First meaningful route must appear before heavy setup.
* Advanced evidence не может быть mandatory upfront.
* Система обязана поддерживать quick-start route и enriched route как разные режимы зрелости маршрута.
* Magic moment rule: пользователь должен увидеть практическую ценность маршрута до глубокого онбординга данных.

7. Data Realism Layer
* Route engine обязан явно различать: что подтверждено данными, а что является допущением.
* Missing data не может маскироваться как high-confidence conclusion.
* При недостатке данных система должна честно снижать уверенность и сообщать об этом.
* Feide трактуется как identity/access federation, а не как grade/test source.
* School evidence automation зависит от внешних интеграций, vendor cooperation и institutional agreements.
* V1 ingestion boundary обязан быть явно ограничен и задокументирован.
* No fake automation promise: нельзя обещать автоматический сбор данных, если для него нет подтверждённого интеграционного контура.

7A. Confidence Framing
* Route confidence states обязательны:
  * early signal,
  * developing picture,
  * stronger evidence-backed route.
* Certainty must scale with evidence quality.
* При низком качестве/полноте evidence система не может коммуницировать high certainty.

8. Legal / Governance Layer
* Route engine работает как decision-support, не как автоматизированное административное решение о доступе ребёнка.
* Human oversight обязателен для high-impact интерпретаций и спорных кейсов.
* Все критичные правила ранжирования и фильтрации должны быть audit-friendly и governance-ready.

9. Offline Bridge Layer
* Система должна поддерживать “bridge to human conversation”: родитель/ребёнок/школа могут обсуждать route outcome офлайн.
* Объяснения должны быть пригодны для переноса в консультацию с counselor/teacher без потери смысла.
* Route output не должен закрывать возможность профессиональной человеческой корректировки.
* Consultation Export — обязательный supported output layer.
* Consultation Export включает:
  * selected profession,
  * current route,
  * assumptions,
  * warnings,
  * route explanation,
  * alternatives,
  * open discussion points.

10. Time Decay and Late Bloomer Safety
* Time decay обязателен, чтобы старые слабые сигналы не замораживали траекторию.
* Late bloomer detection обязателен, чтобы ускоренный прогресс мог поднять релевантность путей.
* Система не должна закреплять “ранний снимок” ребёнка как постоянный прогноз.
* Time decay может влиять на developmental interpretation, но не может стирать formal cumulative admission reality.
* Emerging talent — development signal, а не identity label и не deterministic tag.

11. Innovation Value Guardrail
* Любая новая модель/фактор допускается только если улучшает explainability, stability или realism, а не усложняет ради новизны.
* Инновации не могут нарушать педагогическую безопасность и human-oversight требования.
* При конфликте “сложнее модель vs яснее решение” приоритет у ясности и управляемости.
* Route Engine обязан выявлять non-obvious but plausible adjacent paths, а не только структурировать уже очевидные выборы семьи.

12. Profession-layer realism teaser
* В profession-facing слое должны быть краткие реалистичные подсказки: путь возможен, при каких условиях, с какими рисками.
* Teaser не должен обещать outcome без route-level контекста.
* Teaser обязан сохранять aspiration, но не создавать ложную определённость.

13. Final rule of this layer
* Если любое локальное правило в Route Engine конфликтует с этим guardrail layer, приоритет всегда у этого слоя.
* Любая имплементация scoring, ranking, UI copy, ingestion и automation должна быть проверяема на соответствие пунктам 1–12 и подпунктам 1A/7A до production rollout.

25. Источники данных
Для production readiness блок должен собирать максимально широкий и объективный набор норвежских источников.
Принцип: official и integrated data при наличии имеют приоритет; unsupported/non-integrated sources не могут подаваться как automated truth.
Education structure / route logic
* Udir
* vilbli
* Samordna opptak
School / child assessment
* grades
* school files
* national tests
* structured school exports
* supported school-system data via automated ingestion
* counselor/school-side structured evidence where applicable
Labour market / demand
* NAV
* SSB
* other official Norwegian education/labour datasets where relevant
Identity / integration layer
Primary automation priority:
* Feide
Feide используется как identity/access federation слой.
Feide не является direct source для grades/tests и не должен трактоваться как такой источник.
Дополнительно нужно учитывать official institution-level identifiers:
* organization-level identifiers,
* municipality/county references,
* school registry identity where relevant.
Class-level ingestion
Teacher / rådgiver должен иметь возможность запускать импорт сразу по целому классу, а не по одному ребёнку.
Ограничение v1:
* automation school evidence работает только в границах подтверждённых интеграций, vendor cooperation и institutional agreements;
* неподключённые источники остаются manual/semi-structured;
* запрещено обещать full automation вне подтверждённого integration perimeter.

25A. NAV / Vilbli boundary (route truth)
* Route anchor truth остаётся внутренним: saved target profession + server-side route snapshot.
* Для VGS route structure и school/programme availability primary truth = Vilbli (+ canonical school identity via NSR).
* NAV используется для taxonomy alignment, labour enrichment и user-facing normalization; NAV не является primary truth для VGS structure/availability.
* `apprenticeship_step.source_outcome_url` обязан выбирать most specific Vilbli profession-branch outcome scope; broad education-area yrker URL допускается только как fallback.
* Structural route variant choice (например direct-bedrift) не должен автоматически расширять outcome scope до broad URL.
* Mapping `Vilbli outcome -> normalized profession identity (incl. NAV alignment)` должен быть server-side mapping responsibility, а не UI responsibility.
* Available professions must remain within selected/resolved Vilbli branch outcome scope; NAV enrichment cannot broaden the educational outcome set.
* UI не маскирует broad-scope ошибки; корректность должна фиксироваться в snapshot generation/mapping logic.

26. Refresh logic
Weekly recalculation
Раз в неделю пересчитываются:
* aggregated child profile;
* fit signals;
* route ranking;
* available professions from route;
* relevance of saved routes.
### Event-triggered recalculation (material-only)

Пересчёт выполняется сразу только при поступлении существенных (material) изменений данных.

К таким изменениям относятся:

- успешная обработка (ingestion) значимого school evidence
  (оценки, тесты, полноценные отчёты)

- успешная обработка значимых обновлений academic данных
  (не единичные/частичные изменения, а влияющие на профиль ребёнка)

- изменения профиля, влияющие на route assumptions
  (ограничения, география, ключевые настройки)

- действия пользователя внутри Route
  (смена фильтров, выбор шагов, смена профессии)

---

### Важно

Не каждое обновление school data запускает мгновенный пересчёт.

Если данные:

- частичные
- сырые
- не прошли нормализацию
- не оказывают существенного влияния

-> они обрабатываются в рамках планового (weekly) пересчёта.

---

### Принцип

Event-triggered recalculation применяется только тогда, когда:

-> новые данные реально могут изменить маршрут

Во всех остальных случаях:

-> используется controlled recalculation (weekly),
чтобы избежать дерготни системы и перегрузки.
Monthly external refresh
Раз в месяц обновляются:
* labour market signals;
* demand signals;
* salaries/stability layers;
* competition / admission pressure;
* education availability data.
Operational visibility rule:
* не каждый пересчёт становится видимым изменением для семьи;
* видимыми становятся только material route shifts по правилам секции 24A (Stability Layer);
* мелкие weekly флуктуации остаются в silent recalculation.

27. Data model базового production слоя
Минимально согласованный доменный набор:
* child_evidence_inputs
* child_aggregated_signals
* profession_route_templates
* profession_route_stages
* programme_stage_requirements
* route_filter_profiles
* built_routes
* built_route_steps
* built_route_available_professions
* route_scoring_snapshots
* programme_competition_signals
* profession_demand_signals
Плюс переиспользуются текущие:
* child_profiles
* professions
* education_institutions
* education_programs
* profession_program_links

28. Route generation algorithm
Алгоритм работает так:
1. взять сохранённую профессию;
2. определить допустимые route templates;
3. собрать candidate routes;
4. применить hard filters;
5. убрать невалидные и слабые варианты;
6. посчитать route score;
7. выбрать один optimal route;
8. выбрать до трёх alternatives;
9. подготовить step options для UI;
10. подготовить available professions из текущего route;
11. сохранить / обновить route variant.
Важная граница
Сначала:
* строим допустимые маршруты.
Потом:
* оцениваем их.
Нельзя пытаться “выбрать лучший” из маршрутов, которые вообще невалидны.

29. Conflict + Decision Matrix
Этот слой обязателен, чтобы система не была чёрным ящиком.
Система должна уметь решать конфликты между:
* интересом;
* доказанными результатами;
* родительскими предпочтениями;
* school/test evidence;
* feasibility;
* constraints;
* выбранной профессией;
* route outcome.
Ключевые правила
* интерес не стирается, даже если route становится менее реалистичным;
* сохранённая профессия не исчезает из списка, даже если стала alternative;
* критически слабый feasibility не может стать optimal;
* жёсткие family constraints сильнее рекомендаций системы;
* parent input учитывается всегда, но после 8 класса не должен перекрикивать объективные результаты.
* интерпретация конфликтов обязана сохранять разделение Aspiration/Readiness/Admission Reality слоёв из секции 24A.

30. Automation readiness
Этот блок должен мыслиться как автоматически работающий.
Это означает:
* child profile автоматически агрегируется;
* scoring автоматически пересчитывается;
* routes автоматически перестраиваются;
* low-feasibility состояния автоматически подсвечиваются;
* saved routes автоматически переоцениваются на weekly basis;
* demand и competition overlays автоматически обновляются.
Это не должен быть “ручной инструмент для оператора”.
Школьный слой может подавать данные и запускать импорт, но decision engine должен работать автоматически.
Ограничение:
* automation readiness не означает universal data availability;
* если integration evidence отсутствует, система обязана работать в guarded mode с явно сниженной confidence framing (см. 24A).

31. Роли и слои пользователей
Family
Семья:
* выбирает и сохраняет профессии;
* открывает Route;
* меняет filters;
* сохраняет маршруты;
* просматривает альтернативы.
School
Школа / teacher / counselor:
* загружает сигналы;
* инициирует imports;
* влияет на aggregated child profile через evidence;
* не ломает семейную модель владения.
Важная правка
Система не должна рассчитывать на ручные комментарии или постоянное ручное заполнение учителями как на основу модели.
Школьный слой нужен в первую очередь как:
* источник данных,
* источник structured exports,
* batch-ingestion actor,
* Feide-linked integration point.
Kommune / fylke / owner
Эти слои:
* не вмешиваются в конкретные child decisions как операторы маршрута;
* получают aggregated analytics,
* population-level trends,
* system-level patterns.

32. UX-правила блока
1. Не перегружать пользователя теорией системы образования.
2. Показывать не “структуру”, а решение.
3. Сначала показывать один оптимальный путь.
4. Альтернативы — только по явному действию.
5. Выпадающие списки должны открываться вниз.
6. Горизонтальный маршрут должен оставаться чистым.
7. Если результатов слишком много — не показывать шум, а просить сузить фильтры.
8. Сохранённая профессия всегда остаётся видимой, даже если стала alternative.
9. Сохранённый маршрут остаётся редактируемым.
10. Изменение существенного шага создаёт новый route variant.
11. Evidence block не показывается слишком рано родителям.
12. Низкий feasibility всегда заметен.

33. Что уже зафиксировано как обязательное
* отдельная вкладка Route;
* только сохранённые профессии;
* оптимальный маршрут по умолчанию;
* каждый шаг раскрываемый и выбираемый;
* учёт учреждения + программы + ступени;
* filters над маршрутом;
* available professions как отдельный dropdown;
* alternative routes через отдельную кнопку;
* низкий feasibility подсвечивается розовой warning badge;
* fit — агрегированный профиль, а не только parent tags;
* birth_year учитывается всегда;
* evidence block age-gated;
* weekly recalculation + event-triggered refresh;
* monthly refresh внешних сигналов;
* time decay weighting;
* late bloomer detection;
* controlled exploration layer;
* другое учреждение = другой маршрут;
* Feide-first identity/access direction;
* school evidence automation только в рамках confirmed integrations / vendor cooperation / institutional agreements;
* batch import whole class как product requirement в пределах supported ingestion boundary;
* production-first, not MVP-first.

34. Что ещё остаётся открытым, но не ломает модель
Это уже не дыры, а следующие слои точной калибровки.
Детали вынесены в отдельный документ:
docs/architecture/route-engine-next-steps.md
Это ожидаемые рабочие уточнения, а не пересмотр основы.

35. Финальная формулировка блока
Route / Path Engine — это Norway-first, production-ready decision-support layer, который на основе агрегированного профиля ребёнка, возраста и школьного этапа, семейных ограничений, образовательной структуры, доступности мест, конкуренции и рынка труда строит, оценивает, обновляет и сохраняет реалистичные пути к сохранённым профессиям, объясняет результаты, помогает интерпретировать риски и альтернативы, поддерживает принятие решений, показывает альтернативные маршруты и доступные профессии из выбранного пути, автоматически пересчитывается при изменении данных и проектируется как shared backend/domain block для web и будущих native clients.

36. Адаптация под native
Адаптировать сам концепт не нужно.
Нужно только жёстко соблюдать 3 правила:
36.1. Не привязывать route logic к page-flow
Маршрут не должен зависеть от:
* query params,
* page state,
* local UI hacks.
36.2. Все route states должны быть сериализуемыми
Чтобы native-клиент мог:
* открыть saved route;
* редактировать его;
* сохранить новый вариант;
* получить те же scoring results.
36.3. UI должен быть headless-friendly
Web и native могут рисовать маршрут по-разному, но получать один и тот же:
* built route,
* step options,
* warnings,
* available professions.
Короткий вывод
Концепт адаптировать не нужно.Нужно с самого начала держать его как shared backend/domain block, а не как web-only feature.

---

37. Implementation boundary (v1)

Execution scope первой реализации Route / Path Engine зафиксирован отдельно:

docs/architecture/route-engine-implementation-boundary-v1.md

Этот документ определяет:
* что именно входит в первый production execution slice,
* что сознательно не реализуется в v1,
* порядок реализации и технические границы.

Главный spec остаётся source of truth для:
* продуктовой логики,
* доменной модели,
* педагогических и governance правил.

Implementation boundary документ не изменяет core spec, а ограничивает первую фазу реализации.
