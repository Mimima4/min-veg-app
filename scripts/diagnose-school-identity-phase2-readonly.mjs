import {
  createEmptyPhase2DiagnosticsPayload,
  getPhase2ReadOnlyDiagnostics,
} from "./lib/phase2-readonly-diagnostics-helper.mjs";

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

function toFlatCliPayload(nested) {
  try {
    const flat = nested?.phase2ReadOnlyDiagnostics;
    if (flat && typeof flat === "object") return flat;
  } catch (_) {
    /* ignore */
  }
  return createEmptyPhase2DiagnosticsPayload("phase2_unexpected_error").phase2ReadOnlyDiagnostics;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const professionSlug = String(args.profession ?? "").trim();
  const countyCode = String(args.county ?? "").trim();
  const stage = String(args.stage ?? "").trim();
  const sourceSnapshotLabel = String(args["source-snapshot"] ?? "").trim();

  try {
    if (!professionSlug || !countyCode) {
      const flat = toFlatCliPayload(
        createEmptyPhase2DiagnosticsPayload("phase2_unexpected_error")
      );
      console.log(JSON.stringify(flat, null, 2));
      process.exit(0);
      return;
    }

    const nested = await getPhase2ReadOnlyDiagnostics(
      { professionSlug, countyCode, stage, sourceSnapshotLabel },
      {}
    );
    console.log(JSON.stringify(toFlatCliPayload(nested), null, 2));
  } catch {
    console.log(
      JSON.stringify(
        toFlatCliPayload(createEmptyPhase2DiagnosticsPayload("phase2_unexpected_error")),
        null,
        2
      )
    );
  }
  process.exit(0);
}

main();
