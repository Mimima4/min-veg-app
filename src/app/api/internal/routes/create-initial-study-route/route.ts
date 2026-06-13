import { NextResponse } from "next/server";
import { requireFamilyChildAccess } from "@/server/children/require-family-child-access";
import { createInitialStudyRoute } from "@/server/children/routes/create-initial-study-route";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, targetProfessionId, locale } = body;

    if (!childId || !targetProfessionId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and targetProfessionId are required",
        },
      });
    }

    const access = await requireFamilyChildAccess(childId);

    const data = await createInitialStudyRoute({
      childId,
      targetProfessionId,
      locale,
      createdByType: "parent",
      createdByUserId: access.userId,
    });

    return NextResponse.json({
      ok: true,
      result: {
        routeId: data.identity.routeId,
        routeVariantId: data.identity.routeVariantId,
      },
      updated: data,
      meta: {
        modelVersion: "v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(toRouteErrorResponse(error));
  }
}