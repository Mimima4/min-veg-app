# Phase 4 — Verified Lærebedrift Layer — P1 Ingest Spec (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **LIVE (2026-06-29)** — migration applied; `utdanning` primary fetcher built; Steigen (`1848`) real ingest = **2 godkjent** carpenter rows, orgnr-verified, audit green. Behind ops gate; routes do not consume it yet (P3). |
| **Phase** | **P1** of `phase-4-verified-larebedrift-employer-layer-charter.md` |
| **Goal** | Build `larebedrift_truth` + an **ops-gated, source-agnostic ingest** of **carpenter (Tømrerfaget) nationwide** godkjente lærebedrifter, orgnr-normalized vs Brønnøysund |
| **Access (D-2, amended 2026-06-29)** | **Finnlærebedrift open API** `api.utdanning.no/finnlarebedrift` (**primary, keyless**, `sporring_type=bedrifter_godkjente`) · **Vilbli relay / NLR / manual seed** (secondary) — all from VIGO + Brønnøysund identity. **No scraping, no live calls at runtime** |
| **Ops model** | Mirrors `VGS_OPERATIONAL_RUNNERS.md` (dry-run → ingest → product proof; never on page load/deploy) |

> **Amendment (2026-06-29):** the original «owner Vigo bedrift CSV» plan is dropped (Vigo bedrift is closed to non-lærebedrifter). Udir NXR **recommended the open Finnlærebedrift API** — keyless, godkjent-only, complete (incl. godkjent without a current lærekontrakt, which NLR omits) — so it is now **primary** over the key-gated NLR API. Source is **pluggable** (`scripts/lib/larebedrift-source.mjs`): `utdanning` (primary, live), `nlr` (secondary, inert until `NLR_API_AUTH` env exists), `vilbli` (fallback, parser TBD), `file` (manual seed/test). Schema, orchestrator, audit, and future route consumption are **source-independent** — swapping sources needs no table/route change. §3 below (CSV column contract) now applies only to the optional `file` seed source.

---

## 1. Scope of P1

In: schema + ingest + normalization + audit + dry-run gate, for **`larefag_code = Tømrerfaget`, all counties**.
Out: route-engine surfacing (P3), geocoding default order (P2/P3), UI (P4), other fag (P5).

**Done = `larebedrift_truth` populated with godkjent-only carpenter rows, every row orgnr-verified against Brønnøysund, dry-run + DB snapshot green.** Routes do **not** consume the table yet (P3).

---

## 2. DB schema (migration)

```sql
create table if not exists public.larebedrift_truth (
  id                     uuid primary key default gen_random_uuid(),
  org_number             text not null,
  legal_name             text not null,
  display_name           text,
  county_code            text not null,
  municipality_code      text not null,
  latitude               numeric,
  longitude              numeric,
  larefag_code           text not null,
  larefag_label          text,
  opplaringskontor_name  text,
  opplaringskontor_org   text,
  verification_status    text not null default 'godkjent'
    check (verification_status in ('godkjent')),
  source_reference_url   text not null,
  source_system          text not null
    check (source_system in ('vigo', 'brreg')),
  source_export_date     date not null,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- one truth row per (employer, fag); re-ingest updates in place (idempotent)
create unique index if not exists larebedrift_truth_org_fag_uidx
  on public.larebedrift_truth (org_number, larefag_code);

create index if not exists larebedrift_truth_fag_county_idx
  on public.larebedrift_truth (larefag_code, county_code) where is_active;
```

**Notes**
- `verification_status` check allows **only `godkjent`** → schema-level guarantee that potensielle never persist (charter E-3).
- Unique `(org_number, larefag_code)` makes re-ingest **idempotent** (upsert), mirroring the snapshot idempotency pattern already in the codebase.
- Table is **separate** from `programme_school_availability` (charter non-goal: no school/employer mixing).
- RLS: service-role write only; read policy aligned with existing truth tables (no anon write). `NOT_READY_FOR_APPLY` unchanged.

---

## 3. Owner CSV export contract (from Vigo bedrift)

Owner exports a CSV from Vigo bedrift (godkjente lærebedrifter for Tømrerfaget). Required columns (header names normalized case-insensitively; mapping table below tolerates Norwegian variants):

