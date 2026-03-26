import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function SchoolDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="School Dashboard"
      subtitle={`Placeholder page for /${locale}/school/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/app/family`, label: "Family" },
      ]}
    />
  );
}

