import { STEIGEN_CARPENTER_VEKSLING_VARIANT_ID } from "./steigen-carpenter-veksling-path-variant";
import {
  isNorthCrossFylkeCuratedVariantId,
  painterNorthCrossFylkeVariantId,
} from "./painter-north-cross-fylke-pilot";
import { ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID } from "@/lib/vgs/sparse-vg2-alternative-eligibility";

export function resolveCuratedRegionalAlternativeMainDifference(
  curatedRegionalVariantId: string
): string {
  if (curatedRegionalVariantId === STEIGEN_CARPENTER_VEKSLING_VARIANT_ID) {
    return "Local veksling delivery model (Steigenmodellen) — curated operator path";
  }
  if (isNorthCrossFylkeCuratedVariantId(curatedRegionalVariantId)) {
    return "VG1 in home county; VG2 at nabofylke schools (dropdown) — apprenticeship normally in home county";
  }
  if (curatedRegionalVariantId === ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID) {
    return "VG1 Bygg in home county; VG2 Anleggsteknikk at national sparse schools outside primary area — sorted by public-transport travel time";
  }
  if (curatedRegionalVariantId === painterNorthCrossFylkeVariantId("18")) {
    return "VG1 Bygg in home county, VG2 Overflateteknikk in Nordland — apprenticeship normally in home county";
  }
  if (curatedRegionalVariantId === painterNorthCrossFylkeVariantId("50")) {
    return "VG1 Bygg in home county, VG2 Overflateteknikk in Trøndelag — apprenticeship normally in home county";
  }
  return "Curated regional alternative route";
}
