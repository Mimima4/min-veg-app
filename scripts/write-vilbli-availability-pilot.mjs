import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROGRAMMES = {
  VG1: {
    slug: "electrician-vg1-elektro-oslo",
    programCode: "EL-VG1-OSLO",
  },
  VG2: {
    slug: "electrician-vg2-elenergi-oslo",
    programCode: "EL-VG2-OSLO",
  },
};

const COUNTY_CODE = "03";
const COUNTRY_CODE = "NO";
const MUNICIPALITY_CODE = "0301";
const SOURCE = "vilbli";
const AVAILABILITY_SCOPE = "programme_in_school";
const VERIFICATION_STATUS = "needs_review";
const SOURCE_REFERENCE_URL =
  "https://www.vilbli.no/nb/oslo/strukturkart/v.el/skoler-og-laerebedrifter-elektro-og-datateknologi?kurs=v.elele2----&side=p5";
const SOURCE_SNAPSHOT_LABEL = "vilbli-oslo-electrician-pilot-2026-04-21";

const STAGE_INSTITUTIONS = {
  VG1: [
    "0128c7c2-5d55-476e-8984-d73c76852220",
    "61a1ed6d-37ea-4b8c-a929-c34117cb1516",
    "be24d98a-65f3-431f-84e2-b48533e31df4",
    "837bfb09-3075-44c6-bc06-afddb6cf5e8e",
    "2efedc6d-71b3-4d99-9108-c0fe19567af6",
  ],
  VG2: [
    "0128c7c2-5d55-476e-8984-d73c76852220",
    "61a1ed6d-37ea-4b8c-a929-c34117cb1516",
    "be24d98a-65f3-431f-84e2-b48533e31df4",
    "837bfb09-3075-44c6-bc06-afddb6cf5e8e",
    "2efedc6d-71b3-4d99-9108-c0fe19567af6",
  ],
};

function assertEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

async function getEducationProgramIdByName(name) {
  const { data, error } = await supabase
    .from("education_programs")
    .select("id, slug, program_code")
    .eq("slug", name.slug)
    .eq("program_code", name.programCode)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `education_programs row not found for slug="${name.slug}" and program_code="${name.programCode}"`
    );
  }
  return data.id;
}

async function availabilityExists({
  educationProgramId,
  institutionId,
  stage,
  countyCode,
}) {
  const { data, error } = await supabase
    .from("programme_school_availability")
    .select("id")
    .eq("education_program_id", educationProgramId)
    .eq("institution_id", institutionId)
    .eq("stage", stage)
    .eq("county_code", countyCode)
    .eq("source", SOURCE)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.id);
}

async function insertAvailability({
  educationProgramId,
  institutionId,
  stage,
  countyCode,
}) {
  const payload = {
    education_program_id: educationProgramId,
    institution_id: institutionId,
    country_code: COUNTRY_CODE,
    county_code: countyCode,
    municipality_code: MUNICIPALITY_CODE,
    availability_scope: AVAILABILITY_SCOPE,
    stage,
    source: SOURCE,
    source_reference_url: SOURCE_REFERENCE_URL,
    source_snapshot_label: SOURCE_SNAPSHOT_LABEL,
    is_active: true,
    first_seen_at: new Date().toISOString(),
    last_verified_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    verification_status: VERIFICATION_STATUS,
    notes: null,
  };

  const { error } = await supabase
    .from("programme_school_availability")
    .insert(payload);

  if (error) throw error;
}

async function run() {
  assertEnv();

  const educationProgramIds = {
    VG1: await getEducationProgramIdByName(PROGRAMMES.VG1),
    VG2: await getEducationProgramIdByName(PROGRAMMES.VG2),
  };

  const counters = {
    inserted: 0,
    skipped: 0,
    byStage: {
      VG1: { inserted: 0, skipped: 0 },
      VG2: { inserted: 0, skipped: 0 },
    },
  };

  for (const stage of ["VG1", "VG2"]) {
    for (const institutionId of STAGE_INSTITUTIONS[stage]) {
      const exists = await availabilityExists({
        educationProgramId: educationProgramIds[stage],
        institutionId,
        stage,
        countyCode: COUNTY_CODE,
      });

      if (exists) {
        counters.skipped += 1;
        counters.byStage[stage].skipped += 1;
        continue;
      }

      await insertAvailability({
        educationProgramId: educationProgramIds[stage],
        institutionId,
        stage,
        countyCode: COUNTY_CODE,
      });

      counters.inserted += 1;
      counters.byStage[stage].inserted += 1;
    }
  }

  console.log("=== WRITE RESULT ===\n");
  console.log(`Inserted: ${counters.inserted}`);
  console.log(`Skipped: ${counters.skipped}\n`);
  console.log("Breakdown:");
  console.log(`VG1 inserted: ${counters.byStage.VG1.inserted}`);
  console.log(`VG1 skipped: ${counters.byStage.VG1.skipped}`);
  console.log(`VG2 inserted: ${counters.byStage.VG2.inserted}`);
  console.log(`VG2 skipped: ${counters.byStage.VG2.skipped}`);
  console.log("");
  console.log("Done");
}

run().catch((error) => {
  console.error("Write pilot failed:", error.message);
  process.exit(1);
});
