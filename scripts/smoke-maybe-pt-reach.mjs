#!/usr/bin/env node
/**
 * Unit smoke for maybe PT soft-band classification (no Entur / no DB).
 * Mirrors evaluate-maybe-reach.ts — keep in sync.
 */
import assert from "node:assert/strict";

const SOFT = 500;
const HARD = 550;
const ALLOWED = new Set(["rail", "bus", "coach", "metro", "tram", "water", "ferry", "foot", "bicycle"]);
const FORBIDDEN = new Set(["air", "car", "taxi"]);

function classify(km) {
  if (!(km >= 0)) return { admitted: false, soft: false, reason: "denied_no_pt" };
  if (km <= SOFT) return { admitted: true, soft: false, reason: "normal" };
  if (km <= HARD) return { admitted: true, soft: true, reason: "soft" };
  return { admitted: false, soft: false, reason: "denied_over_hard_max" };
}

function hasForbidden(pattern) {
  return (pattern.legs ?? []).some((l) => FORBIDDEN.has(String(l.mode).toLowerCase()));
}

function sumKm(pattern) {
  if (hasForbidden(pattern)) return null;
  let m = 0;
  let n = 0;
  for (const leg of pattern.legs ?? []) {
    const mode = String(leg.mode).toLowerCase();
    if (!ALLOWED.has(mode)) continue;
    if (typeof leg.distance !== "number" || !Number.isFinite(leg.distance)) continue;
    m += leg.distance;
    n += 1;
  }
  return n === 0 ? null : m / 1000;
}

assert.equal(classify(120).reason, "normal");
assert.equal(classify(500).reason, "normal");
assert.equal(classify(520).reason, "soft");
assert.equal(classify(550).admitted, true);
assert.equal(classify(551).admitted, false);

const railBus = {
  legs: [
    { mode: "rail", distance: 300_000 },
    { mode: "bus", distance: 50_000 },
    { mode: "foot", distance: 800 },
  ],
};
assert.equal(Math.round(sumKm(railBus)), 351);
assert.equal(hasForbidden(railBus), false);
assert.equal(
  sumKm({
    legs: [...railBus.legs, { mode: "air", distance: 400_000 }],
  }),
  null
);

console.error("[smoke:maybe-pt-reach] PASS");
