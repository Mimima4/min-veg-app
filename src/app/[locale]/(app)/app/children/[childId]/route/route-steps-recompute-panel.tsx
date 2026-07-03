"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinVegRoadLoader } from "@/components/route/min-veg-road-loader";
import type {
  StudyRouteCompetitionLevel,
  StudyRouteReadModel,
  StudyRouteReadModelStep,
} from "@/lib/routes/route-types";
import type { SteigenCarpenterVekslingInfoCopy } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";
import RouteStepsPanel from "./route-steps-panel";
import { runClientRecomputeOnce } from "@/lib/routes/client-recompute-lock";

type Props = {
  childId: string;
  routeId: string;
  locale: string;
  professionSlug?: string | null;
  recomputePending: boolean;
  isSavedRoute: boolean;
  steps: StudyRouteReadModelStep[];
  competitionLevel?: StudyRouteCompetitionLevel;
  savedSelectionSignatures?: string[];
  steigenVekslingInfoCopy?: SteigenCarpenterVekslingInfoCopy | null;
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;
const MAX_CLIENT_RECOMPUTE_PASSES = 4;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStudyRouteDetail(params: {
  childId: string;
  routeId: string;
  locale: string;
}): Promise<StudyRouteReadModel> {
  const response = await fetch("/api/internal/routes/get-study-route-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    data?: StudyRouteReadModel;
    error?: { message?: string };
  };

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Failed to load route detail");
  }

  return payload.data;
}

async function triggerClientStudyRouteRecompute(params: {
  childId: string;
  routeId: string;
  locale: string;
}): Promise<StudyRouteReadModel | undefined> {
  const triggerResponse = await fetch(
    "/api/internal/routes/trigger-study-route-recompute",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
  const triggerPayload = (await triggerResponse.json()) as {
    ok?: boolean;
    updated?: StudyRouteReadModel;
    error?: { message?: string };
  };

  if (!triggerResponse.ok || !triggerPayload.ok) {
    throw new Error(
      triggerPayload.error?.message ?? "Route recompute failed"
    );
  }

  if (!triggerPayload.updated?.recomputePending) {
    return fetchStudyRouteDetail(params);
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const detail = await fetchStudyRouteDetail(params);

    if (!detail.recomputePending) {
      return detail;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Route recompute is taking longer than expected");
}

export default function RouteStepsRecomputePanel({
  childId,
  routeId,
  locale,
  professionSlug = null,
  recomputePending,
  isSavedRoute,
  steps,
  competitionLevel,
  savedSelectionSignatures,
  steigenVekslingInfoCopy = null,
}: Props) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [isRefreshing, startTransition] = useTransition();
  const [pending, setPending] = useState(recomputePending);
  const [displaySteps, setDisplaySteps] = useState(steps);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const triggeredRef = useRef(false);
  const clientPassRef = useRef(0);
  const routeKeyRef = useRef(`${childId}:${routeId}`);

  useEffect(() => {
    const routeKey = `${childId}:${routeId}`;
    if (routeKeyRef.current !== routeKey) {
      routeKeyRef.current = routeKey;
      triggeredRef.current = false;
      clientPassRef.current = 0;
    }
    setPending(recomputePending);
    if (steps.length > 0) {
      setDisplaySteps(steps);
    }
    if (!recomputePending) {
      triggeredRef.current = false;
      clientPassRef.current = 0;
    }
  }, [childId, routeId, recomputePending, steps]);

  useEffect(() => {
    if (!pending || triggeredRef.current) {
      return;
    }

    if (clientPassRef.current >= MAX_CLIENT_RECOMPUTE_PASSES) {
      setErrorMessage("Route recompute is taking longer than expected");
      setPending(false);
      triggeredRef.current = false;
      return;
    }

    triggeredRef.current = true;
    clientPassRef.current += 1;
    const lockKey = `${childId}:${routeId}`;
    let cancelled = false;

    void runClientRecomputeOnce(lockKey, () =>
      triggerClientStudyRouteRecompute({ childId, routeId, locale })
    )
      .then((updated) => {
        if (cancelled) {
          return;
        }

        if (updated?.steps && updated.steps.length > 0) {
          setDisplaySteps(updated.steps);
        }

        if (updated?.recomputePending) {
          // Server still marks the draft stale — allow another pass instead of
          // clearing pending while triggeredRef stays true (infinite loader).
          triggeredRef.current = false;
          setPending(true);
          return;
        }

        clientPassRef.current = 0;
        setPending(false);
        startTransition(() => {
          routerRef.current.refresh();
        });
      })
      .catch((error) => {
        if (!cancelled) {
          triggeredRef.current = false;
          setErrorMessage(
            error instanceof Error ? error.message : "Route recompute failed"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pending, childId, routeId, locale, retryKey]);

  const showLoader =
    !errorMessage &&
    (pending ||
      isRefreshing ||
      (displaySteps.length === 0 && recomputePending));

  if (errorMessage) {
    return (
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p className="font-medium">Could not build route</p>
        <p className="mt-2">{errorMessage}</p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800"
          onClick={() => {
            triggeredRef.current = false;
            clientPassRef.current = 0;
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

  if (showLoader) {
    return (
      <div className="w-full rounded-2xl border border-stone-200 bg-white">
        <MinVegRoadLoader locale={locale} />
      </div>
    );
  }

  return (
    <RouteStepsPanel
      childId={childId}
      routeId={routeId}
      locale={locale}
      professionSlug={professionSlug}
      isSavedRoute={isSavedRoute}
      steps={displaySteps}
      competitionLevel={competitionLevel}
      savedSelectionSignatures={savedSelectionSignatures}
      steigenVekslingInfoCopy={steigenVekslingInfoCopy}
    />
  );
}
