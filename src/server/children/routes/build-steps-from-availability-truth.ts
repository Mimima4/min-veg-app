import {
  isVgsStage,
  toStageAwareProgrammeTitle,
} from "@/lib/vgs/stage-aware-programme-title";
import {
  buildLosaOptionDisplayTitle,
  isLosaAvailabilityScope,
  normalizeLosaDeliverySiteLabel,
  normalizeLosaProviderLabel,
  ORDINARY_AVAILABILITY_SCOPE,
} from "@/lib/losa/availability-scope";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { compareInstitutionTransportRank } from "@/lib/planning/kommune-transport/evaluate-reachability";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "./get-availability-truth";
import { getVilbliBranchConfig } from "@/lib/vgs/vilbli-branch-config";
import {
  assessHomeCountyPrimaryRouteEligibility,
  primaryRouteStepsIncludeRequiredSchoolChain,
} from "@/lib/vgs/home-county-primary-route-completeness";
import { assertRouteTruthInvariants } from "@/lib/vgs/route-truth-invariants";
import { resolveProfessionSlugFromProgramSlug } from "@/lib/vgs/vg2-cross-profession";
import { selectAvailabilityTruthStageRow } from "@/lib/vgs/select-availability-truth-stage-row";
import { findPriorBedriftLaerefagStep } from "@/lib/larebedrift/bedrift-laerefag-from-route";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import {
  buildVg2ProgrammeOptionsFromTruthRows,
  pickDefaultVg2ProgramSlugForProfession,
} from "@/lib/vgs/vg2-programme-options";
import type { Vg2ProgrammeOption } from "@/lib/vgs/vg2-programme-options";
import type {
  PathVariant,
  PathVariantNode,
  VilbliOutcomeProfession,
} from "./build-path-variants";

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
  stageAnchorRow?: AvailabilityTruthRow | null;
  transportSortContext?: KommuneTransportSortContext | null;
}) {
  const stageRows = stageRowsSorted(params.rows, params.stage);
  const anchorRow = params.stageAnchorRow ?? params.selectedCandidate ?? null;
  const anchorMunicipalityCode = anchorRow?.municipalityCode ?? null;
  const anchorInstitutionId = anchorRow?.institutionId ?? null;

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

    if (params.transportSortContext?.computed && params.stage !== "VG3") {
      const transportDelta = compareInstitutionTransportRank(
        a.institutionId,
        b.institutionId,
        params.transportSortContext
      );
      if (transportDelta !== 0) {
        return transportDelta;
      }
    }

    const verificationDelta =
      verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
    if (verificationDelta !== 0) return verificationDelta;
    const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
    if (byInstitution !== 0) return byInstitution;
    return (a.institutionId ?? "").localeCompare(b.institutionId ?? "");
  });
}

function schoolBrandKey(name: string | null | undefined): string {
  return String(name ?? "")
    .replace(/\s+avd\b.*$/i, "")
    .trim()
    .toLowerCase();
}

function displayInstitutionNameAsSchoolBrand(name: string | null | undefined): string | null {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return null;
  const brand = trimmed.replace(/\s+avd\b.*$/i, "").trim();
  return brand || trimmed;
}

function withSchoolBrandDisplay(row: AvailabilityTruthRow): AvailabilityTruthRow {
  const institutionName = displayInstitutionNameAsSchoolBrand(row.institutionName);
  if (institutionName === row.institutionName) {
    return row;
  }
  return { ...row, institutionName };
}

function isLosaTruthRow(row: AvailabilityTruthRow): boolean {
  return isLosaAvailabilityScope(row.availabilityScope);
}

function splitOrdinaryAndLosaRows(rows: AvailabilityTruthRow[]): {
  ordinaryRows: AvailabilityTruthRow[];
  losaRows: AvailabilityTruthRow[];
} {
  const ordinaryRows: AvailabilityTruthRow[] = [];
  const losaRows: AvailabilityTruthRow[] = [];
  for (const row of rows) {
    if (isLosaTruthRow(row)) {
      losaRows.push(row);
      continue;
    }
    ordinaryRows.push(row);
  }
  return { ordinaryRows, losaRows };
}

