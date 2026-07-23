/**
 * One-shot: rename Contour B profession treteknikk → snekker in prod DB.
 *
 * education_programs.slug is referenced by profession_program_links.program_slug,
 * so we clone programmes under snekker-* slugs, repoint links + PSA, then deactivate old rows.
 *
 * Usage: node --env-file=.env.local scripts/rename-profession-treteknikk-to-snekker.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SNEKKER_TITLES = {
  title_i18n: { nb: "Snekker", nn: "Snekkar", en: "Joiner" },
  summary_i18n: {
    nb: "Lager møbler, innredning og treprodukter — fra verksted til industriell trevare.",
    nn: "Lagar møblar, innreiing og treprodukt — frå verkstad til industriell trevare.",
    en: "Makes furniture, interiors and wood products — from workshop to industrial timber goods.",
  },
  education_notes_i18n: {
    nb: "VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekker / industrisnekker / trelast).",
    nn: "VGS: Bygg- og anleggsteknikk → Treteknikk. Deretter lære og fagbrev (snekkar / industrisnekkar / trelast).",
    en: "Upper secondary: Building and construction → Wood technology (Treteknikk). Then apprenticeship and trade certificate.",
  },
};

function renameSlug(slug) {
  return String(slug).replace(/^treteknikk-/, "snekker-");
}

function renameCode(code) {
  return String(code ?? "").replace(/^TRETEKNIKK-/, "SNEKKER-");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(url, key);

  const { data: oldProf, error: oldErr } = await sb
    .from("professions")
    .select("*")
    .eq("slug", "treteknikk")
    .maybeSingle();
  if (oldErr) throw oldErr;

  const { data: existingSnekker, error: snErr } = await sb
    .from("professions")
    .select("slug")
    .eq("slug", "snekker")
    .maybeSingle();
  if (snErr) throw snErr;

  if (!existingSnekker) {
    if (!oldProf) throw new Error("Neither treteknikk nor snekker profession exists");
    const { error: insErr } = await sb.from("professions").insert({
      slug: "snekker",
      ...SNEKKER_TITLES,
      education_level: oldProf.education_level ?? "vocational",
      work_style: oldProf.work_style ?? "onsite",
      demand_level: oldProf.demand_level ?? "high",
      is_active: true,
      interest_tags: oldProf.interest_tags,
      strength_tags: oldProf.strength_tags,
      development_focus_tags: oldProf.development_focus_tags,
      school_subject_tags: oldProf.school_subject_tags,
      key_skills: oldProf.key_skills,
      avg_salary_nok: oldProf.avg_salary_nok ?? 520000,
    });
    if (insErr) throw insErr;
    console.log("inserted professions.snekker");
  } else {
    const { error: updErr } = await sb
      .from("professions")
      .update({ ...SNEKKER_TITLES, is_active: true })
      .eq("slug", "snekker");
    if (updErr) throw updErr;
    console.log("updated professions.snekker titles");
  }

  const { data: programmes, error: progErr } = await sb
    .from("education_programs")
    .select("*")
    .like("slug", "treteknikk-%");
  if (progErr) throw progErr;

  /** @type {Map<string, string>} oldProgrammeId -> newProgrammeId */
  const programmeIdMap = new Map();
  let clonedProgrammes = 0;

  for (const row of programmes ?? []) {
    const nextSlug = renameSlug(row.slug);
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
    clone.program_code = renameCode(row.program_code);

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
    .eq("profession_slug", "treteknikk");
  if (linkErr) throw linkErr;

  let movedLinks = 0;
  for (const row of links ?? []) {
    const nextSlug = renameSlug(row.program_slug);
    const { data: clash } = await sb
      .from("profession_program_links")
      .select("id")
      .eq("profession_slug", "snekker")
      .eq("program_slug", nextSlug)
      .maybeSingle();
    if (clash) {
      const { error } = await sb.from("profession_program_links").delete().eq("id", row.id);
      if (error) throw error;
      continue;
    }
    const { error } = await sb
      .from("profession_program_links")
      .update({ profession_slug: "snekker", program_slug: nextSlug })
      .eq("id", row.id);
    if (error) throw error;
    movedLinks += 1;
  }
  console.log("moved links", movedLinks);

  // Repoint PSA rows from old programme ids to new ones.
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
        // Unique clash: keep new programme's PSA, drop old.
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
    .eq("profession_slug", "treteknikk");
  if (contErr) throw contErr;

  let movedConts = 0;
  for (const row of conts ?? []) {
    const { data: clash } = await sb
      .from("vgs_vilbli_home_vg2_continuations")
      .select("institution_id")
      .eq("profession_slug", "snekker")
      .eq("home_county_code", row.home_county_code)
      .eq("institution_id", row.institution_id)
      .maybeSingle();
    if (clash) {
      const { error } = await sb
        .from("vgs_vilbli_home_vg2_continuations")
        .delete()
        .eq("profession_slug", "treteknikk")
        .eq("home_county_code", row.home_county_code)
        .eq("institution_id", row.institution_id);
      if (error) throw error;
      continue;
    }
    const { error } = await sb
      .from("vgs_vilbli_home_vg2_continuations")
      .update({ profession_slug: "snekker" })
      .eq("profession_slug", "treteknikk")
      .eq("home_county_code", row.home_county_code)
      .eq("institution_id", row.institution_id);
    if (error) throw error;
    movedConts += 1;
  }
  console.log("moved continuations", movedConts);

  const { error: obsErr } = await sb
    .from("source_school_observations")
    .update({ profession_slug: "snekker" })
    .eq("profession_slug", "treteknikk");
  if (obsErr && !/Could not find the table|schema cache/i.test(obsErr.message)) {
    throw obsErr;
  }
  console.log("observations", obsErr ? `skipped (${obsErr.message})` : "updated");

  // Deactivate old programmes (keep rows for audit; links no longer reference them).
  const oldIds = [...programmeIdMap.keys()];
  if (oldIds.length > 0) {
    const { error } = await sb
      .from("education_programs")
      .update({ is_active: false })
      .in("id", oldIds);
    if (error && !/column .*is_active/i.test(error.message)) {
      // Some schemas may not have is_active on education_programs — log and continue.
      console.warn("deactivate old programmes:", error.message);
    } else if (!error) {
      console.log("deactivated old treteknikk programmes", oldIds.length);
    }
  }

  if (oldProf) {
    const { error } = await sb
      .from("professions")
      .update({ is_active: false })
      .eq("slug", "treteknikk");
    if (error) throw error;
    console.log("deactivated professions.treteknikk");
  }

  const { count: snekkerLinks } = await sb
    .from("profession_program_links")
    .select("*", { count: "exact", head: true })
    .eq("profession_slug", "snekker");
  const { count: leftoverLinks } = await sb
    .from("profession_program_links")
    .select("*", { count: "exact", head: true })
    .eq("profession_slug", "treteknikk");
  const { data: snekkerProf } = await sb
    .from("professions")
    .select("slug, title_i18n, is_active")
    .eq("slug", "snekker")
    .single();
  console.log("DONE", { snekkerLinks, leftoverLinks, snekkerProf });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
