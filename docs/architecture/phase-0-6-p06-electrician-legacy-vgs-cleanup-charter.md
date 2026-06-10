# Phase 0.6 / P06 — Electrician legacy VGS cleanup charter

| Field | Value |
|-------|--------|
| **Status** | **BATCH 1 DONE** (2026-06-10) — batch 2 pending owner OK |
| **Date (UTC)** | 2026-06-10 |
| **Trigger** | Production audit: fake `mv-*` VGS + legacy Oslo/Bergen seeds still in DB while Vilbli/PSA truth covers all 15 fylke for `electrician` |
| **Out of scope** | Legacy **higher-ed** contour (`doctor`, `software-developer`, `financial-analyst`); Git history |

---

## Goal

Remove **placeholder upper-secondary (VGS) rows** for `electrician` from production data and repo seeds, after confirming route/UI no longer depends on them.

Runtime boundary in `apply-route-selection-boundary.ts` already **hides** legacy VGS for electrician in all Norwegian fylke (TRUTH_READY + Contour B). This charter closes the **data-layer** debt: inactive rows, archived seeds, simpler mental model for ops.

---

## Inventory (production DB, 2026-06-10)

### Affected profession

| Profession | Fake / legacy VGS | Higher-ed legacy (keep) |
|------------|-------------------|-------------------------|
| **electrician** | **8** programs | 0 |
| doctor | 0 | 6 (UiB, UiO, UiT…) |
| software-developer | 0 | 3 |
| financial-analyst | 0 | 3 |
| nurse, teacher, mechanic | 0 | 0 (no links) |

**Only `electrician` has fictitious VGS.**

### Batch 1 — `mv-*` institutions + programs (5 schools)

| ID | Institution slug | Display name | Fylke | Program slug |
|----|------------------|--------------|-------|--------------|
| L-01 | `mv-education-inst-strinda-vgs-trondheim` | Strinda videregående skole | 50 | `mv-electrician-voc-vg2-elektro-strinda-trondheim` |
| L-02 | `mv-education-inst-godalen-vgs-stavanger` | Godalen videregående skole | 11 | `mv-electrician-voc-vg2-elektro-godalen-stavanger` |
| L-03 | `mv-education-inst-kirkeparken-vgs-tromso` | Kirkeparken videregående skole | 55 | `mv-electrician-voc-vg2-elektro-kirkeparken-tromso` |
| L-04 | `mv-education-inst-kvadraturen-vgs-kristiansand` | Kvadraturen videregående skole | 42 | `mv-electrician-voc-vg2-elektro-kvadraturen-kristiansand` |
| L-05 | `mv-education-inst-alta-vgs-alta` | Alta videregående skole | 56 | `mv-electrician-voc-vg2-elektro-alta-vgs` |

**Seed (archived):** `scripts/sql/archived/electrician-strong-coverage-norway-seed.sql`  
**Deactivation:** `scripts/sql/deactivate-electrician-mv-legacy-vgs-batch1.sql` — applied production 2026-06-10

### Batch 2 — legacy VGS (non-`mv-*`, 3 programs)

| ID | Institution slug | Program slug | Fylke | Notes |
|----|------------------|--------------|-------|-------|
| L-06 | `videregaende-oslo-electrical` | `electrician-vg1-elektro-oslo` | 03 | Superseded by Vilbli/PSA Oslo truth |
| L-07 | `videregaende-bergen-electrical` | `electrician-vg2-elenergi-bergen` | 46 | Superseded by Vilbli/PSA Vestland truth |
| L-08 | `fagskolen-oslo-technical` | `electrician-fagskole-technical-oslo` | 03 | Fagskole placeholder; not Vilbli VGS contour |

**Seeds:** `scripts/sql/education-program-vg2-elenergi-oslo-seed.sql` (Oslo VG2 sibling); Oslo VG1 / Bergen / fagskole from earlier pilot seeds.

### Counterfactual (do not delete)

- **36** active electrician programs with non-legacy institutions (Vilbli/PSA / NSR truth).
- **16** active legacy institutions total in DB; **8** are higher-ed only (NTNU, UiO, UiB, …) — **out of scope**.

---

## Preconditions (owner verify before batch 1)

