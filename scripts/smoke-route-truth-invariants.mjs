#!/usr/bin/env node
/**
 * Route truth invariant smoke — catches VG3 fabrication / kolonne-3 regressions without browser E2E.
 *
 * Usage:
 *   node --experimental-strip-types scripts/smoke-route-truth-invariants.mjs
 */
import { isMainModule } from "./lib/is-main-module.mjs";
import {
  collectPathVariantInvariantViolations,
  collectStudyRouteStepsInvariantViolations,
  collectPrimaryRouteCompletenessViolations,
  isHomeCountyPrimarySchoolChainComplete,
} from "./lib/route-truth-invariants.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runFixture(name, fn) {
  const violations = fn();
  if (violations.length > 0) {
    throw new Error(
      `${name}: expected no violations, got ${violations
        .map((item) => item.code)
        .join(", ")}`
    );
  }
  console.error(`[smoke:route-truth] ${name}: OK`);
}

function runNegativeFixture(name, expectedCode, fn) {
  const violations = fn();
  const hit = violations.some((item) => item.code === expectedCode);
  if (!hit) {
    throw new Error(
      `${name}: expected violation ${expectedCode}, got ${violations
        .map((item) => item.code)
        .join(", ") || "none"}`
    );
  }
  console.error(`[smoke:route-truth] ${name}: OK (${expectedCode})`);
}

function finnmarkMechanicTruthRows() {
  return [
    {
      stage: "VG1",
      institutionId: "school-a",
      institutionName: "Alta videregående skole",
      availabilityScope: "programme_in_school",
      programSlug: "mechanic-vg1-teknologi-finnmark",
    },
    {
      stage: "VG2",
      institutionId: "school-a",
      institutionName: "Alta videregående skole",
      availabilityScope: "programme_in_school",
      programSlug: "mechanic-vg2-kjoretoy-finnmark",
    },
  ];
}

function finnmarkElectricianVg3TruthRows() {
  return [
    ...finnmarkMechanicTruthRows().map((row) => ({
      ...row,
      programSlug: row.stage === "VG1" ? "electrician-vg1-elektro-finnmark" : "electrician-vg2-elenergi-finnmark",
    })),
    {
      stage: "VG3",
      institutionId: "school-b",
      institutionName: "Fagskolen i Finnmark",
      availabilityScope: "programme_in_school",
      programSlug: "electrician-vg3-maritim-elektriker-finnmark",
    },
  ];
}

