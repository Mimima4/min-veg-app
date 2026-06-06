import { isNordkappProviderLabel } from "./losa-finnmark-evidence-index.mjs";

/**
 * Resolve provider NSR institution_id at write session (not stored in git).
 */
export async function resolveProviderInstitutionId(
  supabase,
  { providerSchoolLabel, countyCode = "56" } = {}
) {
  if (!isNordkappProviderLabel(providerSchoolLabel)) {
    return {
      resolved: false,
      institutionId: null,
      reason: "provider_label_not_nordkapp_pattern",
    };
  }

  const { data, error } = await supabase
    .from("education_institutions")
    .select("id, name, county_code")
    .eq("county_code", countyCode)
    .ilike("name", "%Nordkapp%videreg%")
    .limit(5);

  if (error) {
    throw error;
  }

  const match = (data ?? []).find((row) =>
    isNordkappProviderLabel(row.name)
  );

  if (!match?.id) {
    return {
      resolved: false,
      institutionId: null,
      reason: "nordkapp_institution_not_found",
      candidates: (data ?? []).length,
    };
  }

  return {
    resolved: true,
    institutionId: match.id,
    institutionName: match.name,
    reason: "nsr_lookup_county_56",
  };
}
