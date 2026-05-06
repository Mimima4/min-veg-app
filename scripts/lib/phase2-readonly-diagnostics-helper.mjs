/*
 * SELECT-only Phase 2 diagnostics helper. No writes, no RPC, no runtime/write integration.
 * See: docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md
 */

import { createClient } from "@supabase/supabase-js";

const WARNING_PRIORITY = [
  "phase2_identity_diagnostics_disabled",
  "phase2_identity_diagnostics_env_missing",
  "phase2_schema_unavailable",
  "phase2_query_failed",
  "phase2_unexpected_error",
  "phase2_result_truncated",
];

const MAX_OBSERVATIONS = 5000;

function buildEmptyInner(warning = null) {
  return {
    phase2SchemaAvailable: false,
    identityResolutionSummary: {
      observationsCount: 0,
      resolutionDecisionCount: 0,
      publicationDecisionCount: 0,
      publishableCount: 0,
      needsReviewCount: 0,
      unsupportedCount: 0,
      unresolvedCount: 0,
    },
    identityResolutionBySchoolCode: {},
    phase2DiagnosticsWarning: warning,
  };
}

function pickWarning(currentWarning, nextWarning) {
  if (!nextWarning) return currentWarning;
  if (!currentWarning) return nextWarning;
  const currentIdx = WARNING_PRIORITY.indexOf(currentWarning);
  const nextIdx = WARNING_PRIORITY.indexOf(nextWarning);
  if (currentIdx === -1) return nextWarning;
  if (nextIdx === -1) return currentWarning;
  return nextIdx < currentIdx ? nextWarning : currentWarning;
}

function chunkArray(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

function asTime(value) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const n = Date.parse(value);
  return Number.isNaN(n) ? Number.NEGATIVE_INFINITY : n;
}

function compareLatest(a, b) {
  const aDecided = asTime(a?.decided_at);
  const bDecided = asTime(b?.decided_at);
  if (aDecided !== bDecided) return bDecided - aDecided;

  const aCreated = asTime(a?.created_at);
  const bCreated = asTime(b?.created_at);
  if (aCreated !== bCreated) return bCreated - aCreated;

  const aId = String(a?.id ?? "");
  const bId = String(b?.id ?? "");
  return aId.localeCompare(bId);
}

function isUnsupportedDecisionState(value) {
  return value === "unsupported_losa" || value === "external_delivery";
}

function isUnresolvedDecisionState(value) {
  return (
    value === "identity_unresolved" ||
    value === "location_unresolved" ||
    value === "ambiguous_candidates"
  );
}

export function isPhase2DiagnosticsEnabled(env = process.env) {
  return String(env.PHASE2_IDENTITY_DIAGNOSTICS_ENABLED ?? "") === "true";
}

export function createEmptyPhase2DiagnosticsPayload(warning = null) {
  return { phase2ReadOnlyDiagnostics: buildEmptyInner(warning) };
}

export async function probePhase2SchemaAvailability(supabase) {
  const { error } = await supabase.from("source_school_observations").select("id").limit(1);
  return { ok: !error };
}

