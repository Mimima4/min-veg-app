import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;

  const fromAccount = from === "account";
  const backHref = fromAccount ? `/${locale}/app/profile` : `/${locale}/login`;
  const backLabel = fromAccount ? "Back to account" : "Back to sign in";
  const backText = fromAccount ? "Account" : "Sign in";

  return (
    <LocalePageShell
      locale={locale}
      title="Set new password"
      subtitle="Open the recovery link from your email and choose a new password."
      backHref={backHref}
      backLabel={backLabel}
    >
      <ResetPasswordForm locale={locale} />

      <div className="mt-6 text-sm text-stone-500">
        Back to{" "}
        <Link
          href={backHref}
          className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          {backText}
        </Link>
      </div>
    </LocalePageShell>
  );
}