function run() {
  const mechanicTruth = finnmarkMechanicTruthRows();

  runFixture("direct-bedrift variant without ghost VG3 node", () =>
    collectPathVariantInvariantViolations({
      truthRows: mechanicTruth,
      variants: [
        {
          variantId: "vilbli-branch-direct-bedrift",
          label: "VG1 → VG2 → opplæring i bedrift",
          nodes: [
            { type: "programme_selection", stage: "VG1", title: "VG1" },
            { type: "programme_selection", stage: "VG2", title: "VG2" },
            { type: "apprenticeship_step", title: "Opplæring i bedrift" },
          ],
        },
      ],
    })
  );

  runNegativeFixture(
    "vg3-then-bedrift without PSA truth is blocked",
    "PATH_VG3_VARIANT_WITHOUT_TRUTH",
    () =>
      collectPathVariantInvariantViolations({
        truthRows: mechanicTruth,
        variants: [
          {
            variantId: "vilbli-branch-vg3-then-bedrift",
            label: "VG1 → VG2 → VG3 → opplæring i bedrift",
            nodes: [
              { type: "programme_selection", stage: "VG1", title: "VG1" },
              { type: "programme_selection", stage: "VG2", title: "VG2" },
              { type: "programme_selection", stage: "VG3", title: "VG3" },
              { type: "apprenticeship_step", title: "Opplæring i bedrift" },
            ],
          },
        ],
      })
  );

  runNegativeFixture(
    "kolonne-3 options on VG3 node are blocked",
    "PATH_VG3_NODE_HAS_BRANCH_OPTIONS",
    () =>
      collectPathVariantInvariantViolations({
        truthRows: finnmarkElectricianVg3TruthRows(),
        variants: [
          {
            variantId: "vilbli-branch-vg3-then-bedrift",
            label: "VG1 → VG2 → VG3 → opplæring i bedrift",
            nodes: [
              { type: "programme_selection", stage: "VG1", title: "VG1" },
              { type: "programme_selection", stage: "VG2", title: "VG2" },
              {
                type: "programme_selection",
                stage: "VG3",
                title: "VG3",
                options: [
                  {
                    optionId: "kolonne3-bilfaget",
                    optionTitle: "Bilfaget, lette kjøretøy",
                  },
                ],
              },
              { type: "apprenticeship_step", title: "Opplæring i bedrift" },
            ],
          },
        ],
      })
  );

  runNegativeFixture(
    "fabricated VG3 step without truth is blocked",
    "STEP_VG3_WITHOUT_TRUTH",
    () =>
      collectStudyRouteStepsInvariantViolations({
        truthRows: mechanicTruth,
        steps: [
          {
            type: "programme_selection",
            stage: "VG3",
            title: "VG3 Bilfaget",
            institution_name: "Alta videregående skole",
            education_level: "vg3",
            fit_band: "strong",
            program_slug: "kolonne3-bilfaget",
            current_profession_slug: "mechanic",
            options: [
              {
                institution_id: "vilbli-branch:kolonne3-bilfaget",
                institution_name: "Alta videregående skole",
                verification_status: "verified",
              },
            ],
          },
        ],
      })
  );

  runFixture("truth-backed VG3 school step passes", () =>
    collectStudyRouteStepsInvariantViolations({
      truthRows: finnmarkElectricianVg3TruthRows(),
      steps: [
        {
          type: "programme_selection",
          stage: "VG3",
          title: "VG3 Maritim elektriker",
          institution_name: "Fagskolen i Finnmark",
          education_level: "vg3",
          fit_band: "strong",
          program_slug: "electrician-vg3-maritim-elektriker-finnmark",
          current_profession_slug: "electrician",
          options: [
            {
              institution_id: "school-b",
              institution_name: "Fagskolen i Finnmark",
              program_slug: "electrician-vg3-maritim-elektriker-finnmark",
              verification_status: "verified",
            },
          ],
        },
      ],
    })
  );

  runNegativeFixture(
    "kolonne-3 fag mixed into apprenticeship with LAREFAG step is blocked",
    "STEP_APPRENTICESHIP_HAS_KOLONNE3_FAG_OPTIONS",
    () =>
      collectStudyRouteStepsInvariantViolations({
        truthRows: finnmarkMechanicTruthRows(),
        steps: [
          {
            type: "programme_selection",
            stage: "LAREFAG",
            title: "Elektrikerfaget",
            program_slug: "kolonne3-elektriker",
            program_title: "Elektrikerfaget",
            options: [
              {
                institution_id: "vilbli-branch:kolonne3-elektriker",
                institution_name: "Elektrikerfaget",
                program_title: "Elektrikerfaget",
              },
            ],
          },
          {
            type: "apprenticeship_step",
            title: "Opplæring i bedrift (Elektrikerfaget)",
            apprenticeship_options: [
              {
                option_id: "kolonne3-elektriker",
                option_title: "Elektrikerfaget",
              },
            ],
          },
        ],
      })
  );

  runNegativeFixture(
    "VG1-only primary steps without home-fylke VG2 PSA are blocked",
    "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY",
    () =>
      collectPrimaryRouteCompletenessViolations({
        truthRows: [
          {
            stage: "VG1",
            institutionId: "school-a",
            institutionName: "Alta vgs",
            availabilityScope: "programme_in_school",
            programSlug: "painter-vg1-bygg-finnmark",
          },
        ],
        steps: [
          {
            type: "programme_selection",
            stage: "VG1",
            title: "VG1 Bygg",
            program_slug: "painter-vg1-bygg-finnmark",
            options: [{ institution_name: "Alta vgs" }],
          },
        ],
      })
  );

  assert(
    isHomeCountyPrimarySchoolChainComplete(finnmarkMechanicTruthRows()),
    "finnmark mechanic VG1+VG2 truth must be primary-complete"
  );
  assert(
    !isHomeCountyPrimarySchoolChainComplete([
      {
        stage: "VG1",
        availabilityScope: "programme_in_school",
      },
    ]),
    "VG1-only truth must not be primary-complete"
  );
  console.error("[smoke:route-truth] primary home-fylke chain gate: OK");

  console.error("[smoke:route-truth] PASS");
}

if (isMainModule(import.meta.url)) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
