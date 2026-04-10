export type StudyRouteWarning = {
    code: string;
    label: string;
    description?: string | null;
    severity?: "low" | "medium" | "high";
  };
  
  export type StudyRouteImprovementGuidance = {
    code: string;
    label: string;
    description?: string | null;
  };
  
  export type StudyRouteEvidenceComposition = {
    hasParentInput: boolean;
    hasSchoolEvidence: boolean;
    hasDerivedSignals: boolean;
  };
  
  export type StudyRouteSignals = {
    fitSummary?: string | null;
    confidenceSummary?: string | null;
    feasibilitySummary?: string | null;
    warnings: StudyRouteWarning[];
    improvementGuidance: StudyRouteImprovementGuidance[];
    evidenceComposition: StudyRouteEvidenceComposition;
  };