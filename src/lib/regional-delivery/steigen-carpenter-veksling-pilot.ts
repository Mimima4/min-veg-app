/**
 * P0 — Steigen × carpenter veksling info card (read-only curated copy).
 * Charter: phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md
 */

export const STEIGEN_KOMMUNE_CODE = "1848";

export const STEIGEN_CARPENTER_VEKSLING_BADGE = "Veksling / Steigenmodellen";

export type SteigenCarpenterVekslingInfoCopy = {
  badge: string;
  title: string;
  body: string;
  bullets: string[];
  campusNote: string;
  sources: Array<{ label: string; href: string }>;
};

export function childHasSteigenHomeKommune(
  preferredMunicipalityCodes: string[]
): boolean {
  return preferredMunicipalityCodes.some(
    (code) => String(code ?? "").trim() === STEIGEN_KOMMUNE_CODE
  );
}

export function shouldShowSteigenCarpenterVekslingInfo(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  return (
    params.professionSlug === "carpenter" &&
    childHasSteigenHomeKommune(params.preferredMunicipalityCodes)
  );
}

export function getSteigenCarpenterVekslingInfoCopy(
  locale: string
): SteigenCarpenterVekslingInfoCopy {
  if (locale === "en") {
    return {
      badge: STEIGEN_CARPENTER_VEKSLING_BADGE,
      title: "Local carpenter path in Steigen (Steigenmodellen)",
      body:
        "In Steigen, Steigenmodellen offers trade training in a workplace from day one, with common subjects at the local upper secondary hub. This is a different delivery model than the campus VGS route shown below.",
      bullets: [
        "0+4: apprenticeship in a local business from the first school day",
        "Common subjects at Nord-Salten vgs avd Steigen (years 1–2)",
        "Trade subjects in the workplace — not listed on Vilbli strukturkart",
      ],
      campusNote:
        "The route steps below show ordinary campus VGS options (for example Bodø, Fauske). Both paths can be relevant for families in Steigen.",
      sources: [
        {
          label: "Lev i Steigen — Steigenmodellen",
          href: "https://www.levisteigen.no/utdanning-i-steigen.html",
        },
        {
          label: "Nordland fylkeskommune — 0+4 on nearest VGS",
          href: "https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx",
        },
      ],
    };
  }

  return {
    badge: STEIGEN_CARPENTER_VEKSLING_BADGE,
    title: "Lokalt tømreralternativ i Steigen (Steigenmodellen)",
    body:
      "I Steigen finnes Steigenmodellen — yrkesopplæring i bedrift fra dag 1 med fellesfag på lokal videregående skole. Dette er en annen leveransemodell enn campus-VGS-ruten som vises nedenfor.",
    bullets: [
      "0+4: lærling i lokal bedrift fra første skoledag",
      "Fellesfag på Nord-Salten vgs avd Steigen (år 1–2)",
      "Programfag i bedrift — ikke på Vilbli strukturkart",
    ],
    campusNote:
      "Rutestegene nedenfor viser vanlig campus-VGS (for eksempel Bodø, Fauske). Begge veier kan være relevante for familier i Steigen.",
    sources: [
      {
        label: "Lev i Steigen — Steigenmodellen",
        href: "https://www.levisteigen.no/utdanning-i-steigen.html",
      },
      {
        label: "Nordland fylkeskommune — 0+4 på nærmeste VGS",
        href: "https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx",
      },
    ],
  };
}
