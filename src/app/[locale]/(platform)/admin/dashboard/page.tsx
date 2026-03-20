import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Admin Dashboard"
      subtitle={`Placeholder page for /${locale}/admin/dashboard.`}
      backHref={`/${locale}`}
      navLinks={[
        { href: `/${locale}/owner/dashboard`, label: "Owner Dashboard" },
      ]}
    />
  );
}

