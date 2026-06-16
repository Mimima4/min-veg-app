import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export function parsePreferredMunicipalityCodes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getChildPreferredMunicipalityCodes(
  childId: string,
  supabase?: SupabaseClient
): Promise<string[]> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("child_profiles")
    .select("preferred_municipality_codes")
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load child preferred municipality codes: ${error.message}`
    );
  }

  return parsePreferredMunicipalityCodes(data?.preferred_municipality_codes);
}