function mapOrdinaryProgrammeOption(row: AvailabilityTruthRow) {
  const programmeTitle =
    isVgsStage(row.stage) && row.programTitle
      ? toStageAwareProgrammeTitle({ stage: row.stage, title: row.programTitle })
      : row.programTitle;

  return {
    institution_id: row.institutionId,
    institution_name: row.institutionName,
    institution_city: row.institutionMunicipality,
    institution_municipality: row.institutionMunicipality,
    institution_website: row.institutionWebsite,
    program_title: programmeTitle,
    program_slug: row.programSlug,
    stage: row.stage,
    duration_label: null,
    display_title: programmeTitle,
    verification_status: row.verificationStatus,
    institution_is_private_school:
      row.institutionIsPrivateSchool === true
        ? true
        : row.institutionIsPrivateSchool === false
          ? false
          : null,
    option_kind: ORDINARY_AVAILABILITY_SCOPE,
    delivery_municipality_code: null,
    delivery_site_label: null,
  };
}

function mapLosaProgrammeOption(row: AvailabilityTruthRow) {
  const providerLabel =
    normalizeLosaProviderLabel(row.providerSchoolLabel ?? row.institutionName) ??
    row.institutionName;
  const deliverySiteLabel = normalizeLosaDeliverySiteLabel(
    row.deliverySiteLabel ?? row.institutionMunicipality ?? null
  );
  const displayTitle =
    buildLosaOptionDisplayTitle({
      providerLabel,
      deliverySiteLabel,
    }) ?? row.institutionName;

  return {
    institution_id: row.institutionId,
    institution_name: providerLabel,
    institution_city: deliverySiteLabel,
    institution_municipality: deliverySiteLabel,
    institution_website: row.institutionWebsite,
    program_title: row.programTitle,
    program_slug: row.programSlug,
    stage: row.stage,
    duration_label: null,
    display_title: displayTitle,
    verification_status: row.verificationStatus,
    institution_is_private_school:
      row.institutionIsPrivateSchool === true
        ? true
        : row.institutionIsPrivateSchool === false
          ? false
          : null,
    option_kind: row.optionKind ?? row.availabilityScope,
    delivery_municipality_code: row.municipalityCode,
    delivery_site_label: deliverySiteLabel,
  };
}

function buildProgrammeSelectionOptions(rows: AvailabilityTruthRow[]) {
  const { ordinaryRows, losaRows } = splitOrdinaryAndLosaRows(rows);
  const ordinaryOptions = dedupeRowsBySchoolBrand(ordinaryRows).map(mapOrdinaryProgrammeOption);
  const losaOptions = losaRows.map(mapLosaProgrammeOption);
  return [...ordinaryOptions, ...losaOptions];
}

/** Vilbli/VIGO school-brand options: collapse multi-avd PSA leftovers to one row per brand. */
function dedupeRowsBySchoolBrand(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  const seen = new Set<string>();
  const deduped: AvailabilityTruthRow[] = [];
  for (const row of rows) {
    const key = schoolBrandKey(row.institutionName);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(withSchoolBrandDisplay(row));
  }
  return deduped;
}

function resolveVg3InstitutionWebsite(params: {
  stageRow: AvailabilityTruthRow | null;
  continuityRow: AvailabilityTruthRow | null;
}): string | null {
  if (params.stageRow?.institutionWebsite) {
    return params.stageRow.institutionWebsite;
  }

  if (!params.stageRow || !params.continuityRow) {
    return null;
  }

  const sameSchool =
    (params.stageRow.institutionId &&
      params.continuityRow.institutionId &&
      params.stageRow.institutionId === params.continuityRow.institutionId) ||
    schoolBrandKey(params.stageRow.institutionName) ===
      schoolBrandKey(params.continuityRow.institutionName);

  return sameSchool ? params.continuityRow.institutionWebsite ?? null : null;
}

function scopeVg2TruthRowsForRoute(
  rows: AvailabilityTruthRow[],
  professionSlug: string,
  programSlug: string | null | undefined
): AvailabilityTruthRow[] {
  const vg2Rows = rows.filter((row) => row.stage === "VG2");
  const slug = String(programSlug ?? "").trim();
  if (slug) {
    const bySlug = vg2Rows.filter((row) => row.programSlug === slug);
    if (bySlug.length > 0) {
      return bySlug;
    }
  }

  const byProfession = vg2Rows.filter(
    (row) => resolveProfessionSlugFromProgramSlug(row.programSlug) === professionSlug
  );
  return byProfession.length > 0 ? byProfession : vg2Rows;
}

/** VG3+ uses regional availability — not VG1/VG2 logistics continuity. */
function regionalStageRows(params: {
  rows: AvailabilityTruthRow[];
  stage: "VG1" | "VG2" | "VG3";
}): AvailabilityTruthRow[] {
  const { ordinaryRows, losaRows } = splitOrdinaryAndLosaRows(params.rows);
  return [
    ...dedupeRowsBySchoolBrand(stageRowsSorted(ordinaryRows, params.stage)),
    ...stageRowsSorted(losaRows, params.stage),
  ];
}

