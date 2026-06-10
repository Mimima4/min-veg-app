# Phase 0–6 Contour B — Akershus Block C E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner browser verify **12/12** VG1 (incl. Ås) **2026-06-10** |
| **Date (UTC)** | 2026-06-10 |
| **Pair** | `electrician` / Akershus **`32`** |
| **Prerequisite** | Main DB **24** PSA rows (12 VG1); relay refresh **2026-06-10** |

---

## Automated proof (2026-06-10)

| Check | Result |
|-------|--------|
| `node scripts/relay-contour-b-vilbli-to-production.mjs --dry-run --county 32` | `dry_run_ok` |
| `node scripts/verify-contour-b-psa-snapshot.mjs --county 32` | **24** rows (12 VG1), `hasTruth: true` |
| Production relay `--county 32` | `ingested` **2026-06-10** (Ås gap) |
| `npm run smoke:contour-b` | run before sign-off |

---

## Owner browser checklist (Akershus / electrician)

Setup: child with **home fylke Akershus** → electrician route → **VG1 programme_selection** step.

- [x] Route loads without error
- [x] **12** school options in VG1 dropdown (Vilbli parity — incl. **Ås videregående skole**)
- [x] **No** LOSA badge (Akershus has no LOSA rows for electrician)
- [x] Sample schools visible: **Bleiker** or **Røyken** (Asker), **Rud** (Bærum), **Strømmen** / **Skedsmo** (Lillestrøm)
- [x] Card shows school name + municipality line
- [x] Select school → save route → reload → selection persists
- [x] VG2 step shows Akershus schools

**Sign-off:** owner confirmed in chat **2026-06-10**. Initial verify showed **11** schools; **Ås** gap fixed via production relay same day (matcher ` AS` vs municipality **Ås**).
