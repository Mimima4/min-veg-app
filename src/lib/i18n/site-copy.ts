export type SupportedLocale = "nb" | "nn" | "en";

type SiteCopy = {
  heroTitle: string;
  heroSubtitle: string;
  shortExplanation: string;
  ctas: {
    tryDemo: string;
    viewPricing: string;
    createAccount: string;
    openPreview: string;
  };
  features: [
    { title: string; description: string },
    { title: string; description: string },
    { title: string; description: string },
  ];
  footerNote: string;
  loginPrompt?: string;
};

const SITE_COPY: Record<SupportedLocale, SiteCopy> = {
  nb: {
    heroTitle: "Min Veg",
    heroSubtitle: "En rolig vei fremover for foreldre og skoler.",
    shortExplanation:
      "Planlegg reisen sammen — i dag, for læring i morgen.",
    ctas: {
      tryDemo: "Prøv demo",
      viewPricing: "Se priser",
      createAccount: "Opprett konto",
      openPreview: "Åpne forhåndsvisning",
    },
    features: [
      {
        title: "For foreldre",
        description:
          "Få oversikt, hold tempoet, og vær trygg på neste steg.",
      },
      {
        title: "For skoler",
        description:
          "Samordne støtte og følg utviklingen med ett blikk.",
      },
      {
        title: "For fremtidsplanlegging",
        description:
          "Gjør mål om til en enkel plan du kan gå tilbake til når som helst.",
      },
    ],
    footerNote:
      "Nordic trust-first. Rent, rolig og enkelt å bruke.",
    loginPrompt: "Har du allerede en konto? Gå til Login.",
  },
  nn: {
    heroTitle: "Min Veg",
    heroSubtitle: "Ein roleg veg framover for foreldre og skular.",
    shortExplanation:
      "Planlegg reisa saman — i dag, for læring i morgon.",
    ctas: {
      tryDemo: "Prøv demo",
      viewPricing: "Sjå prisar",
      createAccount: "Opprett konto",
      openPreview: "Opne førehandsvising",
    },
    features: [
      {
        title: "For foreldre",
        description:
          "Få oversikt, hald fram, og kjenn deg trygg på neste steg.",
      },
      {
        title: "For skular",
        description:
          "Samordna støtte og følg utviklinga med eitt blikk.",
      },
      {
        title: "For framtidsplanlegging",
        description:
          "Gjer mål om til ein enkel plan du kan sjå igjen når som helst.",
      },
    ],
    footerNote:
      "Nordisk trust-first. Reint, roleg og lett å bruke.",
    loginPrompt: "Har du allereie ein konto? Gå til Login.",
  },
  en: {
    heroTitle: "Min Veg",
    heroSubtitle: "A calm path forward for parents and schools.",
    shortExplanation:
      "Plan the journey together — today, for learning tomorrow.",
    ctas: {
      tryDemo: "Try demo",
      viewPricing: "View pricing",
      createAccount: "Create account",
      openPreview: "Open preview",
    },
    features: [
      {
        title: "For parents",
        description:
          "Get clarity, keep momentum, and feel confident about next steps.",
      },
      {
        title: "For schools",
        description:
          "Coordinate support and follow progress at a glance.",
      },
      {
        title: "For future planning",
        description:
          "Turn goals into a simple plan you can revisit anytime.",
      },
    ],
    footerNote:
      "Nordic trust-first. Calm, minimal, and easy to explore.",
    loginPrompt: "Already have an account? Go to Login.",
  },
};

export function getSiteCopy(locale: SupportedLocale): SiteCopy {
  return SITE_COPY[locale];
}