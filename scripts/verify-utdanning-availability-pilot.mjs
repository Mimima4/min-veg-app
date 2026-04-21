import fetch from "node-fetch";

const PILOT_SCHOOLS = [
  {
    id: "0128c7c2-5d55-476e-8984-d73c76852220",
    name: "Bjørnholt videregående skole",
    schoolCode: "220510",
  },
  {
    id: "61a1ed6d-37ea-4b8c-a929-c34117cb1516",
    name: "Elvebakken videregående skole",
    schoolCode: "8105",
  },
  {
    id: "be24d98a-65f3-431f-84e2-b48533e31df4",
    name: "Etterstad videregående skole",
    schoolCode: "8109",
  },
  {
    id: "837bfb09-3075-44c6-bc06-afddb6cf5e8e",
    name: "Kuben videregående skole",
    schoolCode: "323183",
  },
  {
    id: "2efedc6d-71b3-4d99-9108-c0fe19567af6",
    name: "Ullern videregående skole",
    schoolCode: "8099",
  },
];

const TIMEOUT_MS = 12000;

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function looksLikeSchoolPage(html, schoolName) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripHtml(titleMatch[1]) : "";
  const body = stripHtml(html).slice(0, 5000);

  const schoolNorm = normalize(schoolName);
  const schoolCore = schoolNorm
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregående skole\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const titleNorm = normalize(title);
  const bodyNorm = normalize(body);
  const hasSchoolMarker =
    /skole|utdanningstilbud|fagtilbud|videregaende|videregående/i.test(bodyNorm);

  const score =
    (titleNorm.includes(schoolCore) ? 2 : 0) +
    (bodyNorm.includes(schoolCore) ? 2 : 0) +
    (hasSchoolMarker ? 1 : 0);

  return {
    ok: score >= 3,
    displayName: title || null,
  };
}

function extractDisplayName(html) {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) return stripHtml(h1Match[1]);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? stripHtml(titleMatch[1]) : null;
}

function extractProgrammeItems(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const scopeHtml = mainMatch ? mainMatch[1] : html;

  const collected = [];
  const collect = (regex, minLen = 3, maxLen = 180) => {
    for (const m of scopeHtml.matchAll(regex)) {
      const text = normalize(stripHtml(m[1]));
      if (!text) continue;
      if (text.length < minLen || text.length > maxLen) continue;
      collected.push(text);
    }
  };

  collect(/<a[^>]*>([\s\S]*?)<\/a>/gi, 3, 160);
  collect(/<li[^>]*>([\s\S]*?)<\/li>/gi, 3, 200);
  collect(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi, 3, 160);
  collect(/<div[^>]*>([\s\S]*?)<\/div>/gi, 8, 120);

  return [...new Set(collected)];
}

function evaluateProgrammes(programmeItems) {
  const vg1Confirmed = programmeItems.some(
    (item) => item.includes("vg1") && item.includes("elektro")
  );
  const vg2Confirmed = programmeItems.some(
    (item) => item.includes("vg2") && item.includes("elenergi")
  );
  const vg1Mention = programmeItems.some((item) => item.includes("elektro"));
  const vg2Mention = programmeItems.some(
    (item) => item.includes("elenergi") || item.includes("ekom")
  );

  return {
    vg1: vg1Confirmed ? "confirmed" : vg1Mention ? "unclear" : "not_found",
    vg2: vg2Confirmed ? "confirmed" : vg2Mention ? "unclear" : "not_found",
  };
}

function verdictFrom(found, statuses) {
  if (!found) return "not_found";
  const confirmedCount =
    (statuses.vg1 === "confirmed" ? 1 : 0) + (statuses.vg2 === "confirmed" ? 1 : 0);
  if (confirmedCount === 2) return "verified";
  if (confirmedCount === 1) return "partial";
  return "mismatch";
}

async function verifySchool(school) {
  const url = `https://utdanning.no/org/vilbli_no_adr_${school.schoolCode}`;

  try {
    const html = await fetchText(url);
    const identityCheck = looksLikeSchoolPage(html, school.name);
    if (!identityCheck.ok) {
      return {
        found: false,
        url,
        displayName: null,
        candidateSample: [],
        statuses: {
          vg1: "unclear",
          vg2: "unclear",
        },
        verdict: "not_found",
      };
    }

    const displayName = extractDisplayName(html);
    const programmeItems = extractProgrammeItems(html);
    const statuses = evaluateProgrammes(programmeItems);

    return {
      found: true,
      url,
      displayName,
      candidateSample: programmeItems.slice(0, 10),
      statuses,
      verdict: verdictFrom(true, statuses),
    };
  } catch (error) {
    return {
      found: false,
      url,
      displayName: null,
      candidateSample: [],
      statuses: {
        vg1: "not_found",
        vg2: "not_found",
      },
      verdict: "not_found",
      error: error.message,
    };
  }
}

async function run() {
  const summary = {
    verified: 0,
    partial: 0,
    mismatch: 0,
    found: 0,
    not_found: 0,
  };

  console.log("=== UTDANNING VERIFICATION PREVIEW ===\n");

  for (const school of PILOT_SCHOOLS) {
    const result = await verifySchool(school);
    if (result.found) summary.found += 1;
    else summary.not_found += 1;
    if (summary[result.verdict] !== undefined) {
      summary[result.verdict] += 1;
    }

    console.log(`School: ${school.name}`);
    console.log(`NSR id: ${school.id}`);
    console.log(`schoolCode: ${school.schoolCode}\n`);
    console.log("Utdanning:");
    console.log(`- found: ${result.found ? "yes" : "no"}`);
    console.log(`- url: ${result.url ?? "null"}`);
    console.log(`- display_name: ${result.displayName ?? "null"}\n`);
    console.log("Extracted candidates (sample):");
    for (const item of result.candidateSample) {
      console.log(`- ${item}`);
    }
    console.log("");
    console.log("Programmes:");
    console.log(`- VG1 Elektro og datateknologi: ${result.statuses.vg1}`);
    console.log(`- VG2 Elenergi og ekom: ${result.statuses.vg2}\n`);
    console.log("Verdict:");
    console.log(`- ${result.verdict}\n`);
  }

  console.log("=== SUMMARY ===");
  console.log(`verified: ${summary.verified}`);
  console.log(`partial: ${summary.partial}`);
  console.log(`mismatch: ${summary.mismatch}`);
  console.log(`not_found: ${summary.not_found}\n`);
  console.log("Done");
}

run().catch((error) => {
  console.error("Pilot verification failed:", error.message);
  process.exit(1);
});
