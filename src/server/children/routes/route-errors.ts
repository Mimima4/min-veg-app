export type RouteErrorCode =
  | "invalid_request"
  | "route_not_found"
  | "profession_not_saved_for_child"
  | "route_access_denied"
  | "route_readonly_state"
  | "route_recompute_failed"
  | "route_variant_conflict"
  | "route_recompute_pending"
  | "internal_error";

export class RouteDomainError extends Error {
  code: RouteErrorCode;
  details?: Record<string, unknown>;

  constructor(
    code: RouteErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "RouteDomainError";
    this.code = code;
    this.details = details;
  }
}

export function toRouteErrorResponse(error: unknown) {
  if (error instanceof RouteDomainError) {
    return {
      ok: false as const,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  const message =
    error instanceof Error ? error.message : "Unknown internal route error";

  return {
    ok: false as const,
    error: {
      code: "internal_error" as const,
      message,
    },
  };
}