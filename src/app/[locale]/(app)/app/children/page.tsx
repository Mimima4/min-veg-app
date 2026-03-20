import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function ChildrenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Children"
      subtitle={`Placeholder page for /${locale}/app/children.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/app/dashboard`, label: "Dashboard" },
        { href: `/${locale}/app/professions`, label: "Professions" },
      ]}
    />
  );
}

