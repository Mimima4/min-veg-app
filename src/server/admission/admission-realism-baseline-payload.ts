import type {
  AdmissionConfidenceLevel,
  AdmissionReviewStatus,
  AdmissionSourceFamily,
} from "@/lib/routes/route-admission-realism-types";

/**
 * Ingest-ready row shape (camelCase) for route_admission_realism_records.
 * Designed for Samordna opptak–class centralized sources; first coverage is doctor
 * professional programmes only for operational simplicity — schema is profession-agnostic.
 */
export type AdmissionRealismIngestInput = {
  professionSlug: string | null;
  programSlug: string;
  institutionId: string | null;
  sourceFamily: AdmissionSourceFamily;
  sourceUrl: string;
  sourceLabel: string;
  collectedAtIso: string;
  effectiveAtIso: string | null;
  reviewedAtIso: string | null;
  reviewedBy: string | null;
  reviewStatus: AdmissionReviewStatus;
  confidenceLevel: AdmissionConfidenceLevel;
  quotaPayload: Record<string, unknown> | null;
  requirementsPayload: Record<string, unknown> | null;
  thresholdsPayload: Record<string, unknown> | null;
  eligibilityPayload: Record<string, unknown> | null;
  notesPayload: Record<string, unknown> | null;
  isActive: boolean;
};

/**
 * Baseline structured payloads: programme slugs must match education_programs.slug
 * in your database (UiO / NTNU / UiT professional medicine routes).
 *
 * Numeric weights are route-engine tuning signals (not published cut-off scores).
 * Source URLs point to official Samordna opptak portal and/or institution programme pages.
 */
export const BASELINE_CENTRALIZED_ADMISSION_DOCTOR_RECORDS: AdmissionRealismIngestInput[] =
  [
    {
      professionSlug: "doctor",
      programSlug: "doctor-medicine-professional-degree-uio",
      institutionId: null,
      sourceFamily: "centralized_admission",
      sourceUrl: "https://www.samordnaopptak.no/",
      sourceLabel: "Samordna opptak (central admission)",
      collectedAtIso: "2026-01-15T12:00:00.000Z",
      effectiveAtIso: null,
      reviewedAtIso: "2026-01-15T12:00:00.000Z",
      reviewedBy: "baseline-ingest",
      reviewStatus: "approved",
      confidenceLevel: "medium",
      quotaPayload: {
        advantage_weight: 0,
        structured: {
          kind: "ordinary_quota",
          summary_nb:
            "Hovedregel: ordinær kvote for søkere med generell studiekompetanse (jf. opptaksgrenser Samordna opptak).",
        },
      },
      requirementsPayload: {
        alignment_weight: 0.15,
        key_conditions: [
          {
            code: "general_study_competence",
            label_nb: "Generell studiekompetanse",
          },
          {
            code: "science_alignment",
            label_nb: "Relevant realfag/profil fra videregående (programkrav via institusjon/Samordna)",
          },
        ],
      },
      thresholdsPayload: {
        competition_adjustment: -1.25,
        relative_difficulty: "high",
        typical_signal_nb:
          "Konkurranse om plasser er sterk; poenggrenser varierer årlig (offisielle tall via Samordna opptak).",
      },
      eligibilityPayload: {
        region_scopes: [{ code: "national", label_nb: "Ordinær nasjonal kvote (tillegg kvoter iht. gjeldende regelverk)" }],
      },
      notesPayload: null,
      isActive: true,
    },
    {
      professionSlug: "doctor",
      programSlug: "doctor-medicine-professional-degree-ntnu",
      institutionId: null,
      sourceFamily: "centralized_admission",
      sourceUrl: "https://www.samordnaopptak.no/",
      sourceLabel: "Samordna opptak (central admission)",
      collectedAtIso: "2026-01-15T12:00:00.000Z",
      effectiveAtIso: null,
      reviewedAtIso: "2026-01-15T12:00:00.000Z",
      reviewedBy: "baseline-ingest",
      reviewStatus: "approved",
      confidenceLevel: "medium",
      quotaPayload: {
        advantage_weight: 0,
        structured: {
          kind: "ordinary_quota",
          summary_nb:
            "Ordinær kvote; tilleggskvoter (f.eks. førstegangsvitnemål) følger nasjonale regler i Samordna opptak.",
        },
      },
      requirementsPayload: {
        alignment_weight: 0.12,
        key_conditions: [
          {
            code: "general_study_competence",
            label_nb: "Generell studiekompetanse",
          },
        ],
      },
      thresholdsPayload: {
        competition_adjustment: -1.05,
        relative_difficulty: "high",
        typical_signal_nb:
          "Høy etterspørsel; søk tall og poenggrenser direkte i Samordna opptak for aktuelt opptaksår.",
      },
      eligibilityPayload: {
        region_scopes: [{ code: "national", label_nb: "Nasjonal opptaksramme" }],
      },
      notesPayload: null,
      isActive: true,
    },
    {
      professionSlug: "doctor",
      programSlug: "doctor-medicine-professional-degree-uit",
      institutionId: null,
      sourceFamily: "centralized_admission",
      sourceUrl: "https://www.samordnaopptak.no/",
      sourceLabel: "Samordna opptak (central admission)",
      collectedAtIso: "2026-01-15T12:00:00.000Z",
      effectiveAtIso: null,
      reviewedAtIso: "2026-01-15T12:00:00.000Z",
      reviewedBy: "baseline-ingest",
      reviewStatus: "approved",
      confidenceLevel: "medium",
      quotaPayload: {
        advantage_weight: 0.2,
        structured: {
          kind: "ordinary_plus_regional_signals",
          summary_nb:
            "Ordinær kvote; institusjonen har også opptaksrammer som ofte trekker søkere fra nord (se institusjonens studieplan og Samordna for gjeldende kvoter).",
        },
      },
      requirementsPayload: {
        alignment_weight: 0.1,
        key_conditions: [
          {
            code: "general_study_competence",
            label_nb: "Generell studiekompetanse",
          },
        ],
      },
      thresholdsPayload: {
        competition_adjustment: -0.65,
        relative_difficulty: "medium_high",
        typical_signal_nb:
          "Konkurranse er fortsatt betydelig, men typisk lavere press enn de største bysentrene (sammenlign årlige opptakstall).",
      },
      eligibilityPayload: {
        region_scopes: [
          { code: "national", label_nb: "Ordinær nasjonal ramme" },
          {
            code: "northern_context",
            label_nb:
              "UiT har nordlig lokalisering; geografisk relevans for rute brukes separat (geography-first), ikke som erstatning for formelle krav.",
          },
        ],
      },
      notesPayload: null,
      isActive: true,
    },
  ];
