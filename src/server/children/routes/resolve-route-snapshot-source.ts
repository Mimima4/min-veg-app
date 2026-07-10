import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";

/** P-6 empty primary on Contour B truth is intentional — not legacy catalogue selection. */
export function resolveRouteSnapshotSource(params: {
  steps: StudyRouteSnapshotStep[];
  contourBTruthPathUsed: boolean;
  primaryRouteIncompleteHomeCounty: boolean;
}): "availability_truth" | "legacy" {
  if (params.contourBTruthPathUsed || params.primaryRouteIncompleteHomeCounty) {
    return "availability_truth";
  }
  return params.steps.some((step) => step.source === "availability_truth")
    ? "availability_truth"
    : "legacy";
}
