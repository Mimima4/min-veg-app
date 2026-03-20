import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function ProfessionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Professions"
      subtitle={`Placeholder page for /${locale}/app/professions.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/app/dashboard`, label: "Dashboard" },
        { href: `/${locale}/app/children`, label: "Children" },
      ]}
    />
  );
}

