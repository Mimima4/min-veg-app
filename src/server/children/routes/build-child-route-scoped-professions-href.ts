import { createClient } from "@/lib/supabase/server";

type RouteRow = {
  id: string;
  child_id: string;
  status: string;
  updated_at: string;
};

export function formatChildRouteScopedProfessionsHref(params: {
  locale: string;
  childId: string;
  routeId?: string | null;
}): string {
  if (params.routeId) {
    return `/${params.locale}/app/children/${params.childId}/route/${params.routeId}#route-available-professions`;
  }

  return `/${params.locale}/app/children/${params.childId}/route`;
}

export function pickPreferredStudyRouteForProfessions(
  routes: RouteRow[],
  childId: string
): RouteRow | null {
  const childRoutes = routes.filter((route) => route.child_id === childId);
  if (childRoutes.length === 0) {
    return null;
  }

  const draftRoute = childRoutes.find((route) => route.status === "draft");
  return draftRoute ?? childRoutes[0] ?? null;
}

export async function resolveChildRouteScopedProfessionsHref(params: {
  locale: string;
  childId: string;
}): Promise<string> {
  const supabase = await createClient();

  const { data: routes, error } = await supabase
    .from("study_routes")
    .select("id, child_id, status, updated_at")
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .in("status", ["draft", "saved"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to resolve route-scoped professions href: ${error.message}`
    );
  }

  const preferred = pickPreferredStudyRouteForProfessions(routes ?? [], params.childId);

  return formatChildRouteScopedProfessionsHref({
    locale: params.locale,
    childId: params.childId,
    routeId: preferred?.id ?? null,
  });
}
