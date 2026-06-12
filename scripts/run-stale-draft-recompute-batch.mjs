/**
 * Production stale-draft route recompute batch (calls Vercel API).
 *
 * Env: VERCEL_APP_URL, CRON_SECRET (or BILLING_SYNC_SECRET)
 *
 *   node scripts/run-stale-draft-recompute-batch.mjs [--dry-run] [--force]
 */
function parseArgs(argv) {
  const args = { "dry-run": "false", force: "false" };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const force = String(args.force ?? "").toLowerCase() === "true";

  const baseUrl = String(process.env.VERCEL_APP_URL ?? "").trim().replace(/\/$/, "");
  const secret = String(
    process.env.CRON_SECRET ?? process.env.BILLING_SYNC_SECRET ?? ""
  ).trim();

  if (!baseUrl || !secret) {
    throw new Error("Set VERCEL_APP_URL and CRON_SECRET (or BILLING_SYNC_SECRET)");
  }

  const url = `${baseUrl}/api/internal/routes/run-stale-draft-recompute-batch`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dryRun,
      force,
      triggerReason: "scheduled_stale_batch",
    }),
    signal: AbortSignal.timeout(280_000),
  });

  const raw = await response.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`batch HTTP ${response.status}: expected JSON (${raw.slice(0, 160)})`);
  }

  console.log(JSON.stringify(body, null, 2));

  if (!response.ok || body.ok === false) {
    throw new Error(body.error ?? `batch HTTP ${response.status}`);
  }

  if (body.skipped) {
    console.error(`[stale-draft-batch] skipped: ${body.reason ?? "unknown"}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
