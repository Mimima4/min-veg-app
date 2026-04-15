import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdmissionRealismIngestInput } from "./admission-realism-baseline-payload";
import { BASELINE_CENTRALIZED_ADMISSION_DOCTOR_RECORDS } from "./admission-realism-baseline-payload";

function toRowForDb(row: AdmissionRealismIngestInput) {
  return {
    profession_slug: row.professionSlug,
    program_slug: row.programSlug,
    institution_id: row.institutionId,
    source_family: row.sourceFamily,
    source_url: row.sourceUrl,
    source_label: row.sourceLabel,
    collected_at: row.collectedAtIso,
    effective_at: row.effectiveAtIso,
    reviewed_at: row.reviewedAtIso,
    reviewed_by: row.reviewedBy,
    review_status: row.reviewStatus,
    confidence_level: row.confidenceLevel,
    quota_payload: row.quotaPayload,
    requirements_payload: row.requirementsPayload,
    thresholds_payload: row.thresholdsPayload,
    eligibility_payload: row.eligibilityPayload,
    notes_payload: row.notesPayload,
    is_active: row.isActive,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Idempotent upsert on natural key (program_slug, source_family, institution_id):
 * one active baseline row per key; updates payload and governance fields when present.
 */
export async function ingestAdmissionRealismBaseline(params: {
  supabase: SupabaseClient;
  records?: AdmissionRealismIngestInput[];
}): Promise<{ inserted: number; updated: number }> {
  const records = params.records ?? BASELINE_CENTRALIZED_ADMISSION_DOCTOR_RECORDS;
  let inserted = 0;
  let updated = 0;

  for (const row of records) {
    let existingQuery = params.supabase
      .from("route_admission_realism_records")
      .select("id")
      .eq("program_slug", row.programSlug)
      .eq("source_family", row.sourceFamily);

    existingQuery =
      row.institutionId === null
        ? existingQuery.is("institution_id", null)
        : existingQuery.eq("institution_id", row.institutionId);

    const { data: existing, error: selectError } = await existingQuery.maybeSingle();

    if (selectError) {
      throw new Error(
        `ingestAdmissionRealismBaseline: failed to resolve existing row for ${row.programSlug}: ${selectError.message}`
      );
    }

    const payload = toRowForDb(row);

    if (existing?.id) {
      const { error: updateError } = await params.supabase
        .from("route_admission_realism_records")
        .update(payload)
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(
          `ingestAdmissionRealismBaseline: update failed for ${row.programSlug}: ${updateError.message}`
        );
      }

      updated += 1;
    } else {
      const { error: insertError } = await params.supabase
        .from("route_admission_realism_records")
        .insert(payload);

      if (insertError) {
        throw new Error(
          `ingestAdmissionRealismBaseline: insert failed for ${row.programSlug}: ${insertError.message}`
        );
      }

      inserted += 1;
    }
  }

  return { inserted, updated };
}
