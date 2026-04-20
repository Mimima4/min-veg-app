import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIST_URL =
  "https://data-nsr.udir.no/v4/enheter?sidenummer=1&antallPerSide=1000";

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9æøå ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed ${url}: ${res.status} ${text.slice(0, 500)}`);
  }

  return res.json();
}

async function getActiveVgsUnits() {
  const data = await fetchJson(LIST_URL);
  const units = data.EnhetListe ?? [];

  return units.filter(
    (u) => u.ErVideregaaendeSkole === true && u.ErAktiv === true
  );
}

async function fetchUnitDetail(orgnr) {
  return fetchJson(`https://data-nsr.udir.no/v4/enhet/${orgnr}`);
}

async function getCurrentInstitutions() {
  const { data, error } = await supabase
    .from("education_institutions")
    .select("id, name, municipality_name, municipality_code, website_url, nsr_organisasjonsnummer");

  if (error) throw error;
  return data ?? [];
}

function findInstitutionMatch(unit, institutions) {
  const orgnr = unit.Organisasjonsnummer ?? null;
  if (!orgnr) return null;

  const byOrgnr = institutions.find(
    (row) => row.nsr_organisasjonsnummer && row.nsr_organisasjonsnummer === orgnr
  );
  if (byOrgnr) return byOrgnr;

  const unitName = normalize(unit.Navn);
  const kommune = unit.Kommune?.Navn ?? null;
  const kommuneNorm = normalize(kommune);

  const exact = institutions.find((row) => {
    return (
      normalize(row.name) === unitName &&
      normalize(row.municipality_name) === kommuneNorm
    );
  });

  if (exact) return exact;

  return null;
}

async function updateInstitution(rowId, payload) {
  const { error } = await supabase
    .from("education_institutions")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rowId);

  if (error) throw error;
}

async function run() {
  const units = await getActiveVgsUnits();
  const institutions = await getCurrentInstitutions();

  let matched = 0;
  let skipped = 0;
  let updated = 0;

  for (const unit of units) {
    const match = findInstitutionMatch(unit, institutions);

    if (!match) {
      console.log(`SKIP no DB match: ${unit.Navn} (${unit.Kommune?.Navn ?? "unknown"})`);
      skipped += 1;
      continue;
    }

    const detail = await fetchUnitDetail(unit.Organisasjonsnummer);

    const payload = {
      nsr_organisasjonsnummer: detail.Organisasjonsnummer ?? unit.Organisasjonsnummer ?? null,
      name: match.name,
      municipality_name: detail.Kommune?.Navn ?? match.municipality_name ?? null,
      municipality_code: detail.Kommune?.Kommunenummer ?? match.municipality_code ?? null,
      website_url: detail.Internettadresse ?? match.website_url ?? null,
    };

    await updateInstitution(match.id, payload);

    console.log(
      `UPDATED: ${match.name} -> orgnr=${payload.nsr_organisasjonsnummer} website=${payload.website_url ?? "null"}`
    );

    matched += 1;
    updated += 1;
  }

  console.log("\nDONE");
  console.log("matched:", matched);
  console.log("updated:", updated);
  console.log("skipped:", skipped);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});