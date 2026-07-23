/**
 * Shared Contour B catalog profession rename (treteknikk→snekker pattern + study_routes).
 *
 * Clones education_programs under the new slug prefix, repoints links/PSA/continuations,
 * remaps study_routes / child_profession_interests, then soft-deactivates the old profession.
 *
 * Does NOT manually flip PSA is_active (no manual PSA plugs).
 */

import { createClient } from "@supabase/supabase-js";

/**
 * @typedef {{
 *   oldSlug: string,
 *   newSlug: string,
 *   oldCodePrefix: string,
 *   newCodePrefix: string,
 *   titles: {
 *     title_i18n: Record<string, string>,
 *     summary_i18n: Record<string, string>,
 *     education_notes_i18n: Record<string, string>,
 *   },
 * }} RenameProfessionSpec
 */

/**
 * @param {string} slug
 * @param {string} fromPrefix
 * @param {string} toPrefix
 */
export function renameProgrammeSlug(slug, fromPrefix, toPrefix) {
  const re = new RegExp(`^${escapeRegExp(fromPrefix)}-`);
  return String(slug).replace(re, `${toPrefix}-`);
}

/**
 * @param {string | null | undefined} code
 * @param {string} fromPrefix
 * @param {string} toPrefix
 */
export function renameProgrammeCode(code, fromPrefix, toPrefix) {
  const raw = String(code ?? "").trim();
  if (!raw) return `${toPrefix}UNKNOWN`;
  if (raw.startsWith(toPrefix)) return raw;
  if (raw.startsWith(fromPrefix)) {
    return `${toPrefix}${raw.slice(fromPrefix.length)}`;
  }
  // Historical rows sometimes used a different code prefix (e.g. ANLEGGST- vs ANLEG-).
  // Keep uniqueness under the new namespace without inventing a partial replace.
  return `${toPrefix}${raw}`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remap study_routes.target_profession_id old → new for non-archived routes.
 * If the child already has a non-archived draft for the NEW profession, archive the OLD route.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} oldProfessionId
 * @param {string} newProfessionId
 */
export async function remapStudyRoutes(sb, oldProfessionId, newProfessionId) {
  const { data: oldRoutes, error } = await sb
    .from("study_routes")
    .select("id, child_id, status, archived_at")
    .eq("target_profession_id", oldProfessionId)
    .is("archived_at", null);
  if (error) throw error;

  let remapped = 0;
  let archived = 0;

  for (const route of oldRoutes ?? []) {
    const { data: existingNew, error: existErr } = await sb
      .from("study_routes")
      .select("id")
      .eq("child_id", route.child_id)
      .eq("target_profession_id", newProfessionId)
      .is("archived_at", null)
      .limit(1)
      .maybeSingle();
    if (existErr) throw existErr;

    if (existingNew?.id) {
      const { error: archErr } = await sb
        .from("study_routes")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
        })
        .eq("id", route.id);
      if (archErr) throw archErr;
      archived += 1;
      continue;
    }

    const { error: updErr } = await sb
      .from("study_routes")
      .update({ target_profession_id: newProfessionId })
      .eq("id", route.id);
    if (updErr) throw updErr;
    remapped += 1;
  }

  // Also archive any already-archived leftovers that still point at old id? leave as-is for audit.
  console.log("study_routes remapped", remapped, "archived-as-duplicate", archived);
  return { remapped, archived };
}

/**
 * Remap child_profession_interests.profession_id. On unique clash, drop the old row.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} oldProfessionId
 * @param {string} newProfessionId
 */
export async function remapChildProfessionInterests(sb, oldProfessionId, newProfessionId) {
  const { data: rows, error } = await sb
    .from("child_profession_interests")
    .select("id, child_profile_id")
    .eq("profession_id", oldProfessionId);
  if (error) {
    if (/Could not find the table|schema cache|column/i.test(error.message)) {
      console.log("child_profession_interests skipped:", error.message);
      return { remapped: 0, deleted: 0 };
    }
    throw error;
  }

  let remapped = 0;
  let deleted = 0;
  for (const row of rows ?? []) {
    const { data: clash } = await sb
      .from("child_profession_interests")
      .select("id")
      .eq("child_profile_id", row.child_profile_id)
      .eq("profession_id", newProfessionId)
      .maybeSingle();
    if (clash?.id) {
      const { error: delErr } = await sb
        .from("child_profession_interests")
        .delete()
        .eq("id", row.id);
      if (delErr) throw delErr;
      deleted += 1;
      continue;
    }
    const { error: updErr } = await sb
      .from("child_profession_interests")
      .update({ profession_id: newProfessionId })
      .eq("id", row.id);
    if (updErr) {
      if (updErr.code === "23505") {
        const { error: delErr } = await sb
          .from("child_profession_interests")
          .delete()
          .eq("id", row.id);
        if (delErr) throw delErr;
        deleted += 1;
        continue;
      }
      throw updErr;
    }
    remapped += 1;
  }
  console.log("child_profession_interests remapped", remapped, "deleted-as-duplicate", deleted);
  return { remapped, deleted };
}

