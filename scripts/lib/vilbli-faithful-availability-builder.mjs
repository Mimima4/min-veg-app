import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { extractVilbliStagesFromHtml } from "../vilbli-stage-extraction-helper.mjs";
import { classifyIdentitySemantics } from "../school-identity-semantics.mjs";
import { getVgsPathDefinition } from "../vgs-path-definitions.mjs";

const COUNTY_CODE_TO_VILBLI = {
  "56": { slug: "finnmark", label: "Finnmark" },
};

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSchoolName(value) {
  return normalizeBasic(value)
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregande skule\b/g, " ")
    .replace(/\bvidaregaande skule\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    .replace(/\bas\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyInstitutionMatch(vilbliName, institutionName) {
  const vilbliNorm = normalizeSchoolName(vilbliName);
  const nsrNorm = normalizeSchoolName(institutionName);

  if (vilbliNorm && nsrNorm && vilbliNorm === nsrNorm) {
    return { matchType: "exact_normalized", score: 1 };
  }

  const vilbliCore = vilbliNorm.replace(/\bavd\b.*$/, "").trim();
  const nsrCore = nsrNorm.replace(/\bavd\b.*$/, "").trim();
  if (vilbliCore && nsrCore && vilbliCore === nsrCore) {
    return { matchType: "core_name_match", score: 0.9 };
  }

  const vt = vilbliNorm.split(" ").filter(Boolean);
  const nt = nsrNorm.split(" ").filter(Boolean);
  const sharedTokens = vt.filter((token) => token.length >= 4 && nt.includes(token)).length;
  if (sharedTokens >= 2) {
    return { matchType: "fallback_fuzzy", score: 0.6 };
  }

  return { matchType: "none", score: 0 };
}

function buildVilbliSchoolUrl(schoolPagePath) {
  const path = String(schoolPagePath ?? "").trim();
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `https://www.vilbli.no${path.startsWith("/") ? path : `/${path}`}`;
}

function resolveDisplayType({ isLosa, isMatched }) {
  if (isLosa) return "losa_external_delivery";
  if (isMatched) return "ordinary";
  return "identity_unresolved";
}

function resolveVerificationStatus(displayType) {
  if (displayType === "ordinary") return "needs_review";
  if (displayType === "losa_external_delivery") return "vilbli_losa_unpublished";
  return "vilbli_identity_unresolved";
}

/**
 * Vilbli-faithful listing: same county-page extract as Contour A dry-run,
 * classified for UI without PSA write.
 */
export async function buildVilbliFaithfulAvailability({ professionSlug, countyCode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env for vilbli-faithful availability");
  }

  const pathDefinition = getVgsPathDefinition(professionSlug);
  if (!pathDefinition) {
    throw new Error(`No path definition for profession: ${professionSlug}`);
  }

  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!countyMeta) {
    throw new Error(`Vilbli-faithful county not enabled: ${countyCode}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  const response = await fetch(sourceUrl, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Vilbli fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: nsrInstitutions, error: nsrError } = await supabase
    .from("education_institutions")
    .select("id, name, county_code, municipality_code")
    .eq("county_code", countyCode)
    .eq("source", "nsr")
    .eq("is_active", true);
  if (nsrError) throw nsrError;

  const entries = [];
  const seen = new Set();

  for (const [stage, schools] of Object.entries(extracted.extractedStages ?? {})) {
    for (const school of schools ?? []) {
      const dedupeKey = `${stage}::${school.schoolCode}::${school.schoolName}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const ranked = (nsrInstitutions ?? [])
        .map((institution) => ({
          institution,
          ...classifyInstitutionMatch(school.schoolName, institution.name),
        }))
        .filter((candidate) => candidate.matchType !== "none")
        .sort(
          (a, b) =>
            b.score - a.score || a.institution.name.localeCompare(b.institution.name)
        );

      const best = ranked[0] ?? null;
      const isMatched = Boolean(best);
      const semantics = classifyIdentitySemantics(school.schoolName, {
        countyCode,
        professionSlug,
        schoolCode: school.schoolCode,
      });
      const displayType = resolveDisplayType({
        isLosa: semantics.isLosa,
        isMatched,
      });

      entries.push({
        displayType,
        stage,
        schoolCode: school.schoolCode,
        schoolName: school.schoolName,
        vilbliUrl: buildVilbliSchoolUrl(school.schoolPagePath),
        provenance: "vilbli_official_listing",
        verificationStatus: resolveVerificationStatus(displayType),
        institutionId: best?.institution.id ?? null,
        institutionName: best?.institution.name ?? null,
        matchType: best?.matchType ?? null,
        isLosa: semantics.isLosa,
        losaReason: semantics.losaReason,
        hasSlashAliases: semantics.hasSlashAliases,
        psaPublished: false,
      });
    }
  }

  entries.sort((a, b) => {
    const stageOrder = { VG1: 1, VG2: 2, VG3: 3 };
    const stageDelta = (stageOrder[a.stage] ?? 99) - (stageOrder[b.stage] ?? 99);
    if (stageDelta !== 0) return stageDelta;
    return a.schoolName.localeCompare(b.schoolName, "nb");
  });

  const summary = {
    total: entries.length,
    ordinary: entries.filter((e) => e.displayType === "ordinary").length,
    losa_external_delivery: entries.filter((e) => e.displayType === "losa_external_delivery")
      .length,
    identity_unresolved: entries.filter((e) => e.displayType === "identity_unresolved").length,
  };

  return {
    countyCode,
    professionSlug,
    sourceUrl,
    extractedAt: new Date().toISOString(),
    entries,
    summary,
    enrichmentLabels: [
      {
        tier: 1,
        label: "Udir — fjernundervisning (planning CONFIRMED)",
      },
      {
        tier: 1,
        label: "Regjeringen Prop. 57 L kap. 15 (planning CONFIRMED)",
      },
      {
        tier: 1,
        label: "Lovdata NL lov 2023-06-09-30 §14-4 (planning CONFIRMED)",
      },
      {
        tier: 2,
        label: "Alta vgs programme tilbud (planning CONFIRMED)",
      },
    ],
    disclaimer:
      "Official Vilbli listing for this county. Not published PSA truth; LOSA and unmatched rows are shown explicitly.",
  };
}
