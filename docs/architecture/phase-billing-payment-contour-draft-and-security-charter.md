# Billing / payment contour — draft state and security charter

**Status:** `NOT_READY_FOR_LIVE_PAYMENTS`  
**Scope:** Provider ingest (Stripe / Vipps / future), payment intents, subscription access, Tripletex accounting export, operator/admin paths.  
**Purpose:** Record what exists today, what is missing, and **mandatory security work** when this contour goes live.

Family **access gating** (trial / paid / readonly) is in production scope. **Live provider checkout and automatic settlement** are **not** closed in this charter.

---

## 1. Owner risk priorities (ordered)

| Priority | Risk | Business impact |
|----------|------|-----------------|
| P0 | Stolen **infrastructure secrets** (`SUPABASE_SERVICE_ROLE_KEY`, Vercel/GitHub/Supabase owner access) | Full data loss, impersonation, product lockout |
| P0 | Stolen **billing operator secrets** (`BILLING_PROVIDER_INGEST_SECRET`, `BILLING_SYNC_SECRET`) | Fake “paid” access without real money |
| P0 | Compromised **payment provider merchant dashboard** (Stripe / Vipps) | Settlement account change → revenue diverted |
| P1 | **Platform admin** escalation (`app_metadata.platform_admin`) | Free grants, manual billing ingest, audit replay |
| P2 | **Child/route IDOR** (weak RLS + APIs without `assertFamilyOwnsChild`) | Privacy / GDPR; not primary revenue risk per owner |
| P3 | Session theft (phishing / XSS) | Single-account compromise |

This charter focuses on **P0 billing** and lists **non-billing** guards in §8.

---

## 2. Systems in the contour

| System | Role today | In repo? | Live checkout? |
|--------|------------|----------|----------------|
| **Stripe** (or Stripe-like events) | Subscription / payment event names mapped in `map-provider-billing-event.ts` | Partial (normalized ingest only) | **No** end-to-end webhook route |
| **Vipps** | Not implemented | **No** mappers, env, or relay | **No** |
| **Tripletex** | Accounting export **from** paid ledger entries | Yes (`tripletex-export-*`) | N/A (not a payer) |
| **Admin manual ingest** | Operator records subscription by user email | Yes (platform admin UI) | Operator-only |
| **Internal cron runners** | Retry orchestration, notifications, complimentary expiry | Yes (`OPERATIONAL_RUNNERS.md`) | Cron + `BILLING_SYNC_SECRET` |

**Money path (target, not fully wired):**

```text
User checkout (Stripe / Vipps)
  → provider webhook (signed)
  → relay OR native webhook route (parse raw event)
  → optional: create/confirm payment_intent
  → record-provider-payment (paid)
  → orchestration → family access + ledger + Tripletex queue
```

**Today:** steps exist as **internal APIs** and **server modules**; there is **no** public provider webhook endpoint and **no** checkout UI wired to a provider in this repo.

---

## 3. Current code inventory (as of 2026-06-10)

### 3.1 Internal API routes

| Route | Auth today | Provider signature |
|-------|------------|-------------------|
| `POST /api/internal/billing/ingest-provider-event` | `BILLING_PROVIDER_INGEST_SECRET` | Optional HMAC if `BILLING_PROVIDER_{PROVIDER}_WEBHOOK_SECRET` set; **if missing → `not_configured` and ingest still runs** |
| `POST /api/internal/billing/record-provider-payment` | `BILLING_PROVIDER_INGEST_SECRET` | **None** |
| `POST /api/internal/billing/create-payment-intent` | `BILLING_PROVIDER_INGEST_SECRET` | **None** |
| `POST /api/internal/billing/update-payment-intent-status` | `BILLING_PROVIDER_INGEST_SECRET` | **None** |
| `POST /api/internal/billing/ingest-subscription-event` | `BILLING_SYNC_SECRET` | **None** |
| `POST /api/internal/billing/issue-complimentary-grant` | `BILLING_SYNC_SECRET` | **None** |
| Cron-style billing runners | `BILLING_SYNC_SECRET` | N/A |

Implementation references:

- Signature helper: `src/server/billing/verify-provider-ingest-request.ts`
- Normalized event mapper: `src/server/billing/map-provider-billing-event.ts`
- Subscription ingest: `src/server/billing/ingest-billing-subscription-event.ts`
- Provider audit table: `scripts/sql/provider-billing-events-audit-foundation.sql`
- Admin visibility: `src/app/[locale]/(platform)/admin/dashboard/provider-events/`

### 3.2 What ingest expects (not raw Stripe / Vipps JSON)

