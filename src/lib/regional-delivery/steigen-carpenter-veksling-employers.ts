type CuratedSteigenEmployer = {
  employer_id: string;
  employer_name: string;
  municipality: string;
  website: string | null;
  source_note: string;
};

/**
 * P2 curated employer entity table for Steigen carpenter veksling.
 * Kept outside PSA/Vilbli truth to avoid mixing audited route truth sources.
 */
const STEIGEN_CARPENTER_VEKSLING_EMPLOYERS: CuratedSteigenEmployer[] = [
  {
    employer_id: "steigen-carpenter-local-bedrift",
    employer_name: "Lokal opplæringsbedrift (Steigen)",
    municipality: "Steigen",
    website: null,
    source_note: "Curated operator record (levisteigen + kommune/NFK evidence pack).",
  },
];

export function getSteigenCarpenterVekslingApprenticeshipOptions() {
  return STEIGEN_CARPENTER_VEKSLING_EMPLOYERS.map((employer) => ({
    option_id: `employer-${employer.employer_id}`,
    option_title: employer.employer_name,
    outcome_profession_ids: [] as string[],
    entity_type: "employer" as const,
    employer_municipality: employer.municipality,
    employer_website: employer.website,
    employer_source_note: employer.source_note,
  }));
}
