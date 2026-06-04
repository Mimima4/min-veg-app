import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const outdir = path.join(root, "src/server/vgs/generated");
const outfile = path.join(outdir, "contour-b-scheduler.bundle.mjs");

fs.mkdirSync(outdir, { recursive: true });

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
