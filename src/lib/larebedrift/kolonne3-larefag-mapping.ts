/**
 * Maps kolonne-3 / LAREFAG step selections to canonical `larebedrift_truth.larefag_code`.
 * Used when a route has a dedicated Fagvalg step before bedrift (model B).
 *
 * Primary key: VIGO lærefag query code parsed from Vilbli `programme_url`
 * (e.g. `_v.elmel3----` → `ELMEL3`). Title/slug matchers are a fallback only.
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

function kolonne3SlugHaystack(programSlug: string | null | undefined): string {
  return normalize(String(programSlug ?? "").replace(/^kolonne3-/, ""));
}

/** Parse Finnlærebedrift / Vilbli lærefag query code from a yrker or skoler URL. */
export function parseVigoLaerefagQueryCodeFromUrl(
  url: string | null | undefined
): string | null {
  const match = String(url ?? "").match(/_v\.([a-z0-9]+)----/i);
  return match?.[1]?.toUpperCase() ?? null;
}

const VIGO_QUERY_CODE_TO_LAREFAG: Readonly<Record<string, LarefagIdentity>> = {
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
  ELPRO3: {
    code: "PRODUKSJONSELEKTRIKERFAGET",
    label: "Produksjonselektronikerfaget",
  },
};

const KOLONNE3_TITLE_MATCHERS: ReadonlyArray<{
  match: (haystacks: { slugHaystack: string; titleHaystack: string }) => boolean;
  identity: LarefagIdentity;
}> = [
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
