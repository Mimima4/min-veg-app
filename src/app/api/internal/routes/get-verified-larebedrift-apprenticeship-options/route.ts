import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireFamilyChildAccess } from "@/server/children/require-family-child-access";
import { toRouteErrorResponse } from "@/server/children/routes/route-errors";
import { resolveVerifiedLarebedriftOptionsForFagSelection } from "@/server/children/routes/refresh-apprenticeship-larebedrift-for-fag";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, professionSlug, programSlug, programTitle, title, programmeUrl, explicitFagStep } =
      body;

    if (!childId || !professionSlug) {
      return NextResponse.json({
        ok: false,
        error: {
          code: "invalid_request",
          message: "childId and professionSlug are required",
        },
      });
    }

    await requireFamilyChildAccess(childId);

    const supabase = await createClient();
    const options = await resolveVerifiedLarebedriftOptionsForFagSelection({
      supabase,
      childId,
      professionSlug: String(professionSlug),
      programSlug: programSlug ?? null,
      programTitle: programTitle ?? null,
      title: title ?? null,
      programmeUrl: programmeUrl ?? null,
      explicitFagStep: Boolean(explicitFagStep),
    });

    return NextResponse.json({
      ok: true,
      options,
      meta: {
        modelVersion: "v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(toRouteErrorResponse(error));
  }
}
