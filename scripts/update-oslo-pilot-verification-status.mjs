import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COUNTY_CODE = "03";
const SOURCE = "vilbli";

const INSTITUTIONS = {
  BJORNHOLT: "0128c7c2-5d55-476e-8984-d73c76852220",
  ELVEBAKKEN: "61a1ed6d-37ea-4b8c-a929-c34117cb1516",
  ETTERSTAD: "be24d98a-65f3-431f-84e2-b48533e31df4",
  KUBEN: "837bfb09-3075-44c6-bc06-afddb6cf5e8e",
  ULLERN: "2efedc6d-71b3-4d99-9108-c0fe19567af6",
};

const PROGRAMME_SLUGS = {
  VG1: "electrician-vg1-elektro-oslo",
  VG2: "electrician-vg2-elenergi-oslo",
};

function assertEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

async function getProgrammeIdBySlug(slug) {
  const { data, error } = await supabase
    .from("education_programs")
    .select("id")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(`education_programs row not found for slug="${slug}"`);
  }
  return data.id;
}

function buildTargets(programmeIds) {
  const verifiedInstitutions = [
    INSTITUTIONS.BJORNHOLT,
    INSTITUTIONS.ELVEBAKKEN,
    INSTITUTIONS.ETTERSTAD,
    INSTITUTIONS.ULLERN,
  ];

  const targets = [];

  for (const institutionId of verifiedInstitutions) {
    targets.push({
      educationProgramId: programmeIds.VG1,
      institutionId,
      stage: "VG1",
      desiredStatus: "verified",
    });
    targets.push({
      educationProgramId: programmeIds.VG2,
      institutionId,
      stage: "VG2",
      desiredStatus: "verified",
    });
  }

  targets.push({
    educationProgramId: programmeIds.VG1,
    institutionId: INSTITUTIONS.KUBEN,
    stage: "VG1",
    desiredStatus: "verified",
  });
  targets.push({
    educationProgramId: programmeIds.VG2,
    institutionId: INSTITUTIONS.KUBEN,
    stage: "VG2",
    desiredStatus: "needs_review",
  });

  return targets;
}

async function fetchAvailabilityRow(target) {
  const { data, error } = await supabase
    .from("programme_school_availability")
    .select("id, verification_status")
    .eq("education_program_id", target.educationProgramId)
    .eq("institution_id", target.institutionId)
    .eq("county_code", COUNTY_CODE)
    .eq("stage", target.stage)
    .eq("source", SOURCE)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function updateVerificationStatus(rowId, status) {
  const { error } = await supabase
    .from("programme_school_availability")
    .update({
      verification_status: status,
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rowId);

  if (error) throw error;
}

async function run() {
  assertEnv();

  const programmeIds = {
    VG1: await getProgrammeIdBySlug(PROGRAMME_SLUGS.VG1),
    VG2: await getProgrammeIdBySlug(PROGRAMME_SLUGS.VG2),
  };

  const targets = buildTargets(programmeIds);

  const counters = {
    updated: 0,
    skipped: 0,
    verifiedSet: 0,
    needsReviewSet: 0,
  };

  for (const target of targets) {
    const row = await fetchAvailabilityRow(target);
    if (!row?.id) {
      counters.skipped += 1;
      continue;
    }

    if (row.verification_status === target.desiredStatus) {
      counters.skipped += 1;
      continue;
    }

    await updateVerificationStatus(row.id, target.desiredStatus);
    counters.updated += 1;

    if (target.desiredStatus === "verified") counters.verifiedSet += 1;
    if (target.desiredStatus === "needs_review") counters.needsReviewSet += 1;
  }

  console.log("=== UPDATE RESULT ===");
  console.log(`updated: ${counters.updated}`);
  console.log(`skipped: ${counters.skipped}\n`);
  console.log("Breakdown:");
  console.log(`verified set: ${counters.verifiedSet}`);
  console.log(`needs_review set: ${counters.needsReviewSet}\n`);
  console.log("Done");
}

run().catch((error) => {
  console.error("Update failed:", error.message);
  process.exit(1);
});