1. **PSA coverage:** all 15 fylke have active electrician PSA for route consumption (signed in P06 operational closure).
2. **Boundary:** `apply-route-selection-boundary.ts` filters legacy VGS for electrician in pipeline counties — no regression expected from deactivation.
3. **Scripts:** grep repo for hard-coded slugs `mv-electrician-*`, `videregaende-oslo-electrical`, `videregaende-bergen-electrical` — update or drop references before DB write.

---

## Execution procedure

### Step 1 — Read-only re-audit (repeat before each batch)

```sql
-- Programs linked to electrician with legacy or mv-* contour
select ppl.profession_slug, ppl.program_slug, ep.education_level,
       ei.slug as institution_slug, ei.source, ei.county_code
from profession_program_links ppl
join education_programs ep on ep.slug = ppl.program_slug
join education_institutions ei on ei.id = ep.institution_id
where ppl.profession_slug = 'electrician'
  and (ep.slug like 'mv-%' or ei.slug like 'mv-%' or (ei.source = 'legacy' and ep.education_level not in ('bachelor','professional_degree','master')))
order by ep.slug;
```

Expect **8** rows pre-cleanup, **0** post-cleanup.

### Step 2 — Production deactivation (soft delete)

Per batch, owner-approved:

1. `delete from profession_program_links where profession_slug = 'electrician' and program_slug in (...);`
2. `update education_programs set is_active = false where slug in (...);`
3. `update education_institutions set is_active = false where slug in (...)` — only when no other active programs reference the institution.

**Prefer soft deactivate** (`is_active = false`) over hard delete for audit trail.

### Step 3 — Repo seeds

| Batch | Seed action |
|-------|-------------|
| 1 | Archive or delete `electrician-strong-coverage-norway-seed.sql`; add header comment in git history pointer in this charter |
| 2 | Archive Oslo/Bergen/fagskole VGS seeds if no longer referenced by scripts |

### Step 4 — Optional code simplification (batch 3, separate PR)

After data cleanup verified:

- Narrow comments in `apply-route-selection-boundary.ts` (boundary remains valuable for higher-ed legacy).
- Remove any dead slug constants in pilot verification scripts if they only targeted L-06–L-08.

**Do not** remove Contour B boundary logic until higher-ed legacy contour has its own gate.

---

## Verification (required after each batch)

| Check | Command / action |
|-------|------------------|
| Smoke | `npm run smoke:contour-b` |
| DB audit | Step 1 SQL → 0 legacy VGS rows for electrician |
| Route spot-check | One child per affected fylke (11, 42, 50, 55, 56, 03, 46): route step panel shows Vilbli schools only |
| Link count | `electrician` `profession_program_links` drops by 5 (batch 1) then 3 (batch 2); strong-fit count unchanged for truth programs |

---

## Classification

| Class | IDs |
|-------|-----|
| **DELETE / DEACTIVATE (data)** | L-01 … L-08 |
| **ARCHIVE (seeds)** | `electrician-strong-coverage-norway-seed.sql`, related Oslo/Bergen VGS seeds |
| **KEEP** | Higher-ed legacy institutions; `apply-route-selection-boundary.ts` until higher-ed gate |
| **DOC-ONLY** | Cross-link from `phase-0-6-p06-operational-closed-safe-summary.md` when batch 1 completes |

---

## Explicit non-goals

- No change to `NOT_READY_FOR_APPLY` global flag.
- No second profession Vilbli expansion (separate owner record).
- No hard delete of `education_institutions` rows referenced in historical route snapshots (soft deactivate only).

---

## Exit criteria

- [x] Inventory L-01 … L-05 deactivated in production (2026-06-10).
- [x] Zero active `mv-*` institutions or programs in DB (2026-06-10).
- [ ] Inventory L-06 … L-08 deactivated in production.
- [ ] Electrician legacy VGS seeds archived or removed from `scripts/sql/`.
- [ ] Smoke + spot-check route E2E signed by owner.
- [ ] P06 safe summary updated with cleanup completion date.

---

## Owner decision

| Batch | Scope | Owner OK | Date |
|-------|-------|----------|------|
| 1 | L-01 … L-05 (`mv-*`) | **OK** | 2026-06-10 |
| 2 | L-06 … L-08 (Oslo/Bergen/fagskole) | _pending_ | |
| 3 | Optional boundary/comment tidy | _pending_ | |
