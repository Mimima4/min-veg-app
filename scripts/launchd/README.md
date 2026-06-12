# VGS launchd agents

Install (from repo root):

```bash
./scripts/install-vgs-launchd.sh
```

Wrapper scripts: `scripts/cron/run-vgs-scheduled-ops.sh`, `scripts/cron/run-vgs-quarterly-stale-batch.sh`.

| Label | Schedule | Action |
|-------|----------|--------|
| `no.minveg.vgs-scheduled-ops` | 1 Jan, 1 Jul @ 03:00 | `npm run ops:scheduled` |
| `no.minveg.vgs-quarterly-stale-batch` | 1 Feb/May/Aug/Nov @ 03:00 | stale-draft batch only |

Requires `.env.local` at repo root with `VERCEL_APP_URL`, `CRON_SECRET`, Supabase keys.

Logs: `~/Library/Logs/no.minveg.vgs-*.log`

Unload:

```bash
launchctl bootout gui/$(id -u)/no.minveg.vgs-scheduled-ops
launchctl bootout gui/$(id -u)/no.minveg.vgs-quarterly-stale-batch
```
