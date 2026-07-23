/**
 * Maps kolonne-3 / LAREFAG step selections to canonical `larebedrift_truth.larefag_code`.
 * Used when a route has a dedicated Fagvalg step before bedrift (model B).
 *
 * Primary key: VIGO lærefag query code parsed from Vilbli `programme_url`
 * (e.g. `_v.elmel3----` → `ELMEL3`). Title/slug matchers are a fallback only.
 */

import anleggsgartnerRoster from "../../../data/larebedrift/kolonne3-rosters/anleggsgartner.json" with { type: "json" };
import maskinOgKranforerRoster from "../../../data/larebedrift/kolonne3-rosters/maskin-og-kranforer.json" with { type: "json" };
import platearbeiderOgSveiserRoster from "../../../data/larebedrift/kolonne3-rosters/platearbeider-og-sveiser.json" with { type: "json" };
import murerRoster from "../../../data/larebedrift/kolonne3-rosters/murer.json" with { type: "json" };
import snekkerRoster from "../../../data/larebedrift/kolonne3-rosters/snekker.json" with { type: "json" };

type Kolonne3RosterEntry = {
  apiQueryCode: string;
  code: string;
  label: string;
  labelAliases?: string[];
};

const KOLONNE3_ROSTER_ENTRIES: ReadonlyArray<Kolonne3RosterEntry> = [
  ...(anleggsgartnerRoster.entries as Kolonne3RosterEntry[]),
  ...(maskinOgKranforerRoster.entries as Kolonne3RosterEntry[]),
  ...(platearbeiderOgSveiserRoster.entries as Kolonne3RosterEntry[]),
  ...(murerRoster.entries as Kolonne3RosterEntry[]),
  ...(snekkerRoster.entries as Kolonne3RosterEntry[]),
];

function kolonne3RosterByApiQueryCode(): Readonly<Record<string, LarefagIdentity>> {
  const map: Record<string, LarefagIdentity> = {};
  for (const entry of KOLONNE3_ROSTER_ENTRIES) {
    map[entry.apiQueryCode.toUpperCase()] = { code: entry.code, label: entry.label };
  }
  return map;
}

function kolonne3RosterEntriesFlat(): ReadonlyArray<Kolonne3RosterEntry> {
  return KOLONNE3_ROSTER_ENTRIES;
}

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

function kolonne3SlugHaystack(programSlug: string | null | undefined): string {
  return normalize(String(programSlug ?? "").replace(/^kolonne3-/, ""));
}

/** Parse Finnlærebedrift / Vilbli lærefag query code from a yrker or skoler URL. */
export function parseVigoLaerefagQueryCodeFromUrl(
  url: string | null | undefined
): string | null {
  const haystack = String(url ?? "");
  const chainMatches = [...haystack.matchAll(/(?:^|_)v\.([a-z0-9]+)----/gi)];
  if (chainMatches.length > 0) {
    return chainMatches[chainMatches.length - 1]?.[1]?.toUpperCase() ?? null;
  }
  return null;
}

