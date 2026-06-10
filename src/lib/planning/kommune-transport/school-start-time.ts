import { DEFAULT_SCHOOL_START_TIME_BY_STAGE } from "./constants";

export function formatReferenceDateTimeIso(params: {
  referenceDate: Date;
  hour: number;
  minute: number;
  timeZoneOffset?: string;
}): string {
  const year = params.referenceDate.getUTCFullYear();
  const month = String(params.referenceDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(params.referenceDate.getUTCDate()).padStart(2, "0");
  const hh = String(params.hour).padStart(2, "0");
  const mm = String(params.minute).padStart(2, "0");
  const offset = params.timeZoneOffset ?? "+02:00";
  return `${year}-${month}-${day}T${hh}:${mm}:00${offset}`;
}

export function resolveSchoolStartTimeIso(params: {
  stage: "VG1" | "VG2" | "VG3";
  referenceDate: Date;
  timeZoneOffset?: string;
}): string {
  const { hour, minute } = DEFAULT_SCHOOL_START_TIME_BY_STAGE[params.stage];
  return formatReferenceDateTimeIso({
    referenceDate: params.referenceDate,
    hour,
    minute,
    timeZoneOffset: params.timeZoneOffset,
  });
}

/** Next Monday (UTC calendar) used as a representative school weekday for Entur queries. */
export function nextMondayUtc(from: Date = new Date()): Date {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const day = date.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  date.setUTCDate(date.getUTCDate() + daysUntilMonday);
  return date;
}

export function parseIsoToMinutes(iso: string): number | null {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  const date = new Date(parsed);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}
