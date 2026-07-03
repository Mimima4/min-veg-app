"use client";

import { CompetitionBadge } from "@/components/route/competition-badge";
import {
  RouteStepTypeBadgeCompactRow,
  RouteStepTypeBadgeRow,
} from "@/components/route/route-step-type-badge";
import type { StudyRouteCompetitionLevel } from "@/lib/routes/route-types";
import {
  LOSA_ROUTE_BADGE_LABEL,
  LOSA_ROUTE_BADGE_TITLE,
} from "@/lib/losa/availability-scope";
import { parseVg2ProgrammeOptionId } from "@/lib/vgs/vg2-programme-options";

const VG2_OR_FAGVALG_OUTCOME_NOTE =
  "Å bytte program på VG2 eller fagvalg kan endre målprofesjonen og åpne andre ruter og muligheter.";

const PRIVATE_SCHOOL_BADGE_CLASSES = {
  default:
    "inline-flex shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700",
  onDarkSelectedRow:
    "inline-flex shrink-0 rounded-full border border-orange-300 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-900",
};

const LOSA_BADGE_CLASSES = {
  default:
    "inline-flex shrink-0 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800",
  onDarkSelectedRow:
    "inline-flex shrink-0 rounded-full border border-sky-300 bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950",
};

export type Vg2StepOption = {
  id: string;
  schoolName: string;
  location: string | null;
  website: string | null;
  programTitle: string | null | undefined;
  displayTitle: string | null | undefined;
  durationLabel: string | null;
  institutionIsPrivateSchool: boolean;
  isLosaDelivery: boolean;
  programSlug?: string | null;
};

type Props = {
  stepKey: string;
  cardShellClass: string;
  stepTitleClass: string;
  schoolNameClass: string;
  metaClass: string;
  listRowClass: string;
  dropdownOptionsScrollClass: string;
  programmeOpenKey: string;
  schoolOpenKey: string;
  isProgrammeOpen: boolean;
  isSchoolOpen: boolean;
  isRecomputing: boolean;
  programmeTitle: string;
  programmeOptions: Vg2StepOption[];
  selectedProgrammeOption: Vg2StepOption | null;
  selectedProgrammeSlug: string | null;
  schoolOptions: Vg2StepOption[];
  selectedSchoolOption: Vg2StepOption | null;
  competitionLevel?: StudyRouteCompetitionLevel;
  showCompetitionBadge: boolean;
  stepTypeLabel: string;
  compact?: boolean;
  onProgrammeOpenToggle: () => void;
  onSchoolOpenToggle: () => void;
  onProgrammeSelect: (programSlug: string) => void;
  onSchoolSelect: (optionId: string) => void;
  registerRef: (element: HTMLDivElement | null) => void;
  resolveProgrammeDropdownLabel: (option: Vg2StepOption) => string;
  resolveSchoolDropdownLabel: (option: Vg2StepOption) => string;
};

