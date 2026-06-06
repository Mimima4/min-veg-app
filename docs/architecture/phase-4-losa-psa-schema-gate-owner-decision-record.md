# Phase 4 LOSA — PSA Schema Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-PSA** (schema tranche) |
| **Status** | Owner **LOSA PSA schema** adopted at **repo level** — **no row writes** |
| **Closure label** | `PHASE_4_LOSA_PSA_SCHEMA_GATE_ADOPTED_NO_WRITE` |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisite** | **P4-LOSA-PUBLICATION-MODEL** (`a212c2b`) |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-PSA** |

Adopts SQL migration for nationwide `availability_scope` **`losa_fjern_delivery_municipality`**. **Does not** authorize PSA inserts, pipeline patch, Route/UI, or apply to production DB without separate owner session.

---

## 1. Schema changes (binding)

| Change | Purpose |
|--------|---------|
| `availability_scope` check | Add `losa_fjern_delivery_municipality` alongside `programme_in_school` |
| LOSA municipality rule | `municipality_code` required when scope is LOSA |
| Partial unique indexes | Ordinary vs LOSA uniqueness (provider × delivery municipality) |

**Migration file:** `supabase/migrations/20260605120000_programme_school_availability_losa_scope.sql`

**Nationwide rule:** enum value is **not** Finnmark-only; county `56` remains reference for proof CLI.

---

## 2. Owner decisions (P4LPS0–P4LPS11)

| # | Question | Answer |
|---|----------|--------|
| P4LPS0 | Adopt schema migration after publication model? | **Yes** |
| P4LPS1 | Scope values nationwide-applicable (no `56` allowlist in SQL)? | **Yes** |
| P4LPS2 | Partial uniques preserve ordinary `programme_in_school` rows? | **Yes** |
| P4LPS3 | LOSA rows require `municipality_code`? | **Yes** |
| P4LPS4 | Migration in repo ≠ auto-applied to MAIN (owner session)? | **Yes** |
| P4LPS5 | **No** PSA row writes in this gate? | **Yes** |
| P4LPS6 | **No** pipeline `emitLosa` in this gate? | **Yes** |
| P4LPS7 | Contour B still skips `isLosa` until write charter? | **Yes** |
| P4LPS8 | Route / #3 still deferred (**P4-LOSA-ROUTE**)? | **Yes** |
| P4LPS9 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LPS10 | CLI proof: `npm run losa:validate-psa-schema` exit 0 | **Yes** |
| P4LPS11 | Next gate = **P4-LOSA-PSA-WRITE** bounded charter (when §4 row closes) | **Yes** |

---

## 3. Explicit non-scope

- not production Supabase apply (unless owner runs migration separately)
- not first LOSA PSA row insert
- not `get-availability-truth` Route filter change
- not Phase 2 observation DML

---

## 4. Artifacts

| Artifact | Role |
|----------|------|
| `supabase/migrations/20260605120000_programme_school_availability_losa_scope.sql` | Schema migration |
| `scripts/lib/losa-psa-schema.mjs` | Scope constants + file/DB readiness |
| `scripts/validate-losa-psa-schema-readiness.mjs` | CLI proof |

---

## Final statement

Schema **shape** for LOSA PSA is repo-ready. **0** LOSA rows may be written until **P4-LOSA-PSA-WRITE** and per-row §4 closure.
