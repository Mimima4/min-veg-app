import fs from "node:fs";

const BASE_URL = "https://ws.geonorge.no/kommuneinfo/v1/kommuner";

function normalizeMunicipalityCodes(payload) {
  const municipalities = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.kommuner)
      ? payload.kommuner
      : [];

  return Array.from(
    new Set(
      municipalities
        .map((item) => String(item?.kommunenummer ?? "").padStart(4, "0"))
        .filter((code) => /^\d{4}$/.test(code))
    )
  ).sort((a, b) => a.localeCompare(b));
}

function buildSql(rows) {
  const lines = [];
  lines.push("create table if not exists public.municipality_geo_points (");
  lines.push("  municipality_code text primary key,");
  lines.push("  lat double precision not null,");
  lines.push("  lng double precision not null,");
  lines.push("  source_label text,");
  lines.push("  created_at timestamptz not null default now()");
  lines.push(");");
  lines.push("");
  lines.push("insert into public.municipality_geo_points (");
  lines.push("  municipality_code,");
  lines.push("  lat,");
  lines.push("  lng,");
  lines.push("  source_label");
  lines.push(")");
  lines.push("values");

  rows.forEach((row, index) => {
    const suffix = index === rows.length - 1 ? "" : ",";
    lines.push(
      `  ('${row.code}', ${row.lat.toFixed(12)}, ${row.lng.toFixed(12)}, 'geonorge-kommuneinfo-v1-punktiomrade')${suffix}`
    );
  });

  lines.push("on conflict (municipality_code) do update");
  lines.push("set");
  lines.push("  lat = excluded.lat,");
  lines.push("  lng = excluded.lng,");
  lines.push("  source_label = excluded.source_label;");
  lines.push("");
  return lines.join("\n");
}

async function run() {
  const listRes = await fetch(BASE_URL);
  if (!listRes.ok) {
    throw new Error(`Failed municipality list request: ${listRes.status}`);
  }

  const listPayload = await listRes.json();
  const codes = normalizeMunicipalityCodes(listPayload);

  const rows = [];
  for (const code of codes) {
    const detailRes = await fetch(`${BASE_URL}/${code}`);
    if (!detailRes.ok) {
      throw new Error(`Failed municipality detail for ${code}: ${detailRes.status}`);
    }

    const detail = await detailRes.json();
    const coordinates = detail?.punktIOmrade?.coordinates;
    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      throw new Error(`Missing punktIOmrade coordinates for ${code}`);
    }

    rows.push({
      code,
      lng: coordinates[0],
      lat: coordinates[1],
    });
  }

  const sql = buildSql(rows);
  fs.writeFileSync("scripts/sql/municipality-geo-points-foundation.sql", sql, "utf8");

  console.log(`Generated ${rows.length} municipality centroid rows.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
