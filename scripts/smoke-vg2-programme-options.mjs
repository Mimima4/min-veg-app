#!/usr/bin/env node
/**
 * Smoke: VG2 programme option helpers (incl. north nabofylke dedupe).
 * Pure logic mirrored from src/lib/vgs/vg2-programme-options.ts — keep in sync.
 */
import assert from "node:assert/strict";

function buildVg2ProgrammeOptionsFromTruthRows(rows) {
  const seen = new Set();
  const options = [];
  for (const row of rows) {
    if (row.stage !== "VG2") continue;
    const slug = String(row.programSlug ?? "").trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    options.push({
      program_slug: slug,
      program_title: String(row.programTitle ?? slug).trim(),
    });
  }
  return options.sort((a, b) => a.program_title.localeCompare(b.program_title, "nb"));
}

function buildVg2ProgrammeOptionId(programSlug) {
  return `vg2-programme-${programSlug}`;
}

function parseVg2ProgrammeOptionId(optionId) {
  const match = String(optionId).match(/^vg2-programme-(.+)$/);
  return match?.[1]?.trim() || null;
}

function isNabofylkeVg2ProgrammeSlug(programSlug) {
  return /(?:^|-)nabofylke$/.test(String(programSlug ?? "").trim());
}

function preferVg2ProgrammeOptionForProfession(a, b, countySuffix) {
  const aNabo = isNabofylkeVg2ProgrammeSlug(a.program_slug);
  const bNabo = isNabofylkeVg2ProgrammeSlug(b.program_slug);
  if (aNabo !== bNabo) return aNabo ? b : a;
  const suffix = String(countySuffix ?? "").trim();
  if (suffix) {
    const aLocal = a.program_slug.endsWith(`-${suffix}`);
    const bLocal = b.program_slug.endsWith(`-${suffix}`);
    if (aLocal !== bLocal) return aLocal ? a : b;
  }
  return a.program_title.length >= b.program_title.length ? a : b;
}

function dedupeVg2ProgrammeOptionsByProfession({ options, countySuffix, routeProfessionSlug }) {
  const byProfession = new Map();
  for (const option of options) {
    const profession = option.profession_slug ?? routeProfessionSlug;
    const existing = byProfession.get(profession);
    if (!existing) {
      byProfession.set(profession, option);
      continue;
    }
    byProfession.set(
      profession,
      preferVg2ProgrammeOptionForProfession(existing, option, countySuffix)
    );
  }
  return Array.from(byProfession.values()).sort((a, b) =>
    a.program_title.localeCompare(b.program_title, "nb")
  );
}

const programmes = buildVg2ProgrammeOptionsFromTruthRows([
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-vestland",
    programTitle: "VG2 Elenergi og ekom",
  },
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-vestland",
    programTitle: "VG2 Elenergi og ekom",
  },
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-alt-vestland",
    programTitle: "VG2 Alternativ",
  },
]);
assert.equal(programmes.length, 2);
assert.equal(programmes[0]?.program_slug, "electrician-vg2-elenergi-alt-vestland");

assert.equal(
  parseVg2ProgrammeOptionId(buildVg2ProgrammeOptionId("plumber-vg2-rorlegger-vestland")),
  "plumber-vg2-rorlegger-vestland"
);

assert.equal(isNabofylkeVg2ProgrammeSlug("plumber-vg2-rorlegger-nabofylke"), true);
assert.equal(isNabofylkeVg2ProgrammeSlug("plumber-vg2-rorlegger-finnmark"), false);

assert.equal(
  preferVg2ProgrammeOptionForProfession(
    {
      program_slug: "plumber-vg2-rorlegger-nabofylke",
      program_title: "VG2 rørlegger",
      profession_slug: "plumber",
    },
    {
      program_slug: "plumber-vg2-rorlegger-finnmark",
      program_title: "VG2 Rørleggerfaget",
      profession_slug: "plumber",
    },
    "finnmark"
  ).program_slug,
  "plumber-vg2-rorlegger-finnmark"
);

const deduped = dedupeVg2ProgrammeOptionsByProfession({
  options: [
    {
      program_slug: "plumber-vg2-rorlegger-finnmark",
      program_title: "VG2 Rørleggerfaget",
      profession_slug: "plumber",
    },
    {
      program_slug: "plumber-vg2-rorlegger-nabofylke",
      program_title: "VG2 rørlegger",
      profession_slug: "plumber",
    },
    {
      program_slug: "anleggsteknikk-vg2-anleggsteknikk-finnmark",
      program_title: "VG2 Anleggsteknikfaget",
      profession_slug: "anleggsteknikk",
    },
    {
      program_slug: "anleggsteknikk-vg2-anleggsteknikk-nabofylke",
      program_title: "VG2 Anleggsteknikk",
      profession_slug: "anleggsteknikk",
    },
  ],
  countySuffix: "finnmark",
  routeProfessionSlug: "plumber",
});
assert.equal(deduped.length, 2);
assert.equal(
  deduped.find((o) => o.profession_slug === "plumber")?.program_slug,
  "plumber-vg2-rorlegger-finnmark"
);
assert.equal(
  deduped.find((o) => o.profession_slug === "anleggsteknikk")?.program_slug,
  "anleggsteknikk-vg2-anleggsteknikk-finnmark"
);

console.log("OK vg2-programme-options smoke");
