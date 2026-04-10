import type {
    ChildStudyRoutesOverview,
    StudyRouteAlternativeTeaser,
    StudyRouteAvailableProfession,
    StudyRouteReadModel,
  } from "./route-types";
  
  export type RouteApiMeta = {
    modelVersion: "v1";
    generatedAt: string;
    recomputePending?: boolean;
  };
  
  export type RouteApiError = {
    code:
      | "route_not_found"
      | "profession_not_saved_for_child"
      | "route_access_denied"
      | "route_variant_conflict"
      | "route_readonly_state"
      | "route_recompute_pending"
      | "invalid_step_option";
    message: string;
    details?: Record<string, unknown>;
  };
  
  export type RouteReadResponse<T> =
    | {
        ok: true;
        data: T;
        meta: RouteApiMeta;
      }
    | {
        ok: false;
        error: RouteApiError;
      };
  
  export type RouteActionResponse<T> =
    | {
        ok: true;
        result: T;
        updated?: Partial<StudyRouteReadModel> | null;
        meta: RouteApiMeta;
      }
    | {
        ok: false;
        error: RouteApiError;
      };
  
  export type GetChildRoutesOverviewResponse =
    RouteReadResponse<ChildStudyRoutesOverview>;
  
  export type GetStudyRouteDetailResponse = RouteReadResponse<StudyRouteReadModel>;
  
  export type GetStudyRouteAlternativesResponse =
    RouteReadResponse<StudyRouteAlternativeTeaser[]>;
  
  export type GetStudyRouteAvailableProfessionsResponse =
    RouteReadResponse<StudyRouteAvailableProfession[]>;