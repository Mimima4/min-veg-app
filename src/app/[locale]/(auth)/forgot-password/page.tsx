import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import ForgotPasswordForm from "./forgot-password-form";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LocalePageShell
      locale={locale}
      title="Forgot password"
      subtitle="Enter your email and we will send you a password reset link."
      backHref={`/${locale}/login`}
      backLabel="Back to login"
    >
      <ForgotPasswordForm locale={locale} />

      <div className="mt-6 text-sm text-stone-500">
        Back to{" "}
        <Link
          href={`/${locale}/login`}
          className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          Login
        </Link>
      </div>
    </LocalePageShell>
  );
}