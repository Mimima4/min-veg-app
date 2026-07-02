/**
 * Maps kolonne-3 / LAREFAG step selections to canonical `larebedrift_truth.larefag_code`.
 * Used when a route has a dedicated Fagvalg step before bedrift (model B).
 */

type LarefagIdentity = {
  code: string;
  label: string;
};

function normalize(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const KOLONNE3_LAREFAG_MATCHERS: ReadonlyArray<{
  slugNeedles: readonly string[];
  titleNeedles: readonly string[];
  identity: LarefagIdentity;
}> = [
  {
    slugNeedles: ["elektriker", "elektrikerfaget"],
    titleNeedles: ["elektrikerfaget", "elektriker"],
    identity: { code: "ELEKTRIKERFAGET", label: "Elektrikerfaget" },
  },
];

function kolonne3SlugHaystack(programSlug: string | null | undefined): string {
  return normalize(String(programSlug ?? "").replace(/^kolonne3-/, ""));
}

export function resolveLarefagFromKolonne3Selection(params: {
  programSlug?: string | null;
  programTitle?: string | null;
  title?: string | null;
}): LarefagIdentity | null {
  const slugHaystack = kolonne3SlugHaystack(params.programSlug);
  const titleHaystack = normalize(
    [params.programTitle, params.title].filter(Boolean).join(" ")
  );

  for (const matcher of KOLONNE3_LAREFAG_MATCHERS) {
    const slugMatch = matcher.slugNeedles.some((needle) => slugHaystack.includes(needle));
    const titleMatch = matcher.titleNeedles.some((needle) => titleHaystack.includes(needle));
    if (slugMatch || titleMatch) {
      return matcher.identity;
    }
  }

  return null;
}

export function resolveLarefagCodeFromKolonne3Selection(
  params: Parameters<typeof resolveLarefagFromKolonne3Selection>[0]
): string | null {
  return resolveLarefagFromKolonne3Selection(params)?.code ?? null;
}
