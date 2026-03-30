import { redirect } from "next/navigation";
import { requireAppAccess } from "@/server/billing/require-app-access";

export default async function ChildrenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  redirect(`/${locale}/app/family`);
}

