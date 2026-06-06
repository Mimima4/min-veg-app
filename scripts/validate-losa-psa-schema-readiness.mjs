#!/usr/bin/env node
/**
 * P4-LOSA-PSA schema readiness — migration file proof (+ optional DB probe).
 * No PSA writes.
 */
import { createClient } from "@supabase/supabase-js";

import { assessLosaPsaSchemaReadiness } from "./lib/losa-psa-schema.mjs";

function parseArgs(argv) {
  const args = { probeDb: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--probe-db") {
      args.probeDb = true;
      continue;
    }
    if (token === "--json") {
      args.json = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/validate-losa-psa-schema-readiness.mjs [--probe-db] [--json]`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function createOptionalSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function main() {
  const args = parseArgs(process.argv);
  const supabase = args.probeDb ? createOptionalSupabase() : null;

  if (args.probeDb && !supabase) {
    console.error("ABORT: --probe-db requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const readiness = await assessLosaPsaSchemaReadiness({ supabase });

  if (args.json) {
    console.log(JSON.stringify(readiness, null, 2));
  } else {
    console.log(
      [
        "P4-LOSA-PSA schema readiness",
        `migration file: ${readiness.migrationFile.ok ? "OK" : "FAIL"} (${readiness.migrationFile.reason})`,
        `allowed scopes: ${readiness.allowedScopes.join(", ")}`,
        `LOSA write authorized: ${readiness.writeAuthorized}`,
        `ready for migration apply: ${readiness.readyForMigrationApply}`,
        readiness.dbApplied
          ? `db probe: ${readiness.dbApplied.reason}`
          : "db probe: skipped",
      ].join("\n")
    );
  }

  if (!readiness.migrationFile.ok) {
    process.exit(1);
  }

  if (readiness.writeAuthorized) {
    console.error("\nABORT: LOSA PSA write must remain unauthorized at schema gate");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
