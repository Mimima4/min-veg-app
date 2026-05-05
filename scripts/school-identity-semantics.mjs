function asString(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForTokens(value) {
  return normalizeWhitespace(
    asString(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
  );
}

export function normalizeSchoolIdentityLabel(value) {
  return normalizeForTokens(value);
}

export function detectLosa(value) {
  const normalized = normalizeForTokens(value);
  if (!normalized) {
    return { isLosa: false, losaReason: null };
  }

  const losaPatterns = [
    /\blosa\b/,
    /\blokal opplaering\b/,
    /\blokal opplaring\b/,
    /\blokal opplæring\b/,
  ];

  const matched = losaPatterns.find((pattern) => pattern.test(normalized));
  if (!matched) {
    return { isLosa: false, losaReason: null };
  }

  return { isLosa: true, losaReason: "losa_keyword_detected" };
}

export function detectSlashAliases(value) {
  const raw = normalizeWhitespace(asString(value));
  if (!raw) {
    return { hasSlashAliases: false, aliasLabels: [] };
  }

  const parts = raw
    .split("/")
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
  const unique = Array.from(new Set(parts));

  if (unique.length <= 1) {
    return { hasSlashAliases: false, aliasLabels: [] };
  }

  return { hasSlashAliases: true, aliasLabels: unique };
}

export function detectMultiLocationSignals(value) {
  const normalized = normalizeForTokens(value);
  if (!normalized) {
    return { hasMultiLocationSignal: false, multiLocationSignals: [] };
  }

  const signalChecks = [
    { code: "avd", pattern: /\bavd\b/ },
    { code: "avdeling", pattern: /\bavdeling\b/ },
    { code: "campus", pattern: /\bcampus\b/ },
    { code: "sted", pattern: /\bsted\b/ },
    { code: "lokasjon", pattern: /\blokasjon\b/ },
  ];

  const signals = signalChecks.filter((check) => check.pattern.test(normalized)).map((s) => s.code);

  return {
    hasMultiLocationSignal: signals.length > 0,
    multiLocationSignals: signals,
  };
}

export function parseSchoolIdentityLabel(value, context = {}) {
  const originalLabel = normalizeWhitespace(asString(value));
  const normalizedLabel = normalizeSchoolIdentityLabel(originalLabel);
  const aliasInfo = detectSlashAliases(originalLabel);
  const losaInfo = detectLosa(originalLabel);
  const multiLocationInfo = detectMultiLocationSignals(originalLabel);

  return {
    originalLabel,
    normalizedLabel,
    aliasLabels: aliasInfo.aliasLabels,
    hasSlashAliases: aliasInfo.hasSlashAliases,
    isLosa: losaInfo.isLosa,
    losaReason: losaInfo.losaReason,
    hasMultiLocationSignal: multiLocationInfo.hasMultiLocationSignal,
    multiLocationSignals: multiLocationInfo.multiLocationSignals,
    context,
  };
}

export function classifyIdentitySemantics(value, context = {}) {
  const parsed = parseSchoolIdentityLabel(value, context);
  const identityReasonCodes = [];
  const unsupportedReasonCodes = [];
  const needsReviewReasonCodes = [];

  if (parsed.hasSlashAliases) {
    identityReasonCodes.push("slash_alias_detected", "alias_single_identity_candidate");
  }
  if (parsed.isLosa) {
    unsupportedReasonCodes.push("losa_unsupported");
  }
  if (parsed.hasMultiLocationSignal) {
    needsReviewReasonCodes.push(
      "multi_location_signal_detected",
      "identity_location_unresolved"
    );
  }

  const safeForPublicationPrecheck =
    unsupportedReasonCodes.length === 0 && needsReviewReasonCodes.length === 0;

  return {
    originalLabel: parsed.originalLabel,
    normalizedLabel: parsed.normalizedLabel,
    aliasLabels: parsed.aliasLabels,
    hasSlashAliases: parsed.hasSlashAliases,
    isLosa: parsed.isLosa,
    losaReason: parsed.losaReason,
    hasMultiLocationSignal: parsed.hasMultiLocationSignal,
    multiLocationSignals: parsed.multiLocationSignals,
    identityReasonCodes,
    unsupportedReasonCodes,
    needsReviewReasonCodes,
    safeForPublicationPrecheck,
  };
}
