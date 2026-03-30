import { redirect } from "next/navigation";
import { requireAppAccess } from "@/server/billing/require-app-access";
import {
  getDefaultHrefForAccessState,
  getUserAccessState,
} from "@/server/billing/get-user-access-state";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/dashboard`,
  });

  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const accessState = await getUserAccessState();
  const href = getDefaultHrefForAccessState(locale, accessState);

  redirect(href);
}