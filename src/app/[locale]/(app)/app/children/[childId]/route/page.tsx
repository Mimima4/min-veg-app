import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";

type ChildRow = {
  id: string;
  display_name: string | null;
  created_at: string;
};

type RouteCountRow = {
  child_id: string;
};

export default async function RouteHubPage({
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
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="You need to sign in to view routes."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
      </LocalePageShell>
    );
  }

  const { data: familyAccount, error: familyError } = await supabase
    .from("family_accounts")
    .select("id")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (familyError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="There was a problem loading the family account."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
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
        title="Route"
        subtitle="Create a family account first to start working with child routes."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-sm text-stone-700">
            Route is child-based. You need a family account and at least one child
            profile before opening route sections.
          </p>
          <Link
            href={`/${locale}/app/family`}
            className="mt-4 inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Open family
          </Link>
        </div>
      </LocalePageShell>
    );
  }

  const { data: children, error: childrenError } = await supabase
    .from("child_profiles")
    .select("id, display_name, created_at")
    .eq("family_account_id", familyAccount.id)
    .order("created_at", { ascending: true });

  if (childrenError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="There was a problem loading child profiles."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {childrenError.message}
        </div>
      </LocalePageShell>
    );
  }

  const typedChildren = (children ?? []) as ChildRow[];

  const childIds = typedChildren.map((child) => child.id);

  let routeCounts = new Map<string, number>();

  if (childIds.length > 0) {
    const { data: routes, error: routesError } = await supabase
      .from("study_routes")
      .select("child_id")
      .in("child_id", childIds)
      .is("archived_at", null);

    if (routesError) {
      return (
        <LocalePageShell
          locale={locale}
          title="Route"
          subtitle="There was a problem loading route counts."
        >
          <AppPrivateNav locale={locale} currentPath="/app/route" />
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {routesError.message}
          </div>
        </LocalePageShell>
      );
    }

    for (const row of (routes ?? []) as RouteCountRow[]) {
      routeCounts.set(row.child_id, (routeCounts.get(row.child_id) ?? 0) + 1);
    }
  }

  return (
    <LocalePageShell
      locale={locale}
      title="Route"
      subtitle="Open the dedicated route section for each child. Route remains child-based, but it is accessed through this top-level section."
    >
      <AppPrivateNav locale={locale} currentPath="/app/route" />

      {typedChildren.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No child profiles yet
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Create a child profile first. Route is available only inside the child
            route contour.
          </p>
          <Link
            href={`/${locale}/app/children/create`}
            className="mt-4 inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Create child
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {typedChildren.map((child) => {
            const routeCount = routeCounts.get(child.id) ?? 0;

            return (
              <div
                key={child.id}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-500">Child</p>
                    <h2 className="mt-1 text-lg font-semibold text-stone-900">
                      {child.display_name || "Unnamed child"}
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                      {routeCount > 0
                        ? `${routeCount} route${routeCount === 1 ? "" : "s"} available`
                        : "No routes yet"}
                    </p>
                  </div>

                  <Link
                    href={`/${locale}/app/children/${child.id}/route`}
                    className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                  >
                    Open child routes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LocalePageShell>
  );
}