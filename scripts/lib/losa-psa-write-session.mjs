import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "../vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./vilbli-county-meta.mjs";
import { vilbliFetch } from "./vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "../vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./losa-finnmark-entity.mjs";
import { linkEvidenceToManifest } from "./losa-finnmark-evidence-link.mjs";
import { planLosaFinnmarkPublication } from "./losa-finnmark-publication-model.mjs";
import { buildLosaPsaWritePreview } from "./losa-psa-write.mjs";
import { resolveProviderInstitutionId } from "./losa-provider-institution-resolve.mjs";

export const DEFAULT_ALTA_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-2026-05-29-01";

export const DEFAULT_HAMMERFEST_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-HAMMERFEST-2026-05-29-01";

export const DEFAULT_SOR_VARANGER_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-SOR-VARANGER-2026-05-29-01";

export const DEFAULT_PORSANGER_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-PORSANGER-2026-05-29-01";

export const DEFAULT_KARASJOK_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-KARASJOK-2026-05-29-01";

export const DEFAULT_KAUTOKEINO_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-KAUTOKEINO-2026-05-29-01";

export const DEFAULT_VARDO_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-VARDO-2026-05-29-01";

export const DEFAULT_NESSEBY_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-NESSEBY-2026-05-29-01";

export const DEFAULT_TANA_PILOT_CHARTER_ID =
  "MAIN-LOSA-PSA-WRITE-TANA-2026-05-29-01";

/** Bounded write charter profiles — one row per charter session. */
export const LOSA_PSA_WRITE_CHARTER_PROFILES = {
  [DEFAULT_ALTA_PILOT_CHARTER_ID]: {
    deliverySite: "Alta",
    vilbliSchoolCode: "872137",
    snapshotLabel: "losa-alta-pilot-2026-05-29",
  },
  [DEFAULT_HAMMERFEST_PILOT_CHARTER_ID]: {
    deliverySite: "Hammerfest",
    vilbliSchoolCode: "6108473",
    snapshotLabel: "losa-hammerfest-pilot-2026-05-29",
  },
  [DEFAULT_SOR_VARANGER_PILOT_CHARTER_ID]: {
    deliverySite: "Sør-Varanger",
    vilbliSchoolCode: "6108481",
    snapshotLabel: "losa-sor-varanger-pilot-2026-05-29",
  },
  [DEFAULT_PORSANGER_PILOT_CHARTER_ID]: {
    deliverySite: "Porsanger",
    vilbliSchoolCode: "6108475",
    snapshotLabel: "losa-porsanger-pilot-2026-05-29",
  },
  [DEFAULT_KARASJOK_PILOT_CHARTER_ID]: {
    deliverySite: "Karasjok",
    vilbliSchoolCode: "6108476",
    snapshotLabel: "losa-karasjok-pilot-2026-05-29",
  },
  [DEFAULT_KAUTOKEINO_PILOT_CHARTER_ID]: {
    deliverySite: "Kautokeino",
    vilbliSchoolCode: "6108477",
    snapshotLabel: "losa-kautokeino-pilot-2026-05-29",
  },
  [DEFAULT_VARDO_PILOT_CHARTER_ID]: {
    deliverySite: "Vardø",
    vilbliSchoolCode: "6108482",
    snapshotLabel: "losa-vardo-pilot-2026-05-29",
  },
  [DEFAULT_NESSEBY_PILOT_CHARTER_ID]: {
    deliverySite: "Nesseby",
    vilbliSchoolCode: "6108478",
    snapshotLabel: "losa-nesseby-pilot-2026-05-29",
  },
  [DEFAULT_TANA_PILOT_CHARTER_ID]: {
    deliverySite: "Tana",
    vilbliSchoolCode: "259133",
    snapshotLabel: "losa-tana-pilot-2026-05-29",
  },
};

export function resolveCharteredWriteProfile(charterId) {
  const profile = LOSA_PSA_WRITE_CHARTER_PROFILES[charterId];
  if (!profile) {
    throw new Error(`Unknown LOSA PSA write charter id: ${charterId}`);
  }
  return profile;
}

export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key);
}

