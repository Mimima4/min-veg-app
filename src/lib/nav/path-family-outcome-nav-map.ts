/**
 * Versioned path_family ↔ Vilbli outcome ↔ NAV STYRK map.
 * Authority: phase-4-nav-matcher-owner-decision-record.md §5.1
 *
 * Rows are curated with source_reference_url per outcome family.
 * Bump PATH_FAMILY_OUTCOME_NAV_MAP_VERSION when rows change.
 */

import type { RouteOutcomeFilterId } from "./route-outcome-filter-id";

export const PATH_FAMILY_OUTCOME_NAV_MAP_VERSION = 1;

export const NAV_TAXONOMY_AUTHORITY_URL = "https://arbeidsplassen.nav.no/stillinger";

export type PathFamilyOutcomeFilterTag =
  | "laere"
  | "fagbrev"
  | "vg3_spesialisering"
  | "fagskole"
  | "akademisk"
  | "profesjonsstudier";

export type PathFamilyOutcomeNavMapRow = {
  mapVersion: number;
  pathFamilySlug: string;
  professionSlug: string;
  /** Normalized substring match against Vilbli outcome title (any match wins). */
  vilbliTitleIncludes: string[];
  /** Optional substring match on Vilbli yrker / outcome URL. */
  vilbliOutcomeUrlIncludes?: string[];
  filterTags: PathFamilyOutcomeFilterTag[];
  navStyrkCode: string;
  navTitle: string;
  catalogProfessionSlug: string;
  sourceReferenceUrl: string;
};

