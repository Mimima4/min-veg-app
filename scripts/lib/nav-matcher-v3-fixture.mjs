/**
 * V-3 fixture: filter_id scopes path-family map matches (no DB).
 */
const FAST_TAGS = new Set(["laere", "fagbrev"]);
const ACADEMIC_TAGS = new Set(["akademisk", "profesjonsstudier"]);

const FIXTURE_OUTCOMES = [
  {
    vilbliTitle: "Bilfaget lette kjøretøy",
    sourceOutcomeUrl: "https://www.vilbli.no/nb/no/yrker/v.tp/bilfaget-lette-kjoretoy",
    filterTags: ["laere", "fagbrev"],
  },
  {
    vilbliTitle: "Elektroingeniør",
    sourceOutcomeUrl: "https://www.vilbli.no/nb/no/yrker/v.el/elektroingenior",
    filterTags: ["akademisk", "profesjonsstudier"],
  },
];

function rowPassesFilter(row, filterId) {
  if (filterId === "open" || filterId === "flexible") return true;
  if (filterId === "fast_to_work") {
    return row.filterTags.some((tag) => FAST_TAGS.has(tag));
  }
  if (filterId === "long_academic") {
    return row.filterTags.some((tag) => ACADEMIC_TAGS.has(tag));
  }
  return false;
}

export function resolveFixtureMatches(filterId) {
  return FIXTURE_OUTCOMES.filter((row) => rowPassesFilter(row, filterId));
}

export function assertV3FilterScopesOutcomes() {
  const fast = resolveFixtureMatches("fast_to_work");
  const academic = resolveFixtureMatches("long_academic");
  if (fast.length !== 1 || !fast[0].vilbliTitle.includes("Bilfaget")) {
    throw new Error("fast_to_work must scope to apprenticeship-tagged outcomes only");
  }
  if (academic.length !== 1 || !academic[0].vilbliTitle.includes("Elektroingeniør")) {
    throw new Error("long_academic must scope to academic-tagged outcomes only");
  }
  if (fast[0].sourceOutcomeUrl === academic[0].sourceOutcomeUrl) {
    throw new Error("filter change must change scoped outcome set");
  }
}
