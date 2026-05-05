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

function stageRowsSortedWithAnchor(params: {
  rows: AvailabilityTruthRow[];
  stage: "VG1" | "VG2" | "VG3";
  selectedCandidate?: AvailabilityTruthRow | null;
}) {
  const stageRows = stageRowsSorted(params.rows, params.stage);
  const anchorMunicipalityCode = params.selectedCandidate?.municipalityCode ?? null;
  const anchorInstitutionId = params.selectedCandidate?.institutionId ?? null;

  return [...stageRows].sort((a, b) => {
    const aSameInstitution = anchorInstitutionId
      ? a.institutionId === anchorInstitutionId
      : false;
    const bSameInstitution = anchorInstitutionId
      ? b.institutionId === anchorInstitutionId
      : false;
    if (aSameInstitution !== bSameInstitution) {
      return aSameInstitution ? -1 : 1;
    }

    const aSameMunicipality = anchorMunicipalityCode
      ? a.municipalityCode === anchorMunicipalityCode
      : false;
    const bSameMunicipality = anchorMunicipalityCode
      ? b.municipalityCode === anchorMunicipalityCode
      : false;
    if (aSameMunicipality !== bSameMunicipality) {
      return aSameMunicipality ? -1 : 1;
    }

    const verificationDelta =
      verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
    if (verificationDelta !== 0) return verificationDelta;
    const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
    if (byInstitution !== 0) return byInstitution;
    return (a.institutionId ?? "").localeCompare(b.institutionId ?? "");
  });
}

