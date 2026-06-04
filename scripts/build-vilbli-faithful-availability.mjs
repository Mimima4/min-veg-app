import { buildVilbliFaithfulAvailability } from "./lib/vilbli-faithful-availability-builder.mjs";

function parseArgs(argv) {
  const args = {};
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

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const professionSlug = String(args.profession ?? "").trim();
  const countyCode = String(args.county ?? "").trim();

  if (!professionSlug || !countyCode) {
    throw new Error(
      "Usage: node scripts/build-vilbli-faithful-availability.mjs --profession electrician --county 56"
    );
  }

  const payload = await buildVilbliFaithfulAvailability({ professionSlug, countyCode });
  console.log(JSON.stringify(payload, null, 2));
}

run().catch((error) => {
  console.error("vilbli-faithful availability failed:", error.message);
  process.exit(1);
});
