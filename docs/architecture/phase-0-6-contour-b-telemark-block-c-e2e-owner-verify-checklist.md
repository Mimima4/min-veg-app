# Phase 0–6 Contour B — Telemark Block C E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **RELAY FIXED** — re-verify browser (**5** VG1 expected) |
| **Date (UTC)** | 2026-06-10 |
| **Fylke (app)** | **Telemark** |
| **County code** | `40` (ops only) |
| **Prerequisite** | Main DB **10** PSA rows (**5** VG1 + **5** VG2) after relay **2026-06-10** |

---

## PSA VG1 schools (expect in dropdown)

1. Bamble videregående skole (Bamble)
2. **Nome videregående skole avd Lunde** (Nome) — was missing until relay refresh
3. Notodden videregående skole (Notodden)
4. Skogmo videregående skole (Skien)
5. Vest-Telemark vidaregåande skule (Tokke)

---

## Gap closed (2026-06-10)

Owner reported **4** schools vs Vilbli **5**. Missing **Nome** (Vilbli `8341`) — batch relay **2026-06-04** predated matcher link. Production re-relay `40` → **10** PSA rows.

---

## Owner browser checklist (Telemark / electrician)

Setup: child with **home fylke Telemark** → electrician route → **VG1 programme_selection**.

- [ ] **5** school options in VG1 dropdown (incl. **Nome**)
- [ ] **No** LOSA badge
- [ ] Sample: **Skogmo** (Skien), **Notodden**, **Nome**
- [ ] Save/reload persists selection
- [ ] VG2 shows **5** Telemark schools

**Sign-off:** pending owner re-verify after relay.
