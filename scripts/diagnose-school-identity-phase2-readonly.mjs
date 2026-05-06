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

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function createEmptyPayload(warning = null) {
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

async function safeRun() {
  const args = parseArgs(process.argv.slice(2));
  const professionSlug = String(args.profession ?? "").trim();
  const countyCode = String(args.county ?? "").trim();
  const stage = String(args.stage ?? "").trim();
  const sourceSnapshotLabel = String(args["source-snapshot"] ?? "").trim();

  if (!professionSlug || !countyCode) {
    return createEmptyPayload("phase2_unexpected_error");
  }

  if (String(process.env.PHASE2_IDENTITY_DIAGNOSTICS_ENABLED ?? "") !== "true") {
    return createEmptyPayload("phase2_identity_diagnostics_disabled");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createEmptyPayload("phase2_identity_diagnostics_env_missing");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Read-only guardrail: this script must use SELECT queries only.
  const basePayload = createEmptyPayload(null);
  let warning = null;

  const { error: probeError } = await supabase.from("source_school_observations").select("id").limit(1);
  if (probeError) {
    return createEmptyPayload("phase2_schema_unavailable");
  }

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
    return createEmptyPayload("phase2_query_failed");
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
      if (error) return createEmptyPayload("phase2_query_failed");
      if (Array.isArray(data)) resolutionRows = resolutionRows.concat(data);
    }

    for (const ids of chunks) {
      const { data, error } = await supabase
        .from("programme_availability_publication_decisions")
        .select("id, observation_id, publishability_state, decided_at, created_at")
        .in("observation_id", ids);
      if (error) return createEmptyPayload("phase2_query_failed");
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
    // Compatibility rule: only count needs_review if present; absence is not an error.
    if (state === "needs_review") needsReviewCount += 1;
    if (state === "blocked") unsupportedCount += 1;
  }
  for (const row of resolutionRows) {
    const state = String(row?.decision_state ?? "").trim();
    if (state === "needs_review") needsReviewCount += 1;
    if (isUnsupportedDecisionState(state)) unsupportedCount += 1;
    if (isUnresolvedDecisionState(state)) unresolvedCount += 1;
  }

  basePayload.phase2SchemaAvailable = true;
  basePayload.identityResolutionSummary = {
    observationsCount: cappedObservations.length,
    resolutionDecisionCount: resolutionRows.length,
    publicationDecisionCount: publicationRows.length,
    publishableCount,
    needsReviewCount,
    unsupportedCount,
    unresolvedCount,
  };
  basePayload.identityResolutionBySchoolCode = bySchoolCode;
  basePayload.phase2DiagnosticsWarning = warning;
  return basePayload;
}

safeRun()
  .then((payload) => {
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  })
  .catch(() => {
    // Last-resort fail-open: emit stable JSON and exit 0 if possible.
    console.log(JSON.stringify(createEmptyPayload("phase2_unexpected_error"), null, 2));
    process.exit(0);
  });