function continuityStageRows(params: {
  rows: AvailabilityTruthRow[];
  stage: "VG1" | "VG2" | "VG3";
  selectedCandidate?: AvailabilityTruthRow | null;
  stageAnchorRow?: AvailabilityTruthRow | null;
  transportSortContext?: KommuneTransportSortContext | null;
}): AvailabilityTruthRow[] {
  const { ordinaryRows, losaRows } = splitOrdinaryAndLosaRows(params.rows);
  return [
    ...dedupeRowsBySchoolBrand(
      stageRowsSortedWithAnchor({
        rows: ordinaryRows,
        stage: params.stage,
        selectedCandidate: params.selectedCandidate ?? null,
        stageAnchorRow: params.stageAnchorRow ?? null,
        transportSortContext: params.transportSortContext,
      })
    ),
    ...stageRowsSortedWithAnchor({
      rows: losaRows,
      stage: params.stage,
      selectedCandidate: params.selectedCandidate ?? null,
      stageAnchorRow: params.stageAnchorRow ?? null,
      transportSortContext: params.transportSortContext,
    }),
  ];
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

    const branchConfig = getVilbliBranchConfig(params.professionSlug);
    if (branchConfig?.preferredYrkerPathPattern?.test(parsed.pathname)) {
      score += 80;
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
  selectedVg2ProgramSlug?: string | null;
  vg2ProgrammeOptions?: Vg2ProgrammeOption[] | null;
  transportSortContext?: KommuneTransportSortContext | null;
  pathVariants?: PathVariant[];
  selectedPathVariantId?: string | null;
  navOutcomes?: Array<{
    navTitle: string | null;
    navYrkeskategori: string | null;
    reviewNeeded: boolean;
    catalogProfessionId?: string | null;
    sourceOutcome: VilbliOutcomeProfession;
  }>;
}): StudyRouteSnapshotStep[] {
  if (params.rows.length === 0) {
    return [];
  }

  // psa_to_primary gate — Contour B handoff; see home-county-primary-route-completeness.ts
  const primaryEligibility = assessHomeCountyPrimaryRouteEligibility({
    truthRows: params.rows,
    professionSlug: params.professionSlug,
  });
  if (!primaryEligibility.eligible) {
    return [];
  }

  const vg2ProgrammeOptions =
    params.vg2ProgrammeOptions && params.vg2ProgrammeOptions.length > 0
      ? params.vg2ProgrammeOptions
      : buildVg2ProgrammeOptionsFromTruthRows(params.rows);

  const effectiveSelectedVg2ProgramSlug = (() => {
    const explicit = String(params.selectedVg2ProgramSlug ?? "").trim();
    if (explicit) {
      const slugProfession = resolveProfessionSlugFromProgramSlug(explicit);
      if (slugProfession === params.professionSlug) {
        return explicit;
      }
    }

    return (
      pickDefaultVg2ProgramSlugForProfession(vg2ProgrammeOptions, params.professionSlug) ??
      selectAvailabilityTruthStageRow(params.rows, "VG2", params.professionSlug)?.programSlug ??
      (explicit || null)
    );
  })();

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
  const pathVariantCandidates = (params.pathVariants ?? []).filter(
    (variant) => variant.nodes.length > 0
  );
  const selectedVariant =
    (params.selectedPathVariantId
      ? pathVariantCandidates.find(
          (variant) => variant.variantId === params.selectedPathVariantId
        )
      : null) ??
    pathVariantCandidates.sort((a, b) => {
      const missingProgrammeStages = (variant: PathVariant): number =>
        variant.nodes.filter((node) => {
          if (node.type !== "programme_selection") return false;
          if (node.stage !== "VG1" && node.stage !== "VG2" && node.stage !== "VG3") {
            return false;
          }
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
    })[0] ??
    null;
  const resolvedApprenticeshipSourceOutcomeUrl = resolveApprenticeshipSourceOutcomeUrl({
    selectedVariant,
    allPathVariants: params.pathVariants ?? [],
    professionSlug: params.professionSlug,
  });
  const buildLarefagSelectionOptions = (
    branchOptions: Array<{
      optionId: string;
      optionTitle: string;
      sourceOutcomeUrl?: string | null;
    }>
  ) =>
    branchOptions.map((branch) => ({
      institution_id: `vilbli-branch:${branch.optionId}`,
      institution_name: branch.optionTitle,
      institution_city: null,
      institution_municipality: null,
      institution_website: null,
      program_title: branch.optionTitle,
      stage: "LAREFAG",
      duration_label: null,
      display_title: branch.optionTitle,
      verification_status: "verified",
      institution_is_private_school: false,
      option_kind: "larefag",
      programme_url: branch.sourceOutcomeUrl ?? null,
    }));

  const resolveLarefagOutcomeUrlFromStep = (
    larefagStep: StudyRouteSnapshotStep
  ): string | null => {
    if (larefagStep.type !== "programme_selection" || !isLarefagSelectionStage(larefagStep.stage)) {
      return null;
    }
    const selectedSlug = larefagStep.program_slug;
    const options = larefagStep.options ?? [];
    const matched = options.find(
      (option) =>
        option.institution_id === `vilbli-branch:${selectedSlug}` ||
        option.program_title === larefagStep.program_title
    );
    return matched?.programme_url ?? null;
  };

  const buildApprenticeshipOptionsFromKolonne3 = (
    branchOptions: Array<{
      optionId: string;
      optionTitle: string;
      sourceOutcomeUrl?: string | null;
    }>
  ) => {
    return branchOptions.map((branch) => {
      const scopedOutcomes = (params.navOutcomes ?? []).filter((outcome) => {
        if (!branch.sourceOutcomeUrl) return false;
        return outcome.sourceOutcome.sourceOutcomeUrl === branch.sourceOutcomeUrl;
      });
      const outcomeProfessionIds = scopedOutcomes
        .map((outcome) => outcome.catalogProfessionId ?? null)
        .filter((id): id is string => Boolean(id));
      return {
        option_id: branch.optionId,
        option_title: branch.optionTitle,
        outcome_profession_ids: outcomeProfessionIds,
      };
    });
  };

  const buildApprenticeshipOptionsFromYrkerUrl = (sourceOutcomeUrl: string | null) => {
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
      const professionId = outcome.catalogProfessionId ?? null;
      if (professionId) {
        grouped.get(optionId)!.outcome_profession_ids.push(professionId);
      }
    }
    return Array.from(grouped.values());
  };
  const steps: StudyRouteSnapshotStep[] = [];
  const linkedProgrammeSlugByStage = new Map<"VG1" | "VG2" | "VG3", string>();
  for (const stage of ["VG1", "VG2", "VG3"] as const) {
    const stageLinkedRow = selectAvailabilityTruthStageRow(
      params.rows,
      stage,
      stage === "VG2" ? params.professionSlug : null
    );
    if (stageLinkedRow?.programSlug) {
      linkedProgrammeSlugByStage.set(stage, stageLinkedRow.programSlug);
    }
  }

  if (selectedVariant) {
    let selectedVg2RowForGate: AvailabilityTruthRow | null = null;
    let vg1StageRowForAnchor: AvailabilityTruthRow | null = null;
    for (const node of selectedVariant.nodes) {
      if (node.type === "programme_selection") {
        if (isLarefagSelectionStage(node.stage)) {
          const branches = node.options ?? [];
          const defaultBranch = branches[0];
          if (!defaultBranch) {
            continue;
          }
          steps.push({
            type: "programme_selection",
            title: "Fagvalg",
            institution_name: defaultBranch.optionTitle,
            institution_city: null,
            institution_municipality: null,
            institution_website: null,
            education_level: "apprenticeship",
            fit_band: "strong",
            program_slug: defaultBranch.optionId,
            program_title: defaultBranch.optionTitle,
            duration_label: "2 years",
            current_profession_slug: params.professionSlug,
            source: "availability_truth",
            stage: node.stage,
            options: buildLarefagSelectionOptions(branches),
          });
          continue;
        }

        if (node.stage !== "VG1" && node.stage !== "VG2" && node.stage !== "VG3") {
          continue;
        }

        const stageAnchorRow: AvailabilityTruthRow | null =
          node.stage === "VG2"
            ? vg1StageRowForAnchor
            : node.stage === "VG3"
              ? null
              : params.selectedCandidate ?? null;

        const vg2ScopedRows =
          node.stage === "VG2"
            ? scopeVg2TruthRowsForRoute(
                params.rows,
                params.professionSlug,
                effectiveSelectedVg2ProgramSlug
              )
            : null;

        const stageRows: AvailabilityTruthRow[] =
          node.stage === "VG3"
            ? regionalStageRows({ rows: params.rows, stage: "VG3" })
            : continuityStageRows({
                rows:
                  node.stage === "VG2" && vg2ScopedRows
                    ? vg2ScopedRows
                    : params.rows,
                stage: node.stage === "VG2" ? "VG2" : "VG1",
                selectedCandidate: params.selectedCandidate ?? null,
                stageAnchorRow,
                transportSortContext: params.transportSortContext,
              });
        const stageRow: AvailabilityTruthRow | null = stageRows[0] ?? null;

        if (node.stage === "VG3" && stageRows.length === 0) {
          continue;
        }

        const hasStageAvailability = stageRows.length > 0;
        if (!hasStageAvailability) {
          // Child/family contour rule: school-based steps must have school availability.
          continue;
        }
        if (node.stage === "VG1") {
          vg1StageRowForAnchor = stageRow;
        }
        if (node.stage === "VG2") {
          selectedVg2RowForGate = stageRow;
        }
        const selectedProgrammeSlug = (() => {
          const candidate =
            (node.stage === "VG2" ? effectiveSelectedVg2ProgramSlug : null) ??
            stageRow?.programSlug ??
            node.programSlug ??
            linkedProgrammeSlugByStage.get(node.stage) ??
            null;

          if (node.stage !== "VG2" || !candidate) {
            return candidate;
          }

          const slugProfession = resolveProfessionSlugFromProgramSlug(candidate);
          if (!slugProfession || slugProfession === params.professionSlug) {
            return candidate;
          }

          return (
            effectiveSelectedVg2ProgramSlug ??
            pickDefaultVg2ProgramSlugForProfession(vg2ProgrammeOptions, params.professionSlug) ??
            candidate
          );
        })();
        if (!selectedProgrammeSlug) {
          throw new Error(
            `Invariant violation: missing source-backed programme slug for ${node.stage}`
          );
        }
        const catalogueProgrammeTitle = vg2ProgrammeOptions.find(
          (option) => option.program_slug === selectedProgrammeSlug
        )?.program_title;
        const selectedProgrammeTitleRaw = hasStageAvailability
          ? catalogueProgrammeTitle ??
            stageRow?.programTitle ??
            node.programTitle ??
            node.title
          : catalogueProgrammeTitle ?? node.programTitle ?? node.title;
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
          ...(node.stage === "VG2"
            ? {
                programme_options: vg2ProgrammeOptions,
              }
            : {}),
          options: buildProgrammeSelectionOptions(stageRows),
        });
        continue;
      }

      const priorLarefagStep = findPriorBedriftLaerefagStep(steps, steps.length);

      const kolonne3BranchOptions =
        node.branchOptions && node.branchOptions.length > 0 ? node.branchOptions : null;

      const apprenticeshipOptions = priorLarefagStep
        ? []
        : kolonne3BranchOptions
          ? buildApprenticeshipOptionsFromKolonne3(kolonne3BranchOptions)
          : buildApprenticeshipOptionsFromYrkerUrl(
              resolvedApprenticeshipSourceOutcomeUrl ?? node.sourceOutcomeUrl ?? null
            );

      const larefagTitle = priorLarefagStep
        ? priorLarefagStep.program_title ?? priorLarefagStep.title
        : null;

      const apprenticeshipSourceOutcomeUrl = priorLarefagStep
        ? resolveLarefagOutcomeUrlFromStep(priorLarefagStep)
        : resolvedApprenticeshipSourceOutcomeUrl ?? node.sourceOutcomeUrl ?? null;

      steps.push({
        type: "apprenticeship_step",
        title: larefagTitle ? `Opplæring i bedrift (${larefagTitle})` : node.title,
        institution_name: null,
        education_level: "apprenticeship",
        fit_band: "strong",
        program_slug: null,
        program_title: larefagTitle,
        duration_label: "2 years",
        apprenticeship_options: apprenticeshipOptions,
        current_profession_slug: params.professionSlug,
        source: "availability_truth",
        source_outcome_url: apprenticeshipSourceOutcomeUrl,
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
      options: buildProgrammeSelectionOptions([defaultRow]),
    });
  }

  if (steps.length > 0 && !primaryRouteStepsIncludeRequiredSchoolChain(steps)) {
    return [];
  }

  assertRouteTruthInvariants({
    variants: params.pathVariants ?? (selectedVariant ? [selectedVariant] : []),
    steps,
    truthRows: params.rows,
    context: `build-steps:${params.professionSlug}`,
  });

  return steps;
}
