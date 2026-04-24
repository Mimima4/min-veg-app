import { createClient } from "@supabase/supabase-js";

const COUNTY_CODE_TO_VILBLI = {
  "03": { slug: "oslo", label: "Oslo" },
  "31": { slug: "ostfold", label: "Østfold" },
  "32": { slug: "akershus", label: "Akershus" },
  "33": { slug: "buskerud", label: "Buskerud" },
  "34": { slug: "innlandet", label: "Innlandet" },
  "39": { slug: "vestfold", label: "Vestfold" },
  "40": { slug: "telemark", label: "Telemark" },
  "42": { slug: "agder", label: "Agder" },
  "46": { slug: "vestland", label: "Vestland" },
  "50": { slug: "trondelag", label: "Trondelag" },
  "55": { slug: "troms", label: "Troms" },
  "56": { slug: "finnmark", label: "Finnmark" },
  "11": { slug: "rogaland", label: "Rogaland" },
  "15": { slug: "more-og-romsdal", label: "More og Romsdal" },
  "18": { slug: "nordland", label: "Nordland" },
};

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

function buildKeepSlugs({ professionSlug, countySlug }) {
  return new Set([
    `${professionSlug}-vg1-elektro-${countySlug}`,
    `${professionSlug}-vg2-elenergi-${countySlug}`,
    `${professionSlug}-vg3-maritim-elektriker-${countySlug}`,
  ]);
}

async function tableHasColumn(supabase, table, column) {
  const { error } = await supabase.from(table).select(column).limit(1);
  return !error;
}

async function run() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  const args = parseArgs(process.argv.slice(2));
  const professionSlug = String(args.profession ?? "").trim();
  const countyCode = String(args.county ?? "").trim();
  if (!professionSlug || !countyCode) {
    throw new Error(
      "Usage: node scripts/rollback-overbroad-vgs-expansion.mjs --profession electrician --county 50"
    );
  }

  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!countyMeta) throw new Error(`Unsupported county code: ${countyCode}`);
  const countySlug = countyMeta.slug;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const keepSlugs = buildKeepSlugs({ professionSlug, countySlug });

  const { data: professionLinks, error: linksError } = await supabase
    .from("profession_program_links")
    .select("id, program_slug")
    .eq("profession_slug", professionSlug)
    .ilike("program_slug", `${professionSlug}-%-${countySlug}`);
  if (linksError) throw linksError;

  const wrongLinks = (professionLinks ?? []).filter((row) => !keepSlugs.has(row.program_slug));
  const wrongSlugs = Array.from(new Set(wrongLinks.map((row) => row.program_slug))).sort();

  const { data: wrongProgrammes, error: programmesError } = wrongSlugs.length
    ? await supabase
        .from("education_programs")
        .select("id, slug")
        .in("slug", wrongSlugs)
    : { data: [], error: null };
  if (programmesError) throw programmesError;
  const wrongProgrammeIds = (wrongProgrammes ?? []).map((row) => row.id);

  const availabilityHasIsActive = await tableHasColumn(
    supabase,
    "programme_school_availability",
    "is_active"
  );
  let availabilityAffected = 0;
  if (wrongProgrammeIds.length) {
    if (availabilityHasIsActive) {
      const { data, error } = await supabase
        .from("programme_school_availability")
        .update({ is_active: false })
        .in("education_program_id", wrongProgrammeIds)
        .eq("county_code", countyCode)
        .select("id");
      if (error) throw error;
      availabilityAffected = (data ?? []).length;
    } else {
      const { data, error } = await supabase
        .from("programme_school_availability")
        .delete()
        .in("education_program_id", wrongProgrammeIds)
        .eq("county_code", countyCode)
        .select("id");
      if (error) throw error;
      availabilityAffected = (data ?? []).length;
    }
  }

  let linksAffected = 0;
  if (wrongLinks.length) {
    const wrongLinkIds = wrongLinks.map((row) => row.id);
    const { data, error } = await supabase
      .from("profession_program_links")
      .delete()
      .in("id", wrongLinkIds)
      .select("id");
    if (error) throw error;
    linksAffected = (data ?? []).length;
  }

  const { data: remaining, error: remainingError } = await supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", professionSlug)
    .ilike("program_slug", `${professionSlug}-%-${countySlug}`);
  if (remainingError) throw remainingError;

  console.log(
    JSON.stringify(
      {
        professionSlug,
        countyCode,
        countySlug,
        keepSlugs: Array.from(keepSlugs),
        wrongSlugs,
        rollback: {
          linksDeleted: linksAffected,
          availabilityMode: availabilityHasIsActive ? "mark_inactive" : "delete_rows",
          availabilityAffected,
          educationProgramsDeleted: 0,
        },
        remainingCountySlugs: (remaining ?? []).map((row) => row.program_slug).sort(),
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(`Rollback failed: ${error.message}`);
  process.exit(1);
});
