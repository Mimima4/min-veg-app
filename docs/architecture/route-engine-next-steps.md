# Route Engine Next Steps

Этот документ разгружает основной production spec и фиксирует слои точной калибровки, которые остаются открытыми, но не меняют базовую архитектуру.

## Thresholds

- Зафиксировать точные decision thresholds между `optimal`, `recommended`, `alternative`.
- Согласовать граничные условия при близких score (tie-break rules).
- Определить правила деградации статуса при падении feasibility.

## Formulas

- Детализировать формулы внутри подфакторов Fit.
- Зафиксировать итоговую нормализацию подфакторов до общего route score.
- Уточнить веса и правила их будущей калибровки без изменения core-модели.

## Geography Logic

- Уточнить granularity rules для географии (регион, kommune, commute radius и т.д.).
- Формализовать переход между "строгой локальностью" и "расширением региона".
- Определить как geography ограничения влияют на hard filters и soft penalties.

## VGS Competition Model

- Описать competition model specifically for VGS layer.
- Зафиксировать входные сигналы (admission pressure, capacity, historical volatility).
- Уточнить влияние competition на feasibility и итоговый route ranking.

## Explanation Layer

- Спроектировать explanation text layer для родителя и ребёнка.
- Установить формат объяснений: почему маршрут в этом статусе и какие факторы ключевые.
- Согласовать баланс между прозрачностью модели и UX-краткостью.
