# Phase 0–6 Contour B — Telemark Block C E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner verified **5/5** VG1+VG2 **2026-06-10** |
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

- [x] **5** school options in VG1 dropdown (incl. **Nome**)
- [x] **5** VG2 schools — Vilbli parity OK
- [x] **No** LOSA badge

**Sign-off:** owner confirmed in chat **2026-06-10** (after Nome relay).
