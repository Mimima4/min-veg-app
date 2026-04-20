import { NextResponse } from "next/server";
import { removeSavedProfession } from "@/server/children/routes/remove-saved-profession";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, professionId } = body ?? {};

    if (!childId || !professionId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and professionId are required",
        },
      });
    }

    const result = await removeSavedProfession({ childId, professionId });

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