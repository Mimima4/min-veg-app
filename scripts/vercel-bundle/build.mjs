import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const outfile = path.join(root, "scripts/.vercel-bundle/scheduler.mjs");

await esbuild.build({
  entryPoints: [path.join(root, "scripts/vercel-bundle/entry.mjs")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile,
  logLevel: "info",
});

console.log(`[vercel-bundle] wrote ${outfile}`);
