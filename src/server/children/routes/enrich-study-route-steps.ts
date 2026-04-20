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

function formatDurationLabel(durationYears: number | null): string | null {
  if (durationYears === null || !Number.isFinite(durationYears)) {
    return null;
  }

  return durationYears === 1 ? "1 year" : `${durationYears} years`;
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

  return steps.map((step) => {
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

