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

const vg3Maritim = resolveLarefagFromKolonne3Selection({
  programSlug: "electrician-vg3-maritim-elektriker-vestland",
  programTitle: "VG3 Maritim elektriker",
  title: "VG3 Maritim elektriker",
});
if (vg3Maritim?.code !== "MARITIM_ELEKTRIKERFAGET") {
  failed += 1;
  console.error(
    `FAIL VG3 Maritim elektriker slug: expected MARITIM_ELEKTRIKERFAGET, got ${vg3Maritim?.code ?? "null"}`
  );
} else {
  console.log(`OK VG3 Maritim elektriker -> ${vg3Maritim.code}`);
}

const MECHANIC_KJORETOY_FAG = [
  {
    title: "Motormekanikerfaget",
    programmeUrl:
      "/nb/vestland/yrker/v.tp/kjoretoy?kurs=v.tptip1----_v.tpkjt2----_v.tpmme3----_",
    expectedCode: "MOTORMEKANIKERFAGET",
  },
  {
    title: "Bilfaget, lette kjøretøy",
    programmeUrl:
      "/nb/vestland/yrker/v.tp/bilfaget-lette-kjoretoy?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----_",
    expectedCode: "BILFAGET_LETTE_KJORETOY",
  },
  {
    title: "Truck- og liftmekanikerfaget",
    programmeUrl:
      "/nb/vestland/yrker/v.tp/truck-og-liftmekanikerfaget?kurs=v.tptip1----_v.tpkjt2----_v.tptlm3----_",
    expectedCode: "TRUCK_OG_LIFTMEKANIKERFAGET",
  },
];

for (const fixture of MECHANIC_KJORETOY_FAG) {
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

const PLUMBER_RORLEGGER_FAG = {
  title: "Rørleggerfaget",
  programmeUrl:
    "/nb/vestland/yrker/v.ba/bygg-og-anleggsteknikk?kurs=v.babat1----_v.barlf2----_v.barlf3----_",
  expectedCode: "RORLEGGERFAGET",
};

{
  const programSlug = `kolonne3-${slugify(PLUMBER_RORLEGGER_FAG.title)}`;
  const resolved = resolveLarefagFromKolonne3Selection({
    programSlug,
    programTitle: PLUMBER_RORLEGGER_FAG.title,
    title: PLUMBER_RORLEGGER_FAG.title,
    programmeUrl: PLUMBER_RORLEGGER_FAG.programmeUrl,
  });
  if (resolved?.code !== PLUMBER_RORLEGGER_FAG.expectedCode) {
    failed += 1;
    console.error(
      `FAIL ${PLUMBER_RORLEGGER_FAG.title}: expected ${PLUMBER_RORLEGGER_FAG.expectedCode}, got ${resolved?.code ?? "null"}`
    );
  } else {
    console.log(`OK ${PLUMBER_RORLEGGER_FAG.title} -> ${resolved.code}`);
  }
}

const plumberProfessionDefault = resolveLarefagFromKolonne3Selection({
  programSlug: "plumber-vg3-rorleggerfaget-vestland",
  programTitle: "VG3 Rørleggerfaget",
  title: "Rørleggerfaget",
});
if (plumberProfessionDefault?.code !== "RORLEGGERFAGET") {
  failed += 1;
  console.error(
    `FAIL plumber VG3 slug: expected RORLEGGERFAGET, got ${plumberProfessionDefault?.code ?? "null"}`
  );
} else {
  console.log(`OK plumber VG3 slug -> ${plumberProfessionDefault.code}`);
}

if (failed > 0) {
  process.exit(1);
}
console.log("kolonne3-larefag-mapping smoke passed");
