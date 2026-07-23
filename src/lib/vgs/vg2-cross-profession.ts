/**
 * V.BA shared VG1 — carpenter and plumber share VG1 Bygg; VG2 programme picker may
 * offer sibling-profession programmes that trigger a route switch (not school mixing).
 */

export const VBA_SHARED_VG1_PROFESSION_SLUGS = [
  "carpenter",
  "plumber",
  "painter",
  "maskin-og-kranforer",
  "platearbeider-og-sveiser",
  "murer",
  "anleggsgartner",
  "snekker",
] as const;

export type VbaSharedVg1ProfessionSlug = (typeof VBA_SHARED_VG1_PROFESSION_SLUGS)[number];

export function parseRegionalProgrammeSlug(slug: string): {
  professionPrefix: string;
  regionSuffix: string;
} | null {
  const normalized = String(slug ?? "").trim().toLowerCase();
  const match = normalized.match(/^(.*)-vg[1-3]-.+-([a-z0-9]+)$/);
  if (!match) return null;
  const professionPrefix = match[1]?.trim();
  const regionSuffix = match[2]?.trim();
  if (!professionPrefix || !regionSuffix) return null;
  return { professionPrefix, regionSuffix };
}

export function resolveProfessionSlugFromProgramSlug(
  programSlug: string | null | undefined
): string | null {
  return parseRegionalProgrammeSlug(String(programSlug ?? ""))?.professionPrefix ?? null;
}

export function isVbaSharedVg1Profession(
  professionSlug: string | null | undefined
): professionSlug is VbaSharedVg1ProfessionSlug {
  const slug = String(professionSlug ?? "").trim();
  return (VBA_SHARED_VG1_PROFESSION_SLUGS as readonly string[]).includes(slug);
}

export function isVbaSharedVg1CrossProfessionSwitch(params: {
  fromProfessionSlug: string | null | undefined;
  toProfessionSlug: string | null | undefined;
}): boolean {
  const from = String(params.fromProfessionSlug ?? "").trim();
  const to = String(params.toProfessionSlug ?? "").trim();
  if (!from || !to || from === to) return false;
  return isVbaSharedVg1Profession(from) && isVbaSharedVg1Profession(to);
}

export function extractRegionalCountySuffixFromProgramSlugs(
  programSlugs: Array<string | null | undefined>
): string | null {
  for (const slug of programSlugs) {
    const parsed = parseRegionalProgrammeSlug(String(slug ?? ""));
    if (parsed?.regionSuffix) return parsed.regionSuffix;
  }
  return null;
}
