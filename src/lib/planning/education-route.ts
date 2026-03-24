import type { SupportedLocale } from "@/lib/i18n/site-copy";

export type EducationLevel =
  | "open"
  | "certificate"
  | "vocational"
  | "bachelor"
  | "master"
  | "flexible";

const EDUCATION_LEVEL_LABELS: Record<
  EducationLevel,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  certificate: {
    nb: "Sertifikat",
    nn: "Sertifikat",
    en: "Certificate",
  },
  vocational: {
    nb: "Yrkesfaglig",
    nn: "Yrkesfagleg",
    en: "Vocational",
  },
  bachelor: {
    nb: "Bachelor",
    nn: "Bachelor",
    en: "Bachelor",
  },
  master: {
    nb: "Master",
    nn: "Master",
    en: "Master",
  },
  flexible: {
    nb: "Fleksibel",
    nn: "Fleksibel",
    en: "Flexible",
  },
};

const EDUCATION_ROUTE_COPY: Record<
  EducationLevel,
  Record<
    SupportedLocale,
    {
      routeTitle: string;
      routeDescription: string;
    }
  >
> = {
  open: {
    nb: {
      routeTitle: "Åpen studieretning",
      routeDescription:
        "Det er ennå ikke låst til ett tydelig utdanningsnivå. De sterkeste signalene peker fortsatt mer mot utforskning enn mot én fast studieplan.",
    },
    nn: {
      routeTitle: "Open studieretning",
      routeDescription:
        "Det er enno ikkje låst til eitt tydeleg utdanningsnivå. Dei sterkaste signala peikar framleis meir mot utforsking enn mot éin fast studieplan.",
    },
    en: {
      routeTitle: "Open study route",
      routeDescription:
        "No single study level is locked in yet. The strongest signals still point more toward exploration than one fixed education path.",
    },
  },
  certificate: {
    nb: {
      routeTitle: "Kort kurs- eller sertifikatløp",
      routeDescription:
        "Denne retningen passer ofte med kortere programmer, sertifikater eller praktiske opplæringsløp som gir en rask og konkret start.",
    },
    nn: {
      routeTitle: "Kort kurs- eller sertifikatløp",
      routeDescription:
        "Denne retninga passar ofte med kortare program, sertifikat eller praktiske opplæringsløp som gir ein rask og konkret start.",
    },
    en: {
      routeTitle: "Short course or certificate path",
      routeDescription:
        "This direction often fits shorter programmes, certifications, or practical training routes that provide a faster and more concrete start.",
    },
  },
  vocational: {
    nb: {
      routeTitle: "Yrkesfaglig løp",
      routeDescription:
        "Denne retningen peker ofte mot et mer praktisk utdanningsløp med tydelig kobling mellom skole, ferdigheter og senere arbeid.",
    },
    nn: {
      routeTitle: "Yrkesfagleg løp",
      routeDescription:
        "Denne retninga peikar ofte mot eit meir praktisk utdanningsløp med tydeleg kopling mellom skule, ferdigheiter og seinare arbeid.",
    },
    en: {
      routeTitle: "Vocational route",
      routeDescription:
        "This direction often points toward a more practical education route with a clearer connection between school, hands-on skill building, and later work.",
    },
  },
  bachelor: {
    nb: {
      routeTitle: "Bachelorløp",
      routeDescription:
        "De sterkeste matchene peker ofte mot et mer akademisk løp der videregående etterfølges av bachelorstudier eller tilsvarende høyere utdanning.",
    },
    nn: {
      routeTitle: "Bachelorløp",
      routeDescription:
        "Dei sterkaste matchane peikar ofte mot eit meir akademisk løp der vidaregåande blir følgt av bachelorstudiar eller tilsvarande høgare utdanning.",
    },
    en: {
      routeTitle: "Bachelor path",
      routeDescription:
        "The strongest matches often lean toward a more academic route where upper secondary education is followed by a bachelor degree or equivalent higher study.",
    },
  },
  master: {
    nb: {
      routeTitle: "Videre akademisk løp",
      routeDescription:
        "Denne retningen peker ofte mot et lengre akademisk løp der bachelor kan være et mellomtrinn før mer avansert utdanning.",
    },
    nn: {
      routeTitle: "Vidare akademisk løp",
      routeDescription:
        "Denne retninga peikar ofte mot eit lengre akademisk løp der bachelor kan vere eit mellomsteg før meir avansert utdanning.",
    },
    en: {
      routeTitle: "Advanced academic path",
      routeDescription:
        "This direction often points toward a longer academic route where bachelor study may be a midpoint before more advanced education.",
    },
  },
  flexible: {
    nb: {
      routeTitle: "Fleksibelt studieløp",
      routeDescription:
        "Denne retningen kan passe flere typer utdanningsløp. Det viktigste er å holde flere dører åpne mens barnet utforsker videre.",
    },
    nn: {
      routeTitle: "Fleksibelt studieløp",
      routeDescription:
        "Denne retninga kan passe fleire typar utdanningsløp. Det viktigaste er å halde fleire dører opne medan barnet utforskar vidare.",
    },
    en: {
      routeTitle: "Flexible study path",
      routeDescription:
        "This direction can fit more than one type of education route. The key is to keep multiple doors open while the child continues to explore.",
    },
  },
};

const EDUCATION_LEVEL_PRIORITY: EducationLevel[] = [
  "vocational",
  "bachelor",
  "certificate",
  "master",
  "flexible",
  "open",
];

function isEducationLevel(value: string): value is EducationLevel {
  return (
    value === "open" ||
    value === "certificate" ||
    value === "vocational" ||
    value === "bachelor" ||
    value === "master" ||
    value === "flexible"
  );
}

export function getEducationLevelLabel(
  value: EducationLevel,
  locale: SupportedLocale
): string {
  return EDUCATION_LEVEL_LABELS[value][locale];
}

export function getEducationRouteCopy(
  value: EducationLevel,
  locale: SupportedLocale
): {
  routeTitle: string;
  routeDescription: string;
} {
  return EDUCATION_ROUTE_COPY[value][locale];
}

export function getLikelyEducationLevel({
  professionEducationLevels,
  preferredEducationLevel,
}: {
  professionEducationLevels: string[];
  preferredEducationLevel: EducationLevel;
}): EducationLevel {
  const validLevels = professionEducationLevels.filter(isEducationLevel);

  if (
    preferredEducationLevel !== "open" &&
    validLevels.includes(preferredEducationLevel)
  ) {
    return preferredEducationLevel;
  }

  if (validLevels.length === 0) {
    return preferredEducationLevel !== "open" ? preferredEducationLevel : "open";
  }

  const counts = new Map<EducationLevel, number>();

  for (const level of validLevels) {
    counts.set(level, (counts.get(level) ?? 0) + 1);
  }

  let bestLevel: EducationLevel = "open";
  let bestCount = -1;

  for (const level of EDUCATION_LEVEL_PRIORITY) {
    const count = counts.get(level) ?? 0;

    if (count > bestCount) {
      bestLevel = level;
      bestCount = count;
    }
  }

  return bestLevel;
}