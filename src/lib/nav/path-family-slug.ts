/**
 * Path family slugs — one VG1 anchor per family (Vilbli area + VG2 branch).
 * Keep aligned with scripts/vgs-path-definitions.mjs and owner records.
 */

const PATH_FAMILY_SLUG_BY_PROFESSION: Record<string, string> = {
  mechanic: "mechanic-vtp-kjoretoy",
  electrician: "electrician-vel-elenergi",
  carpenter: "carpenter-vba-tomrer",
};

export function resolvePathFamilySlug(professionSlug: string): string | null {
  const key = String(professionSlug ?? "").trim();
  return PATH_FAMILY_SLUG_BY_PROFESSION[key] ?? null;
}

export function isSupportedPathFamilyProfession(professionSlug: string): boolean {
  return resolvePathFamilySlug(professionSlug) !== null;
}
