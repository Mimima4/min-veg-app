import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import LoginForm from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Sign in"
      subtitle="Standard sign in is for accounts with active access."
      backHref={`/${locale}`}
      backLabel="Back home"
    >
      <LoginForm locale={locale} />

      <div className="mt-6 text-sm text-stone-500">
        <Link
          href={`/${locale}/pricing?entry=family`}
          className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          Choose your family plan
        </Link>
      </div>
    </LocalePageShell>
  );
}