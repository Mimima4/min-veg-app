#!/usr/bin/env node
/**
 * Unit smoke for maybe PT soft-band + north-air classification (no Entur / no DB).
 * Mirrors evaluate-maybe-reach.ts — keep in sync.
 */
import assert from "node:assert/strict";

const SOFT = 500;
const HARD = 550;
const AIR_SOFT_SEC = 5 * 60 * 60;
const AIR_HARD_SEC = 8 * 60 * 60;
const GROUND = new Set(["rail", "bus", "coach", "metro", "tram", "water", "ferry", "foot", "bicycle"]);
const CAR = new Set(["car", "taxi"]);

function classifyKm(km) {
  if (!(km >= 0)) return { admitted: false, soft: false, viaAir: false, reason: "denied_no_pt" };
  if (km <= SOFT) return { admitted: true, soft: false, viaAir: false, reason: "normal" };
  if (km <= HARD) return { admitted: true, soft: true, viaAir: false, reason: "soft" };
  return { admitted: false, soft: false, viaAir: false, reason: "denied_over_hard_max" };
}

function classifyAir(durationSec) {
  if (!(durationSec >= 0)) {
    return { admitted: false, soft: false, viaAir: true, reason: "denied_no_pt" };
  }
  if (durationSec <= AIR_SOFT_SEC) {
    return { admitted: true, soft: true, viaAir: true, reason: "air_north" };
  }
  if (durationSec <= AIR_HARD_SEC) {
    return { admitted: true, soft: true, viaAir: true, reason: "air_north_soft" };
  }
  return { admitted: false, soft: false, viaAir: true, reason: "denied_air_over_duration" };
}

function hasAir(pattern) {
  return (pattern.legs ?? []).some((l) => String(l.mode).toLowerCase() === "air");
}

function hasCar(pattern) {
  return (pattern.legs ?? []).some((l) => CAR.has(String(l.mode).toLowerCase()));
}

function hasForbiddenGround(pattern) {
  return (pattern.legs ?? []).some((l) => {
    const m = String(l.mode).toLowerCase();
    return m === "air" || CAR.has(m);
  });
}

function sumGroundKm(pattern) {
  if (hasForbiddenGround(pattern)) return null;
  let m = 0;
  let n = 0;
  for (const leg of pattern.legs ?? []) {
    const mode = String(leg.mode).toLowerCase();
    if (!GROUND.has(mode)) continue;
    if (typeof leg.distance !== "number" || !Number.isFinite(leg.distance)) continue;
    m += leg.distance;
    n += 1;
  }
  return n === 0 ? null : m / 1000;
}

function verdictFromPatterns(patterns, { allowAir = false } = {}) {
  if (patterns.length === 0) {
    return { admitted: false, soft: false, viaAir: false, reason: "denied_no_pt" };
  }
  let bestGround = null;
  for (const p of patterns) {
    const km = sumGroundKm(p);
    if (km === null) continue;
    if (!bestGround || km < bestGround) bestGround = km;
  }
  if (bestGround !== null) return classifyKm(bestGround);

  if (allowAir) {
    let bestDur = null;
    for (const p of patterns) {
      if (hasCar(p) || !hasAir(p)) continue;
      if (!Number.isFinite(p.duration) || p.duration < 0) continue;
      if (bestDur === null || p.duration < bestDur) bestDur = p.duration;
    }
    if (bestDur !== null) return classifyAir(bestDur);
  }

  if (patterns.some((p) => hasAir(p)) && !allowAir) {
    return { admitted: false, soft: false, viaAir: false, reason: "denied_air_or_car" };
  }
  return { admitted: false, soft: false, viaAir: false, reason: "denied_no_pt" };
}

assert.equal(classifyKm(120).reason, "normal");
assert.equal(classifyKm(500).reason, "normal");
assert.equal(classifyKm(520).reason, "soft");
assert.equal(classifyKm(550).admitted, true);
assert.equal(classifyKm(551).admitted, false);

assert.equal(classifyAir(3 * 3600).reason, "air_north");
assert.equal(classifyAir(6 * 3600).reason, "air_north_soft");
assert.equal(classifyAir(9 * 3600).admitted, false);

const railBus = {
  duration: 4 * 3600,
  legs: [
    { mode: "rail", distance: 300_000 },
    { mode: "bus", distance: 50_000 },
    { mode: "foot", distance: 800 },
  ],
};
assert.equal(Math.round(sumGroundKm(railBus)), 351);

const airOnly = {
  duration: 3.5 * 3600,
  legs: [
    { mode: "bus", distance: 20_000 },
    { mode: "air", distance: 1_200_000 },
    { mode: "bus", distance: 15_000 },
  ],
};
assert.equal(sumGroundKm(airOnly), null);
assert.equal(verdictFromPatterns([airOnly], { allowAir: false }).reason, "denied_air_or_car");
assert.equal(verdictFromPatterns([airOnly], { allowAir: true }).reason, "air_north");
assert.equal(verdictFromPatterns([railBus, airOnly], { allowAir: true }).reason, "normal");

console.error("[smoke:maybe-pt-reach] PASS");