export async function getPhase2ReadOnlyDiagnostics(input, options = {}) {
  const env = options.env ?? process.env;

  if (!isPhase2DiagnosticsEnabled(env)) {
    return createEmptyPhase2DiagnosticsPayload("phase2_identity_diagnostics_disabled");
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return createEmptyPhase2DiagnosticsPayload("phase2_identity_diagnostics_env_missing");
  }

  const {
    professionSlug,
    countyCode,
    stage = "",
    sourceSnapshotLabel = "",
  } = input;

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const probe = await probePhase2SchemaAvailability(supabase);
  if (!probe.ok) {
    return createEmptyPhase2DiagnosticsPayload("phase2_schema_unavailable");
  }

  const inner = buildEmptyInner(null);
  let warning = null;

  let observationsQuery = supabase
    .from("source_school_observations")
    .select("id, source_school_code")
    .eq("profession_slug", professionSlug)
    .eq("county_code", countyCode)
    .order("id", { ascending: true })
    .limit(MAX_OBSERVATIONS + 1);

  if (stage) observationsQuery = observationsQuery.eq("stage", stage);
  if (sourceSnapshotLabel) {
    observationsQuery = observationsQuery.eq("source_snapshot_label", sourceSnapshotLabel);
  }

  const { data: observations, error: observationsError } = await observationsQuery;
  if (observationsError) {
    return createEmptyPhase2DiagnosticsPayload("phase2_query_failed");
  }

  const observationRows = Array.isArray(observations) ? observations : [];
  const truncated = observationRows.length > MAX_OBSERVATIONS;
  const cappedObservations = truncated ? observationRows.slice(0, MAX_OBSERVATIONS) : observationRows;
  if (truncated) warning = pickWarning(warning, "phase2_result_truncated");

  const observationIds = cappedObservations
    .map((row) => String(row?.id ?? "").trim())
    .filter(Boolean);

  let resolutionRows = [];
  let publicationRows = [];

  if (observationIds.length > 0) {
    const chunks = chunkArray(observationIds, 1000);

    for (const ids of chunks) {
      const { data, error } = await supabase
        .from("school_identity_resolution_decisions")
        .select("id, observation_id, decision_state, decided_at, created_at")
        .in("observation_id", ids);
      if (error) return createEmptyPhase2DiagnosticsPayload("phase2_query_failed");
      if (Array.isArray(data)) resolutionRows = resolutionRows.concat(data);
    }

    for (const ids of chunks) {
      const { data, error } = await supabase
        .from("programme_availability_publication_decisions")
        .select("id, observation_id, publishability_state, decided_at, created_at")
        .in("observation_id", ids);
      if (error) return createEmptyPhase2DiagnosticsPayload("phase2_query_failed");
      if (Array.isArray(data)) publicationRows = publicationRows.concat(data);
    }
  }

  const resolutionByObservation = new Map();
  for (const row of resolutionRows) {
    const key = String(row?.observation_id ?? "").trim();
    if (!key) continue;
    if (!resolutionByObservation.has(key)) resolutionByObservation.set(key, []);
    resolutionByObservation.get(key).push(row);
  }

  const publicationByObservation = new Map();
  for (const row of publicationRows) {
    const key = String(row?.observation_id ?? "").trim();
    if (!key) continue;
    if (!publicationByObservation.has(key)) publicationByObservation.set(key, []);
    publicationByObservation.get(key).push(row);
  }

  const sortedObservations = [...cappedObservations].sort((a, b) => {
    const aCode = String(a?.source_school_code ?? "").trim();
    const bCode = String(b?.source_school_code ?? "").trim();
    if (aCode !== bCode) return aCode.localeCompare(bCode);
    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });

  const bySchoolCode = {};
  let unknownIndex = 1;
  for (const observation of sortedObservations) {
    const observationId = String(observation?.id ?? "").trim();
    if (!observationId) continue;
    const sourceSchoolCode = String(observation?.source_school_code ?? "").trim();
    const key =
      sourceSchoolCode || `unknown::${String(unknownIndex).padStart(4, "0")}`;
    if (!sourceSchoolCode) unknownIndex += 1;

    if (!bySchoolCode[key]) {
      bySchoolCode[key] = {
        observationCount: 0,
        latestDecisionState: null,
        latestPublishabilityState: null,
        hasPublishableDecision: false,
        hasNeedsReviewDecision: false,
        hasUnsupportedDecision: false,
        hasUnresolvedDecision: false,
      };
    }

    const bucket = bySchoolCode[key];
    bucket.observationCount += 1;

    const resRows = [...(resolutionByObservation.get(observationId) ?? [])].sort(compareLatest);
    const pubRows = [...(publicationByObservation.get(observationId) ?? [])].sort(compareLatest);

    if (resRows.length > 0 && bucket.latestDecisionState == null) {
      bucket.latestDecisionState = resRows[0].decision_state ?? null;
    }
    if (pubRows.length > 0 && bucket.latestPublishabilityState == null) {
      bucket.latestPublishabilityState = pubRows[0].publishability_state ?? null;
    }

    for (const row of resRows) {
      const state = String(row?.decision_state ?? "").trim();
      if (!state) continue;
      if (state === "needs_review") bucket.hasNeedsReviewDecision = true;
      if (isUnsupportedDecisionState(state)) bucket.hasUnsupportedDecision = true;
      if (isUnresolvedDecisionState(state)) bucket.hasUnresolvedDecision = true;
    }
    for (const row of pubRows) {
      const state = String(row?.publishability_state ?? "").trim();
      if (!state) continue;
      if (state === "publishable") bucket.hasPublishableDecision = true;
      if (state === "needs_review") bucket.hasNeedsReviewDecision = true;
      if (state === "blocked") bucket.hasUnsupportedDecision = true;
    }
  }

  let publishableCount = 0;
  let needsReviewCount = 0;
  let unsupportedCount = 0;
  let unresolvedCount = 0;

  for (const row of publicationRows) {
    const state = String(row?.publishability_state ?? "").trim();
    if (state === "publishable") publishableCount += 1;
    if (state === "needs_review") needsReviewCount += 1;
    if (state === "blocked") unsupportedCount += 1;
  }
  for (const row of resolutionRows) {
    const state = String(row?.decision_state ?? "").trim();
    if (state === "needs_review") needsReviewCount += 1;
    if (isUnsupportedDecisionState(state)) unsupportedCount += 1;
    if (isUnresolvedDecisionState(state)) unresolvedCount += 1;
  }

  inner.phase2SchemaAvailable = true;
  inner.identityResolutionSummary = {
    observationsCount: cappedObservations.length,
    resolutionDecisionCount: resolutionRows.length,
    publicationDecisionCount: publicationRows.length,
    publishableCount,
    needsReviewCount,
    unsupportedCount,
    unresolvedCount,
  };
  inner.identityResolutionBySchoolCode = bySchoolCode;
  inner.phase2DiagnosticsWarning = warning;

  return { phase2ReadOnlyDiagnostics: inner };
}