function dedupeRowsByInstitution(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  const seen = new Set<string>();
  const deduped: AvailabilityTruthRow[] = [];
  for (const row of rows) {
    const key = String(row.institutionId ?? "").trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped;
}

function isVg3GeographicallyEligible(params: {
  selectedVg2Row: AvailabilityTruthRow | null;
  vg3Candidate: AvailabilityTruthRow | null;
}): boolean {
  const { selectedVg2Row, vg3Candidate } = params;
  if (!selectedVg2Row || !vg3Candidate) return false;
  if (selectedVg2Row.institutionId === vg3Candidate.institutionId) {
    return true;
  }
  if (
    selectedVg2Row.municipalityCode &&
    vg3Candidate.municipalityCode &&
    selectedVg2Row.municipalityCode === vg3Candidate.municipalityCode
  ) {
    return true;
  }
  return false;
}

function toStageAwareProgrammeTitle(params: {
  stage: "VG1" | "VG2" | "VG3";
  title: string;
}): string {
  if (params.stage !== "VG3") return params.title;
  const normalized = String(params.title ?? "").trim();
  if (!normalized) return "VG3";
  if (/^VG3\b/i.test(normalized)) {
    return normalized.replace(/^VG3\b\s*/i, "VG3 ").trim();
  }
  return `VG3 ${normalized}`;
}

function normalizeProfessionSlugTokens(professionSlug: string): string[] {
  return String(professionSlug ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 4);
}

function scoreSourceOutcomeUrl(params: {
  url: string;
  professionSlug: string;
}): number {
  const rawUrl = String(params.url ?? "").trim();
  if (!rawUrl) return Number.NEGATIVE_INFINITY;

  let score = 0;
  try {
    const parsed = new URL(rawUrl);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const lastSegment = (pathSegments[pathSegments.length - 1] ?? "").toLowerCase();

    // Branch-specific Vilbli outcome pages typically end with "<branch>-yrker".
    if (lastSegment.includes("-yrker")) {
      score += 100;
    } else {
      // Broad education-area pages usually do not carry branch-specific "-yrker" suffix.
      score -= 25;
    }

    const professionTokens = normalizeProfessionSlugTokens(params.professionSlug);
    const lowerPath = parsed.pathname.toLowerCase();
    for (const token of professionTokens) {
      if (lowerPath.includes(token)) {
        score += 5;
      }
    }
  } catch {
    // Keep deterministic fallback for malformed URLs.
    score -= 1000;
  }

  return score;
}

function resolveApprenticeshipSourceOutcomeUrl(params: {
  selectedVariant: PathVariant | null;
  allPathVariants: PathVariant[];
  professionSlug: string;
}): string | null {
  const fromSelectedVariant =
    params.selectedVariant?.nodes
      .filter(
        (node): node is Extract<PathVariant["nodes"][number], { type: "apprenticeship_step" }> =>
          node.type === "apprenticeship_step"
      )
      .map((node) => node.sourceOutcomeUrl)
      .find((value): value is string => Boolean(value)) ?? null;

  const candidateUrls = Array.from(
    new Set(
      params.allPathVariants
        .flatMap((variant) => variant.nodes)
        .filter(
          (node): node is Extract<PathVariant["nodes"][number], { type: "apprenticeship_step" }> =>
            node.type === "apprenticeship_step"
        )
        .map((node) => node.sourceOutcomeUrl)
        .filter((value): value is string => Boolean(value))
    )
  );

  if (candidateUrls.length === 0) {
    return fromSelectedVariant;
  }

  const bestBySpecificity = [...candidateUrls].sort((a, b) => {
    const byScore =
      scoreSourceOutcomeUrl({ url: b, professionSlug: params.professionSlug }) -
      scoreSourceOutcomeUrl({ url: a, professionSlug: params.professionSlug });
    if (byScore !== 0) return byScore;
    return a.localeCompare(b);
  })[0];

  return bestBySpecificity ?? fromSelectedVariant;
}

export function buildStepsFromAvailabilityTruth(params: {
  professionSlug: string;
  rows: AvailabilityTruthRow[];
  selectedCandidate?: AvailabilityTruthRow | null;
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
    const aAnchor =
      params.selectedCandidate &&
      a.educationProgramId === params.selectedCandidate.educationProgramId &&
      a.institutionId === params.selectedCandidate.institutionId &&
      a.stage === params.selectedCandidate.stage;
    const bAnchor =
      params.selectedCandidate &&
      b.educationProgramId === params.selectedCandidate.educationProgramId &&
      b.institutionId === params.selectedCandidate.institutionId &&
      b.stage === params.selectedCandidate.stage;
    if (aAnchor !== bAnchor) {
      return aAnchor ? -1 : 1;
    }
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
  const resolvedApprenticeshipSourceOutcomeUrl = resolveApprenticeshipSourceOutcomeUrl({
    selectedVariant,
    allPathVariants: params.pathVariants ?? [],
    professionSlug: params.professionSlug,
  });
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
    let selectedVg2RowForGate: AvailabilityTruthRow | null = null;
    for (const node of selectedVariant.nodes) {
      if (node.type === "programme_selection") {
        const stageRows = dedupeRowsByInstitution(
          stageRowsSortedWithAnchor({
            rows: params.rows,
            stage: node.stage,
            selectedCandidate: params.selectedCandidate ?? null,
          })
        );
        const stageRow = stageRows[0] ?? null;

        if (node.stage === "VG3") {
          const vg3Eligible = isVg3GeographicallyEligible({
            selectedVg2Row: selectedVg2RowForGate,
            vg3Candidate: stageRow,
          });
          if (!vg3Eligible) {
            // Debug-only guardrail: this helps trace why VG3 was skipped.
            console.info("[build-steps-from-availability-truth] VG3 skipped", {
              skipReason: "vg3_not_geographically_eligible",
              vg2InstitutionId: selectedVg2RowForGate?.institutionId ?? null,
              vg2MunicipalityCode: selectedVg2RowForGate?.municipalityCode ?? null,
              vg3InstitutionId: stageRow?.institutionId ?? null,
              vg3MunicipalityCode: stageRow?.municipalityCode ?? null,
            });
            continue;
          }
        }

        const hasStageAvailability = stageRows.length > 0;
        if (!hasStageAvailability) {
          // Child/family contour rule: school-based steps must have school availability.
          continue;
        }
        if (node.stage === "VG2") {
          selectedVg2RowForGate = stageRow;
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
        const selectedProgrammeTitleRaw = hasStageAvailability
          ? stageRow?.programTitle ?? node.programTitle ?? node.title
          : node.programTitle ?? node.title;
        const selectedProgrammeTitle = toStageAwareProgrammeTitle({
          stage: node.stage,
          title: selectedProgrammeTitleRaw,
        });
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
            institution_is_private_school:
              row.institutionIsPrivateSchool === true
                ? true
                : row.institutionIsPrivateSchool === false
                  ? false
                  : null,
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
        apprenticeship_options: buildApprenticeshipOptions(
          resolvedApprenticeshipSourceOutcomeUrl ?? node.sourceOutcomeUrl ?? null
        ),
        current_profession_slug: params.professionSlug,
        source: "availability_truth",
        source_outcome_url:
          resolvedApprenticeshipSourceOutcomeUrl ?? node.sourceOutcomeUrl ?? null,
      } as StudyRouteSnapshotStep);
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
          institution_is_private_school:
            defaultRow.institutionIsPrivateSchool === true
              ? true
              : defaultRow.institutionIsPrivateSchool === false
                ? false
                : null,
        },
      ],
    });
  }

  return steps;
}
