# Phase 4 — Nordland Steigen carpenter veksling E2E owner verify checklist

| Field | Value |
|-------|--------|
| **Status** | **OPEN** — automation added 2026-06-16 |
| **Pilot** | `carpenter` × Steigen `1848` × veksling variant B |
| **Charter** | `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` |
| **Prerequisite** | P1 curated variant + P2 employer options shipped |

---

## Preconditions

| Item | Status |
|------|--------|
| Child `preferred_municipality_codes` includes **`1848`** | ☐ |
| Draft **carpenter** route exists for child | ☐ |
| Curated variant `curated:steigen-carpenter-veksling-0-4` with current snapshot | ☐ |
| `E2E_CHILD_ID` set in `.env.local` (Steigen carpenter child, kommune `1848`) | ☐ |

Example:

```env
E2E_CHILD_ID=fafad05c-4bf6-43c6-9142-7982262993bc
```

---

## Automated checks

```bash
npm run smoke:steigen-carpenter-veksling
npm run test:e2e:steigen
```

| Check | Automation |
|-------|------------|
| Steigen child fixture resolves | `smoke:steigen-carpenter-veksling` |
| Campus route has veksling alternative with hub + employer | `test:e2e:steigen` |
| Campus route steps header has **no** veksling badge | `test:e2e:steigen` |
| Recompute API **200** | `test:e2e:steigen` |
| Save veksling alternative API **200** (when unsaved) | `test:e2e:steigen` |
| Saved veksling route shows badge in Route steps | `test:e2e:steigen` (if saved route exists) |

---

## Browser verify (owner)

- [ ] Child **Steigen `1848`** sees **both** campus carpenter route (A) and **Veksling / Steigenmodellen** (B)
- [ ] Variant B steps: **Nord-Salten vgs avd Steigen** + **Lokal opplæringsbedrift (Steigen)**
- [ ] No **LOSA** badge on carpenter Steigen surfaces
- [ ] Campus route (A) recompute + save still **200**
- [ ] NAV matcher still **Tømrer** for carpenter family

---

## Sign-off

Owner: _____________ Date: _____________
