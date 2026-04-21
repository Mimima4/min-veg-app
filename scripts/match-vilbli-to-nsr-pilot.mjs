import { createClient } from "@supabase/supabase-js";

const VILBLI_SCHOOLS = [
  "Bjørnholt videregående skole",
  "Elvebakken videregående skole",
  "Etterstad videregående skole",
  "Kuben videregående skole",
  "Ullern videregående skole",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function assertEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  return normalizeBasic(value)
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregående skole\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coreName(value) {
  return normalizeName(value);
}

function tokens(value) {
  return normalizeName(value)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

function classifyMatch(vilbliName, institution) {
  const vilbliNorm = normalizeName(vilbliName);
  const nsrNorm = normalizeName(institution.name);

  if (vilbliNorm && nsrNorm && vilbliNorm === nsrNorm) {
    return {
      matchType: "exact",
      confidence: "high",
      score: 1,
    };
  }

  const vilbliCore = coreName(vilbliName);
  const nsrCore = coreName(institution.name);
  if (vilbliCore && nsrCore && vilbliCore === nsrCore) {
    return {
      matchType: "core",
      confidence: "medium",
      score: 0.9,
    };
  }

  const vt = tokens(vilbliName);
  const nt = tokens(institution.name);
  const shared = vt.find((token) => token.length >= 4 && nt.includes(token));
  if (shared) {
    return {
      matchType: "fuzzy",
      confidence: "low",
      score: 0.6,
    };
  }

  return {
    matchType: "none",
    confidence: "low",
    score: 0,
  };
}

async function fetchOsloNsrSchools() {
  const { data, error } = await supabase
    .from("education_institutions")
    .select("id, name")
    .eq("source", "nsr")
    .eq("county_code", "03");
  if (error) throw error;
  return data ?? [];
}

function findBestMatch(vilbliName, institutions) {
  let best = null;
  for (const institution of institutions) {
    const candidate = classifyMatch(vilbliName, institution);
    if (!best || candidate.score > best.score) {
      best = { institution, ...candidate };
    }
  }

  if (!best || best.matchType === "none") {
    return {
      vilbliName,
      institutionId: null,
      institutionName: null,
      matchType: "none",
      confidence: "low",
    };
  }

  return {
    vilbliName,
    institutionId: best.institution.id,
    institutionName: best.institution.name,
    matchType: best.matchType,
    confidence: best.confidence,
  };
}

async function run() {
  assertEnv();
  const institutions = await fetchOsloNsrSchools();
  console.log("=== MATCH RESULT ===\n");

  for (const vilbliName of VILBLI_SCHOOLS) {
    const result = findBestMatch(vilbliName, institutions);

    console.log(`Vilbli: ${result.vilbliName}`);
    console.log(`NSR: ${result.institutionName ?? "null"}`);
    console.log(`institutionId: ${result.institutionId ?? "null"}`);
    console.log(`matchType: ${result.matchType}`);
    console.log(`confidence: ${result.confidence}`);
    console.log("");
  }
}

run().catch((error) => {
  console.error("Pilot matcher failed:", error.message);
  process.exit(1);
});
