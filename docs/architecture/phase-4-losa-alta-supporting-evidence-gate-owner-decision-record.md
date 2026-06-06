# Phase 4 LOSA — Alta Combined Supporting Evidence Gate (Sub-gate 4)

| Field | Value |
|--------|--------|
| **Status** | Owner **Tier 1+2 combined packet** adopted for Alta LOSA pilot |
| **Section** | **P4-LOSA-ALTA-SUPPORTING-EVIDENCE** |
| **Closure label** | `PHASE_4_LOSA_ALTA_SUPPORTING_EVIDENCE_PACKET_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | Sub-gates **1–3** and **5** complete on Alta row |

**Does NOT:** authorize PSA insert, Route **#3**, publication decision (sub-gate 6), or clear `NOT_READY_FOR_APPLY`.

---

## Combined packet (binding)

| Field | Value |
|--------|--------|
| `source_id` | `T1T2_ALTA_LOSA_PUBLICATION_SUPPORT_PACKET` |
| `claim_class` | `publication_supporting_evidence` |
| `scope` | `delivery_site_alta` |
| `tier` | **T1+T2** (combined — **never alone**) |

### Component source refs (audit trail)

| # | `source_id` | Tier | Role in packet |
|---|-------------|------|----------------|
| 1 | `T1_UDIR_FJERNUNDERVISNING_DEEP` | T1 | legal / fjern frame |
| 2 | `T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP` | T1 | legal frame |
| 3 | `T1_REGJERINGEN_PROP57_FJERN_DEEP` | T1 | fjernundervisning rules |
| 4 | `T2_SCHOOL_NORDKAPP_VGS` | T2 | provider |
| 5 | `T2_KOMMUNE_ALTA_REF` | T2 | delivery municipality |
| 6 | `T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP` | T2 | programme stage |

**Prerequisite rule:** packet is `publishable: true` only when all Alta row Tier 2 claims are already `row_confirmed` and county Tier 1 row rule (P4LS4A1) applies.

---

## Owner decisions (P4LASE0–P4LASE7)

| # | Decision | Answer |
|---|----------|--------|
| P4LASE0 | Adopt combined packet after sub-gates 1–3, 5? | **Yes** |
| P4LASE1 | Packet **never sufficient alone** (code enforces prerequisites)? | **Yes** |
| P4LASE2 | Max **1** supporting-evidence CONFIRMED index row | **Yes** |
| P4LASE3 | Alta delivery row scope only | **Yes** |
| P4LASE4 | **No** PSA / Phase 2 DML | **Yes** |
| P4LASE5 | Evidence §4 on Alta → `ROW_SECTION_4_SATISFIED` | **Yes** |
| P4LASE6 | Publication decision remains separate (sub-gate 6) | **Yes** |
| P4LASE7 | CLI: `losa:finnmark-evidence-link` — Alta **6/6** publishable | **Yes** |

---

## Final boundary

Alta row **evidence §4 is satisfied**; PSA emission remains blocked on publication decision + write charter gates.
