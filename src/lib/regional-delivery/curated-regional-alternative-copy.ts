import { STEIGEN_CARPENTER_VEKSLING_VARIANT_ID } from "./steigen-carpenter-veksling-path-variant";
import {
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
  painterNorthCrossFylkeVariantId,
} from "./painter-north-cross-fylke-pilot";

export function resolveCuratedRegionalAlternativeMainDifference(
  curatedRegionalVariantId: string
): string {
  if (curatedRegionalVariantId === STEIGEN_CARPENTER_VEKSLING_VARIANT_ID) {
    return "Local veksling delivery model (Steigenmodellen) — curated operator path";
  }
  if (curatedRegionalVariantId === PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID) {
    return "VG1 Bygg in home county; VG2 Overflateteknikk at nabofylke schools (dropdown) — apprenticeship normally in home county";
  }
  if (curatedRegionalVariantId === painterNorthCrossFylkeVariantId("18")) {
    return "VG1 Bygg in home county, VG2 Overflateteknikk in Nordland — apprenticeship normally in home county";
  }
  if (curatedRegionalVariantId === painterNorthCrossFylkeVariantId("50")) {
    return "VG1 Bygg in home county, VG2 Overflateteknikk in Trøndelag — apprenticeship normally in home county";
  }
  return "Curated regional alternative route";
}
