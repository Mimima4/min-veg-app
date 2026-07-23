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

const PAINTER_FAG = [
  {
    title: "Industrimalerfaget",
    programmeUrl:
      "/nb/ostfold/yrker/v.ba/bygg-og-anleggsteknikk?kurs=v.babat1----_v.baoft2----_v.baimf3----_",
    expectedCode: "INDUSTRIMALERFAGET",
  },
  {
    title: "Maler- og overflateteknikkfaget",
    programmeUrl:
      "/nb/ostfold/yrker/v.ba/bygg-og-anleggsteknikk?kurs=v.babat1----_v.baoft2----_v.bamot3----_",
    expectedCode: "MALER_OG_OVERFLATETEKNIKKFAGET",
  },
];

for (const fixture of PAINTER_FAG) {
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

const ANLEGGSTEKNIKK_FAG = [
  {
    title: "Anleggsmaskinførerfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/anleggsmaskinforerfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.baamf3----_",
    expectedCode: "ANLEGGSMASKINFORERFAGET",
  },
  {
    title: "Anleggsrørleggerfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/anleggsrorleggerfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.baarl3----_",
    expectedCode: "ANLEGGRORLEGGERFAGET",
  },
  {
    title: "Asfaltfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/asfaltfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.baasf3----_",
    expectedCode: "ASFALTFAGET",
  },
  {
    title: "Banemontørfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/banemontorfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.baban3----_",
    expectedCode: "BANEMONTORFAGET",
  },
  {
    title: "Brønn- og borefaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/bronn-og-borefaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.babro3----_",
    expectedCode: "BRONN_OG_BOREFAGET",
  },
  {
    title: "Fjell- og bergverksfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/fjell-og-bergverksfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.bafje3----_",
    expectedCode: "FJELL_OG_BERGVERKSFAGET",
  },
  {
    title: "Fundamenteringsfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/fundamenteringsfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.bafun3----_",
    expectedCode: "FUNDAMENTERINGSFAGET",
  },
  {
    title: "Vei- og anleggsfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/vei-og-anleggsfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.bavoa3----_",
    expectedCode: "VEG_OG_ANLEGGSFAGET",
  },
  {
    title: "Veidrift- og veivedlikeholdsfaget",
    programmeUrl:
      "/nb/vestland/strukturkart/V.BA/veidrift-og-veivedlikeholdsfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.bavov3----_",
    expectedCode: "VEIDRIFT_OG_VEIVEDLIKEHOLDSFAGET",
  },
];

for (const fixture of ANLEGGSTEKNIKK_FAG) {
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

const anleggProfessionDefault = resolveLarefagFromKolonne3Selection({
  programSlug: "anleggsteknikk-vg3-anleggsmaskinforer-vestland",
  programTitle: "VG3 Anleggsmaskinførerfaget",
  title: "Anleggsmaskinførerfaget",
});
if (anleggProfessionDefault?.code !== "ANLEGGSMASKINFORERFAGET") {
  failed += 1;
  console.error(
    `FAIL anleggsteknikk VG3 slug: expected ANLEGGSMASKINFORERFAGET, got ${anleggProfessionDefault?.code ?? "null"}`
  );
} else {
  console.log(`OK anleggsteknikk VG3 slug -> ${anleggProfessionDefault.code}`);
}

const murerProfessionDefault = resolveLarefagFromKolonne3Selection({
  programSlug: "murer-vg3-murer-og-flislegger-vestland",
  programTitle: "VG3 Murer- og flisleggerfaget",
  title: "Murer- og flisleggerfaget",
});
if (murerProfessionDefault?.code !== "MURER_OG_FLISLEGGERFAGET") {
  failed += 1;
  console.error(
    `FAIL murer VG3 slug: expected MURER_OG_FLISLEGGERFAGET, got ${murerProfessionDefault?.code ?? "null"}`
  );
} else {
  console.log(`OK murer VG3 slug -> ${murerProfessionDefault.code}`);
}

const anleggsgartnerProfessionDefault = resolveLarefagFromKolonne3Selection({
  programSlug: "anleggsgartner-vg3-anleggsgartner-vestland",
  programTitle: "VG3 Anleggsgartnerfaget",
  title: "Anleggsgartnerfaget",
});
if (anleggsgartnerProfessionDefault?.code !== "ANLEGGSGARTNERFAGET") {
  failed += 1;
  console.error(
    `FAIL anleggsgartner VG3 slug: expected ANLEGGSGARTNERFAGET, got ${anleggsgartnerProfessionDefault?.code ?? "null"}`
  );
} else {
  console.log(`OK anleggsgartner VG3 slug -> ${anleggsgartnerProfessionDefault.code}`);
}

const treteknikkProfessionDefault = resolveLarefagFromKolonne3Selection({
  programSlug: "treteknikk-vg3-snekker-vestland",
  programTitle: "VG3 Snekkerfaget",
  title: "Snekkerfaget",
});
if (treteknikkProfessionDefault?.code !== "SNEKKERFAGET") {
  failed += 1;
  console.error(
    `FAIL treteknikk VG3 slug: expected SNEKKERFAGET, got ${treteknikkProfessionDefault?.code ?? "null"}`
  );
} else {
  console.log(`OK treteknikk VG3 slug -> ${treteknikkProfessionDefault.code}`);
}

const betongFag = resolveLarefagFromKolonne3Selection({
  programSlug: "kolonne3-betongfaget",
  programTitle: "Betongfaget",
  title: "Betongfaget",
});
if (betongFag?.code !== "BETONGFAGET") {
  failed += 1;
  console.error(`FAIL Betongfaget: expected BETONGFAGET, got ${betongFag?.code ?? "null"}`);
} else {
  console.log(`OK Betongfaget -> ${betongFag.code}`);
}

const anleggRorleggerUrl = resolveLarefagFromKolonne3Selection({
  programSlug: "kolonne3-anleggsrorleggerfaget",
  programTitle: "Anleggsrørleggerfaget",
  title: "Anleggsrørleggerfaget",
  programmeUrl:
    "/nb/vestland/strukturkart/V.BA/anleggsrorleggerfaget-skoler-og-laerebedrifter?kurs=v.babat1----_v.baanl2----_v.baarl3----_",
});
if (anleggRorleggerUrl?.code !== "ANLEGGRORLEGGERFAGET") {
  failed += 1;
  console.error(
    `FAIL Anleggsrørlegger URL must not collapse to RORLEGGERFAGET: got ${anleggRorleggerUrl?.code ?? "null"}`
  );
} else {
  console.log(`OK Anleggsrørlegger URL -> ${anleggRorleggerUrl.code}`);
}

const industrimalerTitleOnly = resolveLarefagFromKolonne3Selection({
  programSlug: "kolonne3-industrimalerfaget",
  programTitle: "Industrimalerfaget",
  title: "Industrimalerfaget",
});
if (industrimalerTitleOnly?.code !== "INDUSTRIMALERFAGET") {
  failed += 1;
  console.error(
    `FAIL title-only Industrimalerfaget: expected INDUSTRIMALERFAGET, got ${industrimalerTitleOnly?.code ?? "null"}`
  );
} else {
  console.log(`OK title-only Industrimalerfaget -> ${industrimalerTitleOnly.code}`);
}

if (failed > 0) {
  process.exit(1);
}
console.log("kolonne3-larefag-mapping smoke passed");
