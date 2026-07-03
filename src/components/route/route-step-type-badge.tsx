"use client";

type CompactProps = {
  compact?: boolean;
};

type BadgeRowProps = CompactProps & {
  label: string;
  isOpen: boolean;
};

/** Single source for route step type badge sizing (VG1, VG2, and legacy steps). */
export function routeStepTypeBadgeClass(compact = false): string {
  return compact
    ? "inline-flex max-w-full rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[10px] font-medium leading-tight text-stone-700"
    : "inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700";
}

export function RouteStepTypeBadge({
  label,
  compact = false,
}: CompactProps & { label: string }) {
  return <span className={routeStepTypeBadgeClass(compact)}>{label}</span>;
}

function RouteStepTypeChevron({ isOpen, compact = false }: CompactProps & { isOpen: boolean }) {
  return (
    <span className={`shrink-0 text-stone-500 ${compact ? "text-[10px]" : "text-xs"}`}>
      {isOpen ? "▲" : "▼"}
    </span>
  );
}

/** Non-compact header: badge + chevron grouped on the right (VG1 programme step). */
export function RouteStepTypeBadgeRow({ label, isOpen, compact = false }: BadgeRowProps) {
  return (
    <div className="flex items-center gap-2">
      <RouteStepTypeBadge label={label} compact={compact} />
      <RouteStepTypeChevron isOpen={isOpen} compact={compact} />
    </div>
  );
}

/** Compact header: badge left, chevron right (VG1 programme step). */
export function RouteStepTypeBadgeCompactRow({ label, isOpen }: BadgeRowProps) {
  return (
    <div className="mt-2 flex items-center justify-between gap-1">
      <RouteStepTypeBadge label={label} compact />
      <RouteStepTypeChevron isOpen={isOpen} compact />
    </div>
  );
}