export default function Vg2RouteStepCard({
  cardShellClass,
  stepTitleClass,
  schoolNameClass,
  metaClass,
  listRowClass,
  dropdownOptionsScrollClass,
  isProgrammeOpen,
  isSchoolOpen,
  isRecomputing,
  programmeTitle,
  programmeOptions,
  selectedProgrammeOption,
  selectedProgrammeSlug,
  schoolOptions,
  selectedSchoolOption,
  competitionLevel,
  showCompetitionBadge,
  stepTypeLabel,
  compact = false,
  onProgrammeOpenToggle,
  onSchoolOpenToggle,
  onProgrammeSelect,
  onSchoolSelect,
  registerRef,
  resolveProgrammeDropdownLabel,
  resolveSchoolDropdownLabel,
}: Props) {
  const selectedSchoolName = selectedSchoolOption?.schoolName ?? null;
  const selectedLocation = selectedSchoolOption?.location ?? null;
  const selectedWebsite = selectedSchoolOption?.website ?? null;
  const selectedDurationLabel = selectedSchoolOption?.durationLabel ?? null;

  return (
    <div className={cardShellClass} ref={registerRef}>
      {isRecomputing ? (
        <p className="mb-2 text-xs text-stone-500">Oppdaterer rute etter programvalg…</p>
      ) : null}

      <button
        type="button"
        disabled={isRecomputing}
        onClick={onProgrammeOpenToggle}
        className="flex w-full flex-col text-left"
        aria-expanded={isProgrammeOpen}
        data-testid="route-vg2-programme-toggle"
      >
        {compact ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <h4 className={`${stepTitleClass} line-clamp-3 text-stone-900`}>{programmeTitle}</h4>
            <RouteStepTypeBadgeCompactRow label={stepTypeLabel} isOpen={isProgrammeOpen} />
          </div>
        ) : (
          <div className="flex w-full items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h4 className={`${stepTitleClass} text-stone-900`}>{programmeTitle}</h4>
                {showCompetitionBadge && competitionLevel ? (
                  <CompetitionBadge level={competitionLevel} />
                ) : null}
              </div>
            </div>
            <RouteStepTypeBadgeRow label={stepTypeLabel} isOpen={isProgrammeOpen} />
          </div>
        )}
      </button>

      {isProgrammeOpen ? (
        <div
          className="mt-3 border-t border-stone-200 pt-3"
          data-testid="route-vg2-programme-options"
        >
          <p className="mb-3 px-2 text-xs leading-relaxed text-stone-500">
            {VG2_OR_FAGVALG_OUTCOME_NOTE}
          </p>
          <div className={`space-y-1 ${dropdownOptionsScrollClass}`}>
            {programmeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={isRecomputing}
                onClick={() => {
                  const slug =
                    option.programSlug ?? parseVg2ProgrammeOptionId(option.id) ?? null;
                  if (!slug) return;
                  onProgrammeSelect(slug);
                }}
                className={`${listRowClass} ${
                  option.id === selectedProgrammeOption?.id
                    ? "border-stone-700 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                }`}
              >
                {resolveProgrammeDropdownLabel(option)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={isRecomputing}
        onClick={onSchoolOpenToggle}
        className="mt-3 flex w-full flex-col border-t border-stone-200 pt-3 text-left"
        aria-expanded={isSchoolOpen}
        data-testid="route-vg2-school-toggle"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {selectedSchoolName ? (
              <p className={schoolNameClass}>{selectedSchoolName}</p>
            ) : (
              <p className={`${schoolNameClass} text-stone-500`}>Velg skole</p>
            )}

            <div className={metaClass}>
              {selectedLocation ? <div>{selectedLocation}</div> : null}
              {selectedDurationLabel ? <div>Study time: {selectedDurationLabel}</div> : null}
              {selectedSchoolOption?.isLosaDelivery ||
              selectedSchoolOption?.institutionIsPrivateSchool ? (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {selectedSchoolOption.isLosaDelivery ? (
                    <span className={LOSA_BADGE_CLASSES.default} title={LOSA_ROUTE_BADGE_TITLE}>
                      {LOSA_ROUTE_BADGE_LABEL}
                    </span>
                  ) : null}
                  {selectedSchoolOption.institutionIsPrivateSchool ? (
                    <span
                      className={PRIVATE_SCHOOL_BADGE_CLASSES.default}
                      title="Privat videregående skole"
                    >
                      Privatskole
                    </span>
                  ) : null}
                </div>
              ) : null}
              {selectedWebsite ? (
                <a
                  href={selectedWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm text-blue-600 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Visit school website
                </a>
              ) : null}
            </div>
          </div>
          <span className="shrink-0 text-xs text-stone-500">{isSchoolOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {isSchoolOpen ? (
        <div className="mt-3 border-t border-stone-200 pt-3" data-testid="route-step-options">
          <div className={`space-y-1 ${dropdownOptionsScrollClass}`}>
            {schoolOptions.length === 0 ? (
              <p className="px-2 py-2 text-sm text-stone-500">Ingen skoler for dette programmet.</p>
            ) : null}
            {schoolOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={isRecomputing}
                onClick={() => onSchoolSelect(option.id)}
                className={`${listRowClass} ${
                  option.id === selectedSchoolOption?.id
                    ? "border-stone-700 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  <span className="block">{resolveSchoolDropdownLabel(option)}</span>
                </span>
                <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  {option.isLosaDelivery ? (
                    <span
                      className={
                        option.id === selectedSchoolOption?.id
                          ? LOSA_BADGE_CLASSES.onDarkSelectedRow
                          : LOSA_BADGE_CLASSES.default
                      }
                      title={LOSA_ROUTE_BADGE_TITLE}
                    >
                      {LOSA_ROUTE_BADGE_LABEL}
                    </span>
                  ) : null}
                  {option.institutionIsPrivateSchool ? (
                    <span
                      className={
                        option.id === selectedSchoolOption?.id
                          ? PRIVATE_SCHOOL_BADGE_CLASSES.onDarkSelectedRow
                          : PRIVATE_SCHOOL_BADGE_CLASSES.default
                      }
                      title="Privat videregående skole"
                    >
                      Privatskole
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedProgrammeSlug ? (
        <span className="sr-only" data-testid="route-vg2-selected-programme-slug">
          {selectedProgrammeSlug}
        </span>
      ) : null}
    </div>
  );
}