| CSV column (accepted aliases) | Maps to | Required | Rule |
|-------------------------------|---------|----------|------|
| `orgnr`, `organisasjonsnummer` | `org_number` | **yes** | 9 digits; validated against Brønnøysund |
| `navn`, `bedriftsnavn` | `legal_name` (fallback) | no | Brønnøysund name wins if present |
| `larefag`, `fagkode`, `fag` | `larefag_code` | **yes** | must resolve to Tømrerfaget (old+new fagkode aware) |
| `status`, `godkjenning` | gate | **yes** | must be **godkjent**; anything else → **reject row** |
| `opplaringskontor`, `kontor` | `opplaringskontor_name` | no | contact channel |
| `opplaringskontor_orgnr` | `opplaringskontor_org` | no | 9 digits if present |

**Export hygiene (E-1):** file is dated, archived under `owner-held/larebedrift-exports/` (not committed), and the **export date** is passed to ingest as `--export-date YYYY-MM-DD` → stored in `source_export_date`.

**Fagkode awareness:** a small alias map resolves Tømrerfaget across fagfornyelse (e.g. old `TØMRER*`/Reform-94 legacy vs LK20 code). Unknown fag string → row rejected with reason `unresolved_fag`.

---

## 4. Brønnøysund normalization (per row)

For each accepted CSV row, call `GET https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>` (open API, no auth, datacenter-safe — runs at **ingest**, not runtime):

| Brønnøysund field | Use |
|-------------------|-----|
| `organisasjonsnummer` | confirm `org_number` (must match) |
| `navn` | canonical `legal_name` (overrides CSV) |
| `forretningsadresse.kommunenummer` | `municipality_code` |
| derive county from kommune prefix / lookup | `county_code` |
| `slettedato` present, or `organisasjonsform = "BEDR/AAFY"` anomalies | flag → reject/needs-review |

**Rejection / review rules**
- 404 from Brønnøysund → `reject` (`brreg_not_found`).
- `slettedato` set (deregistered) → `reject` (`brreg_deleted`).
- orgnr mismatch → `reject` (`orgnr_mismatch`).
- county lookup fails for `kommunenummer` → `needs_review` (do not publish).

`source_reference_url` = `https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>` (`source_system = 'brreg'` for identity; `vigo` retained as origin in export metadata note).

> **Geo:** P1 stores `municipality_code` + `county_code` only. `latitude/longitude` geocoding is **P2** (registered kommune + geocode, D-3). P1 leaves coords null.

---

## 5. Ingest flow & idempotency

```
owner CSV  ──parse──▶ validate (godkjent, fag, orgnr shape)
            └─reject rows with reasons (report)
parsed rows ──per row──▶ Brønnøysund lookup ──▶ normalize / reject / needs_review
normalized  ──upsert──▶ larebedrift_truth  (on conflict (org_number, larefag_code) do update)
not-in-export existing rows for this fag ──▶ is_active = false (soft-retire), not deleted
```

- **Idempotent:** re-running the same export = no-op diffs (upsert by `(org_number, larefag_code)`); `updated_at` refreshed only on real change.
- **Soft-retire:** employers no longer in the latest export for that fag → `is_active = false` (auditable history, never hard-deleted).
- **Dry-run:** `--dry-run` parses + normalizes + reports counts/rejections and **writes nothing**.

---

## 6. Interfaces (to build under P1 — for review)

| Layer | Artifact | Status |
|-------|----------|--------|
| Migration | `supabase/migrations/20260625120000_larebedrift_truth.sql` | **BUILT** — §2 schema + indexes + RLS |
| Source layer | `scripts/lib/larebedrift-source.mjs` | **BUILT** — pluggable `nlr` / `vilbli` / `file`; `fetchGodkjentEmployers()` |
| Orchestrator | `scripts/ingest-larebedrift.mjs` | **BUILT** — source → resolve fag → optional Brønnøysund → upsert → soft-retire; flags `--source --file --larefag --county --export-date --verify-brreg --no-soft-retire --dry-run` |
| Lib (fag) | `scripts/lib/larebedrift-fagkode.mjs` | **BUILT** — Tømrerfaget resolver (code + label, ø/æ/å-folded) |
| Lib (identity) | `scripts/lib/brreg-enhet.mjs` | **BUILT** — Brønnøysund lookup + kommune→county (first 2 digits) |
| Audit | `scripts/verify-larebedrift-truth-snapshot.mjs` | **BUILT** — godkjent-only + dup + identity/geo invariants, per-(fag,county) coverage |
| npm scripts | `package.json` | **BUILT** — `ingest:larebedrift`, `verify:larebedrift` |

