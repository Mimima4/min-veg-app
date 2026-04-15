import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  RouteAdmissionRealismQuery,
  RouteAdmissionRealismRecord,
} from "@/lib/routes/route-admission-realism-types";

type AdmissionRealismRow = {
  id: string;
  profession_slug: string | null;
  program_slug: string;
  institution_id: string | null;
  source_family: RouteAdmissionRealismRecord["sourceFamily"];
  source_url: string;
  source_label: string;
  collected_at: string;
  effective_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_status: RouteAdmissionRealismRecord["reviewStatus"];
  confidence_level: RouteAdmissionRealismRecord["confidenceLevel"];
  quota_payload: RouteAdmissionRealismRecord["quotaPayload"];
  requirements_payload: RouteAdmissionRealismRecord["requirementsPayload"];
  thresholds_payload: RouteAdmissionRealismRecord["thresholdsPayload"];
  eligibility_payload: RouteAdmissionRealismRecord["eligibilityPayload"];
  notes_payload: RouteAdmissionRealismRecord["notesPayload"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const ADMISSION_REALISM_SELECT_COLUMNS =
  "id, profession_slug, program_slug, institution_id, source_family, source_url, source_label, collected_at, effective_at, reviewed_at, reviewed_by, review_status, confidence_level, quota_payload, requirements_payload, thresholds_payload, eligibility_payload, notes_payload, is_active, created_at, updated_at";

function mapRecord(row: AdmissionRealismRow): RouteAdmissionRealismRecord {
  return {
    id: row.id,
    professionSlug: row.profession_slug,
    programSlug: row.program_slug,
    institutionId: row.institution_id,
    sourceFamily: row.source_family,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label,
    collectedAt: row.collected_at,
    effectiveAt: row.effective_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewStatus: row.review_status,
    confidenceLevel: row.confidence_level,
    quotaPayload: row.quota_payload,
    requirementsPayload: row.requirements_payload,
    thresholdsPayload: row.thresholds_payload,
    eligibilityPayload: row.eligibility_payload,
    notesPayload: row.notes_payload,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function compareAdmissionRowsByRecency(
  a: AdmissionRealismRow,
  b: AdmissionRealismRow
): number {
  const byReviewed = (b.reviewed_at ?? "").localeCompare(a.reviewed_at ?? "");
  if (byReviewed !== 0) {
    return byReviewed;
  }

  const byEffective = (b.effective_at ?? "").localeCompare(a.effective_at ?? "");
  if (byEffective !== 0) {
    return byEffective;
  }

  return (b.collected_at ?? "").localeCompare(a.collected_at ?? "");
}

/**
 * Picks the best row for route use: institution-specific first, then programme-level
 * (institution_id null), then by review / effective / collected recency.
 */
export function pickBestAdmissionRealismRow(
  rows: AdmissionRealismRow[],
  institutionId?: string | null,
  professionSlug?: string | null
): RouteAdmissionRealismRecord | null {
  let filtered = rows;

  if (professionSlug) {
    filtered = filtered.filter(
      (row) => !row.profession_slug || row.profession_slug === professionSlug
    );
  }

  if (institutionId) {
    const exact = filtered
      .filter((row) => row.institution_id === institutionId)
      .sort(compareAdmissionRowsByRecency);
    if (exact[0]) {
      return mapRecord(exact[0]);
    }

    const programLevel = filtered
      .filter((row) => row.institution_id === null)
      .sort(compareAdmissionRowsByRecency);
    if (programLevel[0]) {
      return mapRecord(programLevel[0]);
    }

    return null;
  }

  const sorted = [...filtered].sort(compareAdmissionRowsByRecency);
  return sorted[0] ? mapRecord(sorted[0]) : null;
}

export async function getRouteAdmissionRealism(
  query: RouteAdmissionRealismQuery & { supabase?: SupabaseClient }
): Promise<RouteAdmissionRealismRecord | null> {
  const supabase = query.supabase ?? (await createClient());
  let q = supabase
    .from("route_admission_realism_records")
    .select(ADMISSION_REALISM_SELECT_COLUMNS)
    .eq("program_slug", query.programSlug)
    .eq("is_active", true)
    .order("reviewed_at", { ascending: false, nullsFirst: false })
    .order("effective_at", { ascending: false, nullsFirst: false })
    .order("collected_at", { ascending: false });

  if (query.professionSlug) {
    q = q.or(`profession_slug.eq.${query.professionSlug},profession_slug.is.null`);
  }

  q = q.limit(50);

  const { data, error } = await q;

  if (error) {
    throw new Error(
      `Failed to load route admission realism record for ${query.programSlug}: ${error.message}`
    );
  }

  const rows = (data ?? []) as AdmissionRealismRow[];
  return pickBestAdmissionRealismRow(rows, query.institutionId, query.professionSlug ?? null);
}

export async function batchGetRouteAdmissionRealismForCandidates(
  supabase: SupabaseClient,
  candidates: { programSlug: string; institutionId: string | null }[],
  professionSlug?: string | null
): Promise<Map<string, RouteAdmissionRealismRecord>> {
  const slugs = [...new Set(candidates.map((candidate) => candidate.programSlug))];
  if (slugs.length === 0) {
    return new Map();
  }

  let q = supabase
    .from("route_admission_realism_records")
    .select(ADMISSION_REALISM_SELECT_COLUMNS)
    .in("program_slug", slugs)
    .eq("is_active", true)
    .order("reviewed_at", { ascending: false, nullsFirst: false })
    .order("effective_at", { ascending: false, nullsFirst: false })
    .order("collected_at", { ascending: false });

  if (professionSlug) {
    q = q.or(`profession_slug.eq.${professionSlug},profession_slug.is.null`);
  }

  q = q.limit(500);

  const { data, error } = await q;

  if (error) {
    throw new Error(`Failed to batch-load route admission realism: ${error.message}`);
  }

  const rows = (data ?? []) as AdmissionRealismRow[];
  const byProgram = new Map<string, AdmissionRealismRow[]>();

  for (const row of rows) {
    const list = byProgram.get(row.program_slug) ?? [];
    list.push(row);
    byProgram.set(row.program_slug, list);
  }

  const result = new Map<string, RouteAdmissionRealismRecord>();
  const seenKeys = new Set<string>();

  for (const candidate of candidates) {
    const key = `${candidate.programSlug}\t${candidate.institutionId ?? ""}`;
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    const programRows = byProgram.get(candidate.programSlug) ?? [];
    const picked = pickBestAdmissionRealismRow(
      programRows,
      candidate.institutionId,
      professionSlug ?? null
    );

    if (picked) {
      result.set(key, picked);
    }
  }

  return result;
}
