#!/usr/bin/env node
/**
 * Route save-flow smoke — selection signatures + read-model policy (no browser).
 *
 * Usage:
 *   npm run smoke:route-save-flow
 */
import { isMainModule } from "./lib/is-main-module.mjs";
import { buildSelectionSignatureFromPayload } from "./lib/selection-signature.mjs";
import {
  resolveRouteEntryTargetRouteId,
  shouldShowAlternativeRoutesPanel,
} from "./lib/route-read-model-policy.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runFixture(name, fn) {
  fn();
  console.error(`[smoke:route-save-flow] ${name}: OK`);
}

function programmeStepFixture() {
  return [
    {
      type: "programme_selection",
      program_slug: "vg1-elektro",
      institution_name: "Nordkapp videregående skole",
      institution_city: "Honningsvåg",
      options: [
        {
          institution_name: "Nordkapp videregående skole",
          institution_city: "Honningsvåg",
          program_slug: "vg1-elektro",
        },
        {
          institution_name: "Alta videregående skole",
          institution_city: "Alta",
          program_slug: "vg1-elektro",
        },
      ],
    },
    {
      type: "apprenticeship_step",
      program_slug: "elektriker-læretid",
      selected_apprenticeship_option_id: "app-fag-elektro",
      apprenticeship_options: [
        { option_id: "app-fag-elektro", option_title: "Elektrofag" },
        { option_id: "app-fag-annet", option_title: "Annet" },
      ],
    },
  ];
}

export function runRouteSaveFlowSmoke() {
  runFixture("policy: hide alternatives on saved route", () => {
    assert(shouldShowAlternativeRoutesPanel("draft") === true, "draft should show alternatives");
    assert(shouldShowAlternativeRoutesPanel("saved") === false, "saved should hide alternatives");
  });

  runFixture("policy: entry prefers working draft over saved", () => {
    assert(
      resolveRouteEntryTargetRouteId({
        draftRouteIds: ["draft-1"],
        savedRouteIds: ["saved-1"],
      }) === "draft-1",
      "must open working draft when present"
    );
    assert(
      resolveRouteEntryTargetRouteId({
        draftRouteIds: [],
        savedRouteIds: ["saved-1"],
      }) === null,
      "must not open saved route from entry resolver"
    );
  });

  runFixture("signature: stable for identical programme + apprenticeship payload", () => {
    const payload = programmeStepFixture();
    const a = buildSelectionSignatureFromPayload(payload);
    const b = buildSelectionSignatureFromPayload(structuredClone(payload));
    assert(a === b, "signature must be stable across clones");
    assert(a.length > 2, "signature must encode selectable steps");
  });

  runFixture("signature: changes when apprenticeship selection changes", () => {
    const primary = programmeStepFixture();
    const alternate = structuredClone(primary);
    alternate[1].selected_apprenticeship_option_id = "app-fag-annet";
    const primarySig = buildSelectionSignatureFromPayload(primary);
    const alternateSig = buildSelectionSignatureFromPayload(alternate);
    assert(primarySig !== alternateSig, "different apprenticeship picks must differ");
  });

  runFixture("signature: changes when programme school changes", () => {
    const primary = programmeStepFixture();
    const alternate = structuredClone(primary);
    alternate[0].institution_name = "Alta videregående skole";
    alternate[0].institution_city = "Alta";
    const primarySig = buildSelectionSignatureFromPayload(primary);
    const alternateSig = buildSelectionSignatureFromPayload(alternate);
    assert(primarySig !== alternateSig, "different programme schools must differ");
  });
}

if (isMainModule(import.meta.url)) {
  try {
    runRouteSaveFlowSmoke();
    console.error("[smoke:route-save-flow] PASS");
  } catch (error) {
    console.error("[smoke:route-save-flow] FAIL", error);
    process.exit(1);
  }
}
