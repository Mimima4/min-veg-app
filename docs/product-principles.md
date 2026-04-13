# Product Principles

## 1. Truth over completeness

The product must never display incorrect or assumed information.

If a step, requirement, or route is not verified against Norwegian rules:
- it must not be shown
- it must not be approximated

---

## 2. Route = legal path to profession

A route must represent a complete and valid path to legally work in the profession in Norway.

Not:
- partial education
- assumed progression
- simplified versions

---

## 3. Strategy ≠ Route

Strategies help the user:
- get into a route
- increase chances

But they do NOT represent a path to the profession.

---

## 4. No fake alternatives

The system must never present:
- alternative routes that do not lead to the same profession
- misleading options for regulated professions

---

## 5. Better empty than wrong

If data is uncertain:
- show nothing
- not an approximation

---

## Norway-only education scope

The product must recommend only Norwegian education paths and Norwegian labor-market-relevant routes.

Exception:
- `investor` may reference only top-tier prestigious institutions

## Route Engine Principles (Norway-first)

### 1. Route ≠ Strategy
A route is a legally valid path to a profession.  
A strategy is a way to increase chances of entering that path.  
They must never be mixed.

---

### 2. No placeholders, no assumptions
The system must not display:
- approximated steps
- assumed requirements
- fake alternative paths

If something is not verified — it must not be shown.

---

### 3. Norway-only education scope
Only Norwegian education paths and labor-market-relevant routes are allowed.

Exception:
- `investor` may reference only top-tier global institutions

---

### 4. Competition is a data property
Competition level must come from data (`professions.competition_level`), not hardcoded UI logic.

---

### 5. Competition badge rules
- Badge is visual (not plain text)
- Appears in:
  - route overview
  - route status
  - step-level (only where relevant)
- Color:
  - high → pink
  - very_high → red

---

### 6. Step-level truth
Steps are interactive filters, not content blocks.

- No descriptions under steps
- No extra text inside step containers
- Steps must remain minimal and functional

---

### 7. Requirements delivery
Requirements must:
- not be shown as standalone blocks
- not be mixed with strategies
- be accessible via interaction

Current pattern:
- displayed via tooltip on step-level competition badge

---

### 8. Strategy visibility rules
Strategy block must appear only for:
- high
- very_high

competition professions

---

### 9. Better empty than wrong
If data is uncertain or not verified:
- show nothing
- do not approximate
