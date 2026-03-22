import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";

export default async function FamilyPage({
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

  const { data: familyAccount, error: familyError } = await supabase
    .from("family_accounts")
    .select("id, plan_type, status, max_children, created_at")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (familyError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="There was a problem loading your family account."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {familyError.message}
        </div>
      </LocalePageShell>
    );
  }

  if (!familyAccount) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="This is where your family account and child profiles will live."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No family account yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Create your family account to start building the parent and child
            area.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/app/family/create`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Create family account
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  const { data: children, error: childrenError } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, created_at"
    )
    .eq("family_account_id", familyAccount.id)
    .order("created_at", { ascending: true });

  if (childrenError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="There was a problem loading child profiles."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {childrenError.message}
        </div>
      </LocalePageShell>
    );
  }

  const childCount = children?.length ?? 0;
  const canCreateMore = childCount < familyAccount.max_children;

  return (
    <LocalePageShell
      locale={locale}
      title="Family"
      subtitle="Manage your family account and the child profiles connected to it."
      backHref={`/${locale}/app/dashboard`}
      backLabel="Back dashboard"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Family account
          </h2>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Plan type</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.plan_type}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Status</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.status}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Children</dt>
              <dd className="mt-1 text-base text-stone-900">
                {childCount} / {familyAccount.max_children}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Created at</dt>
              <dd className="mt-1 text-base text-stone-900">
                {new Date(familyAccount.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Child profiles
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Add and manage the children connected to this family account.
              </p>
            </div>

            {canCreateMore ? (
              <Link
                href={`/${locale}/app/children/create`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                Create child profile
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                Child limit reached
              </span>
            )}
          </div>

          {!children || children.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-base font-semibold text-stone-900">
                No child profiles yet
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Create the first child profile to continue building the family
                planning flow.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">
                        {child.display_name || "Unnamed child"}
                      </h3>

                      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm text-stone-500">Birth year</dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.birth_year}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-stone-500">
                            School stage
                          </dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.school_stage}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-stone-500">
                            Country code
                          </dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.country_code}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm text-stone-500">
                            Relocation willingness
                          </dt>
                          <dd className="mt-1 text-base text-stone-900">
                            {child.relocation_willingness ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <Link
                        href={`/${locale}/app/children/${child.id}`}
                        className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                      >
                        Open child profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LocalePageShell>
  );
}
