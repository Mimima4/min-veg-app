"use client";

import { useState } from "react";
import type { StudyRouteAlternativeTeaser } from "@/lib/routes/route-types";
import type { SteigenCarpenterVekslingInfoCopy } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";
import { STEIGEN_CARPENTER_VEKSLING_VARIANT_ID } from "@/lib/regional-delivery/steigen-carpenter-veksling-path-variant";
import SteigenVekslingBadgeWithInfo from "@/components/route/steigen-veksling-badge-with-info";
import RouteStepsPanel from "./route-steps-panel";
import SaveRouteButton from "./[routeId]/save-route-button";

type Props = {
  locale: string;
  childId: string;
  routeId: string;
  professionSlug?: string | null;
  alternatives: StudyRouteAlternativeTeaser[];
  savedSelectionSignatures?: string[];
  steigenVekslingInfoCopy?: SteigenCarpenterVekslingInfoCopy | null;
};

function resolveEmptyAlternativesLabel(locale: string) {
  if (locale === "nb") {
    return "Ingen tilgjengelige alternativer for dette yrkesvalget.";
  }
  return "No available alternatives for this profession.";
}

export default function AlternativeRoutesCollapsible({
  locale,
  childId,
  routeId,
  professionSlug = null,
  alternatives,
  savedSelectionSignatures = [],
  steigenVekslingInfoCopy = null,
}: Props) {
  const visibleAlternatives = alternatives.filter(
    (alternative) => (alternative.steps?.length ?? 0) > 0
  );
  const [altOpen, setAltOpen] = useState(visibleAlternatives.length > 0);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setAltOpen(!altOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-stone-50"
        aria-expanded={altOpen}
      >
        <span className="text-lg font-semibold text-stone-900">Alternative routes</span>
        <span className="text-sm text-stone-500">{altOpen ? "Hide" : "Show"}</span>
      </button>

      {altOpen ? (
        <div className="space-y-8 border-t border-stone-200 px-6 pb-6 pt-5">
          {visibleAlternatives.length === 0 ? (
            <p className="text-sm text-stone-600">{resolveEmptyAlternativesLabel(locale)}</p>
          ) : null}
          {visibleAlternatives.map((alternative) => (
            <section
              key={alternative.variantId}
              data-testid={
                alternative.curatedRegionalVariantId === STEIGEN_CARPENTER_VEKSLING_VARIANT_ID
                  ? "steigen-veksling-alternative-route"
                  : undefined
              }
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-stone-900">{alternative.label}</h3>
                  {alternative.curatedRegionalVariantId ===
                    STEIGEN_CARPENTER_VEKSLING_VARIANT_ID && steigenVekslingInfoCopy ? (
                    <SteigenVekslingBadgeWithInfo copy={steigenVekslingInfoCopy} />
                  ) : null}
                </div>
                <SaveRouteButton
                  childId={childId}
                  routeId={routeId}
                  locale={locale}
                  isSaved={alternative.isSaved === true}
                  sourceVariantId={alternative.variantId}
                  size="compact"
                />
              </div>

              <RouteStepsPanel
                childId={childId}
                routeId={routeId}
                locale={locale}
                professionSlug={professionSlug}
                isSavedRoute={false}
                steps={alternative.steps ?? []}
                savedSelectionSignatures={savedSelectionSignatures}
                compact
                showHeader={false}
              />
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
