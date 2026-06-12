import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInitialStudyRoute } from "@/server/children/routes/create-initial-study-route";

type RouteRow = {
  id: string;
  current_variant_id: string | null;
  status: string;
  updated_at: string;
};

type RouteVariantRow = {
  route_id: string;
  status: string;
  is_current: boolean;
};

export default async function RouteEntryResolverPage({
  params,
}: {
  params: Promise<{
    locale: string;
    childId: string;
    targetProfessionId: string;
  }>;
}) {
  const { locale, childId, targetProfessionId } = await params;
  const supabase = await createClient();

  const { data: routes, error } = await supabase
    .from("study_routes")
    .select("id, current_variant_id, status, updated_at")
    .eq("child_id", childId)
    .eq("target_profession_id", targetProfessionId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to resolve route entry target: ${error.message}`);
  }

  const typedRoutes = (routes ?? []) as RouteRow[];
  if (typedRoutes.length === 0) {
    notFound();
  }

  const routeIds = typedRoutes.map((route) => route.id);
  const { data: variants, error: variantsError } = await supabase
    .from("study_route_variants")
    .select("route_id, status, is_current")
    .in("route_id", routeIds)
    .eq("is_current", true);

  if (variantsError) {
    throw new Error(
      `Failed to resolve route entry current variants: ${variantsError.message}`
    );
  }

  const currentVariantByRouteId = new Map<string, RouteVariantRow>();
  for (const variant of (variants ?? []) as RouteVariantRow[]) {
    currentVariantByRouteId.set(variant.route_id, variant);
  }

  const drafts = typedRoutes.filter((route) => {
    if (route.status === "draft") {
      return true;
    }
    const currentVariant = currentVariantByRouteId.get(route.id);
    return currentVariant?.status === "draft";
  });

  if (drafts.length > 0) {
    // Always open the working draft. Saved routes are a separate storage contour and
    // do not carry outcome-filter alternative variants.
    redirect(`/${locale}/app/children/${childId}/route/${drafts[0].id}`);
  }

  const createdWorkingRoute = await createInitialStudyRoute({
    childId,
    targetProfessionId,
    locale,
    createdByType: "system",
    createdByUserId: null,
  });

  if (!createdWorkingRoute?.identity?.routeId) {
    notFound();
  }

  redirect(
    `/${locale}/app/children/${childId}/route/${createdWorkingRoute.identity.routeId}`
  );
}
