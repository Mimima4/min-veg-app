import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { AvailabilityTruthRow } from "./get-availability-truth";
import type { PathVariant, VilbliOutcomeProfession } from "./build-path-variants";

function stagePriority(stage: string): number {
  const order: Record<string, number> = {
    VG1: 1,
    VG2: 2,
    VG3: 3,
    APPRENTICESHIP: 4,
  };
  return order[stage] ?? 999;
}

function verificationPriority(status: string): number {
  if (status === "verified") return 1;
  if (status === "needs_review") return 2;
  return 999;
}

function selectStageRow(rows: AvailabilityTruthRow[], stage: "VG1" | "VG2" | "VG3") {
  return [...rows]
    .filter((row) => row.stage === stage)
    .sort((a, b) => {
      const verificationDelta =
        verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
      if (verificationDelta !== 0) return verificationDelta;
      const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
      if (byInstitution !== 0) return byInstitution;
      return (a.institutionId ?? "").localeCompare(b.institutionId ?? "");
    })[0];
}

function stageRowsSorted(rows: AvailabilityTruthRow[], stage: "VG1" | "VG2" | "VG3") {
  return [...rows]
    .filter((row) => row.stage === stage)
    .sort((a, b) => {
      const verificationDelta =
        verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
      if (verificationDelta !== 0) return verificationDelta;
      const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
      if (byInstitution !== 0) return byInstitution;
      return (a.institutionId ?? "").localeCompare(b.institutionId ?? "");
    });
}

