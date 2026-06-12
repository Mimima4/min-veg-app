#!/usr/bin/env node
/**
 * Audit education_institutions.website_url reachability and apply conservative corrections.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (source .env.local)
 *
 *   node scripts/audit-education-institution-websites.mjs --dry-run
 *   node scripts/audit-education-institution-websites.mjs --apply
 */
import { createClient } from "@supabase/supabase-js";

const REQUEST_TIMEOUT_MS = 12_000;
const CONCURRENCY = 8;

/** Curated fixes when HTTP probes and NSR are stale (Vilbli / official site verified). */
const MANUAL_REPLACEMENTS_BY_NAME = {
  "Orkdal vidaregåande skole": "https://www.orkland.vgs.no",
  "Båtsfjord videregående skole": "https://www.batsfjordvgs.no",
  "Bergen Maritime videregående skole": "https://www.lbm.vgs.no",
  "Rubbestadnes vidaregåande skule": "https://www.bomlo.vgs.no",
};

const GENERIC_NSR_HOSTS = new Set([
  "tromsfylke.no",
  "www.tromsfylke.no",
  "vlfk.no",
  "www.vlfk.no",
  "hfk.no",
  "www.hfk.no",
  "afk.no",
  "www.afk.no",
  "bfk.no",
  "www.bfk.no",
]);

function parseArgs(argv) {
  return {
    dryRun: !argv.includes("--apply"),
    routeRelevantOnly: argv.includes("--route-relevant-only"),
  };
}

function normalizeUrl(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function stripTrailingSlash(url) {
  return String(url).replace(/\/$/, "");
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function tokenizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((part) => part.length >= 3);
}

function sharedNameToken(a, b) {
  const tokensA = new Set(tokenizeName(a));
  for (const token of tokenizeName(b)) {
    if (tokensA.has(token)) return token;
  }
  return null;
}

async function probeUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
    });
    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, status: null, finalUrl: null, error: message };
  } finally {
    clearTimeout(timer);
  }
}

function withWwwVariants(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return [];
  const parsed = new URL(normalized);
  const host = parsed.hostname.toLowerCase();
  const variants = new Set([stripTrailingSlash(normalized)]);

  if (host.startsWith("www.")) {
    const bare = `${parsed.protocol}//${host.slice(4)}${parsed.pathname}${parsed.search}`;
    variants.add(stripTrailingSlash(bare));
  } else {
    const withWww = `${parsed.protocol}//www.${host}${parsed.pathname}${parsed.search}`;
    variants.add(stripTrailingSlash(withWww));
  }

  return Array.from(variants);
}

function expandLegacyVgsHosts(url) {
  const host = hostnameOf(url);
  if (!host) return [];

  const bare = host.replace(/^www\./, "");
  const candidates = new Set();

  // vossvgs.no -> voss.vgs.no
  const compactVgs = bare.match(/^([a-z0-9]{2,})vgs\.no$/);
  if (compactVgs) {
    const token = compactVgs[1];
    candidates.add(`https://www.${token}.vgs.no`);
    candidates.add(`https://${token}.vgs.no`);
  }

  // vossgymnas.no -> vossgymnas.vgs.no
  const compactGymnas = bare.match(/^([a-z0-9]{2,})gymnas\.no$/);
  if (compactGymnas) {
    const token = compactGymnas[1];
    candidates.add(`https://www.${token}gymnas.vgs.no`);
    candidates.add(`https://${token}gymnas.vgs.no`);
  }

  // skole.vlfk.no/oddavgs -> odda.vgs.no
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "skole.vlfk.no") {
      const pathToken = parsed.pathname
        .split("/")
        .map((part) => part.replace(/vgs$/i, ""))
        .find((part) => /^[a-z0-9]{3,}$/i.test(part));
      if (pathToken) {
        const token = pathToken.toLowerCase();
        candidates.add(`https://www.${token}.vgs.no`);
        candidates.add(`https://${token}.vgs.no`);
      }
    }
  } catch {
    // ignore
  }

  return Array.from(candidates).flatMap((candidate) => withWwwVariants(candidate));
}

function nameBasedVgsCandidates(institution) {
  const name = String(institution.name ?? "");
  const lower = name.toLowerCase();
  const candidates = new Set();

  if (/gymnas/i.test(lower)) {
    const municipalityToken = tokenizeName(institution.municipality_name)[0] ?? null;
    const nameTokens = tokenizeName(name.replace(/gymnas.*/i, ""));
    const base = nameTokens[0] ?? municipalityToken;
    if (base) {
      candidates.add(`https://www.${base}gymnas.vgs.no`);
      candidates.add(`https://${base}gymnas.vgs.no`);
    }
  }

  const schoolTokens = tokenizeName(
    name
      .replace(/vidareg[aå]ande skule/gi, "")
      .replace(/videreg[aå]ende skole/gi, "")
      .replace(/\bavd\b.*/gi, "")
  );
  for (const token of schoolTokens) {
    if (token.length < 4) continue;
    candidates.add(`https://www.${token}.vgs.no`);
    candidates.add(`https://${token}.vgs.no`);
  }

  return Array.from(candidates).map(stripTrailingSlash);
}

