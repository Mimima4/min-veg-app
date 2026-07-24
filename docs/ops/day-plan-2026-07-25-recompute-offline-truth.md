# План на день — 2026-07-25 — Офлайн-истина recompute (Vilbli path + Entur)

| Поле | Значение |
|------|----------|
| **Дата** | **2026-07-25** (суббота) |
| **Статус** | **ЗАПЛАНИРОВАНО** — указание владельца 2026-07-24 |
| **Правило продукта** | Пользователь не ждёт живой Vilbli/Entur при обычном открытии/пересчёте маршрута; каждый пользователь равноценен |

---

## Почему этот день (цепочка решений)

### Что произошло

1. Локально кратков были **~90–130 с** на `/app/family` и `/app/route` после Contour B rename + ночных relay. Прод казался нормальным. Причина всплеска — **прерывистая латентность Supabase/PostgREST**, не docs-коммит dual-VG1. Позже dev снова ~1–3 с на страницах.
2. Отдельно **`trigger-study-route-recompute` всё ещё ~5–47 с** в обычной работе. Владелец спросил: если Vilbli уже в бэкенде ~2×/год, почему recompute долгий?
3. Агент слишком рано увёл в «очередь на экране» и предположил, что Entur уже грузится по расписанию. Владелец оба пункта оспорил.

### Что показал аудит кода (2026-07-24)

| Убеждение | Факт в репо |
|-----------|-------------|
| Списки школ PSA из бэкенда после relay | **Верно** — `programme_school_availability` через Contour B relay (~≥6 мес / ops) |
| Recompute не трогает Vilbli | **Неверно** — `buildPathVariants` всё ещё **live `fetch` HTML** (структура пути / yrker), отдельно от PSA |
| Entur уже в бэкенде по расписанию | **Неверно** — только in-process corridor TTL **6 ч** + opportunistic `relocation_maybe_pt_reach_cache`. §9 «nationwide matrix 2×/week» — **только discussion / не реализовано** |
| Уточнение владельца по ритму | Не «раз в 2 дня», а **2 раза в неделю** |

### Закон продукта (владелец)

- Никто не ждёт очередь на экране.
- Тяжёлая работа — **до** клика (как PSA): пишем истину в наш бэкенд по известному ритму; recompute **читает нас**, не live Vilbli/Entur.

### Решение (владелец 2026-07-24)

Сделать завтра:

1. **Полный снимок Vilbli path-variant в бэкенде** — без live HTML на recompute.
2. **Entur PT matrix/corridor в бэкенд 2×/неделю** — без live Journey Planner на обычном recompute (кроме редко chartered miss, если owner так решит).
3. **После A+B:** matcher campus A+C (Lillehammer Sør≠Nord) — см. задачу C ниже. **Не выполнять до завершения A и B.**

---

## Задачи на 2026-07-25

### A. Офлайн-снимок Vilbli path / yrker

**Зачем:** Live HTML на каждый Contour B recompute лишний при источнике, который меняется ~дважды в год. Секунды, 504, не масштабируется.

**Цель:** `buildPathVariants` читает **наш снимок**, не `fetch(sourceUrl)` / `fetch(outcomeUrl)`.

**Черновой shape (уточнить на kickoff):**

- Парсеную структуру path-variant + yrker писать при **Contour B relay / materialize** (семейство PSA-гейтов — не ручной plug).
- Recompute: lookup → steps; если нет снимка → fail closed / chartered fallback (owner gate), **не** silent live scrape по умолчанию.
- Smoke: recompute при заблокированном vilbli.no проходит для chartered профессий.

**Готово когда:** обычный Contour B draft recompute не вызывает Vilbli HTTP для path variants.

### B. Entur в бэкенд 2× в неделю

**Зачем:** Cold recompute доминирует live Entur; warm in-process (~6 ч) не помогает serverless cold start. Намерение владельца — «PT в бэке по расписанию»; §9 в `phase-4-relocation-maybe-public-transport-reach-owner-draft.md` был discussion-only — **поднять в реализацию**.

**Цель:** Долговременное хранилище hub/corridor (и maybe-reach), refresh **дважды в неделю**; recompute сортирует/admit из **БД**.

**Черновой shape (уточнить на kickoff):**

