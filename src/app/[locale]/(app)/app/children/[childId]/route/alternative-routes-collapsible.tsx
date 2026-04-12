"use client";

import { useState } from "react";
import type { StudyRouteAlternativeTeaser } from "@/lib/routes/route-types";
import RouteAlternativesPanel from "./route-alternatives-panel";

type Props = {
  alternatives: StudyRouteAlternativeTeaser[];
};

export default function AlternativeRoutesCollapsible({ alternatives }: Props) {
  const hasAlternativeRoutes = alternatives.length > 1;
  const [altOpen, setAltOpen] = useState(false);

  if (!hasAlternativeRoutes) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setAltOpen(!altOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:bg-gray-50"
      >
        <span className="font-medium">Alternative routes</span>
        <span className="text-sm text-gray-500">{altOpen ? "Hide" : "Show"}</span>
      </button>

      {altOpen ? (
        <div className="mt-4">
          <RouteAlternativesPanel alternatives={alternatives} />
        </div>
      ) : null}
    </div>
  );
}
