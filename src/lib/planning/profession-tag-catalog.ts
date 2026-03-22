import type { SupportedLocale } from "@/lib/i18n/site-copy";

type LocalizedLabel = Record<SupportedLocale, string>;

type TagDefinition = {
  id: string;
  label_i18n: LocalizedLabel;
};

const DEVELOPMENT_FOCUS_TAGS: TagDefinition[] = [
  {
    id: "medical_routines",
    label_i18n: {
      nb: "Medisinske rutiner",
      nn: "Medisinske rutinar",
      en: "Medical routines",
    },
  },
  {
    id: "stress_tolerance",
    label_i18n: {
      nb: "Stresstoleranse",
      nn: "Stresstoleranse",
      en: "Stress tolerance",
    },
  },
  {
    id: "responsibility",
    label_i18n: {
      nb: "Ansvar",
      nn: "Ansvar",
      en: "Responsibility",
    },
  },
  {
    id: "classroom_leadership",
    label_i18n: {
      nb: "Klasseledelse",
      nn: "Klasseleiing",
      en: "Classroom leadership",
    },
  },
  {
    id: "patience",
    label_i18n: {
      nb: "Tålmodighet",
      nn: "Tolmod",
      en: "Patience",
    },
  },
  {
    id: "subject_depth",
    label_i18n: {
      nb: "Faglig dybde",
      nn: "Fagleg djupn",
      en: "Subject depth",
    },
  },
  {
    id: "problem_solving",
    label_i18n: {
      nb: "Problemløsning",
      nn: "Problemløysing",
      en: "Problem solving",
    },
  },
  {
    id: "coding_practice",
    label_i18n: {
      nb: "Kodepraksis",
      nn: "Kodepraksis",
      en: "Coding practice",
    },
  },
  {
    id: "systems_thinking",
    label_i18n: {
      nb: "Systemtenkning",
      nn: "Systemtenking",
      en: "Systems thinking",
    },
  },
  {
    id: "safety_awareness",
    label_i18n: {
      nb: "Sikkerhetsforståelse",
      nn: "Tryggleiksforståing",
      en: "Safety awareness",
    },
  },
  {
    id: "technical_routines",
    label_i18n: {
      nb: "Tekniske rutiner",
      nn: "Tekniske rutinar",
      en: "Technical routines",
    },
  },
  {
    id: "fault_finding",
    label_i18n: {
      nb: "Feilsøking",
      nn: "Feilsøking",
      en: "Fault finding",
    },
  },
  {
    id: "manual_precision",
    label_i18n: {
      nb: "Manuell presisjon",
      nn: "Manuell presisjon",
      en: "Manual precision",
    },
  },
  {
    id: "tool_confidence",
    label_i18n: {
      nb: "Verktøytrygghet",
      nn: "Verktøytryggleik",
      en: "Tool confidence",
    },
  },
  {
    id: "financial_reasoning",
    label_i18n: {
      nb: "Finansiell forståelse",
      nn: "Finansiell forståing",
      en: "Financial reasoning",
    },
  },
  {
    id: "research_depth",
    label_i18n: {
      nb: "Analytisk fordypning",
      nn: "Analytisk fordjuping",
      en: "Research depth",
    },
  },
  {
    id: "decision_support",
    label_i18n: {
      nb: "Beslutningsstøtte",
      nn: "Avgjerdsstøtte",
      en: "Decision support",
    },
  },
];

const SCHOOL_SUBJECT_TAGS: TagDefinition[] = [
  {
    id: "mathematics",
    label_i18n: {
      nb: "Matematikk",
      nn: "Matematikk",
      en: "Mathematics",
    },
  },
  {
    id: "science",
    label_i18n: {
      nb: "Naturfag",
      nn: "Naturfag",
      en: "Science",
    },
  },
  {
    id: "communication",
    label_i18n: {
      nb: "Kommunikasjon",
      nn: "Kommunikasjon",
      en: "Communication",
    },
  },
  {
    id: "language",
    label_i18n: {
      nb: "Språk",
      nn: "Språk",
      en: "Language",
    },
  },
  {
    id: "social_science",
    label_i18n: {
      nb: "Samfunnsfag",
      nn: "Samfunnsfag",
      en: "Social science",
    },
  },
  {
    id: "pedagogy",
    label_i18n: {
      nb: "Pedagogikk",
      nn: "Pedagogikk",
      en: "Pedagogy",
    },
  },
  {
    id: "technology",
    label_i18n: {
      nb: "Teknologi",
      nn: "Teknologi",
      en: "Technology",
    },
  },
  {
    id: "health",
    label_i18n: {
      nb: "Helsefag",
      nn: "Helsefag",
      en: "Health",
    },
  },
  {
    id: "economics",
    label_i18n: {
      nb: "Økonomi",
      nn: "Økonomi",
      en: "Economics",
    },
  },
];

function getLabel(
  list: TagDefinition[],
  id: string,
  locale: SupportedLocale
): string {
  return list.find((item) => item.id === id)?.label_i18n[locale] ?? id;
}

export function getDevelopmentFocusLabel(
  id: string,
  locale: SupportedLocale
): string {
  return getLabel(DEVELOPMENT_FOCUS_TAGS, id, locale);
}

export function getSchoolSubjectLabel(
  id: string,
  locale: SupportedLocale
): string {
  return getLabel(SCHOOL_SUBJECT_TAGS, id, locale);
}