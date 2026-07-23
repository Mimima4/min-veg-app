/**
 * One-shot: rename Contour B profession anleggsteknikk → maskin-og-kranforer in prod DB.
 *
 * School VG2 stays Anleggsteknikk (BAANL2 / vg2-anleggsteknikk middles).
 * Includes study_routes + child_profession_interests remapping (snekker bug fix).
 *
 * Usage: node --env-file=.env.local scripts/rename-profession-anleggsteknikk-to-maskin-og-kranforer.mjs
 */
import { runContourBProfessionRename } from "./lib/rename-contour-b-profession.mjs";

const TITLES = {
  title_i18n: {
    nb: "Maskin- og kranfører",
    nn: "Maskin- og kranførar",
    en: "Machine and crane operator",
  },
  summary_i18n: {
    nb: "Maskiner, anlegg og infrastruktur i bygg og anlegg.",
    nn: "Maskiner, anlegg og infrastruktur i bygg og anlegg.",
    en: "Machinery, construction sites and infrastructure in building and civil engineering.",
  },
  education_notes_i18n: {
    nb: "VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.",
    nn: "VGS: Bygg- og anleggsteknikk → Anleggsteknikfaget. Deretter lære og fagbrev.",
    en: "Upper secondary: Building and construction → Construction technology. Then apprenticeship and trade certificate.",
  },
};

runContourBProfessionRename({
  oldSlug: "anleggsteknikk",
  newSlug: "maskin-og-kranforer",
  // Historical program_code prefix was ANLEG- (not full ANLEGSTEKNIKK-).
  oldCodePrefix: "ANLEG-",
  newCodePrefix: "MASKIN-OG-KRANFORER-",
  titles: TITLES,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
