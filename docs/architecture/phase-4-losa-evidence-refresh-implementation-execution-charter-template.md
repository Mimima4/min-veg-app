# Phase 4 LOSA Evidence Refresh — Pilot Session Charter (Template)

| Field | Value |
|-------|--------|
| **Gate** | `phase-4-losa-evidence-refresh-implementation-execution-gate-owner-decision-record.md` (**P4-LOSA-REFRESH-IMPL**) |
| **Pilot** | **Pilot 1** — Tier 1 canonical fetches only |

**Forbidden:** PSA; Phase 2 DML; UI; invented URLs; cron; git raw dumps/secrets.

---

## 1. Approval

| Field | Fill |
|-------|------|
| Charter ID | e.g. `MAIN-LOSA-REFRESH-PILOT-YYYY-MM-DD-01` |
| **OWNER** / **SECURITY** / **TECH_EXECUTOR** | yes / no |
| Reference county | `56` (Finnmark) |

---

## 2. Approved registry sources (Pilot 1)

| source_id | Fetch? | Notes |
|-----------|--------|-------|
| `T1_LOVDATA` | yes / no | |
| `T1_REGJERINGEN` | yes / no | |
| `T1_STORTINGET` | yes / no | |
| `T1_UDIR` | yes / no | |

---

## 3. Success criteria

| Criterion | Pass |
|-----------|------|
| All chartered URLs fetched (HTTP status recorded) | |
| Owner-held snapshot dir created | |
| Refresh outcome state assigned | |
| No product DB writes | |

---

## Final statement

**Pilot 1** only — not Finnmark publication, not matcher write.
