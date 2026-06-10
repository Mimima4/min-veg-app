/**
 * Vilbli VG3 / Opplæring i bedrift branch hints per VGS profession.
 * Keep aligned with owner records under docs/architecture/.
 *
 * Product policy: show all kolonne-3 / bedrift continuations from the active
 * VG1→VG2 programme chain (per fylke) — not a global catalog; do not narrow to one
 * sibling fag. Exclude Påbygging / adult contours.
 */

export type VilbliBranchProfessionConfig = {
  /** Regex on skoler-og-laerebedrifter href for a reference apprenticeship branch page. */
  branchSkolerUrlPattern: RegExp;
  /** When true, sort VG3 branch options with profession-specific preference (electrician only). */
  preferVg3OptionOrdering: boolean;
  preferredVg3OptionPattern?: RegExp;
  /** Boost apprenticeship yrker URL scoring when multiple yrker URLs exist. */
  preferredYrkerPathPattern?: RegExp;
};

export const VILBLI_BRANCH_CONFIG_BY_PROFESSION: Record<string, VilbliBranchProfessionConfig> =
  {
    electrician: {
      branchSkolerUrlPattern: /elektrikerfaget-skoler-og-laerebedrifter/i,
      preferVg3OptionOrdering: true,
      preferredVg3OptionPattern: /elektrikerfaget/i,
      preferredYrkerPathPattern: /\/yrker\/v\.el\/elektrikerfaget/i,
    },
    mechanic: {
      branchSkolerUrlPattern: /bilfaget-lette-kjoretoy-skoler-og-laerebedrifter/i,
      preferVg3OptionOrdering: false,
      preferredYrkerPathPattern: /\/yrker\/v\.tp\//i,
    },
  };

export function getVilbliBranchConfig(professionSlug: string): VilbliBranchProfessionConfig | null {
  const key = String(professionSlug ?? "").trim();
  return VILBLI_BRANCH_CONFIG_BY_PROFESSION[key] ?? null;
}
