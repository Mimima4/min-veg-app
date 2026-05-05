import { createAdminClient } from "@/lib/supabase/admin";
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
};

type ProgramLookupRow = {
  id: string;
  slug: string;
  program_code: string | null;
  title: string | null;
};

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

  const [{ data: slugPrograms, error: slugProgramsError }, { data: codePrograms, error: codeProgramsError }] =
    await Promise.all([
      supabase
        .from("education_programs")
        .select("id, slug, program_code, title")
        .in("slug", normalizedKeys)
        .eq("is_active", true),
      supabase
        .from("education_programs")
        .select("id, slug, program_code, title")
        .in("program_code", normalizedKeys)
        .eq("is_active", true),
    ]);

  if (slugProgramsError) {
    throw new Error(
      `Failed to load availability-truth program ids by slug: ${slugProgramsError.message}`
    );
  }

  if (codeProgramsError) {
    throw new Error(
      `Failed to load availability-truth program ids by code: ${codeProgramsError.message}`
    );
  }

  const typedPrograms = [
    ...((slugPrograms ?? []) as ProgramLookupRow[]),
    ...((codePrograms ?? []) as ProgramLookupRow[]),
  ];

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
}: {
  countyCode: string;
  programmeSlugsOrCodes: string[];
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

  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("programme_school_availability")
    .select(
      "education_program_id, institution_id, county_code, municipality_code, stage, verification_status, updated_at, source_reference_url"
    )
    .in("education_program_id", educationProgramIds)
    .eq("county_code", normalizedCountyCode)
    .eq("is_active", true)
    .in("verification_status", ["verified", "needs_review"]);

  if (availabilityError) {
    throw new Error(`Failed to load availability truth rows: ${availabilityError.message}`);
  }

  const typedAvailabilityRows = (availabilityRows ?? []) as Array<{
    education_program_id: string;
    institution_id: string;
    county_code: string;
    municipality_code: string | null;
    stage: string;
    verification_status: string;
    updated_at: string | null;
    source_reference_url: string | null;
  }>;

  if (typedAvailabilityRows.length === 0) {
    return {
      hasTruth: false,
      rows: [] as AvailabilityTruthRow[],
    };
  }

  const institutionIds = Array.from(
    new Set(typedAvailabilityRows.map((row) => row.institution_id).filter(Boolean))
  );

  const { data: institutions, error: institutionsError } = await supabase
    .from("education_institutions")
    .select("id, name, municipality_name, municipality_code, website_url, is_private_school")
    .in("id", institutionIds)
    .eq("is_active", true);

  if (institutionsError) {
    throw new Error(
      `Failed to load institutions for availability truth: ${institutionsError.message}`
    );
  }

  const institutionById = new Map(
    ((institutions ?? []) as Array<{
      id: string;
      name: string | null;
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

  const rows = typedAvailabilityRows
    .map((row) => {
      const program = programById.get(row.education_program_id);
      const institution = institutionById.get(row.institution_id);

      if (!program) {
        return null;
      }

      return {
        educationProgramId: row.education_program_id,
        programSlug: program.slug,
        programCode: program.programCode,
        programTitle: program.title,
        institutionId: row.institution_id,
        institutionName: institution?.name ?? null,
        institutionMunicipality: institution?.municipality_name ?? null,
        municipalityCode: row.municipality_code ?? institution?.municipality_code ?? null,
        institutionWebsite: institution?.website_url ?? null,
        institutionIsPrivateSchool:
          institution != null ? (institution.is_private_school ?? null) : null,
        countyCode: row.county_code,
        stage: row.stage,
        verificationStatus: row.verification_status,
        updatedAt: row.updated_at,
        sourceReferenceUrl: row.source_reference_url,
      } satisfies AvailabilityTruthRow;
    })
    .filter((row): row is AvailabilityTruthRow => Boolean(row))
    .sort((a, b) => {
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
}: {
  countyCode: string;
  programmeSlugsOrCodes: string[];
}): Promise<string | null> {
  const supabase = createAdminClient();
  const normalizedCountyCode = countyCode.trim();
  const programById = await resolveProgramsBySlugsOrCodes(supabase, programmeSlugsOrCodes);
  const educationProgramIds = Array.from(programById.keys());

  if (!normalizedCountyCode || educationProgramIds.length === 0) {
    return null;
  }

  const { data: latestRows, error } = await supabase
    .from("programme_school_availability")
    .select("updated_at")
    .in("education_program_id", educationProgramIds)
    .eq("county_code", normalizedCountyCode)
    .eq("is_active", true)
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