const BASE_VIGO_QUERY_CODE_TO_LAREFAG: Readonly<Record<string, LarefagIdentity>> = {
  ELELE3: { code: "ELEKTRIKERFAGET", label: "Elektrikerfaget" },
  ELMEL3: { code: "MARITIM_ELEKTRIKERFAGET", label: "Maritim elektrikerfaget" },
  ELERF3: { code: "ELEKTROREPARATORFAGET", label: "Elektroreparatørfaget" },
  ELEMO3: { code: "ENERGIMONTORFAGET", label: "Energimontørfaget" },
  ELEOP3: { code: "ENERGIOPERATORFAGET", label: "Energioperatørfaget" },
  ELHEI3: { code: "HEISMONTORFAGET", label: "Heismontørfaget" },
  ELSIG3: { code: "SIGNALMONTORFAGET", label: "Signalmontørfaget" },
  ELTAV3: { code: "TAVLEMONTORFAGET", label: "Tavlemontørfaget" },
  ELTEL3: { code: "TELEKOMMUNIKASJONSMONTORFAGET", label: "Telekommunikasjonsmontørfaget" },
  ELTOG3: { code: "TOGELEKTRIKERFAGET", label: "Togelektrikerfaget" },
  ELVIK3: { code: "VIKLERFAGET", label: "Viklerfaget" },
  BARLF3: { code: "RORLEGGERFAGET", label: "Rørleggerfaget" },
  BATMF3: { code: "TOMRERFAGET", label: "Tømrerfaget" },
  BAMOT3: { code: "MALER_OG_OVERFLATETEKNIKKFAGET", label: "Maler- og overflateteknikkfaget" },
  BAIMF3: { code: "INDUSTRIMALERFAGET", label: "Industrimalerfaget" },
  ELPRO3: {
    code: "PRODUKSJONSELEKTRIKERFAGET",
    label: "Produksjonselektronikerfaget",
  },
  TPBDK3: {
    code: "BILFAGET_DEMONTERING_KJORETOY",
    label: "Bilfaget, demontering av kjøretøy",
  },
  TPBMK3: { code: "BILFAGET_LETTE_KJORETOY", label: "Bilfaget, lette kjøretøy" },
  TPBTK3: { code: "BILFAGET_TUNGE_KJORETOY", label: "Bilfaget, tunge kjøretøy" },
  TPHJU3: { code: "HJULUTRUSTNINGSFAGET", label: "Hjulutrustningsfaget" },
  TPLMM3: {
    code: "LANDBRUKMASKINMEKANIKERFAGET",
    label: "Landbruksmaskinmekanikerfaget",
  },
  TPMME3: { code: "MOTORMEKANIKERFAGET", label: "Motormekanikerfaget" },
  TPMSY3: { code: "MOTORSYKKELFAGET", label: "Motorsykkelfaget" },
  TPRSD3: { code: "RESERVEDELSFAGET", label: "Reservedelsfaget" },
  TPSYM3: { code: "SYKKELMEKANIKERFAGET", label: "Sykkelmekanikerfaget" },
  TPTLM3: {
    code: "TRUCK_OG_LIFTMEKANIKERFAGET",
    label: "Truck- og liftmekanikerfaget",
  },
};

const VIGO_QUERY_CODE_TO_LAREFAG: Readonly<Record<string, LarefagIdentity>> = {
  ...BASE_VIGO_QUERY_CODE_TO_LAREFAG,
  ...kolonne3RosterByApiQueryCode(),
};

function rosterTitleMatchers(): ReadonlyArray<{
  match: (haystacks: { slugHaystack: string; titleHaystack: string }) => boolean;
  identity: LarefagIdentity;
}> {
  return kolonne3RosterEntriesFlat().map((entry) => ({
    match: ({ slugHaystack, titleHaystack }) => {
      const needles = [
        normalize(entry.label),
        normalize(entry.label.replace(/faget$/i, "")),
        ...(entry.labelAliases ?? []).map((alias) => normalize(alias)),
      ].filter(Boolean);
      return needles.some(
        (needle) => slugHaystack.includes(needle) || titleHaystack.includes(needle)
      );
    },
    identity: { code: entry.code, label: entry.label },
  }));
}

