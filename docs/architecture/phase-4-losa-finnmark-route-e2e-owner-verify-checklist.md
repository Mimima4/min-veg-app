# Phase 4 LOSA — Finnmark Route E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner browser verify confirmed 2026-06-10 (after option-id + label normalization fix) |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Main DB **18** LOSA PSA rows county `56`; head `9b920a7`+ |

---

## Automated proof (2026-05-29)

| Check | Result |
|-------|--------|
| `npm run smoke:contour-b` | PASS |
| `npm run losa:finnmark-evidence-link` | **18/18** §4, **0** blocked |
| `npm run losa:plan-route-consumption` | **18** route eligible |

---

## Owner browser checklist (Finnmark / electrician)

- [ ] Open child route with Finnmark county + electrician programme step
- [ ] **Ordinary** options present (~**6** Contour B schools) — **no** LOSA badge
- [ ] **LOSA** options present (**18**) — sky **LOSA** badge on card + dropdown
- [ ] Dropdown shows `Nordkapp videregående skole · {kommune}` (not 18 identical labels)
- [ ] Card heading = **provider only** (no `– LOSA …` in title)
- [ ] Location line = delivery kommune (e.g. `Vadsø`, `Alta`)
- [ ] Select Vadsø LOSA option → persists on save/reload
- [ ] No ordinary school mis-labelled as LOSA (and vice versa)

**Sign-off:** owner confirmed in chat, 2026-06-10. Two defects found and fixed during verify:
1. Dropdown label duplicated `LOSA` inline (`· LOSA Porsanger`) — normalized; LOSA only as badge.
2. All LOSA options shared one option id (`programme-{institution_id}`) — selection always fell back to Nordkapp; ids now `programme-losa-{institution_id}-{municipality_code}`.
