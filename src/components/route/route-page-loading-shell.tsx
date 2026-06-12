"use client";

import { useParams } from "next/navigation";
import { MinVegRoadLoader } from "@/components/route/min-veg-road-loader";

/**
 * Instant fallback while route pages stream SSR — avoids blank screen on navigation.
 */
export function RoutePageLoadingShell() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 h-10 w-48 animate-pulse rounded-lg bg-stone-200/80" aria-hidden />
        <div className="grid gap-6">
          <div className="w-full rounded-2xl border border-stone-200 bg-white p-6">
            <div className="h-4 w-24 animate-pulse rounded bg-stone-200/80" aria-hidden />
            <div className="mt-3 h-7 w-2/3 max-w-md animate-pulse rounded bg-stone-200/80" aria-hidden />
            <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-stone-100" aria-hidden />
          </div>
          <div className="w-full rounded-2xl border border-stone-200 bg-white">
            <MinVegRoadLoader locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
