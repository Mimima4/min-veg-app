import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_LIST_URL = "https://data-nsr.udir.no/v4/enheter";
const PAGE_SIZE = 1000;

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9æøå ]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildInstitutionSlug(detail) {
  const base = slugify(detail.Navn);
  const kommune = slugify(detail.Kommune?.Navn ?? "");
  const orgnr = String(detail.Organisasjonsnummer ?? "").toLowerCase();
  return [base, kommune, orgnr].filter(Boolean).join("-");
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWebsite(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.includes("@")) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isPrivateSchool(detail) {
  if (detail.ErPrivatskole === true) return true;

  const name = normalize(detail.Navn);

  const privateSignals = [
    "akademiet",
    "wang",
    "montessori",
    "bibelskolen",
    "as",
  ];

  return privateSignals.some((signal) => name.includes(signal));
}

function isRouteRelevant(detail) {
  const name = normalize(detail.Navn);
  const municipalityName = normalize(detail.Kommune?.Navn ?? "");
  const countryCode = "NO";

  if (!detail.ErAktiv || !detail.ErVideregaaendeSkole) {
    return false;
  }

  // foreign schools are stored, but not used in family/child route v1
  if (countryCode !== "NO" || municipalityName.includes("utlandet")) {
    return false;
  }

  const blockedTerms = [
    "privatisteksamen",
    "eksamenskontoret",
    "fengsel",
    "ila fengsel",
  ];

  if (blockedTerms.some((term) => name.includes(term))) {
    return false;
  }

  return true;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed ${url}: ${res.status} ${text.slice(0, 500)}`);
  }

  return res.json();
}

async function fetchAllUnits() {
  const all = [];
  let page = 1;

  while (true) {
    const url = `${BASE_LIST_URL}?sidenummer=${page}&antallPerSide=${PAGE_SIZE}`;
    const data = await fetchJson(url);
    const units = data.EnhetListe ?? [];
    if (units.length === 0) break;

    all.push(...units);

    if (units.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
}

async function upsertInstitution(detail) {
  const orgnr = detail.Organisasjonsnummer ?? null;
  const website = normalizeWebsite(detail.Internettadresse);

  const payload = {
    slug: buildInstitutionSlug(detail),
    name: detail.Navn,
    institution_type: "upper_secondary",
    website_url: website,
    country_code: "NO",
    county_code: detail.Fylke?.Fylkesnummer ?? "unknown",
    municipality_code: detail.Kommune?.Kommunenummer ?? "unknown",
    municipality_name: detail.Kommune?.Navn ?? "Unknown",
    is_active: detail.ErAktiv === true,
    nsr_organisasjonsnummer: orgnr,
    source: "nsr",
    is_route_relevant: isRouteRelevant(detail),
    is_private_school: isPrivateSchool(detail),
  };

  const { error } = await supabase
    .from("education_institutions")
    .upsert(payload, {
      onConflict: "nsr_organisasjonsnummer",
    });

  if (error) throw error;
}

async function run() {
  const units = await fetchAllUnits();

  const vgs = units.filter(
    (u) => u.ErVideregaaendeSkole === true && u.ErAktiv === true
  );
  const osloInSource = vgs.filter(
    (u) => String(u.Fylke?.Fylkesnummer ?? "") === "03"
  );
  const filteredOut = {
    notActiveOrNotVgs: 0,
    outsideNorwayOrUtlandet: 0,
    blockedTerm: 0,
  };

  let upserted = 0;
  let osloWritten = 0;

  for (const unit of vgs) {
    const detail = await fetchJson(
      `https://data-nsr.udir.no/v4/enhet/${unit.Organisasjonsnummer}`
    );

    if (!detail.ErAktiv || !detail.ErVideregaaendeSkole) {
      filteredOut.notActiveOrNotVgs += 1;
      continue;
    }

    const municipalityName = normalize(detail.Kommune?.Navn ?? "");
    if (municipalityName.includes("utlandet")) {
      filteredOut.outsideNorwayOrUtlandet += 1;
      continue;
    }

    const name = normalize(detail.Navn);
    const blockedTerms = [
      "privatisteksamen",
      "eksamenskontoret",
      "fengsel",
      "ila fengsel",
    ];
    if (blockedTerms.some((term) => name.includes(term))) {
      filteredOut.blockedTerm += 1;
      continue;
    }

    await upsertInstitution(detail);

    console.log(
      `UPSERTED: ${detail.Navn} | route_relevant=${isRouteRelevant(detail)} | website=${normalizeWebsite(detail.Internettadresse) ?? "null"}`
    );

    upserted += 1;
    if (String(detail.Fylke?.Fylkesnummer ?? "") === "03") {
      osloWritten += 1;
    }
  }

  console.log("\nDONE");
  console.log("Total NSR schools fetched:", units.length);
  console.log("Total active VGS in source:", vgs.length);
  console.log("Oslo schools detected in source:", osloInSource.length);
  console.log("Oslo schools written to DB:", osloWritten);
  console.log(
    "Filtered out:",
    filteredOut.notActiveOrNotVgs +
      filteredOut.outsideNorwayOrUtlandet +
      filteredOut.blockedTerm
  );
  console.log("Filtered out (not active/not vgs):", filteredOut.notActiveOrNotVgs);
  console.log(
    "Filtered out (outside Norway/utlandet):",
    filteredOut.outsideNorwayOrUtlandet
  );
  console.log("Filtered out (blocked term):", filteredOut.blockedTerm);
  console.log("upserted:", upserted);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});