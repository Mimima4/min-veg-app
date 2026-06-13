#!/usr/bin/env node
/**
 * Smoke: R-VG3-CATALOG classification rules (no DB).
 */
import { isMainModule } from "./lib/is-main-module.mjs";
import {
  classifyVg3CatalogPsaStatus,
  isStrictAuditFailureStatus,
} from "./lib/vg3-catalog-status.mjs";
import {
  expectsVg3SchoolProgrammeInContour,
  shouldMaterializeExpandedProgrammeCatalog,
} from "./vgs-path-definitions.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runFixture(name, fn) {
  fn();
  console.error(`[smoke:vg3-catalog] ${name}: OK`);
}

export function runVg3CatalogStatusSmoke() {
  runFixture("electrician/mechanic do not require school VG3 in contour", () => {
    assert(expectsVg3SchoolProgrammeInContour("electrician") === false);
    assert(expectsVg3SchoolProgrammeInContour("mechanic") === false);
  });

  runFixture("Oslo electrician catalog without PSA is orphan not strict gap", () => {
    const status = classifyVg3CatalogPsaStatus({
      professionSlug: "electrician",
      countyCode: "03",
      catalogVg3Count: 10,
      psaVg3Count: 0,
    });
    assert(status === "catalog_orphan");
    assert(isStrictAuditFailureStatus(status) === false);
  });

  runFixture("Contour B mechanic catalog without PSA is orphan (path does not require school VG3)", () => {
    const status = classifyVg3CatalogPsaStatus({
      professionSlug: "mechanic",
      countyCode: "56",
      catalogVg3Count: 10,
      psaVg3Count: 0,
    });
    assert(status === "catalog_orphan");
    assert(isStrictAuditFailureStatus(status) === false);
  });

  runFixture("strict audit fails only on actionable_gap status", () => {
    assert(isStrictAuditFailureStatus("actionable_gap") === true);
    assert(isStrictAuditFailureStatus("catalog_orphan") === false);
  });

  runFixture("PSA present is live", () => {
    const status = classifyVg3CatalogPsaStatus({
      professionSlug: "electrician",
      countyCode: "15",
      catalogVg3Count: 1,
      psaVg3Count: 2,
    });
    assert(status === "live");
  });

  runFixture("pipeline skips VG3 catalog without schools", () => {
    assert(
      shouldMaterializeExpandedProgrammeCatalog({
        stage: "VG3",
        source: "school_programme_link",
        schools: [],
      }) === false
    );
    assert(
      shouldMaterializeExpandedProgrammeCatalog({
        stage: "VG3",
        source: "apprenticeship_branch_programme",
        schools: [],
      }) === false
    );
    assert(
      shouldMaterializeExpandedProgrammeCatalog({
        stage: "VG3",
        source: "school_programme_link",
        schools: [{ schoolCode: "123" }],
      }) === true
    );
  });
}

if (isMainModule(import.meta.url)) {
  try {
    runVg3CatalogStatusSmoke();
    console.error("[smoke:vg3-catalog] PASS");
  } catch (error) {
    console.error("[smoke:vg3-catalog] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
