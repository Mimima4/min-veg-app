import type { SupportedLocale } from "@/lib/i18n/site-copy";

type LocalizedLabel = Record<SupportedLocale, string>;

type TagDefinition = {
  id: string;
  label_i18n: LocalizedLabel;
  aliases?: string[];
  match_terms?: string[];
};

type StrengthRule = {
  id: string;
  requiredTraitIds?: string[];
  minimumTraitMatches?: number;
  requiredInterestIds?: string[];
  minimumInterestMatches?: number;
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export const INTEREST_TAGS: TagDefinition[] = [
  {
    id: "math",
    label_i18n: { nb: "Matematikk", nn: "Matematikk", en: "Math" },
    aliases: ["math", "mathematics", "numbers"],
    match_terms: ["mathematics", "analysis", "problem solving"],
  },
  {
    id: "nature",
    label_i18n: { nb: "Natur", nn: "Natur", en: "Nature" },
    aliases: ["nature"],
    match_terms: ["practical work"],
  },
  {
    id: "music",
    label_i18n: { nb: "Musikk", nn: "Musikk", en: "Music" },
    aliases: ["music"],
    match_terms: ["creativity"],
  },
  {
    id: "design",
    label_i18n: { nb: "Design", nn: "Design", en: "Design" },
    aliases: ["design", "drawing", "art"],
    match_terms: ["creativity"],
  },
  {
    id: "technology",
    label_i18n: { nb: "Teknologi", nn: "Teknologi", en: "Technology" },
    aliases: ["technology", "tech", "robotics", "programming"],
    match_terms: ["programming", "systems thinking", "technical precision"],
  },
  {
    id: "helping_people",
    label_i18n: {
      nb: "Hjelpe mennesker",
      nn: "Hjelpe menneske",
      en: "Helping people",
    },
    aliases: ["helping people", "care", "helping"],
    match_terms: ["empathy", "communication"],
  },
  {
    id: "building",
    label_i18n: {
      nb: "Bygge ting",
      nn: "Byggje ting",
      en: "Building things",
    },
    aliases: ["building", "constructing", "making things"],
    match_terms: ["practical work", "technical precision"],
  },
  {
    id: "languages",
    label_i18n: { nb: "Språk", nn: "Språk", en: "Languages" },
    aliases: ["languages", "language"],
    match_terms: ["communication"],
  },
  {
    id: "sports",
    label_i18n: { nb: "Sport", nn: "Sport", en: "Sports" },
    aliases: ["sports", "sport"],
    match_terms: ["teamwork"],
  },
  {
    id: "business",
    label_i18n: { nb: "Business", nn: "Business", en: "Business" },
    aliases: ["business", "finance"],
    match_terms: ["finance", "research", "analysis"],
  },
];

export const OBSERVED_TRAIT_TAGS: TagDefinition[] = [
  {
    id: "focused",
    label_i18n: { nb: "Fokusert", nn: "Fokusert", en: "Focused" },
    aliases: ["focused", "focus"],
  },
  {
    id: "curious",
    label_i18n: { nb: "Nysgjerrig", nn: "Nysgjerrig", en: "Curious" },
    aliases: ["curious", "asks questions"],
  },
  {
    id: "patient",
    label_i18n: { nb: "Tålmodig", nn: "Tolmodig", en: "Patient" },
    aliases: ["patient"],
  },
  {
    id: "social",
    label_i18n: { nb: "Sosial", nn: "Sosial", en: "Social" },
    aliases: ["social"],
  },
  {
    id: "independent",
    label_i18n: {
      nb: "Selvstendig",
      nn: "Sjølvstendig",
      en: "Independent",
    },
    aliases: ["independent"],
  },
  {
    id: "organised",
    label_i18n: { nb: "Organisert", nn: "Organisert", en: "Organised" },
    aliases: ["organised", "organized"],
  },
  {
    id: "creative",
    label_i18n: { nb: "Kreativ", nn: "Kreativ", en: "Creative" },
    aliases: ["creative"],
  },
  {
    id: "detail_oriented",
    label_i18n: {
      nb: "Ser detaljer",
      nn: "Ser detaljar",
      en: "Detail-oriented",
    },
    aliases: ["detail oriented", "attention to detail", "detail"],
  },
  {
    id: "practical",
    label_i18n: { nb: "Praktisk", nn: "Praktisk", en: "Practical" },
    aliases: ["practical"],
  },
  {
    id: "confident",
    label_i18n: { nb: "Trygg", nn: "Trygg", en: "Confident" },
    aliases: ["confident"],
  },
  {
    id: "persistent",
    label_i18n: { nb: "Utholdende", nn: "Uthaldande", en: "Persistent" },
    aliases: ["persistent", "finishes tasks"],
  },
  {
    id: "empathetic",
    label_i18n: { nb: "Omsorgsfull", nn: "Omsorgsfull", en: "Empathetic" },
    aliases: ["empathetic", "caring"],
  },
];

export const DERIVED_STRENGTH_TAGS: TagDefinition[] = [
  {
    id: "analytical_thinking",
    label_i18n: {
      nb: "Analytisk tenkning",
      nn: "Analytisk tenking",
      en: "Analytical thinking",
    },
    match_terms: ["analysis", "problem solving", "systems thinking"],
  },
  {
    id: "communication",
    label_i18n: {
      nb: "Kommunikasjon",
      nn: "Kommunikasjon",
      en: "Communication",
    },
    match_terms: ["communication"],
  },
  {
    id: "empathy",
    label_i18n: { nb: "Empati", nn: "Empati", en: "Empathy" },
    match_terms: ["empathy", "communication"],
  },
  {
    id: "practical_precision",
    label_i18n: {
      nb: "Praktisk presisjon",
      nn: "Praktisk presisjon",
      en: "Practical precision",
    },
    match_terms: ["technical precision", "practical work", "attention to detail"],
  },
  {
    id: "creativity",
    label_i18n: { nb: "Kreativitet", nn: "Kreativitet", en: "Creativity" },
    match_terms: ["creativity"],
  },
  {
    id: "teamwork",
    label_i18n: { nb: "Samarbeid", nn: "Samarbeid", en: "Teamwork" },
    match_terms: ["teamwork", "communication"],
  },
  {
    id: "structured_work",
    label_i18n: {
      nb: "Strukturert arbeid",
      nn: "Strukturert arbeid",
      en: "Structured work",
    },
    match_terms: ["planning", "medical routines", "classroom leadership"],
  },
  {
    id: "persistence",
    label_i18n: {
      nb: "Utholdenhet",
      nn: "Uthald",
      en: "Persistence",
    },
    match_terms: ["problem solving", "research"],
  },
  {
    id: "independent_work",
    label_i18n: {
      nb: "Selvstendig arbeid",
      nn: "Sjølvstendig arbeid",
      en: "Independent work",
    },
    match_terms: ["research"],
  },
];

const DERIVED_STRENGTH_RULES: StrengthRule[] = [
  {
    id: "analytical_thinking",
    requiredTraitIds: ["focused", "curious", "detail_oriented", "organised"],
    minimumTraitMatches: 2,
    requiredInterestIds: ["math", "technology", "building", "business"],
    minimumInterestMatches: 1,
  },
  {
    id: "communication",
    requiredTraitIds: ["social", "confident", "curious"],
    minimumTraitMatches: 2,
    requiredInterestIds: ["languages", "helping_people"],
    minimumInterestMatches: 1,
  },
  {
    id: "empathy",
    requiredTraitIds: ["empathetic", "patient", "social"],
    minimumTraitMatches: 2,
    requiredInterestIds: ["helping_people"],
    minimumInterestMatches: 1,
  },
  {
    id: "practical_precision",
    requiredTraitIds: ["practical", "detail_oriented"],
    minimumTraitMatches: 2,
    requiredInterestIds: ["building", "technology", "nature"],
    minimumInterestMatches: 1,
  },
  {
    id: "creativity",
    requiredTraitIds: ["creative"],
    minimumTraitMatches: 1,
    requiredInterestIds: ["design", "music"],
    minimumInterestMatches: 1,
  },
  {
    id: "teamwork",
    requiredTraitIds: ["social", "patient", "empathetic"],
    minimumTraitMatches: 2,
  },
  {
    id: "structured_work",
    requiredTraitIds: ["organised", "focused"],
    minimumTraitMatches: 2,
  },
  {
    id: "persistence",
    requiredTraitIds: ["persistent", "focused", "patient"],
    minimumTraitMatches: 2,
  },
  {
    id: "independent_work",
    requiredTraitIds: ["independent", "focused"],
    minimumTraitMatches: 2,
  },
];

function getTagLabelFromList(
  list: TagDefinition[],
  id: string,
  locale: SupportedLocale
): string {
  const tag = list.find((item) => item.id === id);
  return tag?.label_i18n[locale] ?? id;
}

function coerceIdsFromList(list: TagDefinition[], values: string[]): string[] {
  const normalizedInput = values.map(normalize);

  return Array.from(
    new Set(
      list
        .filter((tag) => {
          const candidates = [tag.id, ...(tag.aliases ?? [])].map(normalize);
          return candidates.some((candidate) =>
            normalizedInput.includes(candidate)
          );
        })
        .map((tag) => tag.id)
    )
  );
}

export function coerceInterestIds(values: string[]): string[] {
  return coerceIdsFromList(INTEREST_TAGS, values);
}

export function coerceObservedTraitIds(values: string[]): string[] {
  return coerceIdsFromList(OBSERVED_TRAIT_TAGS, values);
}

export function getInterestLabel(id: string, locale: SupportedLocale): string {
  return getTagLabelFromList(INTEREST_TAGS, id, locale);
}

export function getObservedTraitLabel(
  id: string,
  locale: SupportedLocale
): string {
  return getTagLabelFromList(OBSERVED_TRAIT_TAGS, id, locale);
}

export function getDerivedStrengthLabel(
  id: string,
  locale: SupportedLocale
): string {
  return getTagLabelFromList(DERIVED_STRENGTH_TAGS, id, locale);
}

export function getInterestMatchTerms(ids: string[]): string[] {
  return Array.from(
    new Set(
      ids.flatMap((id) => {
        const tag = INTEREST_TAGS.find((item) => item.id === id);
        return tag?.match_terms ?? [];
      })
    )
  );
}

export function getDerivedStrengthMatchTerms(ids: string[]): string[] {
  return Array.from(
    new Set(
      ids.flatMap((id) => {
        const tag = DERIVED_STRENGTH_TAGS.find((item) => item.id === id);
        return tag?.match_terms ?? [];
      })
    )
  );
}

export function getDerivedStrengthIds({
  interestIds,
  observedTraitIds,
}: {
  interestIds: string[];
  observedTraitIds: string[];
}): string[] {
  const interestSet = new Set(interestIds);
  const traitSet = new Set(observedTraitIds);

  return DERIVED_STRENGTH_RULES.filter((rule) => {
    const traitMatches =
      rule.requiredTraitIds?.filter((id) => traitSet.has(id)).length ?? 0;

    const interestMatches =
      rule.requiredInterestIds?.filter((id) => interestSet.has(id)).length ?? 0;

    const traitOk =
      !rule.requiredTraitIds ||
      traitMatches >= (rule.minimumTraitMatches ?? rule.requiredTraitIds.length);

    const interestOk =
      !rule.requiredInterestIds ||
      interestMatches >=
        (rule.minimumInterestMatches ?? rule.requiredInterestIds.length);

    return traitOk && interestOk;
  }).map((rule) => rule.id);
}