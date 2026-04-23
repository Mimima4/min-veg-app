"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  StudyRouteAvailableProfessionsBlock,
  StudyRouteReadModelStep,
} from "@/lib/routes/route-types";

type Props = {
  locale: string;
  availableProfessions: StudyRouteAvailableProfessionsBlock;
  steps: StudyRouteReadModelStep[];
};

export default function RouteAvailableProfessionsPanel({
  locale,
  availableProfessions,
  steps,
}: Props) {
  const isTruthApprenticeshipStep = (
    step: StudyRouteReadModelStep
  ): step is Extract<StudyRouteReadModelStep, { type: "apprenticeship_step" }> =>
    typeof step === "object" &&
    step !== null &&
    "type" in step &&
    "source" in step &&
    step.type === "apprenticeship_step" &&
    step.source === "availability_truth";

  const apprenticeshipStep = useMemo(
    () => steps.find((step) => isTruthApprenticeshipStep(step)),
    [steps]
  );
  const apprenticeshipOptions = apprenticeshipStep?.apprenticeship_options ?? [];
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const visibleProfessions = useMemo(() => {
    if (!selectedOptionId) return [];
    return availableProfessions.items.filter(
      (profession) => profession.apprenticeshipOptionId === selectedOptionId
    );
  }, [availableProfessions.items, selectedOptionId]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        Available professions
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        These professions become reachable via the currently selected route.
      </p>

      {availableProfessions.items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-semibold text-stone-900">
            {availableProfessions.emptyState?.title ??
              "No additional professions can be shown yet"}
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            {availableProfessions.emptyState?.message ??
              "Adjust route inputs or selected filters to expand available professions"}
          </p>
        </div>
      ) : apprenticeshipOptions.length > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Choose apprenticeship direction
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Outcomes are shown for the selected apprenticeship option.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {apprenticeshipOptions.map((option) => (
                <button
                  key={option.option_id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.option_id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    selectedOptionId === option.option_id
                      ? "border-stone-700 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  {option.option_title}
                </button>
              ))}
            </div>
          </div>

          {selectedOptionId === null ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              Choose apprenticeship direction to see related professions.
            </div>
          ) : visibleProfessions.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              No professions are linked to this direction yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {visibleProfessions.map((profession) => (
                <div
                  key={profession.professionId}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">
                        {profession.navTitle ?? profession.title}
                      </h3>
                      {profession.navYrkeskategori ? (
                        <p className="mt-1 inline-flex rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs font-medium text-stone-700">
                          {profession.navYrkeskategori}
                        </p>
                      ) : null}
                    </div>

                    {profession.slug ? (
                      <Link
                        href={`/${locale}/app/professions/${profession.slug}`}
                        className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                      >
                        Open profession
                      </Link>
                    ) : (
                      <span className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-500">
                        Source outcome
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {availableProfessions.items.map((profession) => (
            <div
              key={profession.professionId}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {profession.navTitle ?? profession.title}
                  </h3>
                  {profession.navYrkeskategori ? (
                    <p className="mt-1 inline-flex rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs font-medium text-stone-700">
                      {profession.navYrkeskategori}
                    </p>
                  ) : null}
                  {profession.whyOpenedLabel ? (
                    <p className="mt-1 text-sm text-stone-600">
                      {profession.whyOpenedLabel}
                    </p>
                  ) : null}
                  {profession.similarityLabel ? (
                    <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
                      {profession.similarityLabel}
                    </p>
                  ) : null}
                </div>

                {profession.slug ? (
                  <Link
                    href={`/${locale}/app/professions/${profession.slug}`}
                    className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                  >
                    Open profession
                  </Link>
                ) : (
                  <span className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-500">
                    Source outcome
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}