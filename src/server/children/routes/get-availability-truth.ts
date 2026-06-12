import { resolveInstitutionDisplayName } from "@/lib/i18n/institution-display-name";
import {
  availabilityScopesForRouteTruth,
  buildLosaOptionDisplayTitle,
  isLosaAvailabilityScope,
  ORDINARY_AVAILABILITY_SCOPE,
  parseLosaPsaNotes,
  type AvailabilityScope,
} from "@/lib/losa/availability-scope";
import { createAdminClient } from "@/lib/supabase/admin";
import { selectEducationInstitutions } from "@/server/education/query-education-institutions";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AvailabilityTruthRow = {
  educationProgramId: string;
  programSlug: string;
  programCode: string | null;
  programTitle: string | null;
  institutionId: string;
  institutionName: string | null;
  institutionMunicipality: string | null;
  municipalityCode: string | null;
  institutionWebsite: string | null;
  institutionIsPrivateSchool: boolean | null;
  countyCode: string;
  stage: "VG1" | "VG2" | "VG3" | "APPRENTICESHIP" | string;
  verificationStatus: "verified" | "needs_review" | string;
  updatedAt: string | null;
  sourceReferenceUrl: string | null;
  availabilityScope: AvailabilityScope | string;
  deliverySiteLabel: string | null;
  providerSchoolLabel: string | null;
  optionKind: AvailabilityScope | string;
};

type ProgramLookupRow = {
  id: string;
  slug: string;
  program_code: string | null;
  title: string | null;
};

const PROGRAM_LOOKUP_CHUNK_SIZE = 80;

async function loadProgramsByColumnInChunks(
  supabase: SupabaseClient,
  column: "slug" | "program_code",
  keys: string[]
): Promise<ProgramLookupRow[]> {
  const rows: ProgramLookupRow[] = [];
  for (let index = 0; index < keys.length; index += PROGRAM_LOOKUP_CHUNK_SIZE) {
    const chunk = keys.slice(index, index + PROGRAM_LOOKUP_CHUNK_SIZE);
    const { data, error } = await supabase
      .from("education_programs")
      .select("id, slug, program_code, title")
      .in(column, chunk)
      .eq("is_active", true);

    if (error) {
      const label = column === "slug" ? "slug" : "code";
      throw new Error(`Failed to load availability-truth program ids by ${label}: ${error.message}`);
    }

    rows.push(...((data ?? []) as ProgramLookupRow[]));
  }
  return rows;
}

async function resolveProgramsBySlugsOrCodes(
  supabase: SupabaseClient,
  programmeSlugsOrCodes: string[]
) {
  const normalizedKeys = Array.from(
    new Set(programmeSlugsOrCodes.map((value) => value.trim()).filter(Boolean))
  );
  if (normalizedKeys.length === 0) {
    return new Map<string, { slug: string; programCode: string | null; title: string | null }>();
  }

  const [slugPrograms, codePrograms] = await Promise.all([
    loadProgramsByColumnInChunks(supabase, "slug", normalizedKeys),
    loadProgramsByColumnInChunks(supabase, "program_code", normalizedKeys),
  ]);

  const typedPrograms = [...slugPrograms, ...codePrograms];

  return new Map(
    typedPrograms.map((program) => [
      program.id,
      {
        slug: program.slug,
        programCode: program.program_code,
        title: program.title,
      },
    ])
  );
}

