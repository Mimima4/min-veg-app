import { redirect } from "next/navigation";
import { requireAppAccess } from "@/server/billing/require-app-access";
import { resolveChildRouteScopedProfessionsHref } from "@/server/children/routes/build-child-route-scoped-professions-href";

export default async function ChildMatchesPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}/matches`,
  });

  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  redirect(
    await resolveChildRouteScopedProfessionsHref({
      locale,
      childId,
    })
  );
}
