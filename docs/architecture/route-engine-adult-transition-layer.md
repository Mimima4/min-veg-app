# Route / Path Engine — Adult / Transition Layer

**Status:** FUTURE / NON-V1 LAYER  
**Scope:** Not part of baseline Route Engine v1  
**Use:** Referenced for future expansion only  

---

**Статус:** FUTURE LAYER (not part of baseline v1)  
**Назначение:** зафиксировать будущее направление расширения Route Engine для adult users, career switching и requalification paths.

---

## 1. Главная идея

Baseline Route Engine v1 строится как child / family-first route system.

Adult / Transition Layer — отдельный future mode, в котором маршрут строится:
- не от school-stage start,
- а от уже имеющегося образования и/или опыта,
- к новой целевой профессии.

---

## 2. Что является входной точкой в adult-layer

Пользователь может задавать:
- уже полученное upper secondary education
- уже полученное higher education
- vocational background
- current work experience
- additional qualifications / certifications

Это становится starting state для transition route.

---

## 3. Ключевая сущность

В adult-layer вводится отдельная сущность:
**Transition Route**

Это маршрут, который:
- начинается с уже имеющейся образовательной/профессиональной базы
- может включать bridging / requalification steps
- не обязан следовать child-route baseline matrix

---

## 4. Почему это не часть baseline v1

Adult / transition logic:
- требует другой feasibility logic
- требует другой qualification-gap interpretation
- требует adult-specific routing rules
- не должно ломать строгую Norway-first child/family baseline matrix

Поэтому этот слой фиксируется отдельно, а не как исключения внутри baseline.

---

## 5. Future transition directions (фиксируем как допустимое развитие)

В future adult-layer могут быть разрешены:
- extended HIGHER_EDUCATION -> HIGHER_EDUCATION transitions
- APPRENTICESHIP -> HIGHER_EDUCATION through bridge logic
- REQUALIFICATION -> HIGHER_EDUCATION
- WORK_ENTRY -> EDUCATION
- reverse/transition routes for career switchers
- short-path reskilling / bridging / certification routes

---

## 6. Жёсткое правило
Adult / Transition Layer:
- не активируется в baseline v1
- не должен неявно “просачиваться” в child/family matrix
- не должен ломать structural validity baseline

---

## 7. Product implication
В будущем это может стать отдельным режимом продукта, например:
- Start from your current education
- Change career path
- Requalify for a new profession

---

## 8. Статус
Этот документ фиксирует будущее направление развития и не меняет baseline v1.
Любая реализация этого слоя — отдельная execution wave.
