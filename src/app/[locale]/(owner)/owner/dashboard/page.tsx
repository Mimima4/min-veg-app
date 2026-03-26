import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function OwnerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Owner Dashboard"
      subtitle={`Placeholder page for /${locale}/owner/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/admin/dashboard`, label: "Admin Dashboard" },
        { href: `/${locale}/app/family`, label: "Family" },
      ]}
    />
  );
}

