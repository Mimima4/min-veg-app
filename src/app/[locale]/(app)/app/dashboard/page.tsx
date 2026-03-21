import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Dashboard"
      subtitle="This is the private Min Veg workspace. More family and planning tools will be added here next."
      backHref={`/${locale}`}
    >
      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Signed in as</p>
          <p className="mt-1 text-base font-medium text-stone-900">
            {user.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/app/profile`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Open profile
          </Link>

          <Link
            href={`/${locale}/forgot-password`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Reset password
          </Link>

          <SignOutButton locale={locale} />
        </div>
      </div>
    </LocalePageShell>
  );
}