function isAcceptableNsrUrl(nsrUrl, institution, currentUrl) {
  const host = hostnameOf(nsrUrl);
  if (!host || GENERIC_NSR_HOSTS.has(host)) return false;

  const currentHost = hostnameOf(currentUrl);
  if (currentHost && host === currentHost) return true;

  if (host.endsWith(".vgs.no") || host.endsWith(".skole.no")) {
    return Boolean(sharedNameToken(institution.name, nsrUrl));
  }

  try {
    const parsed = new URL(nsrUrl);
    if (parsed.pathname && parsed.pathname !== "/" && parsed.pathname.length > 1) {
      return Boolean(sharedNameToken(institution.name, `${parsed.pathname} ${host}`));
    }
  } catch {
    return false;
  }

  return false;
}

async function fetchNsrWebsite(orgnr) {
  if (!orgnr) return null;
  const response = await fetch(`https://data-nsr.udir.no/v4/enhet/${orgnr}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) return null;
  const detail = await response.json();
  return normalizeUrl(detail.Internettadresse ?? null);
}

async function firstWorkingUrl(candidates, tried) {
  for (const candidate of candidates) {
    const normalized = stripTrailingSlash(normalizeUrl(candidate) ?? "");
    if (!normalized || tried.has(normalized)) continue;
    const probe = await probeUrl(normalized);
    tried.set(normalized, probe);
    if (probe.ok) {
      return { url: normalized, probe };
    }
  }
  return null;
}

async function resolveReplacement(institution) {
  const current = stripTrailingSlash(normalizeUrl(institution.website_url) ?? "");
  if (!current) return null;

  const tried = new Map();
  const currentProbe = await probeUrl(current);
  tried.set(current, currentProbe);
  if (currentProbe.ok) {
    return { action: "keep", current, probe: currentProbe };
  }

  const canonicalCandidates = [
    ...withWwwVariants(current),
    ...expandLegacyVgsHosts(current),
    ...nameBasedVgsCandidates(institution),
  ];

  const manualUrl = MANUAL_REPLACEMENTS_BY_NAME[institution.name ?? ""];
  if (manualUrl && stripTrailingSlash(manualUrl) !== current) {
    const manualHit = await firstWorkingUrl(withWwwVariants(manualUrl), tried);
    if (manualHit) {
      return {
        action: "replace",
        current,
        replacement: manualHit.url,
        source: "manual",
        probe: manualHit.probe,
      };
    }
  }

  const canonicalHit = await firstWorkingUrl(canonicalCandidates, tried);
  if (canonicalHit) {
    return {
      action: "replace",
      current,
      replacement: canonicalHit.url,
      source: "canonical",
      probe: canonicalHit.probe,
    };
  }

  const nsrUrl = await fetchNsrWebsite(institution.nsr_organisasjonsnummer);
  if (nsrUrl && stripTrailingSlash(nsrUrl) !== current && isAcceptableNsrUrl(nsrUrl, institution, current)) {
    const nsrHit = await firstWorkingUrl(withWwwVariants(nsrUrl), tried);
    if (nsrHit) {
      return {
        action: "replace",
        current,
        replacement: nsrHit.url,
        source: "nsr",
        probe: nsrHit.probe,
      };
    }
  }

  return {
    action: "broken",
    current,
    probe: currentProbe,
    tried: Array.from(tried.entries()).map(([url, result]) => ({
      url,
      status: result.status,
      error: result.error ?? null,
    })),
  };
}

async function mapPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

async function main() {
  const { dryRun, routeRelevantOnly } = parseArgs(process.argv.slice(2));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let query = supabase
    .from("education_institutions")
    .select("id, name, municipality_name, county_code, website_url, nsr_organisasjonsnummer, is_route_relevant")
    .not("website_url", "is", null)
    .order("name");

  if (routeRelevantOnly) {
    query = query.eq("is_route_relevant", true);
  }

  const { data: institutions, error } = await query;
  if (error) throw new Error(error.message);

  console.error(
    `[website-audit] institutions=${institutions.length} dryRun=${dryRun} routeRelevantOnly=${routeRelevantOnly}`
  );

  const results = await mapPool(institutions, CONCURRENCY, async (institution) => {
    const resolution = await resolveReplacement(institution);
    return { institution, resolution };
  });

  const keep = [];
  const replace = [];
  const broken = [];

  for (const entry of results) {
    const { institution, resolution } = entry;
    if (resolution.action === "keep") {
      keep.push(entry);
      continue;
    }
    if (resolution.action === "replace") {
      replace.push(entry);
      console.error(
        `[website-audit] REPLACE ${institution.name}: ${resolution.current} -> ${resolution.replacement} (${resolution.source})`
      );
      continue;
    }
    broken.push(entry);
    console.error(
      `[website-audit] BROKEN ${institution.name}: ${resolution.current} status=${resolution.probe.status ?? "n/a"}`
    );
  }

  console.error(
    `[website-audit] summary keep=${keep.length} replace=${replace.length} broken=${broken.length}`
  );

  if (!dryRun && replace.length > 0) {
    for (const { institution, resolution } of replace) {
      const { error: updateError } = await supabase
        .from("education_institutions")
        .update({
          website_url: resolution.replacement,
        })
        .eq("id", institution.id);
      if (updateError) {
        throw new Error(`Failed to update ${institution.name}: ${updateError.message}`);
      }
    }
    console.error(`[website-audit] applied=${replace.length}`);
  }

  if (broken.length > 0) {
    console.error("[website-audit] unresolved:");
    for (const { institution, resolution } of broken) {
      console.error(`- ${institution.name} | ${resolution.current}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
