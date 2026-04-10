import { NextResponse } from "next/server";
import { getStudyRouteDetail } from "@/server/children/routes/get-study-route-detail";
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

    const data = await getStudyRouteDetail({ childId, routeId, locale });

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