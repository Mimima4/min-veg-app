import type { SupabaseClient } from "@supabase/supabase-js";

let nameI18nColumnKnown = false;
let nameI18nColumnAvailable = false;

function isMissingNameI18nColumn(message: string): boolean {
  return message.includes("name_i18n") && message.includes("does not exist");
}

function markNameI18nUnavailable(): void {
  nameI18nColumnKnown = true;
  nameI18nColumnAvailable = false;
}

function withNullNameI18n<T extends Record<string, unknown>>(rows: T[]): Array<T & { name_i18n: null }> {
  return rows.map((row) => ({ ...row, name_i18n: null }));
}

export async function selectEducationInstitutions(
  supabase: SupabaseClient,
  params: {
    ids: string[];
    selectWithNameI18n: string;
    selectWithoutNameI18n: string;
    errorLabel: string;
    onlyActive?: boolean;
  }
): Promise<Record<string, unknown>[]> {
  const ids = Array.from(new Set(params.ids.filter(Boolean)));
  if (ids.length === 0) {
    return [];
  }

  const shouldTryI18n = !nameI18nColumnKnown || nameI18nColumnAvailable;

  if (shouldTryI18n) {
    let withI18nQuery = supabase
      .from("education_institutions")
      .select(params.selectWithNameI18n)
      .in("id", ids);
    if (params.onlyActive) {
      withI18nQuery = withI18nQuery.eq("is_active", true);
    }

    const withI18n = await withI18nQuery;

    if (!withI18n.error) {
      nameI18nColumnKnown = true;
      nameI18nColumnAvailable = true;
      return (withI18n.data ?? []) as unknown as Record<string, unknown>[];
    }

    if (!isMissingNameI18nColumn(withI18n.error.message)) {
      throw new Error(`${params.errorLabel}: ${withI18n.error.message}`);
    }

    markNameI18nUnavailable();
  }

  let withoutI18nQuery = supabase
    .from("education_institutions")
    .select(params.selectWithoutNameI18n)
    .in("id", ids);
  if (params.onlyActive) {
    withoutI18nQuery = withoutI18nQuery.eq("is_active", true);
  }

  const withoutI18n = await withoutI18nQuery;

  if (withoutI18n.error) {
    throw new Error(`${params.errorLabel}: ${withoutI18n.error.message}`);
  }

  return withNullNameI18n((withoutI18n.data ?? []) as unknown as Record<string, unknown>[]);
}