/**
 * @param {RenameProfessionSpec} spec
 */
export async function runContourBProfessionRename(spec) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(url, key);
  const { oldSlug, newSlug, oldCodePrefix, newCodePrefix, titles } = spec;

  const { data: oldProf, error: oldErr } = await sb
    .from("professions")
    .select("*")
    .eq("slug", oldSlug)
    .maybeSingle();
  if (oldErr) throw oldErr;

  const { data: existingNew, error: newErr } = await sb
    .from("professions")
    .select("id, slug")
    .eq("slug", newSlug)
    .maybeSingle();
  if (newErr) throw newErr;

  if (!existingNew) {
    if (!oldProf) throw new Error(`Neither ${oldSlug} nor ${newSlug} profession exists`);
    const { error: insErr } = await sb.from("professions").insert({
      slug: newSlug,
      ...titles,
      education_level: oldProf.education_level ?? "vocational",
      work_style: oldProf.work_style ?? "onsite",
      demand_level: oldProf.demand_level ?? "high",
      is_active: true,
      interest_tags: oldProf.interest_tags,
      strength_tags: oldProf.strength_tags,
      development_focus_tags: oldProf.development_focus_tags,
      school_subject_tags: oldProf.school_subject_tags,
      key_skills: oldProf.key_skills,
      avg_salary_nok: oldProf.avg_salary_nok,
    });
    if (insErr) throw insErr;
    console.log(`inserted professions.${newSlug}`);
  } else {
    const { error: updErr } = await sb
      .from("professions")
      .update({ ...titles, is_active: true })
      .eq("slug", newSlug);
    if (updErr) throw updErr;
    console.log(`updated professions.${newSlug} titles`);
  }

  const { data: newProf, error: newProfErr } = await sb
    .from("professions")
    .select("id, slug, is_active")
    .eq("slug", newSlug)
    .single();
  if (newProfErr) throw newProfErr;

  const { data: programmes, error: progErr } = await sb
    .from("education_programs")
    .select("*")
    .like("slug", `${oldSlug}-%`);
  if (progErr) throw progErr;

  /** @type {Map<string, string>} */
  const programmeIdMap = new Map();
  let clonedProgrammes = 0;

  for (const row of programmes ?? []) {
    const nextSlug = renameProgrammeSlug(row.slug, oldSlug, newSlug);
    const { data: existing } = await sb
      .from("education_programs")
      .select("id")
      .eq("slug", nextSlug)
      .maybeSingle();

    if (existing?.id) {
      programmeIdMap.set(row.id, existing.id);
      continue;
    }

    const clone = { ...row };
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    clone.slug = nextSlug;
    clone.program_code = renameProgrammeCode(row.program_code, oldCodePrefix, newCodePrefix);

    const { data: inserted, error } = await sb
      .from("education_programs")
      .insert(clone)
      .select("id")
      .single();
    if (error) throw error;
    programmeIdMap.set(row.id, inserted.id);
    clonedProgrammes += 1;
  }
  console.log("cloned programmes", clonedProgrammes, "id map", programmeIdMap.size);

  const { data: links, error: linkErr } = await sb
    .from("profession_program_links")
    .select("id, program_slug")
    .eq("profession_slug", oldSlug);
  if (linkErr) throw linkErr;

  let movedLinks = 0;
  for (const row of links ?? []) {
    const nextSlug = renameProgrammeSlug(row.program_slug, oldSlug, newSlug);
    const { data: clash } = await sb
      .from("profession_program_links")
      .select("id")
      .eq("profession_slug", newSlug)
      .eq("program_slug", nextSlug)
      .maybeSingle();
    if (clash) {
      const { error } = await sb.from("profession_program_links").delete().eq("id", row.id);
      if (error) throw error;
      continue;
    }
    const { error } = await sb
      .from("profession_program_links")
      .update({ profession_slug: newSlug, program_slug: nextSlug })
      .eq("id", row.id);
    if (error) throw error;
    movedLinks += 1;
  }
  console.log("moved links", movedLinks);

  let movedPsa = 0;
  for (const [oldId, newId] of programmeIdMap.entries()) {
    if (oldId === newId) continue;
    const { data: psaRows, error: psaErr } = await sb
      .from("programme_school_availability")
      .select("id")
      .eq("education_program_id", oldId);
    if (psaErr) throw psaErr;
    for (const psa of psaRows ?? []) {
      const { error } = await sb
        .from("programme_school_availability")
        .update({ education_program_id: newId })
        .eq("id", psa.id);
      if (error) {
        if (error.code === "23505") {
          const { error: delErr } = await sb
            .from("programme_school_availability")
            .delete()
            .eq("id", psa.id);
          if (delErr) throw delErr;
          continue;
        }
        throw error;
      }
      movedPsa += 1;
    }
  }
  console.log("moved PSA rows", movedPsa);

  const { data: conts, error: contErr } = await sb
    .from("vgs_vilbli_home_vg2_continuations")
    .select("profession_slug, home_county_code, institution_id")
    .eq("profession_slug", oldSlug);
  if (contErr) throw contErr;

  let movedConts = 0;
  for (const row of conts ?? []) {
    const { data: clash } = await sb
      .from("vgs_vilbli_home_vg2_continuations")
      .select("institution_id")
      .eq("profession_slug", newSlug)
      .eq("home_county_code", row.home_county_code)
      .eq("institution_id", row.institution_id)
      .maybeSingle();
    if (clash) {
      const { error } = await sb
        .from("vgs_vilbli_home_vg2_continuations")
        .delete()
        .eq("profession_slug", oldSlug)
        .eq("home_county_code", row.home_county_code)
        .eq("institution_id", row.institution_id);
      if (error) throw error;
      continue;
    }
    const { error } = await sb
      .from("vgs_vilbli_home_vg2_continuations")
      .update({ profession_slug: newSlug })
      .eq("profession_slug", oldSlug)
      .eq("home_county_code", row.home_county_code)
      .eq("institution_id", row.institution_id);
    if (error) throw error;
    movedConts += 1;
  }
  console.log("moved continuations", movedConts);

  const { error: obsErr } = await sb
    .from("source_school_observations")
    .update({ profession_slug: newSlug })
    .eq("profession_slug", oldSlug);
  if (obsErr && !/Could not find the table|schema cache/i.test(obsErr.message)) {
    throw obsErr;
  }
  console.log("observations", obsErr ? `skipped (${obsErr.message})` : "updated");

  // CRITICAL: remapping so drafts keep working under the new catalog slug.
  if (oldProf?.id && newProf?.id && oldProf.id !== newProf.id) {
    await remapStudyRoutes(sb, oldProf.id, newProf.id);
    await remapChildProfessionInterests(sb, oldProf.id, newProf.id);
  } else {
    console.log("study_routes / interests skip (missing old/new profession ids)");
  }

  const oldIds = [...programmeIdMap.keys()];
  if (oldIds.length > 0) {
    const { error } = await sb
      .from("education_programs")
      .update({ is_active: false })
      .in("id", oldIds);
    if (error && !/column .*is_active/i.test(error.message)) {
      console.warn("deactivate old programmes:", error.message);
    } else if (!error) {
      console.log(`deactivated old ${oldSlug} programmes`, oldIds.length);
    }
  }

  if (oldProf) {
    const { error } = await sb
      .from("professions")
      .update({ is_active: false })
      .eq("slug", oldSlug);
    if (error) throw error;
    console.log(`deactivated professions.${oldSlug}`);
  }

  const { count: newLinks } = await sb
    .from("profession_program_links")
    .select("*", { count: "exact", head: true })
    .eq("profession_slug", newSlug);
  const { count: leftoverLinks } = await sb
    .from("profession_program_links")
    .select("*", { count: "exact", head: true })
    .eq("profession_slug", oldSlug);

  console.log("DONE", {
    newLinks,
    leftoverLinks,
    newProf,
    oldSlug,
    newSlug,
  });
}

// silence unused helper (kept for clarity / future tables)
void remapProfessionIdRows;
