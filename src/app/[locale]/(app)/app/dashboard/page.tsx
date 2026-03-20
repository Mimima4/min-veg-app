import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function AppDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="App Dashboard"
      subtitle={`Placeholder page for /${locale}/app/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/app/children`, label: "Children" },
        { href: `/${locale}/app/professions`, label: "Professions" },
      ]}
    />
  );
}