const KOLONNE3_TITLE_MATCHERS: ReadonlyArray<{
  match: (haystacks: { slugHaystack: string; titleHaystack: string }) => boolean;
  identity: LarefagIdentity;
}> = [
  ...rosterTitleMatchers(),
  {
    match: ({ slugHaystack, titleHaystack }) =>
      (slugHaystack.includes("rorlegger") || titleHaystack.includes("rorlegger")) &&
      !slugHaystack.includes("anleggsrorlegger") &&
      !titleHaystack.includes("anleggsrorlegger"),
    identity: { code: "RORLEGGERFAGET", label: "Rørleggerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("tomrer") || titleHaystack.includes("tomrer"),
    identity: { code: "TOMRERFAGET", label: "Tømrerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("industrimaler") || titleHaystack.includes("industrimaler"),
    identity: { code: "INDUSTRIMALERFAGET", label: "Industrimalerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("overflateteknikk") ||
      titleHaystack.includes("overflateteknikk") ||
      ((slugHaystack.includes("maler") || titleHaystack.includes("maler")) &&
        !slugHaystack.includes("industrimaler") &&
        !titleHaystack.includes("industrimaler")),
    identity: {
      code: "MALER_OG_OVERFLATETEKNIKKFAGET",
      label: "Maler- og overflateteknikkfaget",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("truck") ||
      slugHaystack.includes("liftmekaniker") ||
      titleHaystack.includes("truck") ||
      titleHaystack.includes("liftmekaniker"),
    identity: {
      code: "TRUCK_OG_LIFTMEKANIKERFAGET",
      label: "Truck- og liftmekanikerfaget",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("landbruksmaskin") || titleHaystack.includes("landbruksmaskin"),
    identity: {
      code: "LANDBRUKMASKINMEKANIKERFAGET",
      label: "Landbruksmaskinmekanikerfaget",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("demontering") || titleHaystack.includes("demontering"),
    identity: {
      code: "BILFAGET_DEMONTERING_KJORETOY",
      label: "Bilfaget, demontering av kjøretøy",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("tunge") ||
      titleHaystack.includes("tunge kjoretoy") ||
      titleHaystack.includes("tunge kjøretøy"),
    identity: { code: "BILFAGET_TUNGE_KJORETOY", label: "Bilfaget, tunge kjøretøy" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("lette") ||
      titleHaystack.includes("lette kjoretoy") ||
      titleHaystack.includes("lette kjøretøy"),
    identity: { code: "BILFAGET_LETTE_KJORETOY", label: "Bilfaget, lette kjøretøy" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("motormekaniker") || titleHaystack.includes("motormekaniker"),
    identity: { code: "MOTORMEKANIKERFAGET", label: "Motormekanikerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("motorsykkel") || titleHaystack.includes("motorsykkel"),
    identity: { code: "MOTORSYKKELFAGET", label: "Motorsykkelfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("sykkelmekaniker") || titleHaystack.includes("sykkelmekaniker"),
    identity: { code: "SYKKELMEKANIKERFAGET", label: "Sykkelmekanikerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("hjulutrustning") || titleHaystack.includes("hjulutrustning"),
    identity: { code: "HJULUTRUSTNINGSFAGET", label: "Hjulutrustningsfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("reservedel") || titleHaystack.includes("reservedel"),
    identity: { code: "RESERVEDELSFAGET", label: "Reservedelsfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("produksjonselektroniker") ||
      titleHaystack.includes("produksjonselektroniker"),
    identity: {
      code: "PRODUKSJONSELEKTRIKERFAGET",
      label: "Produksjonselektronikerfaget",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("togelektriker") || titleHaystack.includes("togelektriker"),
    identity: { code: "TOGELEKTRIKERFAGET", label: "Togelektrikerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      (slugHaystack.includes("maritim") && slugHaystack.includes("elektriker")) ||
      titleHaystack.includes("maritim elektriker"),
    identity: { code: "MARITIM_ELEKTRIKERFAGET", label: "Maritim elektrikerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("elektroreparator") || titleHaystack.includes("elektroreparator"),
    identity: { code: "ELEKTROREPARATORFAGET", label: "Elektroreparatørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("energimontor") || titleHaystack.includes("energimontor"),
    identity: { code: "ENERGIMONTORFAGET", label: "Energimontørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("energioperator") || titleHaystack.includes("energioperator"),
    identity: { code: "ENERGIOPERATORFAGET", label: "Energioperatørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("heismontor") || titleHaystack.includes("heismontor"),
    identity: { code: "HEISMONTORFAGET", label: "Heismontørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("signalmontor") || titleHaystack.includes("signalmontor"),
    identity: { code: "SIGNALMONTORFAGET", label: "Signalmontørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("tavlemontor") || titleHaystack.includes("tavlemontor"),
    identity: { code: "TAVLEMONTORFAGET", label: "Tavlemontørfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("telekommunikasjonsmontor") ||
      titleHaystack.includes("telekommunikasjonsmontor"),
    identity: {
      code: "TELEKOMMUNIKASJONSMONTORFAGET",
      label: "Telekommunikasjonsmontørfaget",
    },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("vikler") || titleHaystack.includes("vikler"),
    identity: { code: "VIKLERFAGET", label: "Viklerfaget" },
  },
  {
    match: ({ slugHaystack, titleHaystack }) =>
      slugHaystack.includes("elektrikerfaget") || titleHaystack.includes("elektrikerfaget"),
    identity: { code: "ELEKTRIKERFAGET", label: "Elektrikerfaget" },
  },
];

export function isKolonne3ProgramSlug(programSlug: string | null | undefined): boolean {
  return String(programSlug ?? "").trim().startsWith("kolonne3-");
}

export function resolveLarefagFromKolonne3Selection(params: {
  programSlug?: string | null;
  programTitle?: string | null;
  title?: string | null;
  programmeUrl?: string | null;
}): LarefagIdentity | null {
  const vigoCode = parseVigoLaerefagQueryCodeFromUrl(params.programmeUrl);
  if (vigoCode && VIGO_QUERY_CODE_TO_LAREFAG[vigoCode]) {
    return VIGO_QUERY_CODE_TO_LAREFAG[vigoCode];
  }

  const slugHaystack = kolonne3SlugHaystack(params.programSlug);
  const titleHaystack = normalize(
    [params.programTitle, params.title].filter(Boolean).join(" ")
  );
  const haystacks = { slugHaystack, titleHaystack };

  for (const matcher of KOLONNE3_TITLE_MATCHERS) {
    if (matcher.match(haystacks)) {
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