export function buildStepsFromAvailabilityTruth(params: {
  professionSlug: string;
  rows: AvailabilityTruthRow[];
  pathVariants?: PathVariant[];
  navOutcomes?: Array<{
    navTitle: string | null;
    navYrkeskategori: string | null;
    reviewNeeded: boolean;
    sourceOutcome: VilbliOutcomeProfession;
  }>;
}): StudyRouteSnapshotStep[] {
  if (params.rows.length === 0) {
    return [];
  }

  const defaultRow = [...params.rows].sort((a, b) => {
    const stageDelta = stagePriority(a.stage) - stagePriority(b.stage);
    if (stageDelta !== 0) return stageDelta;
    const verificationDelta =
      verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
    if (verificationDelta !== 0) return verificationDelta;
    return (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
  })[0];
  const selectedVariant =
    (params.pathVariants ?? [])
      .filter((variant) => variant.nodes.length > 0)
      .sort((a, b) => {
        const missingProgrammeStages = (variant: PathVariant): number =>
          variant.nodes.filter((node) => {
            if (node.type !== "programme_selection") return false;
            return stageRowsSorted(params.rows, node.stage).length === 0;
          }).length;
        const aMissingCount = missingProgrammeStages(a);
        const bMissingCount = missingProgrammeStages(b);
        const byMissingCount = aMissingCount - bMissingCount;
        if (byMissingCount !== 0) return byMissingCount;

        const byNodeLength = b.nodes.length - a.nodes.length;
        if (byNodeLength !== 0) return byNodeLength;
        const aHasVg3 = a.nodes.some(
          (node) => node.type === "programme_selection" && node.stage === "VG3"
        );
        const bHasVg3 = b.nodes.some(
          (node) => node.type === "programme_selection" && node.stage === "VG3"
        );
        if (aHasVg3 === bHasVg3) return 0;
        return bHasVg3 ? 1 : -1;
      })[0] ?? null;
  const buildApprenticeshipOptions = (sourceOutcomeUrl: string | null) => {
    const scopedOutcomes = (params.navOutcomes ?? []).filter((outcome) => {
      if (!sourceOutcomeUrl) return false;
      return outcome.sourceOutcome.sourceOutcomeUrl === sourceOutcomeUrl;
    });
    const grouped = new Map<
      string,
      { option_id: string; option_title: string; outcome_profession_ids: string[] }
    >();
    for (const outcome of scopedOutcomes) {
      const optionTitle = outcome.sourceOutcome.vilbliTitle;
      const optionId =
        `opt-${optionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}` ||
        "opt-outcome";
      if (!grouped.has(optionId)) {
        grouped.set(optionId, {
          option_id: optionId,
          option_title: optionTitle,
          outcome_profession_ids: [],
        });
      }
      const professionId = `review-${(outcome.sourceOutcome.vilbliTitle || "outcome")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;
      grouped.get(optionId)!.outcome_profession_ids.push(professionId);
    }
    return Array.from(grouped.values());
  };
  const steps: StudyRouteSnapshotStep[] = [];
  const linkedProgrammeSlugByStage = new Map<"VG1" | "VG2" | "VG3", string>();
  for (const stage of ["VG1", "VG2", "VG3"] as const) {
    const stageLinkedRow = selectStageRow(params.rows, stage);
    if (stageLinkedRow?.programSlug) {
      linkedProgrammeSlugByStage.set(stage, stageLinkedRow.programSlug);
    }
  }

  if (selectedVariant) {
    for (const node of selectedVariant.nodes) {
      if (node.type === "programme_selection") {
        const stageRows = stageRowsSorted(params.rows, node.stage);
        const stageRow = stageRows[0] ?? null;
        const hasStageAvailability = stageRows.length > 0;
        if (!hasStageAvailability) {
          // Child/family contour rule: school-based steps must have school availability.
          continue;
        }
        const selectedProgrammeSlug =
          stageRow?.programSlug ??
          node.programSlug ??
          linkedProgrammeSlugByStage.get(node.stage) ??
          null;
        if (!selectedProgrammeSlug) {
          throw new Error(
            `Invariant violation: missing source-backed programme slug for ${node.stage}`
          );
        }
        const selectedProgrammeTitle = hasStageAvailability
          ? stageRow?.programTitle ?? node.programTitle ?? node.title
          : node.programTitle ?? node.title;
        steps.push({
          type: "programme_selection",
          title: selectedProgrammeTitle,
          institution_name: hasStageAvailability ? stageRow?.institutionName ?? null : null,
          institution_city: hasStageAvailability ? stageRow?.institutionMunicipality ?? null : null,
          institution_municipality: hasStageAvailability
            ? stageRow?.institutionMunicipality ?? null
            : null,
          institution_website: hasStageAvailability ? stageRow?.institutionWebsite ?? null : null,
          education_level: node.stage.toLowerCase(),
          fit_band: "strong",
          program_slug: selectedProgrammeSlug,
          program_title: selectedProgrammeTitle,
          current_profession_slug: params.professionSlug,
          source: "availability_truth",
          stage: node.stage,
          options: stageRows.map((row) => ({
            institution_id: row.institutionId,
            institution_name: row.institutionName,
            institution_city: row.institutionMunicipality,
            institution_municipality: row.institutionMunicipality,
            institution_website: row.institutionWebsite,
            program_title: row.programTitle,
            stage: row.stage,
            duration_label: null,
            display_title: row.programTitle,
            verification_status: row.verificationStatus,
          })),
        });
        continue;
      }

      steps.push({
        type: "apprenticeship_step",
        title: node.title,
        institution_name: null,
        education_level: "apprenticeship",
        fit_band: "strong",
        program_slug: null,
        apprenticeship_options: buildApprenticeshipOptions(node.sourceOutcomeUrl ?? null),
        current_profession_slug: params.professionSlug,
        source: "availability_truth",
      });
    }
  } else {
    const selectedProgrammeTitle = defaultRow.programTitle ?? defaultRow.programSlug;
    steps.push({
      type: "programme_selection",
      title: selectedProgrammeTitle,
      institution_name: defaultRow.institutionName,
      institution_city: defaultRow.institutionMunicipality,
      institution_municipality: defaultRow.institutionMunicipality,
      institution_website: defaultRow.institutionWebsite,
      education_level: defaultRow.stage.toLowerCase(),
      fit_band: "strong",
      program_slug: defaultRow.programSlug,
      program_title: selectedProgrammeTitle,
      current_profession_slug: params.professionSlug,
      source: "availability_truth",
      stage: defaultRow.stage,
      options: [
        {
          institution_id: defaultRow.institutionId,
          institution_name: defaultRow.institutionName,
          institution_city: defaultRow.institutionMunicipality,
          institution_municipality: defaultRow.institutionMunicipality,
          institution_website: defaultRow.institutionWebsite,
          program_title: defaultRow.programTitle,
          stage: defaultRow.stage,
          duration_label: null,
          display_title: defaultRow.programTitle,
          verification_status: defaultRow.verificationStatus,
        },
      ],
    });
  }

  return steps;
}
