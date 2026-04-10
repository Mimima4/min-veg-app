import type {
  StudyRouteSnapshotStatus,
  StudyRouteStatus,
  StudyRouteVariantStatus,
} from "./route-status";
import type { StudyRouteStep } from "./route-step-types";
import type { StudyRouteSignals } from "./route-signal-types";

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

export type StudyRouteHeaderSummary = {
  professionTitle: string;
  routeLabel: string;
  stageContextLabel?: string | null;
  overallFitLabel?: string | null;
  feasibilityLabel?: string | null;
  realismLabel?: string | null;
  stepsCount: number;
  warningsCount: number;
  newRouteAvailable: boolean;
};

export type StudyRouteAvailableProfession = {
  professionId: string;
  slug: string;
  title: string;
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
  interestIds: string[];
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
  steps: StudyRouteStep[];
  signals: StudyRouteSignals;
  availableProfessions: StudyRouteAvailableProfessionsBlock;
  alternativeRoutes: StudyRouteAlternativeTeaser[];
  allowedActions: StudyRouteAllowedActions;
};

export type ChildStudyRouteOverviewItem = {
  routeId: string;
  targetProfessionId: string;
  targetProfessionSlug: string;
  professionTitle: string;
  routeLabel: string;
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