import {
  getAvailabilityTruth,
  type AvailabilityTruthRow,
} from "./get-availability-truth";

export async function shouldUseAvailabilityTruth({
  countyCodes,
  programmeSlugsOrCodes,
}: {
  countyCodes: string[];
  programmeSlugsOrCodes: string[];
}): Promise<{
  useTruth: boolean;
  countyCode: string | null;
  truth: {
    hasTruth: boolean;
    rows: AvailabilityTruthRow[];
  };
}> {
  const normalizedCountyCodes = Array.from(
    new Set(countyCodes.map((value) => value.trim()).filter(Boolean))
  );

  for (const countyCode of normalizedCountyCodes) {
    const truth = await getAvailabilityTruth({
      countyCode,
      programmeSlugsOrCodes,
    });
    if (truth.hasTruth) {
      return {
        useTruth: true,
        countyCode,
        truth,
      };
    }
  }

  return {
    useTruth: false,
    countyCode: null,
    truth: { hasTruth: false, rows: [] },
  };
}