export async function getAvailabilityTruth({
  countyCode,
  programmeSlugsOrCodes,
  locale,
  availabilityScopes = availabilityScopesForRouteTruth(),
}: {
  countyCode: string;
  programmeSlugsOrCodes: string[];
  locale?: string;
  availabilityScopes?: AvailabilityScope[];
}) {
  const supabase = createAdminClient();
  const normalizedCountyCode = countyCode.trim();
  const programById = await resolveProgramsBySlugsOrCodes(supabase, programmeSlugsOrCodes);

  if (!normalizedCountyCode || programById.size === 0) {
    return {
      hasTruth: false,
      rows: [] as AvailabilityTruthRow[],
    };
  }

  const educationProgramIds = Array.from(programById.keys());

  const normalizedScopes = Array.from(
    new Set(
      (availabilityScopes.length > 0 ? availabilityScopes : [ORDINARY_AVAILABILITY_SCOPE]).map(
        (scope) => scope.trim()
      )
    )
  ).filter(Boolean) as AvailabilityScope[];

  const availabilityRows: Array<{
    education_program_id: string;
    institution_id: string;
    county_code: string;
    municipality_code: string | null;
    availability_scope: string;
    stage: string;
    verification_status: string;
    updated_at: string | null;
    source_reference_url: string | null;
    notes: string | null;
  }> = [];

  for (let index = 0; index < educationProgramIds.length; index += PROGRAM_LOOKUP_CHUNK_SIZE) {
    const programIdChunk = educationProgramIds.slice(index, index + PROGRAM_LOOKUP_CHUNK_SIZE);
    const { data, error: availabilityError } = await supabase
      .from("programme_school_availability")
      .select(
        "education_program_id, institution_id, county_code, municipality_code, availability_scope, stage, verification_status, updated_at, source_reference_url, notes"
      )
      .in("education_program_id", programIdChunk)
      .eq("county_code", normalizedCountyCode)
      .eq("is_active", true)
      .in("availability_scope", normalizedScopes)
      .in("verification_status", ["verified", "needs_review"]);

    if (availabilityError) {
      throw new Error(`Failed to load availability truth rows: ${availabilityError.message}`);
    }

    availabilityRows.push(
      ...((data ?? []) as typeof availabilityRows)
    );
  }

  if (availabilityRows.length === 0) {
    return {
      hasTruth: false,
      rows: [] as AvailabilityTruthRow[],
    };
  }

  const institutionIds = Array.from(
    new Set(availabilityRows.map((row) => row.institution_id).filter(Boolean))
  );

  const institutions = await selectEducationInstitutions(supabase, {
    ids: institutionIds,
    selectWithNameI18n:
      "id, name, name_i18n, municipality_name, municipality_code, website_url, is_private_school",
    selectWithoutNameI18n:
      "id, name, municipality_name, municipality_code, website_url, is_private_school",
    errorLabel: "Failed to load institutions for availability truth",
    onlyActive: true,
  });

  const institutionById = new Map(
    (institutions as Array<{
      id: string;
      name: string | null;
      name_i18n: Record<string, string> | null;
      municipality_name: string | null;
      municipality_code: string | null;
      website_url: string | null;
      is_private_school: boolean | null;
    }>).map((institution) => [institution.id, institution])
  );

  const stagePriority: Record<string, number> = {
    VG1: 1,
    VG2: 2,
    VG3: 3,
    APPRENTICESHIP: 4,
  };

  const rows: AvailabilityTruthRow[] = [];
  for (const row of availabilityRows) {
    const program = programById.get(row.education_program_id);
    const institution = institutionById.get(row.institution_id);

    if (!program) {
      continue;
    }

    const isLosaRow = isLosaAvailabilityScope(row.availability_scope);
    const losaNotes = isLosaRow
      ? parseLosaPsaNotes(row.notes)
      : { providerSchoolLabel: null, deliverySiteLabel: null };
    const providerLabel =
      losaNotes.providerSchoolLabel ??
      resolveInstitutionDisplayName({
        locale: locale ?? "nb",
        institutionName: institution?.name ?? null,
        nameI18n: institution?.name_i18n ?? null,
      });
    const deliverySiteLabel = losaNotes.deliverySiteLabel ?? null;
    const institutionName = isLosaRow
      ? buildLosaOptionDisplayTitle({
          providerLabel,
          deliverySiteLabel,
        }) ?? providerLabel
      : resolveInstitutionDisplayName({
          locale: locale ?? "nb",
          institutionName: institution?.name ?? null,
          nameI18n: institution?.name_i18n ?? null,
        });
    const institutionMunicipality = isLosaRow
      ? deliverySiteLabel ?? institution?.municipality_name ?? null
      : institution?.municipality_name ?? null;

    rows.push({
      educationProgramId: row.education_program_id,
      programSlug: program.slug,
      programCode: program.programCode,
      programTitle: program.title,
      institutionId: row.institution_id,
      institutionName,
      institutionMunicipality,
      municipalityCode: row.municipality_code ?? institution?.municipality_code ?? null,
      institutionWebsite: institution?.website_url ?? null,
      institutionIsPrivateSchool:
        institution != null ? (institution.is_private_school ?? null) : null,
      countyCode: row.county_code,
      stage: row.stage,
      verificationStatus: row.verification_status,
      updatedAt: row.updated_at,
      sourceReferenceUrl: row.source_reference_url,
      availabilityScope: row.availability_scope,
      deliverySiteLabel,
      providerSchoolLabel: isLosaRow ? losaNotes.providerSchoolLabel ?? providerLabel : null,
      optionKind: isLosaRow ? row.availability_scope : ORDINARY_AVAILABILITY_SCOPE,
    });
  }

  rows.sort((a, b) => {
      const stageDelta = (stagePriority[a.stage] ?? 999) - (stagePriority[b.stage] ?? 999);
      if (stageDelta !== 0) {
        return stageDelta;
      }
      return (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
    });

  return {
    hasTruth: rows.length > 0,
    rows,
  };
}

export async function getAvailabilityTruthVersion({
  countyCode,
  programmeSlugsOrCodes,
  availabilityScopes = availabilityScopesForRouteTruth(),
}: {
  countyCode: string;
  programmeSlugsOrCodes: string[];
  availabilityScopes?: AvailabilityScope[];
}): Promise<string | null> {
  const supabase = createAdminClient();
  const normalizedCountyCode = countyCode.trim();
  const programById = await resolveProgramsBySlugsOrCodes(supabase, programmeSlugsOrCodes);
  const educationProgramIds = Array.from(programById.keys());

  if (!normalizedCountyCode || educationProgramIds.length === 0) {
    return null;
  }

  const normalizedScopes = Array.from(
    new Set(
      (availabilityScopes.length > 0 ? availabilityScopes : [ORDINARY_AVAILABILITY_SCOPE]).map(
        (scope) => scope.trim()
      )
    )
  ).filter(Boolean) as AvailabilityScope[];

  const { data: latestRows, error } = await supabase
    .from("programme_school_availability")
    .select("updated_at")
    .in("education_program_id", educationProgramIds)
    .eq("county_code", normalizedCountyCode)
    .eq("is_active", true)
    .in("availability_scope", normalizedScopes)
    .in("verification_status", ["verified", "needs_review"])
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to load availability truth version: ${error.message}`);
  }

  const latestUpdatedAt = ((latestRows ?? []) as Array<{ updated_at: string | null }>)[0]
    ?.updated_at;
  return latestUpdatedAt ?? null;
}