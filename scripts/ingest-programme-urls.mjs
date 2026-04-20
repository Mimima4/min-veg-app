import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- helpers

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9æøå ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isRelevant(title, programTitle) {
  const t1 = normalize(title);
  const t2 = normalize(programTitle);

  if (!t1 || !t2) return false;

  // минимальная защита от Økonomi vs Medisin
  const keywords = t2.split(" ").slice(0, 3);
  return keywords.every((k) => t1.includes(k));
}

// --- source search (Utdanning.no)

async function searchUtdanning(programTitle) {
  const query = encodeURIComponent(programTitle);
  const url = `https://utdanning.no/api/search?q=${query}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data?.results?.length) return null;

    for (const r of data.results) {
      if (isRelevant(r.title, programTitle)) {
        return r.url;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// --- main

async function run() {
  const { data: programs, error } = await supabase
    .from("education_programs")
    .select("id, title, programme_url")
    .eq("is_active", true);

  if (error) throw error;

  let updated = 0;
  let skipped = 0;

  for (const p of programs) {
    if (p.programme_url) {
      skipped++;
      continue;
    }

    const found = await searchUtdanning(p.title);

    if (!found) continue;

    await supabase
      .from("education_programs")
      .update({ programme_url: found })
      .eq("id", p.id);

    console.log(`✔ ${p.title} → ${found}`);
    updated++;
  }

  console.log("\nDONE");
  console.log("updated:", updated);
  console.log("skipped:", skipped);
}

run();
