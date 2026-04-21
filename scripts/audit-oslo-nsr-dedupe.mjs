import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function assertEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coreName(value) {
  return normalize(value)
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregående skole\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    .replace(/\bskole\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return coreName(value).split(" ").filter(Boolean);
}

function websiteDomain(url) {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function similarity(a, b) {
  const aSet = new Set(tokens(a));
  const bSet = new Set(tokens(b));
  if (aSet.size === 0 || bSet.size === 0) return 0;
  let overlap = 0;
  for (const t of aSet) if (bSet.has(t)) overlap += 1;
  return overlap / Math.max(aSet.size, bSet.size);
}

function classifyCluster(rows) {
  if (rows.length === 1) {
    return {
      classification: "distinct_valid_school",
      reason: "single Oslo NSR row in cluster",
    };
  }

  const orgSet = new Set(rows.map((r) => String(r.nsr_organisasjonsnummer ?? "")).filter(Boolean));
  const domainSet = new Set(rows.map((r) => websiteDomain(r.website_url)).filter(Boolean));
  const nameCores = rows.map((r) => coreName(r.name));

  const exactCoreMatch = new Set(nameCores).size === 1;
  const avgSimilarity =
    rows.length < 2
      ? 1
      : similarity(rows[0].name, rows[1].name);

  if (orgSet.size === 1 && orgSet.size > 0 && (exactCoreMatch || avgSimilarity >= 0.7)) {
    return {
      classification: "probable_duplicate",
      reason: "shared organization number and high name similarity",
    };
  }

  if ((domainSet.size === 1 && domainSet.size > 0) || exactCoreMatch) {
    return {
      classification: "same_school_different_name",
      reason: "shared domain and/or same name core with different display/legal labels",
    };
  }

  return {
    classification: "needs_review",
    reason: "related identity signals exist but not strong enough for safe auto-classification",
  };
}

async function fetchOsloNsrRows() {
  const { data, error } = await supabase
    .from("education_institutions")
    .select(
      "id, name, nsr_organisasjonsnummer, website_url, county_code, municipality_code, is_route_relevant, is_private_school, municipality_name, slug"
    )
    .eq("source", "nsr")
    .eq("county_code", "03")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function buildClusters(rows) {
  const clusters = new Map();
  for (const row of rows) {
    const t = tokens(row.name);
    const key = t[0] || coreName(row.name) || normalize(row.name);
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(row);
  }
  return [...clusters.entries()]
    .map(([key, members]) => ({ key, members }))
    .sort((a, b) => b.members.length - a.members.length || a.key.localeCompare(b.key));
}

async function run() {
  assertEnv();
  const rows = await fetchOsloNsrRows();

  console.log("=== OSLO NSR DEDUPE AUDIT ===\n");
  console.log(`Total Oslo NSR rows: ${rows.length}\n`);

  console.log("=== FULL OSLO NSR ROW LIST (COMPACT) ===");
  for (const r of rows) {
    console.log(
      `- id=${r.id} | name=${r.name} | orgnr=${r.nsr_organisasjonsnummer ?? "null"} | website=${r.website_url ?? "null"} | county=${r.county_code} | municipality_code=${r.municipality_code ?? "null"} | is_route_relevant=${r.is_route_relevant} | is_private_school=${r.is_private_school ?? "null"} | municipality_name=${r.municipality_name ?? "null"}`
    );
  }
  console.log("");

  const clusters = buildClusters(rows).filter((c) => c.members.length > 1);
  if (clusters.length === 0) {
    console.log("No suspicious multi-row clusters detected.");
    return;
  }

  console.log("=== SUSPICIOUS CLUSTERS ===");
  for (const cluster of clusters) {
    const { classification, reason } = classifyCluster(cluster.members);
    console.log(`\nCluster: ${cluster.key}`);
    for (const r of cluster.members) {
      console.log(
        `- ${r.name} | id=${r.id} | orgnr=${r.nsr_organisasjonsnummer ?? "null"} | domain=${websiteDomain(r.website_url) || "null"} | municipality_code=${r.municipality_code ?? "null"}`
      );
    }
    console.log(`classification: ${classification}`);
    console.log(`reason: ${reason}`);
  }
}

run().catch((error) => {
  console.error("Audit failed:", error.message);
  process.exit(1);
});
