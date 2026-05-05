import type {
  StudyRouteSnapshotStatus,
  StudyRouteStatus,
  StudyRouteVariantStatus,
} from "./route-status";
import type { StudyRouteStep } from "./route-step-types";
import type { StudyRouteSignals } from "./route-signal-types";

/** Persisted snapshot rows (programme / progression / outcome). */
export type StudyRouteProgrammeSelectionSnapshotStep = {
  type: "programme_selection";
  title: string;
  institution_name: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
  institution_website?: string | null;
  programme_url?: string | null;
  education_level: string;
  fit_band: string;
  program_slug: string;
  program_title?: string | null;
  duration_years?: number | null;
  duration_label?: string | null;
  current_profession_slug: string;
  source?: "availability_truth" | "legacy";
  stage?: string;
  options?: Array<{
    institution_id: string;
    institution_name: string | null;
    institution_city?: string | null;
    institution_municipality?: string | null;
    institution_website?: string | null;
    program_title?: string | null;
    stage?: string | null;
    duration_label?: string | null;
    display_title?: string | null;
    verification_status: string;
    institution_is_private_school?: boolean | null;
  }>;
};

export type StudyRouteProgressionSnapshotStep = {
  type: "progression_step";
  title: string;
  institution_name: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
  institution_website?: string | null;
  programme_url?: string | null;
  education_level: string;
  fit_band: string;
  program_slug: string | null;
  program_title?: string | null;
  duration_years?: number | null;
  duration_label?: string | null;
  current_profession_slug: string;
  source?: "availability_truth" | "legacy";
};

export type StudyRouteApprenticeshipSnapshotStep = {
  type: "apprenticeship_step";
  title: string;
  institution_name: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
  institution_website?: string | null;
  programme_url?: string | null;
  education_level: string;
  fit_band: string;
  program_slug: string | null;
  program_title?: string | null;
  duration_years?: number | null;
  duration_label?: string | null;
  apprenticeship_options?: Array<{
    option_id: string;
    option_title: string;
    outcome_profession_ids: string[];
  }>;
  current_profession_slug: string;
  source?: "availability_truth" | "legacy";
};

export type StudyRouteOutcomeSnapshotStep = {
  type: "outcome_step";
  title: string;
  institution_name: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
  institution_website?: string | null;
  programme_url?: string | null;
  education_level: string;
  fit_band: string;
  program_slug: string | null;
  program_title?: string | null;
  duration_years?: number | null;
  duration_label?: string | null;
  current_profession_slug: string;
  source?: "availability_truth" | "legacy";
  nav_profession_title?: string | null;
  nav_yrkeskategori?: string | null;
};

export type StudyRouteSnapshotStep =
  | StudyRouteProgrammeSelectionSnapshotStep
  | StudyRouteApprenticeshipSnapshotStep
  | StudyRouteProgressionSnapshotStep
  | StudyRouteOutcomeSnapshotStep;

/** Route snapshot body: ordered persisted step rows. */
export type StudyRouteSnapshot = {
  steps: StudyRouteSnapshotStep[];
};

/** Steps returned in read model: legacy step shape or persisted snapshot rows. */
export type StudyRouteReadModelStep = StudyRouteStep | StudyRouteSnapshotStep;

export type StudyRouteIdentity = {
  routeId: string;
  childId: string;
  targetProfessionId: string;
  targetProfessionSlug: string;
  routeVariantId: string;
  status: StudyRouteStatus;
  variantStatus?: StudyRouteVariantStatus | null;
  snapshotStatus?: StudyRouteSnapshotStatus | null;
  isCurrent: boolean;
  isEditable: boolean;
  generatedAt: string;
  lastMeaningfulChangeAt: string;
};

export type StudyRouteCompetitionLevel =
  | "very_high"
  | "high"
  | "medium"
  | "low";

export type StudyRouteHeaderSummary = {
  professionTitle: string;
  routeLabel: string;
  stageContextLabel?: string | null;
  overallFitLabel?: string | null;
  feasibilityLabel?: string | null;
  realismLabel?: string | null;
  /** From profession data (read model); not derived from authenticity rules. */
  competitionLevel: StudyRouteCompetitionLevel;
  /** User-facing line; `null` when `competitionLevel` is `low` (do not show). */
  competitionLabel: string | null;
  stepsCount: number;
  warningsCount: number;
  newRouteAvailable: boolean;
};

export type StudyRouteAvailableProfession = {
  professionId: string;
  slug: string | null;
  title: string;
  navTitle?: string | null;
  navYrkeskategori?: string | null;
  reviewNeeded?: boolean;
  reviewStrength?: "weak_match" | "no_match";
  apprenticeshipOptionId?: string | null;
  whyOpenedLabel?: string | null;
  similarityLabel?: string | null;
};

export type StudyRouteAvailableProfessionsEmptyState = {
  title: string;
  message: string;
};

export type StudyRouteAvailableProfessionsBlock = {
  items: StudyRouteAvailableProfession[];
  emptyState: StudyRouteAvailableProfessionsEmptyState | null;
};

export type StudyRouteAlternativeTeaser = {
  variantId: string;
  label: string;
  isCurrent: boolean;
  variantStatus?: string | null;
  mainDifference?: string | null;
  realismDelta?: string | null;
  riskDelta?: string | null;
  changedStepsCount?: number | null;
};

export type StudyRouteAllowedActions = {
  canEditRoute: boolean;
  canOpenAlternatives: boolean;
  canSaveAsNewVariant: boolean;
  canReplaceCurrentVariant: boolean;
  canOpenAvailableProfessions: boolean;
  canExportConsultationPdf: boolean;
  canShareReadOnlyRoute: boolean;
  canRemoveSavedRoute: boolean;
};

export type StudyRouteSnapshotPlanningSlice = {
  preferredMunicipalityCodes: string[];
  relocationWillingness: "no" | "maybe" | "yes" | null;
  interestIds: string[];
  observedTraitIds: string[];
  derivedStrengthIds: string[];
  desiredIncomeBand: string | null;
  preferredWorkStyle: string | null;
  preferredEducationLevel: string | null;
};

export type StudyRouteSnapshotCurrentProfession = {
  id: string;
  slug: string;
  title: string;
};

export type StudyRouteSnapshotContext = {
  locale: string;
  childId: string;
  routeId: string;
  routeVariantId: string | null;
  currentProfession: StudyRouteSnapshotCurrentProfession;
  planning: StudyRouteSnapshotPlanningSlice;
};

export type StudyRouteReadModel = {
  identity: StudyRouteIdentity;
  header: StudyRouteHeaderSummary;
  steps: StudyRouteReadModelStep[];
  signals: StudyRouteSignals;
  availableProfessions: StudyRouteAvailableProfessionsBlock;
  alternativeRoutes: StudyRouteAlternativeTeaser[];
  savedSelectionSignatures?: string[];
  allowedActions: StudyRouteAllowedActions;
};

export type ChildStudyRouteOverviewItem = {
  routeId: string;
  professionId: string;
  targetProfessionId: string;
  targetProfessionSlug: string;
  professionTitle: string;
  routeLabel: string;
  competitionLevel: StudyRouteCompetitionLevel;
  status: StudyRouteStatus;
  overallFitLabel?: string | null;
  feasibilityLabel?: string | null;
  warningsCount: number;
  newRouteAvailable: boolean;
  updatedAt: string;
};

export type ChildStudyRoutesOverview = {
  childId: string;
  childDisplayName: string;
  routes: ChildStudyRouteOverviewItem[];
};