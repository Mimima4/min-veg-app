import { createClient } from "@/lib/supabase/server";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";

type EducationProgramRow = {
  slug: string;
  title: string | null;
  duration_years: number | null;
  institution_id: string | null;
  programme_url?: string | null;
};

type EducationInstitutionRow = {
  id: string;
  name: string | null;
  municipality_name: string | null;
  website_url: string | null;
};

type ProfessionProgramLinkRow = {
  profession_slug: string;
  program_slug: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildInstitutionNameVariants(name: string): string[] {
  const normalized = normalizeWhitespace(name);
  const variants = new Set<string>([normalized]);

  if (/videregående skole/i.test(normalized)) {
    variants.add(normalizeWhitespace(normalized.replace(/videregående skole/gi, "vgs")));
  }

  if (/universitetet/i.test(normalized)) {
    variants.add(normalizeWhitespace(normalized.replace(/universitetet/gi, "university")));
  }

  return Array.from(variants).filter(Boolean);
}

function stripInstitutionSuffixFromProgrammeTitle(params: {
  rawTitle: string | null | undefined;
  institutionName: string | null | undefined;
  municipalityName: string | null | undefined;
}): string | null {
  const rawTitle = normalizeWhitespace(params.rawTitle ?? "");
  if (!rawTitle) return null;

  const institutionName = normalizeWhitespace(params.institutionName ?? "");
  const municipalityName = normalizeWhitespace(params.municipalityName ?? "");

  const suffixCandidates = new Set<string>();
  
  if (institutionName) {
    const institutionVariants = buildInstitutionNameVariants(institutionName);

    for (const variant of institutionVariants) {
      suffixCandidates.add(variant);

      if (municipalityName) {
        suffixCandidates.add(`${variant} (${municipalityName})`);
      }
    }
  }

  if (municipalityName) {
    suffixCandidates.add(municipalityName);
    suffixCandidates.add(`(${municipalityName})`);
  }

  let cleaned = rawTitle;

  for (const suffix of suffixCandidates) {
    const suffixPattern = new RegExp(String.raw`\s*[–—-]\s*${escapeRegExp(suffix)}$`, "i");

    cleaned = cleaned.replace(suffixPattern, "").trim();
  }

  return normalizeWhitespace(cleaned);
}

function stripTrailingGeographicSuffix(rawTitle: string | null | undefined): string | null {
  const title = normalizeWhitespace(rawTitle ?? "");
  if (!title) return null;

  // Remove trailing city-like suffixes from display titles, e.g. " - Bergen", " - Oslo".
  // Keep this display-only and conservative: uppercase-led 1-3 tokens at end.
  const cleaned = title.replace(
    /\s*[–—-]\s*([A-ZÆØÅ][\p{L}.-]+(?:\s+[A-ZÆØÅ][\p{L}.-]+){0,2})$/u,
    ""
  );

  return normalizeWhitespace(cleaned);
}

function formatDurationLabel(durationYears: number | null): string | null {
  if (durationYears === null || !Number.isFinite(durationYears)) {
    return null;
  }

  return durationYears === 1 ? "1 year" : `${durationYears} years`;
}

function getStepDuration(
  step: StudyRouteSnapshotStep,
  selectedPath?: { stage?: string | null }
): number | null {
  const stage = (selectedPath?.stage ?? ("stage" in step ? step.stage : null) ?? "")
    .toString()
    .toUpperCase();
  if (stage === "VG1" || stage === "VG2" || stage === "VG3") {
    return 1;
  }

  if (step.type === "apprenticeship_step") {
    const title = normalizeWhitespace(step.title ?? "").toLowerCase();
    if (title.includes("lære") || title.includes("laere") || title.includes("opplæring i bedrift") || title.includes("opplaering i bedrift")) {
      return 2;
    }
  }

  return null;
}

export async function enrichStudyRouteSteps(
  steps: StudyRouteSnapshotStep[]
): Promise<StudyRouteSnapshotStep[]> {
  const supabase = await createClient();

  const programSlugs = Array.from(
    new Set(
      steps
        .map((step) => step.program_slug)
        .filter((value): value is string => Boolean(value))
    )
  );

  if (programSlugs.length === 0) {
    return steps;
  }

  const { data: programs, error: programsError } = await supabase
    .from("education_programs")
    .select("slug, title, duration_years, institution_id, programme_url")
    .in("slug", programSlugs);

  if (programsError) {
    throw new Error(
      `Failed to load education programs for route step enrichment: ${programsError.message}`
    );
  }

  const typedPrograms = (programs ?? []) as EducationProgramRow[];
  const programBySlug = new Map(
    typedPrograms.map((program) => [program.slug, program])
  );

  const institutionIds = Array.from(
    new Set(
      typedPrograms
        .map((program) => program.institution_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  let institutionById = new Map<string, EducationInstitutionRow>();
  if (institutionIds.length > 0) {
    const { data: institutions, error: institutionsError } = await supabase
      .from("education_institutions")
      .select("id, name, municipality_name, website_url")
      .in("id", institutionIds);

    if (institutionsError) {
      throw new Error(
        `Failed to load education institutions for route step enrichment: ${institutionsError.message}`
      );
    }

    institutionById = new Map(
      ((institutions ?? []) as EducationInstitutionRow[]).map((institution) => [
        institution.id,
        institution,
      ])
    );
  }

  const professionSlugs = Array.from(
    new Set(
      steps
        .map((step) => step.current_profession_slug)
        .filter((value): value is string => Boolean(value))
    )
  );
  let stageTitleByProfession = new Map<string, Map<string, string>>();
  if (professionSlugs.length > 0) {
    const { data: links } = await supabase
      .from("profession_program_links")
      .select("profession_slug, program_slug")
      .in("profession_slug", professionSlugs);
    const linkRows = (links ?? []) as ProfessionProgramLinkRow[];
    const linkedProgramSlugs = Array.from(
      new Set(linkRows.map((row) => row.program_slug).filter(Boolean))
    );

    if (linkedProgramSlugs.length > 0) {
      const { data: linkedPrograms } = await supabase
        .from("education_programs")
        .select("slug, title")
        .in("slug", linkedProgramSlugs)
        .eq("is_active", true);

      const linkedProgramBySlug = new Map(
        ((linkedPrograms ?? []) as Array<{ slug: string; title: string | null }>).map(
          (row) => [row.slug, row]
        )
      );

      for (const linkRow of linkRows) {
        const linkedProgram = linkedProgramBySlug.get(linkRow.program_slug);
        const linkedTitle = normalizeWhitespace(linkedProgram?.title ?? "");
        if (!linkedTitle) continue;

        const stageMatch = linkedTitle.match(/^(VG[1-3])\b/i);
        const stage = stageMatch?.[1]?.toUpperCase();
        if (!stage) continue;

        if (!stageTitleByProfession.has(linkRow.profession_slug)) {
          stageTitleByProfession.set(linkRow.profession_slug, new Map());
        }
        const byStage = stageTitleByProfession.get(linkRow.profession_slug)!;
        if (!byStage.has(stage)) {
          byStage.set(stage, linkedTitle);
        }
      }
    }
  }

  let lastTruthInstitution: {
    name: string | null;
    municipality: string | null;
    website: string | null;
  } | null = null;

  const institutionIdsNeedingPrivateFlag = new Set<string>();
  for (const step of steps) {
    if (step.source !== "availability_truth" || step.type !== "programme_selection") {
      continue;
    }
    for (const opt of step.options ?? []) {
      const oid = typeof opt.institution_id === "string" ? opt.institution_id.trim() : "";
      if (!oid) continue;
      const existing = opt.institution_is_private_school;
      if (existing !== undefined && existing !== null) continue;
      institutionIdsNeedingPrivateFlag.add(oid);
    }
  }

  let privateSchoolByInstitutionId = new Map<string, boolean | null>();
  if (institutionIdsNeedingPrivateFlag.size > 0) {
    const { data: privateRows } = await supabase
      .from("education_institutions")
      .select("id, is_private_school")
      .in("id", [...institutionIdsNeedingPrivateFlag]);
    privateSchoolByInstitutionId = new Map(
      (
        (privateRows ?? []) as Array<{
          id: string;
          is_private_school: boolean | null;
        }>
      ).map((row) => [row.id, row.is_private_school ?? null])
    );
  }

  return steps.map((step) => {
    if (step.source === "availability_truth") {
      if (step.type === "apprenticeship_step") {
        const durationYears = getStepDuration(step);
        return {
          ...step,
          duration_years: durationYears,
          duration_label: formatDurationLabel(durationYears),
        };
      }

      const fallbackInstitutionName =
        step.institution_name ?? lastTruthInstitution?.name ?? null;
      const fallbackMunicipalityName =
        step.institution_city ??
        step.institution_municipality ??
        lastTruthInstitution?.municipality ??
        null;
      const fallbackInstitutionWebsite =
        step.institution_website ?? lastTruthInstitution?.website ?? null;

      if (step.type === "programme_selection") {
        if (fallbackInstitutionName || fallbackMunicipalityName || fallbackInstitutionWebsite) {
          lastTruthInstitution = {
            name: fallbackInstitutionName,
            municipality: fallbackMunicipalityName,
            website: fallbackInstitutionWebsite,
          };
        }

        const truthDuration = getStepDuration(step, { stage: step.stage ?? null });
        const rawProgramTitle = step.program_title ?? step.title;
        const normalizedRawProgramTitle = normalizeWhitespace(rawProgramTitle ?? "");
        const rawLooksLikeStageOnly = /^(VG[1-3])$/i.test(normalizedRawProgramTitle);
        const stageLabel = normalizeWhitespace(step.stage ?? "").toUpperCase();
        const rawStagePrefix = normalizedRawProgramTitle.match(/^(VG[1-3])\b/i)?.[1]?.toUpperCase() ?? null;
        const rawStageMismatched =
          Boolean(stageLabel) && Boolean(rawStagePrefix) && rawStagePrefix !== stageLabel;
        const inferredByStage = step.stage
          ? stageTitleByProfession
              .get(step.current_profession_slug)
              ?.get(step.stage.toUpperCase())
          : null;
        const resolvedProgramTitle =
          rawLooksLikeStageOnly || rawStageMismatched
            ? inferredByStage ?? rawProgramTitle
            : rawProgramTitle;

        const normalizedProgramTitle = stripInstitutionSuffixFromProgrammeTitle({
          rawTitle: resolvedProgramTitle,
          institutionName: fallbackInstitutionName,
          municipalityName: fallbackMunicipalityName,
        });
        const displayProgramTitle =
          fallbackInstitutionName || fallbackMunicipalityName
            ? stripTrailingGeographicSuffix(normalizedProgramTitle)
            : normalizedProgramTitle;

        return {
          ...step,
          institution_name: fallbackInstitutionName,
          institution_city: fallbackMunicipalityName,
          institution_municipality: fallbackMunicipalityName,
          institution_website: fallbackInstitutionWebsite,
          program_title: displayProgramTitle,
          title: displayProgramTitle ?? step.title,
          duration_years: truthDuration,
          duration_label: formatDurationLabel(truthDuration),
          options: step.options?.map((option) => ({
            ...(() => {
              const optionMunicipality =
                option.institution_city ??
                option.institution_municipality ??
                fallbackMunicipalityName;
              const optionProgramRaw = option.program_title ?? displayProgramTitle ?? null;
              const optionNormalizedProgramTitle = stripInstitutionSuffixFromProgrammeTitle({
                rawTitle: optionProgramRaw,
                institutionName: option.institution_name ?? fallbackInstitutionName,
                municipalityName: optionMunicipality,
              });
              const optionDisplayProgramTitle =
                option.institution_name || optionMunicipality
                  ? stripTrailingGeographicSuffix(optionNormalizedProgramTitle)
                  : optionNormalizedProgramTitle;

              const institutionId =
                typeof option.institution_id === "string" ? option.institution_id.trim() : "";
              const hydratedPrivate =
                option.institution_is_private_school !== undefined &&
                option.institution_is_private_school !== null
                  ? option.institution_is_private_school
                  : institutionId
                    ? (privateSchoolByInstitutionId.get(institutionId) ?? null)
                    : null;

              return {
                ...option,
                institution_city: optionMunicipality,
                institution_municipality:
                  option.institution_municipality ??
                  option.institution_city ??
                  fallbackMunicipalityName,
                institution_website: option.institution_website ?? null,
                program_title: optionDisplayProgramTitle,
                stage: option.stage ?? step.stage ?? null,
                duration_label: option.duration_label ?? formatDurationLabel(truthDuration),
                display_title: optionDisplayProgramTitle,
                institution_is_private_school: hydratedPrivate,
              };
            })(),
          })),
        };
      }

      return step;
    }

    if (!step.program_slug) {
      return step;
    }

    const program = programBySlug.get(step.program_slug);
    const institution = program?.institution_id
      ? institutionById.get(program.institution_id) ?? null
      : null;

    const institutionName = institution?.name ?? step.institution_name ?? null;
    const municipalityName =
      institution?.municipality_name ??
      step.institution_city ??
      step.institution_municipality ??
      null;

    const durationYears =
      typeof program?.duration_years === "number" ? program.duration_years : null;

    const normalizedProgramTitle = stripInstitutionSuffixFromProgrammeTitle({
      rawTitle: program?.title ?? step.program_title ?? step.title,
      institutionName,
      municipalityName,
    });

    return {
      ...step,
      program_title: normalizedProgramTitle,
      institution_name: institutionName,
      institution_city: municipalityName,
      institution_municipality: municipalityName,
      institution_website: institution?.website_url ?? step.institution_website ?? null,
      programme_url: program?.programme_url ?? null,
      duration_years: durationYears,
      duration_label: formatDurationLabel(durationYears),
    };
  });
}