`ingest-provider-event` expects a **normalized** JSON body, for example:

```json
{
  "provider": "stripe",
  "providerEventId": "evt_123",
  "providerEventType": "invoice.paid",
  "customerEmail": "family@example.com",
  "planCode": "family_basic",
  "billingCycle": "yearly"
}
```

Raw Stripe webhooks use `type`, `data.object`, etc. **This app does not parse raw provider payloads yet.** A **relay** or a **new native webhook route** is required per provider.

### 3.3 Signature algorithm (already implemented)

When `BILLING_PROVIDER_{PROVIDER}_WEBHOOK_SECRET` is set:

- Headers: `stripe-signature` or `x-provider-signature` + optional `x-provider-timestamp`
- Payload signed: `{timestamp}.{rawRequestBody}`
- Algorithm: HMAC-SHA256 (hex), compatible with common Stripe-style `t=...,v1=...` headers

**Gap:** verification is **skipped** when webhook secret env is unset.

---

## 4. Mandatory work before live payments (`GO_LIVE_GATE`)

Do **not** enable public checkout until all items below are **PASS**.

### 4.1 Provider wiring (functional)

- [ ] Choose primary provider(s): Stripe, Vipps, … — document in `BILLING_PROVIDER_ALLOWLIST`
- [ ] **Stripe:** native `POST /api/webhooks/stripe` (or equivalent) that:
  - reads **raw body**
  - verifies **Stripe** signature (official SDK or equivalent)
  - maps to internal normalized event + `payment_intent` / `record-provider-payment` as needed
- [ ] **Vipps:** same pattern — Vipps-specific signature rules + event mapper (new file; not in repo today)
- [ ] Remove or strictly env-gate any reliance on manual relay posting normalized JSON without provider proof
- [ ] Checkout UI → `create-payment-intent` only from authenticated, authorized server actions (never expose `BILLING_PROVIDER_INGEST_SECRET` to browser)

### 4.2 Security (fail-closed in production)

- [ ] **Production:** reject `ingest-provider-event` when `signatureVerified !== true`
- [ ] **Production:** reject `record-provider-payment` unless called from trusted server path that already verified provider payment (no standalone bearer-only forgery)
- [ ] **Production:** require `BILLING_PROVIDER_{PROVIDER}_WEBHOOK_SECRET` for every allowlisted provider
- [ ] Separate secrets: `dev` / `staging` / `prod`; rotation playbook documented
- [ ] `BILLING_SYNC_SECRET` and `BILLING_PROVIDER_INGEST_SECRET` — long random, CI/Vercel only, never client
- [ ] Optional: IP allowlist on internal billing routes from known cron egress
- [ ] Alert on `provider_billing_event_audits` with `status IN (failed, rejected)` spike

### 4.3 Verification tests (automated)

- [ ] Unit tests: signature verify pass / fail / missing secret
- [ ] Integration: fake webhook without signature → 401/403
- [ ] Integration: forged `record-provider-payment` with bearer only in prod config → rejected
- [ ] Integration: valid Stripe fixture event → family access updated once (idempotent replay)

### 4.4 Operator paths (still needed, but bounded)

- [ ] Admin manual ingest: keep **platform_admin** only; audit log who recorded what
- [ ] Complimentary grants: `BILLING_SYNC_SECRET` + admin workflow; no user-facing grant API
- [ ] Provider audit replay: admin-only; confirm replay cannot run from user session

### 4.5 Tripletex (accounting, not collection)

- [ ] `TRIPLETEX_EXPORT_MODE=real` only after customer sync validated
- [ ] Tripletex tokens server-only; export queue monitored

---

## 5. Target architecture per provider

### 5.1 Stripe (recommended first)

```text
Stripe Dashboard
  webhook → https://{app}/api/webhooks/stripe
    verify Stripe-Signature (whsec_...)
    map event → payment_intent + record-provider-payment OR ingest-provider-event
    idempotent on provider_event_id
```

Env:

- `BILLING_PROVIDER_ALLOWLIST=stripe`
- `BILLING_PROVIDER_STRIPE_WEBHOOK_SECRET=whsec_...`
- `BILLING_PROVIDER_INGEST_SECRET` — only for server-to-server if relay kept; prefer removing relay for Stripe

### 5.2 Vipps (when added)

- New mapper cases in `map-provider-billing-event.ts` for Vipps `eventType` strings
- `BILLING_PROVIDER_VIPPS_WEBHOOK_SECRET` (or provider-documented signing scheme)
- Native webhook route with **Vipps-documented** signature verification (do not reuse Stripe HMAC blindly without reading their spec)
- E2E test with Vipps test environment webhooks

