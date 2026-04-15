import { NextResponse } from "next/server";
import { saveStudyRoute } from "@/server/children/routes/save-study-route";
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

    const updated = await saveStudyRoute({
      childId,
      routeId,
      locale,
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
