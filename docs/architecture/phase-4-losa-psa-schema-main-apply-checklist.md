# Phase 4 LOSA — PSA Schema Main Apply Checklist

## 1. Status / boundary

- Status: **MAIN APPLY COMPLETED — schema-only** — see §3–§5.
- Scope: **additive** PSA schema for nationwide `losa_fjern_delivery_municipality` plus co-applied `education_institutions.name_i18n` column (pending since prior session).
- This file records factual main apply and post-apply verification only.
- **No** LOSA PSA row inserts.
- **No** Contour B / pipeline `emitLosa` change.
- **No** Route Engine / UI / billing change.
- **No** `get-availability-truth` **#3** wiring.
- `NOT_READY_FOR_APPLY` remains **unchanged** (product apply blocked until §4 row closure + write charter).

---

## 2. Target confirmation

| Field | Value |
|--------|--------|
| `project_ref` | `bgmtxyfchtqjuvzuuoon` |
| Project label | `min-veg-dev` (main) |
| Not applied to | `egalvhjvdvmoqboxbwzo` (`my-app-test`) |
| Git branch | `main` |
| Repo HEAD (pre-apply reference) | `1f2f443` |
| Owner session date (UTC) | 2026-05-29 |

---

## 3. Pre-apply confirmation

1. `npx supabase link --project-ref bgmtxyfchtqjuvzuuoon` succeeded.
2. Remote migration history **before** push:
   - `20260506112154` — present
   - `20260529120000` — **absent**
   - `20260605120000` — **absent**
3. Dry-run (`npx supabase db push --linked --dry-run`) planned only:
   - `20260529120000_education_institutions_name_i18n.sql`
   - `20260605120000_programme_school_availability_losa_scope.sql`
4. Migration SHA256 (repo files at apply time):
   - `20260529120000`: `354df4c44a38c1ae4fe7522ecac9312e86dda34b8b207efa9c6f0248c47f66b4`
   - `20260605120000`: `ff11c117a8b342eed7b131c182d9b3722d45051d841e46e62b12dee021c57b4d`

---

## 4. Apply execution

- Command: `npx supabase db push --linked --yes`
- Applied migrations:
  1. `20260529120000_education_institutions_name_i18n.sql`
  2. `20260605120000_programme_school_availability_losa_scope.sql`
- CLI notices (non-blocking):
  - `chk_education_institutions_name_i18n_object` did not exist — skip on drop (expected idempotent).
  - PostgreSQL identifier truncation notice on legacy unique constraint name lookup (constraint removed; partial indexes created).

---

## 5. Post-apply verification

### 5.1 Migration history

Remote history now includes:

| Version | Applied |
|---------|---------|
| `20260506112154` | yes (prior) |
| `20260529120000` | **yes** |
| `20260605120000` | **yes** |

### 5.2 `programme_school_availability` constraints

| Constraint | Verified |
|------------|----------|
| `programme_school_availability_availability_scope_check` | `programme_in_school`, `losa_fjern_delivery_municipality` |
| `programme_school_availability_losa_municipality_required` | LOSA scope requires `municipality_code` |

### 5.3 Partial unique indexes

| Index | Verified |
|-------|----------|
| `programme_school_availability_ordinary_scope_key` | yes |
| `programme_school_availability_losa_scope_key` | yes |
| `idx_programme_school_availability_availability_scope` | yes |

### 5.4 `education_institutions.name_i18n`

- Column `name_i18n` type `jsonb` — present.
- Check `chk_education_institutions_name_i18n_object` — applied.

### 5.5 CLI smoke (read-only)

| Command | Result |
|---------|--------|
| `npm run losa:validate-psa-schema -- --probe-db` | exit 0 — table readable |
| `npm run losa:preview-psa-write` | **0** write candidates; execution unauthorized |

---

## 6. Operational boundary (post-apply)

| Item | Post-apply state |
|------|------------------|
| LOSA PSA rows in DB | **0** |
| Row §4 satisfied | **0** / 18 |
| Route LOSA options | **0** |
| Contour B `isLosa` skip | unchanged |
| Next gate | §4 row closure → **P4-LOSA-PSA-WRITE** bounded charter (max **1** pilot row) |

---

## Final statement

LOSA PSA **schema shape** is **applied to main**. Product publication and Route consumption remain **blocked** until operational tail steps 2–4 complete per `phase-4-losa-planning-closed-safe-summary.md`.
