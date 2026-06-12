# VGS launchd agents

Install (from repo root):

```bash
./scripts/install-vgs-launchd.sh
```

Wrapper scripts: `scripts/cron/run-vgs-scheduled-ops.sh`, `scripts/cron/run-vgs-quarterly-stale-batch.sh`.

| Label | Schedule | Action |
|-------|----------|--------|
| `no.minveg.vgs-scheduled-ops` | **1 Feb, 1 Aug** @ 03:00 | full ops (Vilbli relay + green A + batch) |
| `no.minveg.vgs-quarterly-stale-batch` | **1 Jan/Apr/Jul/Oct** @ 03:00 | stale-draft batch only |

Requires `.env.local` at repo root with `VERCEL_APP_URL`, `CRON_SECRET`, Supabase keys.

Logs: `~/Library/Logs/no.minveg.vgs-*.log`

Unload:

```bash
launchctl bootout gui/$(id -u)/no.minveg.vgs-scheduled-ops
launchctl bootout gui/$(id -u)/no.minveg.vgs-quarterly-stale-batch
```
