# Phase 0–6 Contour B — Buskerud Block C E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **OPEN** — browser verify |
| **Date (UTC)** | 2026-06-10 |
| **Fylke (app)** | **Buskerud** |
| **County code** | `33` (ops only) |
| **Prerequisite** | Main DB **16** PSA rows (**8** VG1 + **8** VG2) |

---

## PSA VG1 schools (expect in dropdown)

1. Buskerud videregående skole (Modum)
2. Hønefoss videregående skole (Ringerike)
3. Kongsberg videregående skole (Kongsberg)
4. Lier videregående skole (Lier)
5. Numedal videregående skole (Nore og Uvdal)
6. Tyrifjord videregående skole (Hole)
7. Ål vidaregåande skole avd Ål (Ål)
8. Åssiden videregående skole (Drammen)

---

## Owner browser checklist (Buskerud / electrician)

Setup: child with **home fylke Buskerud** → electrician route → **VG1 programme_selection**.

- [ ] **8** school options in VG1 dropdown
- [ ] **No** LOSA badge
- [ ] Sample: **Åssiden** (Drammen), **Kongsberg**, **Hønefoss**
- [ ] Save/reload persists selection
- [ ] VG2 shows Buskerud schools

**Sign-off:** owner date when complete. If count ≠ Vilbli → note gap before closing.
