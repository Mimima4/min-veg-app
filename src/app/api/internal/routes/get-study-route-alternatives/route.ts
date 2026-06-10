import { NextResponse } from "next/server";
import { getStudyRouteAlternatives } from "@/server/children/routes/get-study-route-alternatives";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { routeId } = body;

    if (!routeId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "routeId is required",
        },
      });
    }

    const data = await getStudyRouteAlternatives({ routeId });

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