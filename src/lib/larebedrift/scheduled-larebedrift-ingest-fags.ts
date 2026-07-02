/**
 * Fag included in the monthly Vercel cron ingest (`run-larebedrift-ingest.ts`).
 * Keep apiQueryCode + code aligned with `scripts/lib/larebedrift-fagkode.mjs`.
 */

export type ScheduledLarebedriftIngestFag = {
  apiQueryCode: string;
  code: string;
  label: string;
};

export const SCHEDULED_LAREBEDRIFT_INGEST_FAGS: ReadonlyArray<ScheduledLarebedriftIngestFag> = [
  { apiQueryCode: "BATMF3", code: "TOMRERFAGET", label: "Tømrerfaget" },
  { apiQueryCode: "ELELE3", code: "ELEKTRIKERFAGET", label: "Elektrikerfaget" },
  { apiQueryCode: "ELMEL3", code: "MARITIM_ELEKTRIKERFAGET", label: "Maritim elektrikerfaget" },
  { apiQueryCode: "ELERF3", code: "ELEKTROREPARATORFAGET", label: "Elektroreparatørfaget" },
  { apiQueryCode: "ELEMO3", code: "ENERGIMONTORFAGET", label: "Energimontørfaget" },
  { apiQueryCode: "ELEOP3", code: "ENERGIOPERATORFAGET", label: "Energioperatørfaget" },
  { apiQueryCode: "ELHEI3", code: "HEISMONTORFAGET", label: "Heismontørfaget" },
  { apiQueryCode: "ELSIG3", code: "SIGNALMONTORFAGET", label: "Signalmontørfaget" },
  { apiQueryCode: "ELTAV3", code: "TAVLEMONTORFAGET", label: "Tavlemontørfaget" },
  { apiQueryCode: "ELTEL3", code: "TELEKOMMUNIKASJONSMONTORFAGET", label: "Telekommunikasjonsmontørfaget" },
  { apiQueryCode: "ELTOG3", code: "TOGELEKTRIKERFAGET", label: "Togelektrikerfaget" },
  { apiQueryCode: "ELVIK3", code: "VIKLERFAGET", label: "Viklerfaget" },
];

/** Cron batches — each must finish within Vercel `maxDuration` (300s on Hobby). */
export const SCHEDULED_LAREBEDRIFT_INGEST_BATCHES: ReadonlyArray<
  ReadonlyArray<(typeof SCHEDULED_LAREBEDRIFT_INGEST_FAGS)[number]["code"]>
> = [
  ["TOMRERFAGET"],
  ["ELEKTRIKERFAGET", "MARITIM_ELEKTRIKERFAGET", "ELEKTROREPARATORFAGET", "ENERGIMONTORFAGET"],
  ["ENERGIOPERATORFAGET", "HEISMONTORFAGET", "SIGNALMONTORFAGET", "TAVLEMONTORFAGET"],
  ["TELEKOMMUNIKASJONSMONTORFAGET", "TOGELEKTRIKERFAGET", "VIKLERFAGET"],
];

export function isScheduledLarebedriftIngestBatchIndex(batchIndex: number): boolean {
  return (
    Number.isInteger(batchIndex) &&
    batchIndex >= 0 &&
    batchIndex < SCHEDULED_LAREBEDRIFT_INGEST_BATCHES.length
  );
}

export function getScheduledLarebedriftIngestBatchCodes(batchIndex: number): string[] {
  const batch = SCHEDULED_LAREBEDRIFT_INGEST_BATCHES[batchIndex];
  if (!batch) {
    throw new Error(
      `Invalid larebedrift ingest batch index ${batchIndex} (valid: 0-${SCHEDULED_LAREBEDRIFT_INGEST_BATCHES.length - 1})`
    );
  }
  return [...batch];
}
