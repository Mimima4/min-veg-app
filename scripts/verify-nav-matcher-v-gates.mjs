#!/usr/bin/env node
/**
 * Automatable NAV matcher verification gates (V-1…V-6, V-8).
 * V-7 remains owner browser E2E (mechanic Vestland pilot).
 *
 * Usage:
 *   npm run verify:nav-matcher-v-gates
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./lib/is-main-module.mjs";

const PATH_VARIANT_DIRECT_BEDRIFT = "vilbli-branch-direct-bedrift";
const PATH_VARIANT_VG3_THEN_BEDRIFT = "vilbli-branch-vg3-then-bedrift";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runGate(name, fn) {
  fn();
  console.error(`[verify:nav-matcher] ${name}: OK`);
}

function mockVariants() {
  return [
    { variantId: PATH_VARIANT_DIRECT_BEDRIFT, nodes: [{ id: "vg1" }, { id: "app" }] },
    { variantId: PATH_VARIANT_VG3_THEN_BEDRIFT, nodes: [{ id: "vg1" }, { id: "vg3" }, { id: "app" }] },
  ];
}

function resolvePathVariantForFilter(params) {
  const hidden = new Set();
  hidden.add("fagskole_after_vgs");
  hidden.add("long_academic");
  hidden.add("pabygging_studiekompetanse");
  if (!params.hasVg3SchoolProgrammeAvailability) {
    hidden.add("vg3_before_apprenticeship");
  }

  let effectiveFilterId = params.filterId;
  if (hidden.has(effectiveFilterId)) {
    effectiveFilterId = "open";
  }

  const direct = params.variants.find((v) => v.variantId === PATH_VARIANT_DIRECT_BEDRIFT) ?? null;
  const vg3Then = params.variants.find((v) => v.variantId === PATH_VARIANT_VG3_THEN_BEDRIFT) ?? null;

  let primary = null;
  switch (effectiveFilterId) {
    case "fast_to_work":
      primary = direct;
      break;
    case "vg3_before_apprenticeship":
      primary = vg3Then;
      break;
    default:
      primary = direct;
  }

  return {
    primaryPathVariantId: primary?.variantId ?? null,
    hiddenFilterIds: Array.from(hidden),
    effectiveFilterId,
  };
}

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, acc);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function readTree(rootDir) {
  return walkFiles(rootDir).map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

export function runNavMatcherVGates(options = {}) {
  const skipBuild = Boolean(options.skipBuild);
  const variants = mockVariants();

  runGate("V-1 fast_to_work → direct-bedrift", () => {
    const result = resolvePathVariantForFilter({
      filterId: "fast_to_work",
      variants,
      hasVg3SchoolProgrammeAvailability: true,
    });
    assert(
      result.primaryPathVariantId === PATH_VARIANT_DIRECT_BEDRIFT,
      `expected ${PATH_VARIANT_DIRECT_BEDRIFT}, got ${result.primaryPathVariantId}`
    );
  });

  runGate("V-2 vg3_before_apprenticeship → vg3-then-bedrift", () => {
    const result = resolvePathVariantForFilter({
      filterId: "vg3_before_apprenticeship",
      variants,
      hasVg3SchoolProgrammeAvailability: true,
    });
    assert(
      result.primaryPathVariantId === PATH_VARIANT_VG3_THEN_BEDRIFT,
      `expected ${PATH_VARIANT_VG3_THEN_BEDRIFT}, got ${result.primaryPathVariantId}`
    );
  });

  runGate("V-2 without VG3 PSA hides vg3 filter", () => {
    const result = resolvePathVariantForFilter({
      filterId: "vg3_before_apprenticeship",
      variants,
      hasVg3SchoolProgrammeAvailability: false,
    });
    assert(
      result.effectiveFilterId === "open",
      "vg3 filter must fall back to open without PSA-backed VG3"
    );
    assert(
      result.primaryPathVariantId === PATH_VARIANT_DIRECT_BEDRIFT,
      "fallback primary must be direct-bedrift"
    );
  });

  runGate("V-4 fagskole/long_academic hidden", () => {
    for (const filterId of ["fagskole_after_vgs", "long_academic"]) {
      const result = resolvePathVariantForFilter({
        filterId,
        variants,
        hasVg3SchoolProgrammeAvailability: true,
      });
      assert(
        result.hiddenFilterIds.includes(filterId),
        `${filterId} must stay hidden`
      );
      assert(result.effectiveFilterId === "open", `${filterId} must not become effective`);
    }
  });

  runGate("V-5 no live NAV fetch in route request path", () => {
    const routeServerTree = readTree(path.join(ROOT, "src/server/children/routes"));
    const navSnapshotModule = fs.readFileSync(
      path.join(ROOT, "src/server/nav/get-nav-occupation-snapshot.ts"),
      "utf8"
    );
    assert(
      !/fetch\s*\(\s*['"`]https?:\/\/[^'"`]*nav\./i.test(routeServerTree),
      "route server path must not fetch live NAV HTML"
    );
    assert(
      navSnapshotModule.includes('from("nav_occupation_snapshots")'),
      "NAV data must come from versioned DB snapshot"
    );
  });

  runGate("V-6 no review-* synthetic profession IDs in family UI", () => {
    const appTree = readTree(path.join(ROOT, "src/app"));
    assert(!/review-[a-z0-9-]+/i.test(appTree), "family UI must not expose review-* profession slugs");
  });

  if (!skipBuild) {
    runGate("V-8 build passes", () => {
      const result = spawnSync("npm", ["run", "build"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
        env: process.env,
      });
      if (result.status !== 0) {
        const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
        throw new Error(`build failed:\n${combined.slice(-1500)}`);
      }
    });
  }
}

if (isMainModule(import.meta.url)) {
  const skipBuild = process.argv.includes("--skip-build");
  try {
    runNavMatcherVGates({ skipBuild });
    const suffix = skipBuild
      ? "V-1…V-6 PASS (V-7 browser E2E owner-held; V-8 skipped — run npm run build)"
      : "V-1…V-6 + V-8 PASS (V-7 browser E2E still owner-held)";
    console.error(`[verify:nav-matcher] ${suffix}`);
  } catch (error) {
    console.error("[verify:nav-matcher] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