### 5.3 Tripletex

- **Outbound only** after real payment confirmed
- No inbound payment trust on Tripletex callbacks unless explicitly added later

---

## 6. Example attack scenarios (for test design)

### 6.1 Fake paid (must fail after GO_LIVE_GATE)

```http
POST /api/internal/billing/ingest-provider-event
Authorization: Bearer <stolen_BILLING_PROVIDER_INGEST_SECRET>
Content-Type: application/json

{"provider":"stripe","providerEventId":"evt_fake",...,"customerEmail":"attacker@example.com"}
```

**Expected after gate:** 401/403 (no valid provider signature).

### 6.2 Revenue diversion (out of app scope but owner-critical)

Attacker changes settlement IBAN in **Stripe/Vipps merchant dashboard**.  
**Mitigation:** 2FA on merchant accounts, separate login, alert on payout detail change — **operational**, not app code.

### 6.3 Free access via complimentary grant

```http
POST /api/internal/billing/issue-complimentary-grant
Authorization: Bearer <stolen_BILLING_SYNC_SECRET>
```

**Mitigation:** secret rotation, IP allowlist, monitoring, no secret in client bundles.

---

## 7. Related env checklist (payment go-live)

| Variable | Purpose |
|----------|---------|
| `BILLING_PROVIDER_ALLOWLIST` | Comma-separated allowed provider slugs |
| `BILLING_PROVIDER_INGEST_SECRET` | Server-to-server ingest auth (minimize surface in prod) |
| `BILLING_SYNC_SECRET` | Cron + operator internal routes |
| `BILLING_PROVIDER_STRIPE_WEBHOOK_SECRET` | Stripe webhook HMAC |
| `BILLING_PROVIDER_VIPPS_WEBHOOK_SECRET` | Vipps webhook signing (when added) |
| `BILLING_PROVIDER_*_WEBHOOK_SECRET` | Pattern per provider |

---

## 8. Where else to protect (outside payment contour)

Not blocking payment go-live, but owner should track:

### 8.1 Infrastructure ownership (P0 — “steal the product”)

- GitHub org: 2FA, minimal owners, branch protection on `main`
- Vercel team: 2FA, limit env var viewers, separate prod project
- Supabase org: 2FA, owner recovery codes stored safely
- Domain registrar / DNS: 2FA, prevent silent NS transfer
- Stripe / Vipps **merchant** admin: 2FA, payout change alerts

**Note:** Service role key lets an attacker corrupt data and impersonate users; it does **not** transfer Vercel/GitHub ownership without those account credentials.

### 8.2 Application secrets (P0)

- `SUPABASE_SERVICE_ROLE_KEY` — server/CI/scripts only; never client; rotate on leak
- E2E uses service role locally (`e2e/lib/e2e-service-auth.ts`) — does not widen production attack surface

### 8.3 Platform admin (P1)

- `app_metadata.role = platform_admin` — only via Supabase auth admin / controlled process
- Admin routes under `(platform)/admin` — layout gate in `admin/layout.tsx`
- Manual billing ingest form — powerful; keep admin count minimal

### 8.4 Child / route data (P2 — privacy)

- APIs under `/api/internal/routes/*` trust Supabase session + RLS; explicit `assertFamilyOwnsChild` still recommended (defense in depth)
- Phase 2 RLS main apply remains separate track (`phase-2-rls-*` docs)

**Implemented (2026-06-10):** `requireFamilyChildAccess` / `requireFamilyChildAccessForRouteId` in `src/server/children/require-family-child-access.ts`, wired into user-facing route API handlers (cron/scheduler paths unchanged).

### 8.5 User session (P3)

- Supabase auth defaults; rate limit login; CSP as app matures

**Implemented (2026-06-10):** baseline security headers in `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

## 9. Suggested implementation order (when contour starts)

1. Native **Stripe** webhook route + tests + prod fail-closed signature
2. Checkout server action (authenticated) → `create-payment-intent` → Stripe Checkout / Payment Element
3. Close bearer-only forgery on `record-provider-payment` in production
4. **Vipps** if required for NO market — separate mapper + webhook route
5. Operator runbook + secret rotation drill
6. Optional: child-route IDOR tests (privacy, lower priority per owner)

---

## 10. Document links

- Operational cron: `src/server/billing/OPERATIONAL_RUNNERS.md`
- Provider audit UI: `/admin/dashboard/provider-events`
- E2E auth (dev only): `e2e/lib/e2e-service-auth.ts`

**This document does not approve live payments or schema apply. It is planning + security gate only.**
