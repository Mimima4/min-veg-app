#!/usr/bin/env node
/**
 * Anlegg VG2 — relocation `maybe` before/after analytics by home fylke.
 *
 * BEFORE: haversine ≤ 400 km (legacy P-8)
 * AFTER:  Entur bus+rail network km soft band (≤500 normal, 500–550 soft, >550 deny)
 *
 * Usage:
 *   npm run analytics:anlegg-maybe-pt-reach
 */
import { createClient } from "@supabase/supabase-js";

const FYLKE_CODES = [
  "03",
  "11",
  "15",
  "18",
  "31",
  "32",
  "33",
  "34",
  "39",
  "40",
  "42",
  "46",
  "50",
  "55",
  "56",
];

/** Representative home kommune per fylke (admin / regional hub). */
const HOME_KOMMUNE_BY_FYLKE = {
  "03": { code: "0301", label: "Oslo" },
  "11": { code: "1103", label: "Stavanger" },
  "15": { code: "1508", label: "Ålesund" },
  "18": { code: "1804", label: "Bodø" },
  "31": { code: "3107", label: "Fredrikstad" },
  "32": { code: "3201", label: "Bærum" },
  "33": { code: "3301", label: "Drammen" },
  "34": { code: "3401", label: "Kongsvinger" },
  "39": { code: "3901", label: "Horten" },
  "40": { code: "4001", label: "Porsgrunn" },
  "42": { code: "4203", label: "Arendal" },
  "46": { code: "4601", label: "Bergen" },
  "50": { code: "5001", label: "Trondheim" },
  "55": { code: "5501", label: "Tromsø" },
  "56": { code: "5601", label: "Alta" },
};

const LEGACY_HAVERSINE_MAX_KM = 400;
const SOFT_MAX = 500;
const HARD_MAX = 550;
const ENTUR_JP = "https://api.entur.io/journey-planner/v3/graphql";
const ENTUR_GEO = "https://api.entur.io/geocoder/v1/autocomplete";
const CLIENT = process.env.ENTUR_CLIENT_NAME?.trim() || "min-veg-analytics";
const ALLOWED = new Set(["rail", "bus", "coach", "metro", "tram", "water", "ferry", "foot", "bicycle"]);
const FORBIDDEN = new Set(["air", "car", "taxi"]);

function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const MAX_HUB_KM = 45;

async function enturJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "ET-Client-Name": CLIENT,
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Entur ${response.status}`);
  return response.json();
}

function isUsableHub(id) {
  return (
    typeof id === "string" &&
    (id.startsWith("NSR:StopPlace:") || id.startsWith("NSR:GroupOfStopPlaces:"))
  );
}

async function resolveHub(municipalityName, focus) {
  for (const text of [
    municipalityName,
    `${municipalityName} stasjon`,
    `${municipalityName} rutebileterminal`,
    `${municipalityName} bussterminal`,
  ]) {
    const url = new URL(ENTUR_GEO);
    url.searchParams.set("text", text);
    url.searchParams.set("size", "10");
    url.searchParams.set("lang", "no");
    if (focus) {
      url.searchParams.set("focus.point.lat", String(focus.lat));
      url.searchParams.set("focus.point.lon", String(focus.lng));
    }
    try {
      const json = await enturJson(url.toString());
      const hubs = (json.features ?? [])
        .filter((f) => isUsableHub(f.properties?.id))
        .map((f) => {
          const lng = Number(f.geometry?.coordinates?.[0]);
          const lat = Number(f.geometry?.coordinates?.[1]);
          const distanceKm =
            focus && Number.isFinite(lat) && Number.isFinite(lng)
              ? haversineKm(focus, { lat, lng })
              : Number.POSITIVE_INFINITY;
          return { id: f.properties.id, name: f.properties.name, distanceKm };
        })
        .filter((h) => !focus || h.distanceKm <= MAX_HUB_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);
      if (hubs[0]) return hubs[0].id;
    } catch {
      continue;
    }
  }
  if (!focus) return null;
  const url = new URL("https://api.entur.io/geocoder/v1/reverse");
  url.searchParams.set("point.lat", String(focus.lat));
  url.searchParams.set("point.lon", String(focus.lng));
  url.searchParams.set("size", "15");
  url.searchParams.set("layers", "venue");
  url.searchParams.set("boundary.circle.radius", "25");
  try {
    const json = await enturJson(url.toString());
    const scored = (json.features ?? [])
      .filter((f) => String(f.properties?.id ?? "").startsWith("NSR:StopPlace:"))
      .map((f) => {
        const lng = Number(f.geometry?.coordinates?.[0]);
        const lat = Number(f.geometry?.coordinates?.[1]);
        const distanceKm = haversineKm(focus, { lat, lng });
        const name = f.properties?.name ?? "";
        let score = distanceKm;
        if (/terminal|stasjon|sentrum|kai/i.test(name)) score -= 5;
        return { id: f.properties.id, score, distanceKm };
      })
      .filter((h) => h.distanceKm <= MAX_HUB_KM)
      .sort((a, b) => a.score - b.score);
    return scored[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function kommuneDetail(code) {
  const response = await fetch(`https://ws.geonorge.no/kommuneinfo/v1/kommuner/${code}`);
  if (!response.ok) return null;
  return response.json();
}

