# Billing / Access operational runners

These internal routes are intended for scheduled execution (cron / job runner).

## 1. Billing orchestration retry processor
POST `/api/internal/billing/run-retry-processor`

Purpose:
- retry failed billing orchestration runs
- continue payment-driven downstream processing

Auth:
- `BILLING_SYNC_SECRET`

Recommended frequency:
- every 1–5 minutes

---

## 2. Billing notification processor
POST `/api/internal/billing/run-notification-processor`

Purpose:
- process pending billing notification events
- process failed notification retries when `next_retry_at` is due

Auth:
- `BILLING_SYNC_SECRET`

Recommended frequency:
- every 1–5 minutes

---

## 3. Complimentary grant expiry processor
POST `/api/internal/billing/run-complimentary-expiry`

Purpose:
- mark expired complimentary access grants as `expired`

Auth:
- `BILLING_SYNC_SECRET`

Recommended frequency:
- every 15–60 minutes

---

## Notes

- These routes are internal/operator infrastructure.
- They should not be exposed in user-facing UI.
- They are safe candidates for deployment cron jobs.