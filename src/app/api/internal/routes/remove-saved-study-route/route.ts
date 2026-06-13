import { NextResponse } from "next/server";
import { requireFamilyChildAccess } from "@/server/children/require-family-child-access";
import { removeSavedStudyRoute } from "@/server/children/routes/remove-saved-study-route";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, routeId } = body;

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

    const result = await removeSavedStudyRoute({ childId, routeId });

    return NextResponse.json({
      ok: true,
      result,
      meta: {
        modelVersion: "v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(toRouteErrorResponse(error));
  }
}
