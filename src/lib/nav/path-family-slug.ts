/**
 * Path family slugs — one VG1 anchor per family (Vilbli area + VG2 branch).
 * Keep aligned with scripts/vgs-path-definitions.mjs and owner records.
 */

const PATH_FAMILY_SLUG_BY_PROFESSION: Record<string, string> = {
  mechanic: "mechanic-vtp-kjoretoy",
  electrician: "electrician-vel-elenergi",
  carpenter: "carpenter-vba-tomrer",
  plumber: "plumber-vba-rorlegger",
  painter: "painter-vba-overflateteknikk",
  // Catalog Maskin- og kranfører; Vilbli school VG2 branch is Anleggsteknikk.
  "maskin-og-kranforer": "maskin-og-kranforer-vba-anleggsteknikk",
  // Catalog Platearbeider og sveiser; Vilbli school VG2 branch is Klima/energi/miljø.
  "platearbeider-og-sveiser": "platearbeider-og-sveiser-vba-klima-energi",
  murer: "murer-vba-betong-mur",
  anleggsgartner: "anleggsgartner-vba-anleggsgartner",
  // Catalog profession Snekker; Vilbli school VG2 branch is Treteknikk.
  snekker: "snekker-vba-treteknikk",
  // Catalog profession Kokk; Vilbli school VG2 branch is Kokk- og servitørfag.
  kokk: "kokk-vrm-kokk-servitor",
};

export function resolvePathFamilySlug(professionSlug: string): string | null {
  const key = String(professionSlug ?? "").trim();
  return PATH_FAMILY_SLUG_BY_PROFESSION[key] ?? null;
}

export function isSupportedPathFamilyProfession(professionSlug: string): boolean {
  return resolvePathFamilySlug(professionSlug) !== null;
}
