export const STUDY_ROUTE_STEP_TYPES = [
  "current_stage",
  "next_education_stage",
  "programme_selection",
  "institution_choice",
  "qualification_transition",
  "profession_entry",
] as const;

export type StudyRouteStepType = (typeof STUDY_ROUTE_STEP_TYPES)[number];

export type StudyRouteStepProgrammeRef = {
  id?: string | null;
  slug?: string | null;
  title: string;
};

export type StudyRouteStepInstitutionRef = {
  id?: string | null;
  slug?: string | null;
  title: string;
};

export type StudyRouteStepMeta = {
  currentProfessionSlug?: string | null;
};

export type StudyRouteStep = {
  stepId: string;
  stepType: StudyRouteStepType;
  stageCode: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  programme?: StudyRouteStepProgrammeRef | null;
  institution?: StudyRouteStepInstitutionRef | null;
  regionContext?: {
    fylke?: string | null;
    kommuner?: string[] | null;
  } | null;
  timing?: {
    durationLabel?: string | null;
    startsAtLabel?: string | null;
  } | null;
  requirementsSummary?: string | null;
  feasibilityBadge?: string | null;
  warnings?: string[];
  isEditable: boolean;
  stepOptionsCount?: number | null;
  meta?: StudyRouteStepMeta | null;
};