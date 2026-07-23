/**
 * One-shot: rename Contour B profession klima → platearbeider-og-sveiser in prod DB.
 *
 * School VG2 stays Klima/energi/miljø (BAKEM2 / vg2-klima middles).
 * Includes study_routes + child_profession_interests remapping (snekker bug fix).
 *
 * Usage: node --env-file=.env.local scripts/rename-profession-klima-to-platearbeider-og-sveiser.mjs
 */
import { runContourBProfessionRename } from "./lib/rename-contour-b-profession.mjs";

const TITLES = {
  title_i18n: {
    nb: "Platearbeider og sveiser",
    nn: "Platearbeidar og sveiser",
    en: "Sheet metal worker and welder",
  },
  summary_i18n: {
    nb: "Ventilasjon, blikk og klima i bygg — KEM-kjeden.",
    nn: "Ventilasjon, blikk og klima i bygg — KEM-kjeda.",
    en: "Ventilation, sheet metal and climate systems in buildings — KEM pathway.",
  },
  education_notes_i18n: {
    nb: "VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.",
    nn: "VGS: Bygg- og anleggsteknikk → Klima, energi og miljøteknikk. Deretter lære og fagbrev.",
    en: "Upper secondary: Building and construction → Climate, energy and environmental technology. Then apprenticeship and trade certificate.",
  },
};

runContourBProfessionRename({
  oldSlug: "klima",
  newSlug: "platearbeider-og-sveiser",
  oldCodePrefix: "KLIMA-",
  newCodePrefix: "PLATEARBEIDER-OG-SVEISER-",
  titles: TITLES,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