function normalizeTitle(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MECHANIC_KJORETOY_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/v.tp/bilfaget-lette-kjoretoy?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----&side=p2";

const ELECTRICIAN_ELEKTRO_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/v.el/skoler-og-laerebedrifter-elektro-og-datateknologi?kurs=v.elele2----&side=p5";

const CARPENTER_TOMRER_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/V.BA/tomrer-fag-og-timefordeling?kurs=V.BABAT1----_V.BATMF2----&side=p2";

const PLUMBER_RORLEGGER_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/V.BA/rorlegger-fag-og-timefordeling?kurs=V.BABAT1----_V.BARLF2----&side=p2";

const PAINTER_OVERFLATETEKNIKK_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/V.BA/overflateteknikk?kurs=V.BAOFT2----&side=p2";

const ANLEGSTEKNIKK_SOURCE =
  "https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANL2----&side=p2";

export const PATH_FAMILY_OUTCOME_NAV_MAP_ROWS: PathFamilyOutcomeNavMapRow[] = [
  // --- mechanic / mechanic-vtp-kjoretoy ---
  {
    mapVersion: 1,
    pathFamilySlug: "mechanic-vtp-kjoretoy",
    professionSlug: "mechanic",
    vilbliTitleIncludes: ["bilfaget", "lette kjoretoy", "lette kjøretøy"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.tp/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "håndverkere.mekaniker",
    navTitle: "Mekaniker",
    catalogProfessionSlug: "mechanic",
    sourceReferenceUrl: MECHANIC_KJORETOY_SOURCE,
  },
  {
    mapVersion: 1,
    pathFamilySlug: "mechanic-vtp-kjoretoy",
    professionSlug: "mechanic",
    vilbliTitleIncludes: ["motormekaniker"],
    filterTags: ["vg3_spesialisering", "laere", "fagbrev"],
    navStyrkCode: "håndverkere.mekaniker",
    navTitle: "Mekaniker",
    catalogProfessionSlug: "mechanic",
    sourceReferenceUrl: MECHANIC_KJORETOY_SOURCE,
  },
  {
    mapVersion: 1,
    pathFamilySlug: "mechanic-vtp-kjoretoy",
    professionSlug: "mechanic",
    vilbliTitleIncludes: [
      "bilfaget tunge",
      "hjulutrustning",
      "landbruksmaskin",
      "motorsykkel",
      "reservedel",
      "sykkelmekaniker",
      "truck",
      "liftmekaniker",
      "demontering",
    ],
    filterTags: ["vg3_spesialisering", "laere", "fagbrev"],
    navStyrkCode: "håndverkere.mekaniker",
    navTitle: "Mekaniker",
    catalogProfessionSlug: "mechanic",
    sourceReferenceUrl: MECHANIC_KJORETOY_SOURCE,
  },
  {
    mapVersion: 1,
    pathFamilySlug: "mechanic-vtp-kjoretoy",
    professionSlug: "mechanic",
    vilbliTitleIncludes: ["maskiningenior", "maskiningeniør"],
    filterTags: ["akademisk", "profesjonsstudier"],
    navStyrkCode: "industri-og-produksjon.maskinteknikk-og-mekanikk",
    navTitle: "Maskinteknikk og mekanikk",
    catalogProfessionSlug: "mechanic",
    sourceReferenceUrl: NAV_TAXONOMY_AUTHORITY_URL,
  },
  // --- electrician / electrician-vel-elenergi ---
  {
    mapVersion: 1,
    pathFamilySlug: "electrician-vel-elenergi",
    professionSlug: "electrician",
    vilbliTitleIncludes: ["elektriker", "elektro"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.el/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "håndverkere.elektriker/elektro",
    navTitle: "Elektriker/elektro",
    catalogProfessionSlug: "electrician",
    sourceReferenceUrl: ELECTRICIAN_ELEKTRO_SOURCE,
  },
  {
    mapVersion: 1,
    pathFamilySlug: "electrician-vel-elenergi",
    professionSlug: "electrician",
    vilbliTitleIncludes: ["elektroingenior", "elektroingeniør"],
    filterTags: ["akademisk", "profesjonsstudier"],
    navStyrkCode: "bygg-og-anlegg.andre-ingeniører",
    navTitle: "Andre ingeniører",
    catalogProfessionSlug: "electrician",
    sourceReferenceUrl: NAV_TAXONOMY_AUTHORITY_URL,
  },
  // --- carpenter / carpenter-vba-tomrer ---
  {
    mapVersion: 1,
    pathFamilySlug: "carpenter-vba-tomrer",
    professionSlug: "carpenter",
    vilbliTitleIncludes: ["tomrerfaget", "tømrerfaget", "tømrer"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // NAV vacancy catalog merges Tømrer + Snekker into one leaf; Min Veg keeps them as
    // two catalogue professions (carpenter vs snekker) with distinct navTitle.
    navStyrkCode: "håndverkere.tømrer-og-snekker",
    navTitle: "Tømrer",
    catalogProfessionSlug: "carpenter",
    sourceReferenceUrl: CARPENTER_TOMRER_SOURCE,
  },
  // --- plumber / plumber-vba-rorlegger ---
  {
    mapVersion: 1,
    pathFamilySlug: "plumber-vba-rorlegger",
    professionSlug: "plumber",
    vilbliTitleIncludes: ["rorleggerfaget", "rørleggerfaget", "rørlegger"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "håndverkere.rørlegger",
    navTitle: "Rørlegger",
    catalogProfessionSlug: "plumber",
    sourceReferenceUrl: PLUMBER_RORLEGGER_SOURCE,
  },
  // --- painter / painter-vba-overflateteknikk ---
  {
    mapVersion: 1,
    pathFamilySlug: "painter-vba-overflateteknikk",
    professionSlug: "painter",
    vilbliTitleIncludes: [
      "maler",
      "overflateteknikk",
      "maler og overflateteknikk",
      "industrimaler",
    ],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "håndverkere.maler",
    navTitle: "Maler",
    catalogProfessionSlug: "painter",
    sourceReferenceUrl: PAINTER_OVERFLATETEKNIKK_SOURCE,
  },
  // --- maskin-og-kranforer / maskin-og-kranforer-vba-anleggsteknikk ---
  // Catalog Maskin- og kranfører; school VG2 stays Anleggsteknikk (BAANL2).
  {
    mapVersion: 1,
    pathFamilySlug: "maskin-og-kranforer-vba-anleggsteknikk",
    professionSlug: "maskin-og-kranforer",
    vilbliTitleIncludes: [
      "anleggsteknikk",
      "anleggsteknikfaget",
      "anleggsmaskinforer",
      "anleggsmaskinfører",
      "veg og anlegg",
    ],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // NAV arbeidsplassen STYRK (snapshot) — no exact «Anleggsmaskinfører» leaf;
    // closest occupation is Maskin- og kranfører.
    navStyrkCode: "bygg-og-anlegg.maskin--og-kranfører",
    navTitle: "Maskin- og kranfører",
    catalogProfessionSlug: "maskin-og-kranforer",
    sourceReferenceUrl: ANLEGSTEKNIKK_SOURCE,
  },
  // --- platearbeider-og-sveiser / platearbeider-og-sveiser-vba-klima-energi ---
  // Catalog Platearbeider og sveiser; school VG2 stays Klima/energi/miljø (BAKEM2).
  {
    mapVersion: 1,
    pathFamilySlug: "platearbeider-og-sveiser-vba-klima-energi",
    professionSlug: "platearbeider-og-sveiser",
    vilbliTitleIncludes: [
      "klima",
      "energi og miljo",
      "miljoteknikk",
      "ventilasjon",
      "blikkenslager",
      "isolator",
      "isolatør",
      "membrantekker",
    ],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // Closest NAV arbeidsplassen leaf for Ventilasjons- / blikkenslager chain.
    navStyrkCode: "håndverkere.platearbeider-og-sveiser",
    navTitle: "Platearbeider og sveiser",
    catalogProfessionSlug: "platearbeider-og-sveiser",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/klima-energi-og-miljoteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAKEM2----&side=p2",
  },
  // --- murer / murer-vba-betong-mur ---
  {
    mapVersion: 1,
    pathFamilySlug: "murer-vba-betong-mur",
    professionSlug: "murer",
    vilbliTitleIncludes: [
      "betong og mur",
      "betong",
      "mur",
      "murer",
      "flislegger",
    ],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // Dedicated NAV arbeidsplassen leaf for the Murer- og flisleggerfaget primary fag.
    navStyrkCode: "håndverkere.murer",
    navTitle: "Murer",
    catalogProfessionSlug: "murer",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/betong-og-mur-fag-og-timefordeling?kurs=V.BABAT1----_V.BABMO2----&side=p2",
  },
  // --- anleggsgartner / anleggsgartner-vba-anleggsgartner ---
  {
    mapVersion: 1,
    pathFamilySlug: "anleggsgartner-vba-anleggsgartner",
    professionSlug: "anleggsgartner",
    vilbliTitleIncludes: ["anleggsgartner", "gartner"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // No dedicated NAV leaf for Anleggsgartner — closest vacancy-catalog occupation.
    navStyrkCode: "natur-og-miljø.skogbruk,-gartnerarbeid-og-hagebruk",
    navTitle: "Skogbruk, gartnerarbeid og hagebruk",
    catalogProfessionSlug: "anleggsgartner",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsgartner-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANG2----&side=p2",
  },
  // --- snekker / snekker-vba-treteknikk ---
  {
    mapVersion: 1,
    pathFamilySlug: "snekker-vba-treteknikk",
    professionSlug: "snekker",
    vilbliTitleIncludes: ["snekkerfaget", "snekker", "industrisnekker", "trelast"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.ba/"],
    filterTags: ["laere", "fagbrev"],
    // Same NAV vacancy leaf as carpenter (taxonomy merge). Distinct Min Veg profession + navTitle.
    navStyrkCode: "håndverkere.tømrer-og-snekker",
    navTitle: "Snekker",
    catalogProfessionSlug: "snekker",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/treteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BATRT2----&side=p2",
  },
  // --- kokk / kokk-vrm-kokk-servitor ---
  {
    mapVersion: 1,
    pathFamilySlug: "kokk-vrm-kokk-servitor",
    professionSlug: "kokk",
    vilbliTitleIncludes: ["kokkfaget", "kokk"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.rm/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "reiseliv-og-mat.kokk",
    navTitle: "Kokk",
    catalogProfessionSlug: "kokk",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.RM/kokk-og-servitorfag-fag-og-timefordeling?kurs=V.RMRMF1----_V.RMKOS2----&side=p2",
  },
  {
    mapVersion: 1,
    pathFamilySlug: "kokk-vrm-kokk-servitor",
    professionSlug: "kokk",
    vilbliTitleIncludes: ["servitor", "servitør", "servitorfaget", "servitørfaget"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.rm/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "reiseliv-og-mat.restaurant",
    navTitle: "Restaurant",
    catalogProfessionSlug: "kokk",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.RM/kokk-og-servitorfag-fag-og-timefordeling?kurs=V.RMRMF1----_V.RMKOS2----&side=p2",
  },
  {
    mapVersion: 1,
    pathFamilySlug: "kokk-vrm-kokk-servitor",
    professionSlug: "kokk",
    vilbliTitleIncludes: ["ernaeringskokk", "ernæringskokk", "ernaeringskokkfaget", "ernæringskokkfaget"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.rm/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "reiseliv-og-mat.kokk",
    navTitle: "Kokk",
    catalogProfessionSlug: "kokk",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.RM/kokk-og-servitorfag-fag-og-timefordeling?kurs=V.RMRMF1----_V.RMKOS2----&side=p2",
  },
  {
    mapVersion: 1,
    pathFamilySlug: "kokk-vrm-kokk-servitor",
    professionSlug: "kokk",
    vilbliTitleIncludes: ["ferskvarehandler", "ferskvarehandlerfaget"],
    vilbliOutcomeUrlIncludes: ["/yrker/v.rm/"],
    filterTags: ["laere", "fagbrev"],
    navStyrkCode: "industri-og-produksjon.matproduksjon-og-næringsmiddelarbeid",
    navTitle: "Matproduksjon og næringsmiddelarbeid",
    catalogProfessionSlug: "kokk",
    sourceReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.RM/kokk-og-servitorfag-fag-og-timefordeling?kurs=V.RMRMF1----_V.RMKOS2----&side=p2",
  },
];

const FILTER_TAG_ALLOWLIST: Record<RouteOutcomeFilterId, Set<PathFamilyOutcomeFilterTag> | null> =
  {
    open: null,
    flexible: null,
    fast_to_work: new Set(["laere", "fagbrev"]),
    vg3_before_apprenticeship: new Set(["vg3_spesialisering", "laere", "fagbrev"]),
    fagskole_after_vgs: new Set(["fagskole"]),
    long_academic: new Set(["akademisk", "profesjonsstudier"]),
    pabygging_studiekompetanse: new Set(["akademisk"]),
  };

export function getPathFamilyOutcomeNavMapRows(params: {
  pathFamilySlug: string;
  mapVersion?: number;
}): PathFamilyOutcomeNavMapRow[] {
  const version = params.mapVersion ?? PATH_FAMILY_OUTCOME_NAV_MAP_VERSION;
  return PATH_FAMILY_OUTCOME_NAV_MAP_ROWS.filter(
    (row) => row.pathFamilySlug === params.pathFamilySlug && row.mapVersion === version
  );
}

export function matchPathFamilyOutcomeNavMapRow(params: {
  pathFamilySlug: string;
  vilbliTitle: string;
  vilbliOutcomeUrl: string;
  mapVersion?: number;
}): PathFamilyOutcomeNavMapRow | null {
  const titleNorm = normalizeTitle(params.vilbliTitle);
  const urlNorm = String(params.vilbliOutcomeUrl ?? "").toLowerCase();
  const rows = getPathFamilyOutcomeNavMapRows({
    pathFamilySlug: params.pathFamilySlug,
    mapVersion: params.mapVersion,
  });

  for (const row of rows) {
    const titleMatch = row.vilbliTitleIncludes.some((fragment) =>
      titleNorm.includes(normalizeTitle(fragment))
    );
    if (!titleMatch) continue;

    if (row.vilbliOutcomeUrlIncludes?.length) {
      const urlMatch = row.vilbliOutcomeUrlIncludes.some((fragment) =>
        urlNorm.includes(fragment.toLowerCase())
      );
      if (!urlMatch) continue;
    }

    return row;
  }

  return null;
}

function rowPassesFilterGate(
  row: PathFamilyOutcomeNavMapRow,
  filterId: RouteOutcomeFilterId
): boolean {
  const allowlist = FILTER_TAG_ALLOWLIST[filterId];
  if (allowlist === null) {
    return true;
  }
  return row.filterTags.some((tag) => allowlist.has(tag));
}

export function resolvePathFamilyNavMapMatches(params: {
  pathFamilySlug: string;
  filterId: RouteOutcomeFilterId;
  outcomes: Array<{
    vilbliTitle: string;
    vilbliUrl: string;
    sourceOutcomeUrl: string;
  }>;
  mapVersion?: number;
}): Array<{
  sourceOutcome: {
    vilbliTitle: string;
    vilbliUrl: string;
    sourceOutcomeUrl: string;
  };
  mapRow: PathFamilyOutcomeNavMapRow;
  navTitle: string;
  navCode: string;
  catalogProfessionSlug: string;
  matchMethod: "path_family_map";
  confidence: "high";
  reviewNeeded: false;
}> {
  const matches: Array<{
    sourceOutcome: {
      vilbliTitle: string;
      vilbliUrl: string;
      sourceOutcomeUrl: string;
    };
    mapRow: PathFamilyOutcomeNavMapRow;
    navTitle: string;
    navCode: string;
    catalogProfessionSlug: string;
    matchMethod: "path_family_map";
    confidence: "high";
    reviewNeeded: false;
  }> = [];

  const seen = new Set<string>();

  for (const outcome of params.outcomes) {
    const row = matchPathFamilyOutcomeNavMapRow({
      pathFamilySlug: params.pathFamilySlug,
      vilbliTitle: outcome.vilbliTitle,
      vilbliOutcomeUrl: outcome.sourceOutcomeUrl,
      mapVersion: params.mapVersion,
    });
    if (!row) continue;
    if (!rowPassesFilterGate(row, params.filterId)) continue;

    const dedupeKey = `${outcome.sourceOutcomeUrl}::${row.navStyrkCode}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    matches.push({
      sourceOutcome: outcome,
      mapRow: row,
      navTitle: row.navTitle,
      navCode: row.navStyrkCode,
      catalogProfessionSlug: row.catalogProfessionSlug,
      matchMethod: "path_family_map",
      confidence: "high",
      reviewNeeded: false,
    });
  }

  return matches;
}

/** Filters hidden until post-VGS / academic contours are live (registry §4). */
export function getHiddenRouteOutcomeFilterIds(params: {
  filterId: RouteOutcomeFilterId;
  childContext: boolean;
  pathFamilySlug: string | null;
  hasVg3BranchVariant: boolean;
}): RouteOutcomeFilterId[] {
  const hidden = new Set<RouteOutcomeFilterId>();

  hidden.add("fagskole_after_vgs");
  hidden.add("long_academic");
  if (params.childContext) {
    hidden.add("pabygging_studiekompetanse");
  } else {
    hidden.add("pabygging_studiekompetanse");
  }

  if (!params.pathFamilySlug) {
    hidden.add("fast_to_work");
    hidden.add("vg3_before_apprenticeship");
    hidden.add("flexible");
  }

  if (!params.hasVg3BranchVariant) {
    hidden.add("vg3_before_apprenticeship");
  }

  if (hidden.has(params.filterId)) {
    return Array.from(hidden);
  }

  return Array.from(hidden);
}
