import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireFamilyChildAccess } from "@/server/children/require-family-child-access";
import { triggerStudyRouteRecompute } from "@/server/children/routes/trigger-study-route-recompute";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, routeId, locale } = body;
    const internalSecret = req.headers.get("x-internal-secret");
    const hasValidInternalSecret =
      Boolean(process.env.BILLING_SYNC_SECRET) &&
      internalSecret === process.env.BILLING_SYNC_SECRET;

    if (!childId || !routeId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and routeId are required",
        },
      });
    }

    if (!hasValidInternalSecret) {
      await requireFamilyChildAccess(childId);
    }

    const supabase = hasValidInternalSecret
      ? createAdminClient()
      : await createClient();
    const user = hasValidInternalSecret
      ? null
      : (await supabase.auth.getUser()).data.user;

    const updated = await triggerStudyRouteRecompute({
      childId,
      routeId,
      locale,
      triggeredByType: hasValidInternalSecret ? "system" : "parent",
      triggeredByUserId: user?.id ?? null,
      supabase,
    });

    return NextResponse.json({
      ok: true,
      result: {
        routeId: updated.identity.routeId,
        routeVariantId: updated.identity.routeVariantId,
        recomputed: true,
      },
      updated,
      meta: {
        modelVersion: "v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(toRouteErrorResponse(error));
  }
}