- Charter: какие пары/hubs в v1 (product corridors + P-8/maybe — **не** безграничный Cartesian по всей Норвегии без gate).
- Cron / launchd **2×/неделю** → Postgres; policy_version / freshness.
- Recompute / `buildKommuneTransportSortContext` / maybe-reach: сначала кэш; live Entur только по явной miss-политике (owner), не happy path.
- Обновить §9 с «discussion only» на implemented owner record.

**Готово когда:** при свежем кэше обычный Contour B recompute с transport sort не вызывает Entur Journey Planner.

### C. Matcher campus A+C — Lillehammer Sør≠Nord (после A и B)

**Статус:** **НЕ СЕЙЧАС** — владелец 2026-07-24: в план на 2026-07-25 **третьим пунктом**, выполнять **только после A и B**.

**Зачем:** Kokk (и любой pin `Lillehammer … Avdeling Sør`) пишет PSA на **avd Nord** из‑за `token.length >= 4` (токен `sør` = 3) → `multi_avd_identity` → алфавитный Nord. Нарушает Forbidden matching-spec. Подтверждено Composer + **Grok 4.5**.

**Решение (согласовано, не short-token):**

1. **A** — в brand cohort: равенство `extractAvdLocationLabel(Vilbli)` ↔ `extractAvdLocationLabel(NSR)` (fold æøå); не ослаблять global `length >= 4` для Høyanger/Hornnes.
2. **C** — если Vilbli указал avd, а resolve = 0 → ABORT/ambiguous, **не** alphabetical campus.
3. **Отвергнуто:** naive `includes` / global `length >= 3` / Lillehammer-only hack / manual PSA.

**Готово когда:** smoke Sør→Sør (+ регресс Nord, Sortland-neg, Høyanger, Hornnes, guard C) → dry-run + production relay `34` (kokk и затронутые профессии) → Vilbli↔Min Veg campus DIFF = 0; без manual PSA.

**Код:** `scripts/lib/vilbli-nsr-institution-match.mjs` + `scripts/smoke-vilbli-nsr-institution-match.mjs`. Owner record: `phase-0-6-contour-b-kokk-vilbli-branch-owner-record.md`.

### D. Вне объёма дня (пока owner не расширит)

- Dual VG1 implementation (всё ещё **DEFERRED**).
- Широкий refactor family/route hub.
- Ручные PSA-плаги (запрещены).
- Kokk Block C owner UI — трек профессии **сегодня**, не этот day-plan.

### E. Процесс

- Pre-commit: `npx tsc --noEmit && npm run build`.
- Contour B writes только через relay/pipeline (`VGS_OPERATIONAL_RUNNERS.md` / no-manual-PSA).
- Commit/push только по запросу владельца.

---

## Прогноз ёмкости после A + B + Supabase/Vercel Pro

Допущения: path variants + Entur corridors из **нашей БД**; recompute в основном Postgres R/W snapshots; Pro (минимум Micro, лучше Small при многих concurrent writes).

| Сценарий | Прогноз |
|----------|---------|
| Один пользователь, кэш свежий | Цель класс **1–3 с** (БД), не 5–47 с |
| Много пользователей открывают готовые маршруты | Pro тянет read-heavy |
| **1000 одновременных** DB-only recompute | Реально на Pro Small+ с пулом; stampede — фоновый batch **без очереди на экране** (сразу последний хороший snapshot) |
| Live Entur/Vilbli stampede | **Снят с happy path** |
| Pro **без** A+B | **Не** убирает 15–20 с Entur — только запас по БД |

**Продуктово:** Pro держит кухню открытой. A+B готовят заранее. Вместе = «никто не ждёт». Пункт C — data-truth, не latency; после A+B.

---

## Вопросы на kickoff 2026-07-25

1. Схема хранения Vilbli path-variant snapshots (новая таблица vs расширение truth).
2. Scope Entur matrix v1: какие home/school kommune / hubs обязательны.
3. Miss-политика: пустой кэш → block sort / soft haversine / редкий live fetch (выбор owner).
4. Где cron: launchd vs Vercel cron vs существующие ops runners.

Canvas (RU): `day-plan-2026-07-25-recompute-offline` рядом с чатом.