function classify(km) {
  if (!(km >= 0)) return { admitted: false, soft: false, reason: "denied_no_pt" };
  if (km <= SOFT_MAX) return { admitted: true, soft: false, reason: "normal", km };
  if (km <= HARD_MAX) return { admitted: true, soft: true, reason: "soft", km };
  return { admitted: false, soft: false, reason: "denied_over_hard_max", km };
}

function bestPtKm(patterns) {
  let best = null;
  for (const pattern of patterns ?? []) {
    const modes = (pattern.legs ?? []).map((l) => String(l.mode ?? "").toLowerCase());
    if (modes.some((m) => FORBIDDEN.has(m))) continue;
    let metres = 0;
    let n = 0;
    for (const leg of pattern.legs ?? []) {
      const mode = String(leg.mode ?? "").toLowerCase();
      if (!ALLOWED.has(mode)) continue;
      if (typeof leg.distance !== "number" || !Number.isFinite(leg.distance)) continue;
      metres += leg.distance;
      n += 1;
    }
    if (n === 0) continue;
    const km = metres / 1000;
    if (best == null || km < best) best = km;
  }
  return best;
}

async function evaluatePt(homeCode, schoolCode, hubCache, nameCache) {
  if (homeCode === schoolCode) return { admitted: true, soft: false, reason: "same_kommune", km: 0 };

  async function hubFor(code) {
    if (hubCache.has(code)) return hubCache.get(code);
    let detail = nameCache.get(code);
    if (detail === undefined) {
      detail = await kommuneDetail(code);
      nameCache.set(code, detail);
    }
    const name = detail?.kommunenavnNorsk ?? detail?.kommunenavn ?? null;
    const coords = detail?.punktIOmrade?.coordinates;
    const focus =
      Array.isArray(coords) && coords.length >= 2
        ? { lng: coords[0], lat: coords[1] }
        : null;
    const hub = name ? await resolveHub(name, focus) : null;
    hubCache.set(code, hub);
    return hub;
  }

  try {
    const [from, to] = await Promise.all([hubFor(homeCode), hubFor(schoolCode)]);
    if (!from || !to) return { admitted: false, soft: false, reason: "denied_hub_unresolved", km: null };

    const query = `query Trip($from:String!,$to:String!,$dateTime:DateTime!){
      trip(from:{place:$from},to:{place:$to},dateTime:$dateTime,arriveBy:false,numTripPatterns:6){
        tripPatterns{ duration legs{ mode distance } }
      }
    }`;
    const json = await enturJson(ENTUR_JP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: {
          from,
          to,
          dateTime: "2026-08-18T10:00:00+02:00",
        },
      }),
    });
    const patterns = json?.data?.trip?.tripPatterns ?? [];
    const km = bestPtKm(patterns);
    if (km == null) return { admitted: false, soft: false, reason: "denied_no_pt", km: null };
    return classify(km);
  } catch (error) {
    return {
      admitted: false,
      soft: false,
      reason: "denied_no_pt",
      km: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  const supabase = createClient(url, key);

  const { data: progs, error: progError } = await supabase
    .from("education_programs")
    .select("id, slug")
    .ilike("slug", "anleggsteknikk-vg2-anleggsteknikk-%")
    .eq("is_active", true);
  if (progError) throw new Error(progError.message);

  const programIds = (progs ?? []).map((p) => p.id);
  const { data: psa, error: psaError } = await supabase
    .from("programme_school_availability")
    .select("county_code, institution_id, institutions:institution_id(name, municipality_code)")
    .in("education_program_id", programIds)
    .eq("stage", "VG2")
    .eq("is_active", true)
    .eq("availability_scope", "programme_in_school");
  if (psaError) throw new Error(psaError.message);

  const schools = [];
  for (const row of psa ?? []) {
    const municipalityCode = String(row.institutions?.municipality_code ?? "")
      .trim()
      .padStart(4, "0");
    if (!municipalityCode || municipalityCode === "0000") continue;
    schools.push({
      countyCode: String(row.county_code ?? "").trim(),
      municipalityCode,
      name: row.institutions?.name ?? "?",
    });
  }
  schools.sort((a, b) => a.name.localeCompare(b.name, "nb"));
  console.error(`[analytics] active anlegg VG2 schools=${schools.length}`);
  for (const s of schools) console.error(`  ${s.countyCode} ${s.municipalityCode} ${s.name}`);

  const homeCodes = Object.values(HOME_KOMMUNE_BY_FYLKE).map((h) => h.code);
  const allCodes = [...new Set([...homeCodes, ...schools.map((s) => s.municipalityCode)])];
  const { data: geoRows, error: geoError } = await supabase
    .from("municipality_geo_points")
    .select("municipality_code, lat, lng")
    .in("municipality_code", allCodes);
  if (geoError) throw new Error(geoError.message);
  const geoByCode = new Map((geoRows ?? []).map((r) => [r.municipality_code, { lat: r.lat, lng: r.lng }]));

  const hubCache = new Map();
  const nameCache = new Map();
  const tableRows = [];

  for (const fylke of FYLKE_CODES) {
    const home = HOME_KOMMUNE_BY_FYLKE[fylke];
    if (!home) continue;
    const beforeSchools = [];
    const afterSchools = [];

    for (const school of schools) {
      const homeGeo = geoByCode.get(home.code);
      const schoolGeo = geoByCode.get(school.municipalityCode);
      const hv =
        homeGeo && schoolGeo ? haversineKm(homeGeo, schoolGeo) : null;
      if (hv != null && hv <= LEGACY_HAVERSINE_MAX_KM) {
        beforeSchools.push(`${school.name} (${Math.round(hv)}km≈)`);
      }

      const verdict = await evaluatePt(home.code, school.municipalityCode, hubCache, nameCache);
      if (verdict.admitted) {
        const tag = verdict.soft ? "soft" : "ok";
        const km = verdict.km != null ? `${Math.round(verdict.km)}km` : "?km";
        afterSchools.push(`${school.name} [${tag}/${km}]`);
      } else {
        console.error(
          `  deny ${fylke}→${school.name}: ${verdict.reason}${verdict.km != null ? ` ${Math.round(verdict.km)}km` : ""}`
        );
      }
    }

    tableRows.push({
      fylke,
      home: `${home.label} (${home.code})`,
      beforeCount: beforeSchools.length,
      afterCount: afterSchools.length,
      before: beforeSchools.join("; ") || "—",
      after: afterSchools.join("; ") || "—",
      delta: afterSchools.length - beforeSchools.length,
    });
    console.error(
      `[analytics] fylke=${fylke} before=${beforeSchools.length} after=${afterSchools.length}`
    );
  }

  console.log("\n## Anlegg VG2 — relocation maybe: было (haversine≤400) → стало (Entur PT 500/550)\n");
  console.log("| Fylke | Home | До (N) | После (N) | Δ | До (школы) | После (школы) |");
  console.log("|------:|------|-------:|----------:|--:|------------|---------------|");
  for (const r of tableRows) {
    console.log(
      `| ${r.fylke} | ${r.home} | ${r.beforeCount} | ${r.afterCount} | ${r.delta >= 0 ? "+" : ""}${r.delta} | ${r.before} | ${r.after} |`
    );
  }
  console.log(`\nPSA schools: ${schools.map((s) => s.name).join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
