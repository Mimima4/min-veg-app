#!/usr/bin/env node
/**
 * Smoke: kolonne-3 fag → canonical larefag mapping (Oslo electrician fixtures).
 */
import { resolveLarefagFromKolonne3Selection } from "../src/lib/larebedrift/kolonne3-larefag-mapping.ts";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const OSLO_ELECTRICIAN_FAG = [
  {
    title: "Maritim elektriker",
    programmeUrl:
      "/nb/oslo/yrker/v.el/elektro-og-datateknologi?kurs=v.elele1----_v.elele2----_v.elmel3----_",
    expectedCode: "MARITIM_ELEKTRIKERFAGET",
  },
  {
    title: "Elektrikerfaget",
    programmeUrl:
      "/nb/oslo/yrker/v.el/elektro-og-datateknologi?kurs=v.elele1----_v.elele2----_v.elele3----_",
    expectedCode: "ELEKTRIKERFAGET",
  },
  {
    title: "Elektroreparatørfaget",
    programmeUrl:
      "/nb/oslo/yrker/v.el/elektro-og-datateknologi?kurs=v.elele1----_v.elele2----_v.elerf3----_",
    expectedCode: "ELEKTROREPARATORFAGET",
  },
  {
    title: "Telekommunikasjonsmontørfaget",
    programmeUrl:
      "/nb/oslo/yrker/v.el/elektro-og-datateknologi?kurs=v.elele1----_v.elele2----_v.eltel3----_",
    expectedCode: "TELEKOMMUNIKASJONSMONTORFAGET",
  },
];

let failed = 0;
for (const fixture of OSLO_ELECTRICIAN_FAG) {
  const programSlug = `kolonne3-${slugify(fixture.title)}`;
  const resolved = resolveLarefagFromKolonne3Selection({
    programSlug,
    programTitle: fixture.title,
    title: fixture.title,
    programmeUrl: fixture.programmeUrl,
  });
  if (resolved?.code !== fixture.expectedCode) {
    failed += 1;
    console.error(
      `FAIL ${fixture.title}: expected ${fixture.expectedCode}, got ${resolved?.code ?? "null"}`
    );
  } else {
    console.log(`OK ${fixture.title} -> ${resolved.code}`);
  }
}

// Without programmeUrl, title-only must not collapse unrelated fag to elektrikerfaget.
const withoutUrl = resolveLarefagFromKolonne3Selection({
  programSlug: "kolonne3-elektroreparatorfaget",
  programTitle: "Elektroreparatørfaget",
  title: "Elektroreparatørfaget",
});
if (withoutUrl?.code !== "ELEKTROREPARATORFAGET") {
  failed += 1;
  console.error(`FAIL slug-only Elektroreparatørfaget: got ${withoutUrl?.code ?? "null"}`);
} else {
  console.log(`OK slug-only Elektroreparatørfaget -> ${withoutUrl.code}`);
}

if (failed > 0) {
  process.exit(1);
}
console.log("kolonne3-larefag-mapping smoke passed");
