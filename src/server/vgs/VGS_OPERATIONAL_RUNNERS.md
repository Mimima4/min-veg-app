# VGS Contour B operational scheduler

Batch verify/ingest for eligible `(profession, county)` pairs. **Not** invoked on route page load.

## Cadence

**Every 6 months:** 1 January and 1 July 00:00 UTC (`vercel.json` cron).

## Recommended automation (no GitHub secrets)

1. Deploy on **Vercel** with existing app env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (already required for admin routes)
2. Add **`CRON_SECRET`** in **Vercel → Project → Environment Variables** (Production).  
   Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` — this is **not** the service role; it only **triggers** the job.
3. Cron hits:  
   `GET /api/internal/vgs/run-contour-b-operational-scheduler`  
   (configured in `vercel.json`).

Optional: reuse `BILLING_SYNC_SECRET` as the bearer value instead of a separate `CRON_SECRET` (same header patterns as billing internal routes).

## Do not use

- **GitHub Actions** with Supabase keys in repository secrets (removed from repo).
- Manual CLI as the primary operator path (scripts remain for debugging).

## Local / debug only

```bash
node scripts/run-contour-b-operational-scheduler.mjs [--dry-run] [--profession electrician] [--county 56]
```

## External cron alternative

If not on Vercel: any HTTPS cron (e.g. cron-job.org) may `GET` the deployed URL with  
`Authorization: Bearer <CRON_SECRET>` or header `x-internal-secret`.  
Store **only** the trigger secret on the cron provider — **not** `SUPABASE_SERVICE_ROLE_KEY`.
