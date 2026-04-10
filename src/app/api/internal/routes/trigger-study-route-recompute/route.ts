import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerStudyRouteRecompute } from "@/server/children/routes/trigger-study-route-recompute";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, routeId, locale } = body;

    if (!childId || !routeId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and routeId are required",
        },
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updated = await triggerStudyRouteRecompute({
      childId,
      routeId,
      locale,
      triggeredByType: "parent",
      triggeredByUserId: user?.id ?? null,
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