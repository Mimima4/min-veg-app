import { NextResponse } from "next/server";
import { getChildStudyRoutesOverview } from "@/server/children/routes/get-child-study-routes-overview";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, locale, childDisplayName } = body;

    if (!childId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId is required",
        },
      });
    }

    const data = await getChildStudyRoutesOverview({
      childId,
      locale,
      childDisplayName,
    });

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