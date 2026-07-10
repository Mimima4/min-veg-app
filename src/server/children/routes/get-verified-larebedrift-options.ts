import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  haversineDistanceKm,
  normalizeMunicipalityCode,
} from "@/lib/planning/geo-distance";
import { resolveMunicipalityNamesByCode } from "@/server/planning/resolve-municipality-name-nb";

/**
 * Verified lærebedrift → apprenticeship_options reader (P3, geography-first).
 *
 * Reads the audited `larebedrift_truth` layer (godkjent only) and turns it into
 * the route step `apprenticeship_options[]` shape, ordered the same way the route
 * engine already orders schools: **by kommune** — geography-first using
 * `municipality_geo_points` centroids (haversine from the child's home kommune),
 * with a deterministic orgnr tiebreak so the stored snapshot is stable
 * (idempotency) and identical for web RSC and the native API (parity).
 *
 * Transport-reachability ordering for employers (Entur kommune-hub corridors) is
 * a later, gated sub-step — see the charter §6 P3 staging note.
 *
 * Runs at route create/recompute (server), never on page load for the client.
 */

export type VerifiedLarebedriftOption = {
  option_id: string;
  option_title: string;
  outcome_profession_ids: string[];
  entity_type: "employer";
  employer_municipality: string | null;
  employer_website: string | null;
  employer_source_note: string | null;
};

type LarebedriftTruthRow = {
  org_number: string;
  legal_name: string;
  display_name: string | null;
  county_code: string;
  municipality_code: string;
  website: string | null;
  larefag_label: string | null;
  opplaringskontor_name: string | null;
  opplaringskontor_org: string | null;
  source_reference_url: string;
};

/**
 * Always give the family a "learn more / contact" link: the employer's own
 * registered website if Brønnøysund has one, otherwise the authoritative
 * Brønnøysund entity page (name, address, industry, status) — which always
 * exists for a valid orgnr. Small lærebedrifter usually have no own site.
 */
function resolveEmployerWebsite(row: LarebedriftTruthRow): string {
  const own = String(row.website ?? "").trim();
  if (/^https?:\/\//i.test(own)) {
    return own;
  }
  return `https://virksomhet.brreg.no/nb/oppslag/enheter/${row.org_number}`;
}

/** D-5: name in title; orgnr + opplæringskontor live in the expandable source note. */
function composeSourceNote(row: LarebedriftTruthRow): string {
  const parts = [`Godkjent lærebedrift · orgnr ${row.org_number}`];
  if (row.opplaringskontor_name) {
    const kontor = row.opplaringskontor_org
      ? `${row.opplaringskontor_name} (orgnr ${row.opplaringskontor_org})`
      : row.opplaringskontor_name;
    parts.push(`Opplæringskontor: ${kontor}`);
  }
  parts.push("Kilde: Vigo via Brønnøysund/Finnlærebedrift");
  return parts.join(" · ");
}

export async function getVerifiedLarebedriftApprenticeshipOptions(params: {
  supabase: SupabaseClient;
  larefagCode: string;
  preferredMunicipalityCodes: string[];
  countyCodesForEmployerScope?: string[];
}): Promise<VerifiedLarebedriftOption[]> {
  const homeCodes = Array.from(
    new Set(
      params.preferredMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );
  if (homeCodes.length === 0) {
    return [];
  }

  const homeCounties =
    params.countyCodesForEmployerScope && params.countyCodesForEmployerScope.length > 0
      ? Array.from(
          new Set(
            params.countyCodesForEmployerScope
              .map((code) => String(code ?? "").trim())
              .filter((code) => /^\d{2}$/.test(code))
          )
        )
      : Array.from(new Set(homeCodes.map((code) => code.slice(0, 2))));

  const { data, error } = await params.supabase
    .from("larebedrift_truth")
    .select(
      "org_number, legal_name, display_name, county_code, municipality_code, website, larefag_label, opplaringskontor_name, opplaringskontor_org, source_reference_url, is_active, verification_status, larefag_code"
    )
    .eq("larefag_code", params.larefagCode)
    .eq("is_active", true)
    .eq("verification_status", "godkjent")
    .in("county_code", homeCounties);

  if (error) {
    throw new Error(`Failed to load larebedrift_truth: ${error.message}`);
  }

  const rows = ((data ?? []) as LarebedriftTruthRow[]).filter((row) =>
    /^\d{9}$/.test(String(row.org_number ?? ""))
  );
  if (rows.length === 0) {
    return [];
  }

  const candidateCodes = rows
    .map((row) => normalizeMunicipalityCode(row.municipality_code))
    .filter((code): code is string => Boolean(code));
  const geoLookupCodes = Array.from(new Set([...homeCodes, ...candidateCodes]));

  const geoByCode = new Map<string, { lat: number; lng: number }>();
  if (geoLookupCodes.length > 0) {
    const { data: geoRows, error: geoError } = await params.supabase
      .from("municipality_geo_points")
      .select("municipality_code, lat, lng")
      .in("municipality_code", geoLookupCodes);
    if (geoError) {
      throw new Error(
        `Failed to load municipality geo points for larebedrift ordering: ${geoError.message}`
      );
    }
    for (const geo of (geoRows ?? []) as Array<{
      municipality_code: string;
      lat: number;
      lng: number;
    }>) {
      geoByCode.set(geo.municipality_code, { lat: geo.lat, lng: geo.lng });
    }
  }

  const distanceKm = (municipalityCode: string | null): number => {
    const code = normalizeMunicipalityCode(municipalityCode);
    if (!code) return Number.POSITIVE_INFINITY;
    const candidatePoint = geoByCode.get(code);
    if (!candidatePoint) return Number.POSITIVE_INFINITY;
    let best = Number.POSITIVE_INFINITY;
    for (const homeCode of homeCodes) {
      const homePoint = geoByCode.get(homeCode);
      if (!homePoint) continue;
      const distance = haversineDistanceKm(homePoint, candidatePoint);
      if (distance < best) best = distance;
    }
    return best;
  };

  const ordered = rows
    .map((row) => ({ row, distance: distanceKm(row.municipality_code) }))
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.row.org_number.localeCompare(b.row.org_number);
    })
    .map(({ row }) => row);

  if (ordered.length === 0) {
    return [];
  }

  const municipalityNamesByCode = await resolveMunicipalityNamesByCode(
    ordered.map((row) => row.municipality_code)
  );

  return ordered.map((row) => {
    const municipalityCode = normalizeMunicipalityCode(row.municipality_code);
    const employerMunicipality =
      (municipalityCode ? municipalityNamesByCode.get(municipalityCode) : null) ?? null;

    return {
      option_id: `larebedrift-${row.org_number}`,
      option_title: row.display_name ?? row.legal_name,
      outcome_profession_ids: [],
      entity_type: "employer" as const,
      employer_municipality: employerMunicipality,
      employer_website: resolveEmployerWebsite(row),
      employer_source_note: composeSourceNote(row),
    };
  });
}