export async function loadLosaWritePreview({
  profession = "electrician",
  countyCode = "56",
  htmlFile = null,
} = {}) {
  const pathDefinition = getVgsPathDefinition(profession);
  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!pathDefinition || !countyMeta) {
    throw new Error(`Unsupported profession/county: ${profession}/${countyCode}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  const html = htmlFile
    ? await readFile(htmlFile, "utf8")
    : await (await vilbliFetch(sourceUrl)).text();

  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const manifestRows = collectLosaSchoolsFromExtractedStages(
    extracted.extractedStages
  );
  const linkedRows = linkEvidenceToManifest(manifestRows);
  const publicationReport = planLosaFinnmarkPublication(linkedRows, {
    profession,
  });

  return {
    sourceUrl,
    countyMeta,
    publicationReport,
    preview: buildLosaPsaWritePreview(publicationReport, {
      profession,
      countyCode,
      sourceUrl,
    }),
  };
}

export async function resolveEducationProgramId(
  supabase,
  { profession = "electrician", countyCode = "56", stage = "VG1" } = {}
) {
  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!countyMeta) {
    throw new Error(`Unsupported county: ${countyCode}`);
  }

  const slug =
    stage === "VG1"
      ? `${profession}-vg1-elektro-${countyMeta.slug}`
      : `${profession}-vg2-elenergi-${countyMeta.slug}`;

  const { data, error } = await supabase
    .from("education_programs")
    .select("id, slug, program_code")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(`education_programs row not found for slug=${slug}`);
  }

  return { educationProgramId: data.id, slug: data.slug, programCode: data.program_code };
}

function normalizeSourceReferenceUrl(pathOrUrl, sourceUrl) {
  if (!pathOrUrl) return sourceUrl;
  if (String(pathOrUrl).startsWith("http")) return pathOrUrl;
  return `https://www.vilbli.no${pathOrUrl}`;
}

export async function buildResolvedWriteCandidate(
  supabase,
  { candidate, educationProgramId, sourceUrl, snapshotLabel }
) {
  const providerLabel = candidate.payload?.notes
    ? JSON.parse(candidate.payload.notes).provider_school_label
    : null;

  const providerResolution = await resolveProviderInstitutionId(supabase, {
    providerSchoolLabel: providerLabel,
    countyCode: candidate.payload?.county_code ?? "56",
  });

  if (!providerResolution.resolved) {
    throw new Error(
      `Provider institution unresolved: ${providerResolution.reason}`
    );
  }

  const insertPayload = {
    ...candidate.payload,
    education_program_id: educationProgramId,
    institution_id: providerResolution.institutionId,
    source_reference_url: normalizeSourceReferenceUrl(
      candidate.payload.source_reference_url,
      sourceUrl
    ),
    source_snapshot_label: snapshotLabel,
    first_seen_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };

  return {
    candidate,
    providerResolution,
    insertPayload,
  };
}

export async function losaPsaRowExists(supabase, insertPayload) {
  const { data, error } = await supabase
    .from("programme_school_availability")
    .select("id")
    .eq("education_program_id", insertPayload.education_program_id)
    .eq("institution_id", insertPayload.institution_id)
    .eq("county_code", insertPayload.county_code)
    .eq("stage", insertPayload.stage)
    .eq("source", insertPayload.source)
    .eq("availability_scope", insertPayload.availability_scope)
    .eq("municipality_code", insertPayload.municipality_code)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.id);
}

export async function insertLosaPsaRow(supabase, insertPayload) {
  const { data, error } = await supabase
    .from("programme_school_availability")
    .insert(insertPayload)
    .select("id, availability_scope, municipality_code, institution_id, stage")
    .single();

  if (error) throw error;
  return data;
}

export function selectCharteredCandidates(preview, {
  deliverySiteLabel = "Alta",
  maxRows = 1,
  vilbliSchoolCode = null,
} = {}) {
  const writable = preview.candidates.filter((c) => c.writeAllowed);
  let selected = writable.filter(
    (c) => c.deliverySiteLabel === deliverySiteLabel
  );

  if (vilbliSchoolCode) {
    selected = selected.filter(
      (c) => c.vilbliSchoolCode === String(vilbliSchoolCode)
    );
  }

  if (selected.length > maxRows) {
    throw new Error(
      `Charter max ${maxRows} row(s); ${selected.length} matched ${deliverySiteLabel}`
    );
  }

  return selected;
}
