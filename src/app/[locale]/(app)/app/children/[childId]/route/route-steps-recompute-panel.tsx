"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MinVegRoadLoader } from "@/components/route/min-veg-road-loader";
import type {
  StudyRouteCompetitionLevel,
  StudyRouteReadModelStep,
} from "@/lib/routes/route-types";
import RouteStepsPanel from "./route-steps-panel";

type Props = {
  childId: string;
  routeId: string;
  locale: string;
  recomputePending: boolean;
  isSavedRoute: boolean;
  steps: StudyRouteReadModelStep[];
  competitionLevel?: StudyRouteCompetitionLevel;
  savedSelectionSignatures?: string[];
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRecomputePending(params: {
  childId: string;
  routeId: string;
  locale: string;
}): Promise<boolean> {
  const response = await fetch("/api/internal/routes/get-study-route-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    data?: { recomputePending?: boolean };
  };

  if (!response.ok || !payload.ok) {
    throw new Error("Failed to check route recompute status");
  }

  return Boolean(payload.data?.recomputePending);
}

export default function RouteStepsRecomputePanel({
  childId,
  routeId,
  locale,
  recomputePending,
  isSavedRoute,
  steps,
  competitionLevel,
  savedSelectionSignatures,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(recomputePending);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const runStartedRef = useRef(false);

  useEffect(() => {
    setPending(recomputePending);
  }, [recomputePending]);

  useEffect(() => {
    if (!pending || runStartedRef.current) {
      return;
    }

    runStartedRef.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        const triggerResponse = await fetch(
          "/api/internal/routes/trigger-study-route-recompute",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childId, routeId, locale }),
          }
        );
        const triggerPayload = (await triggerResponse.json()) as {
          ok?: boolean;
          updated?: { recomputePending?: boolean };
          error?: { message?: string };
        };

        if (!triggerResponse.ok || !triggerPayload.ok) {
          throw new Error(
            triggerPayload.error?.message ?? "Route recompute failed"
          );
        }

        if (cancelled) {
          return;
        }

        if (!triggerPayload.updated?.recomputePending) {
          setPending(false);
          router.refresh();
          return;
        }

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          const stillPending = await fetchRecomputePending({
            childId,
            routeId,
            locale,
          });

          if (cancelled) {
            return;
          }

          if (!stillPending) {
            setPending(false);
            router.refresh();
            return;
          }

          await sleep(POLL_INTERVAL_MS);
        }

        throw new Error("Route recompute is taking longer than expected");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Route recompute failed"
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pending, childId, routeId, locale, router, retryKey]);

  if (errorMessage) {
    return (
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p className="font-medium">Could not build route</p>
        <p className="mt-2">{errorMessage}</p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800"
          onClick={() => {
            runStartedRef.current = false;
            setErrorMessage(null);
            setPending(true);
            setRetryKey((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="w-full rounded-2xl border border-stone-200 bg-white">
        <MinVegRoadLoader />
      </div>
    );
  }

  return (
    <RouteStepsPanel
      childId={childId}
      routeId={routeId}
      locale={locale}
      isSavedRoute={isSavedRoute}
      steps={steps}
      competitionLevel={competitionLevel}
      savedSelectionSignatures={savedSelectionSignatures}
    />
  );
}
