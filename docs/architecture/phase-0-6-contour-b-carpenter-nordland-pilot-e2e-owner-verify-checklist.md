# Phase 0–6 Contour B — Carpenter Nordland pilot E2E owner verify checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner sign-off **2026-06-15** |
| **Date (UTC)** | 2026-06-10 |
| **Pilot** | `carpenter` × Nordland (`18`) |
| **Prerequisite** | Production ingest for `carpenter/18`; child with home fylke `18` |

---

## Preconditions

| Item | Status |
|------|--------|
| `professions.slug = carpenter` row exists | ☑ |
| PSA truth for `carpenter/18` (`verification_ready_after_write` or green after ingest) | ☑ |
| Deploy includes `carpenter` path defs + bundle | ☑ |

---

## Browser verify

- [x] Child home fylke **18** → create/open **carpenter** route
- [x] **VG1** options match Vilbli scout (~7 schools: Bodø, Fauske, …)
- [x] **VG2** options match tømrer chain (~5 schools)
- [x] **VG3 / bedrift** kolonne-3 list renders (sibling bygg specializations policy)
- [x] **Compare** same child **electrician** route — Nord-Salten slash visible on elec, **not** duplicated on carpenter
- [x] Save + recompute + remove-saved — API **200**
- [x] NAV matcher shows **Tømrer** outcomes (not `review-*` slugs)
- [x] **VG1/VG2** stage prefix in programme titles (`VG1 Bygg- og anleggsteknikk`)

---

## Sign-off

Owner: _____________ Date: _____________
