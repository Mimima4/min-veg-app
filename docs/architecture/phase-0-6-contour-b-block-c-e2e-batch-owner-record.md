# Phase 0–6 Contour B — Block C E2E Batch Owner Record

| Field | Value |
|-------|--------|
| **Status** | **ACTIVE** — Akershus **CLOSED**; batch **OPEN** |
| **Date (UTC)** | 2026-06-10 |
| **Profession** | `electrician` |
| **Contour** | **B** partial (non-green fylke) |

---

## Batch scope

Formal Block C browser proof for Contour B fylke already ingested in **2026-06-04** batch relay. **Owner verifies by fylke name** (as shown in app), not county code.

| Fylke (app label) | County code | VG1 schools (PSA) | Checklist | Status |
|-------------------|-------------|-------------------|-----------|--------|
| **Akershus** | `32` | **12** | `phase-0-6-contour-b-akershus-32-block-c-e2e-owner-verify-checklist.md` | **CLOSED** 2026-06-10 |
| **Østfold** | `31` | **5** | `phase-0-6-contour-b-ostfold-block-c-e2e-owner-verify-checklist.md` | OPEN |
| **Buskerud** | `33` | **8** | `phase-0-6-contour-b-buskerud-block-c-e2e-owner-verify-checklist.md` | OPEN |
| **Innlandet** | `34` | **11** | `phase-0-6-contour-b-innlandet-block-c-e2e-owner-verify-checklist.md` | OPEN |
| **Vestfold** | `39` | **5** | `phase-0-6-contour-b-vestfold-block-c-e2e-owner-verify-checklist.md` | OPEN |
| **Telemark** | `40` | **4** | `phase-0-6-contour-b-telemark-block-c-e2e-owner-verify-checklist.md` | OPEN |
| **Agder** | `42` | **9** | `phase-0-6-contour-b-agder-block-c-e2e-owner-verify-checklist.md` | OPEN |

**Not in batch:** green Contour A fylke (**Oslo, Rogaland, Vestland, Trøndelag**); pilots **Møre og Romsdal, Nordland, Troms, Finnmark** (already Block C proven).

---

## Per-fylke workflow

1. CLI snapshot matches Vilbli school count (relay refresh if gap — see Akershus **Ås** precedent).
2. Owner browser: child **home fylke = {name}** → electrician → VG1 → count schools → save/reload.
3. Sign checklist → mark **CLOSED** in this table.

---

## Akershus lesson (2026-06-10)

Vilbli **12** vs app **11** → missing **Ås videregående skole** until county `32` production re-relay (matcher ` AS` vs municipality **Ås**). Re-check Vilbli strukturkart if counts diverge.
