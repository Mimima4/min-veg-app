#!/usr/bin/env node
import assert from "node:assert/strict";

const NORTH_HOME = new Set(["55", "56"]);
const NORTH_FRIENDLY = new Set(["18"]);

function resolveScope({ layer, homeFylke, relocation, sparseGate }) {
  if (!sparseGate) {
    return { allowed: new Set(homeFylke), nationalAlt: false };
  }
  if (layer === "primary") {
    const allowed = new Set(homeFylke);
    if (homeFylke.some((c) => NORTH_HOME.has(c))) {
      for (const c of NORTH_FRIENDLY) allowed.add(c);
    }
    return { allowed, nationalAlt: false };
  }
  if (relocation === "no") {
    return { allowed: null, nationalAlt: false };
  }
  return { allowed: null, nationalAlt: true };
}

// Dense profession gate off — home only (current behaviour)
assert.deepEqual(
  [...resolveScope({ layer: "primary", homeFylke: ["46"], relocation: "yes", sparseGate: false }).allowed],
  ["46"]
);

// Anlegg north primary — home + Nordland
const northPrimary = resolveScope({
  layer: "primary",
  homeFylke: ["56"],
  relocation: "no",
  sparseGate: true,
});
assert.ok(northPrimary.allowed.has("56"));
assert.ok(northPrimary.allowed.has("18"));
assert.equal(northPrimary.nationalAlt, false);

// Non-north primary — home only
const vestPrimary = resolveScope({
  layer: "primary",
  homeFylke: ["46"],
  relocation: "yes",
  sparseGate: true,
});
assert.deepEqual([...vestPrimary.allowed], ["46"]);

// Alternative relocation=no — no national
assert.equal(
  resolveScope({ layer: "alternative", homeFylke: ["56"], relocation: "no", sparseGate: true }).nationalAlt,
  false
);

// Alternative relocation=yes — national allowed
assert.equal(
  resolveScope({ layer: "alternative", homeFylke: ["56"], relocation: "yes", sparseGate: true }).nationalAlt,
  true
);

console.error("[smoke:school-geography-scope] PASS");
