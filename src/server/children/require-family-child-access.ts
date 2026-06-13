import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { RouteDomainError } from "@/server/children/routes/route-errors";

export type FamilyChildAccess = {
  userId: string;
  familyAccountId: string;
  childId: string;
};

async function userCanAccessFamilyChild(params: {
  userId: string;
  familyAccountId: string;
}): Promise<boolean> {
  const admin = createAdminClient();

  const { data: family, error: familyError } = await admin
    .from("family_accounts")
    .select("id, primary_user_id")
    .eq("id", params.familyAccountId)
    .maybeSingle();

  if (familyError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load family account: ${familyError.message}`,
      { familyAccountId: params.familyAccountId }
    );
  }

  if (!family) {
    return false;
  }

  if (family.primary_user_id === params.userId) {
    return true;
  }

  const { data: partnerLink, error: partnerError } = await admin
    .from("family_partner_links")
    .select("partner_user_id")
    .eq("family_account_id", params.familyAccountId)
    .eq("status", "linked")
    .eq("partner_user_id", params.userId)
    .maybeSingle();

  if (partnerError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to verify family partner access: ${partnerError.message}`,
      { familyAccountId: params.familyAccountId }
    );
  }

  return Boolean(partnerLink);
}

export async function requireFamilyChildAccess(childId: string): Promise<FamilyChildAccess> {
  const normalizedChildId = childId.trim();

  if (!normalizedChildId) {
    throw new RouteDomainError("invalid_request", "childId is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new RouteDomainError("route_access_denied", "Authentication required");
  }

  const admin = createAdminClient();
  const { data: child, error: childError } = await admin
    .from("child_profiles")
    .select("id, family_account_id")
    .eq("id", normalizedChildId)
    .maybeSingle();

  if (childError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load child profile: ${childError.message}`,
      { childId: normalizedChildId }
    );
  }

  if (!child?.family_account_id) {
    throw new RouteDomainError("route_access_denied", "Child profile not found", {
      childId: normalizedChildId,
    });
  }

  const allowed = await userCanAccessFamilyChild({
    userId: user.id,
    familyAccountId: child.family_account_id,
  });

  if (!allowed) {
    throw new RouteDomainError(
      "route_access_denied",
      "You do not have access to this child profile",
      { childId: normalizedChildId }
    );
  }

  return {
    userId: user.id,
    familyAccountId: child.family_account_id,
    childId: child.id,
  };
}

export async function requireFamilyChildAccessForRouteId(
  routeId: string
): Promise<FamilyChildAccess> {
  const normalizedRouteId = routeId.trim();

  if (!normalizedRouteId) {
    throw new RouteDomainError("invalid_request", "routeId is required");
  }

  const admin = createAdminClient();
  const { data: route, error: routeError } = await admin
    .from("study_routes")
    .select("child_id")
    .eq("id", normalizedRouteId)
    .is("archived_at", null)
    .maybeSingle();

  if (routeError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load study route: ${routeError.message}`,
      { routeId: normalizedRouteId }
    );
  }

  if (!route?.child_id) {
    throw new RouteDomainError("route_access_denied", "Route not found", {
      routeId: normalizedRouteId,
    });
  }

  return requireFamilyChildAccess(route.child_id);
}
