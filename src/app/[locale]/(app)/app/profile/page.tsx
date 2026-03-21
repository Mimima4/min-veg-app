import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";

export default async function ProfilePage({
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
      title="Profile"
      subtitle="This is the first private profile skeleton for the signed-in user."
      backHref={`/${locale}/app/dashboard`}
    >
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-stone-500">Email</dt>
            <dd className="mt-1 text-base text-stone-900">{user.email}</dd>
          </div>

          <div>
            <dt className="text-sm text-stone-500">User ID</dt>
            <dd className="mt-1 break-all text-sm text-stone-700">
              {user.id}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-stone-500">Email confirmed</dt>
            <dd className="mt-1 text-base text-stone-900">
              {user.email_confirmed_at ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>
    </LocalePageShell>
  );
}