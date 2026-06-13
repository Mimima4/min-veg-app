import { NextResponse } from "next/server";
import { requireFamilyChildAccessForRouteId } from "@/server/children/require-family-child-access";
import { getStudyRouteAvailableProfessions } from "@/server/children/routes/get-study-route-available-professions";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { routeId, locale } = body;

    if (!routeId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "routeId is required",
        },
      });
    }

    await requireFamilyChildAccessForRouteId(routeId);

    const data = await getStudyRouteAvailableProfessions({ routeId, locale });

    return NextResponse.json({
      ok: true,
      data,
      meta: {
        modelVersion: "v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(toRouteErrorResponse(error));
  }
}