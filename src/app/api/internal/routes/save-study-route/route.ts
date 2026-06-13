import { NextResponse } from "next/server";
import { requireFamilyChildAccess } from "@/server/children/require-family-child-access";
import { saveStudyRoute } from "@/server/children/routes/save-study-route";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, routeId, locale, selectedOptions, sourceVariantId } = body;

    if (!childId || !routeId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and routeId are required",
        },
      });
    }

    await requireFamilyChildAccess(childId);

    const updated = await saveStudyRoute({
      childId,
      routeId,
      locale,
      selectedOptions,
      sourceVariantId,
    });

    return NextResponse.json({
      ok: true,
      result: {
        routeId: updated.identity.routeId,
        routeVariantId: updated.identity.routeVariantId,
        status: updated.identity.status,
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
