import type {
  RouteEducationProgram,
  RouteInstitution,
  RouteProgramLink,
} from "./select-programme-for-route";

const TEMP_HIGHER_ED_LEVELS = new Set(["bachelor", "professional_degree", "master"]);

export function applyRouteSelectionBoundary(params: {
  professionProgramLinks: RouteProgramLink[];
  educationPrograms: RouteEducationProgram[];
  institutions: RouteInstitution[];
}): {
  professionProgramLinks: RouteProgramLink[];
  educationPrograms: RouteEducationProgram[];
  institutions: RouteInstitution[];
} {
  const institutionById = new Map(
    params.institutions.map((institution) => [institution.id, institution])
  );

  const allowedPrograms = params.educationPrograms.filter((program) => {
    const institution = institutionById.get(program.institution_id);
    if (!institution) return false;

    const educationLevel = (program.education_level ?? "").trim().toLowerCase();
    const isHigherEd = TEMP_HIGHER_ED_LEVELS.has(educationLevel);
    const isLegacyInstitution = institution.source === "legacy";

    // Temporary boundary codification: higher-ed legacy contour is allowed only
    // when candidate completeness requirements are met. is_route_relevant=false
    // does not auto-exclude this specific contour.
    if (isLegacyInstitution && isHigherEd) {
      if (!program.is_active || !institution.is_active) return false;
      if (!institution.municipality_code || !institution.county_code) return false;
    }

    return true;
  });

  const allowedProgramSlugs = new Set(allowedPrograms.map((program) => program.slug));
  const allowedLinks = params.professionProgramLinks.filter((link) => {
    if (!link.fit_band) return false;
    return allowedProgramSlugs.has(link.program_slug);
  });

  const linkedProgramSlugs = new Set(allowedLinks.map((link) => link.program_slug));
  const filteredPrograms = allowedPrograms.filter((program) =>
    linkedProgramSlugs.has(program.slug)
  );
  const filteredInstitutionIds = new Set(
    filteredPrograms.map((program) => program.institution_id)
  );
  const filteredInstitutions = params.institutions.filter((institution) =>
    filteredInstitutionIds.has(institution.id)
  );

  return {
    professionProgramLinks: allowedLinks,
    educationPrograms: filteredPrograms,
    institutions: filteredInstitutions,
  };
}