**No runtime API endpoint** (unlike Contour B relay): NLR/Brønnøysund are reached only at ingest by a Node script with service-role env; runtime stays free of external calls. NLR is fetched server-side at ingest with a basic-auth key (`NLR_API_AUTH`); Vilbli fallback would use the existing home-IP relay headers.

---

## 7. Ops gate (mirrors VGS runners)

| Step | Action | Gate |
|------|--------|------|
| 1 | Owner places dated CSV in `owner-held/larebedrift-exports/` | E-1 |
| 2 | `npm run ingest:larebedrift -- --file <path> --export-date <date> --dry-run` | report: accepted / rejected (reasons) / needs_review |
| 3 | Review dry-run report; zero unexpected rejections | owner OK |
| 4 | `npm run ingest:larebedrift -- --file <path> --export-date <date>` | production write (upsert + soft-retire) |
| 5 | `npm run verify:larebedrift` | godkjent-only true; per-county counts sane |
| 6 | Record snapshot + decisions in `owner-held/` | E2E proof deferred to P3/P4 (no route consumption yet) |

**Never** on page load / deploy / git push. Refresh cadence aligned with owner export availability (charter §7).

---

## 8. Validation / acceptance (P1 done criteria)

- [ ] Migration applied; `larebedrift_truth` exists with godkjent-only check + unique `(org_number, larefag_code)`
- [ ] Dry-run on a real owner export prints accepted/rejected/needs_review with **reasons**; writes nothing
- [ ] Production ingest upserts carpenter rows; **every** row orgnr-verified vs Brønnøysund (no `brreg_not_found`/`mismatch` persisted)
- [ ] Zero rows with `verification_status != 'godkjent'` (DB check enforces)
- [ ] Re-running same export = idempotent (no spurious `updated_at` churn); removed employers soft-retired (`is_active=false`)
- [ ] `npm run verify:larebedrift` green; `npm run build` green
- [ ] **Steigen `1848`** carpenter employer(s) (e.g. `995810166` ÅLSTADØYA TRELAST AS) present as godkjent rows — ready for P3 migration off the curated placeholder
- [ ] Routes still behave exactly as before (no consumption of the new table in P1)

---

## 9. Non-goals (P1)

- Route-engine consumption / default / order (P3)
- Geocoding lat/long (P2)
- UI changes (P4)
- Non-carpenter fag (P5)
- Live external calls at runtime (master-spec invariant)
- Hard deletes (soft-retire only)

---

## 10. Open items for sign-off (A-3)

| # | Item | Status / resolution |
|---|------|---------------------|
| I-1 | Source access | **Resolved** — Udir NLR key requested (`nxr-teknisk@udir.no`, 2026-06-25); `nlr` fetcher built, inert until `NLR_API_AUTH` set. Vilbli fallback confirmed available (imports from Vigo); parser TBD if key denied. |
| I-2 | County derivation | **Resolved** — `countyCodeFromKommunenummer` (first 2 digits) in `brreg-enhet.mjs`; NLR also returns Fylke directly. |
| I-3 | Table name | **Resolved** — `larebedrift_truth` (parallels `*_truth` naming). |
| I-4 | Soft-retire vs history | **Resolved (P1)** — `is_active` soft-retire, scoped to ingested fag (+ county if `--county`); no hard delete. |
| I-5 | NLR per-fag completeness | **Open** — NLR lists godkjent **with ≥1 løpende kontrakt** (active subset). Confirm at first real ingest whether dormant-but-godkjent employers must also appear (may need Vilbli supplement). |

---

## 11. References

- `phase-4-verified-larebedrift-employer-layer-charter.md` — parent charter (A-3 gate)
- `phase-4-verified-larebedrift-employer-layer-design-gate.md` — resolved decisions D-1…D-6
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — ops gate / dry-run → production → proof model
- `src/lib/routes/route-types.ts` — `apprenticeship_options[]` employer fields (consumer in P3)
- Brønnøysund Enhetsregisteret API — `https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>`
