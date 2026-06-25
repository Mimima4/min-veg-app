/**
 * Brønnøysundregistrene (Enhetsregisteret) lookup — open API, no auth.
 * `https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>`
 *
 * Used at INGEST time only (never runtime) to canonicalize employer identity by
 * orgnr and to confirm/fill kommune + county for the verified lærebedrift layer.
 * Source-agnostic: works regardless of whether rows came from NLR, Vilbli or a
 * manual seed.
 */

const BRREG_BASE = "https://data.brreg.no/enhetsregisteret/api/enheter";

/** County code = first two digits of a 4-digit kommunenummer (NO standard). */
export function countyCodeFromKommunenummer(kommunenummer) {
  const digits = String(kommunenummer ?? "").trim();
  if (!/^\d{4}$/.test(digits)) {
    return null;
  }
  return digits.slice(0, 2);
}

/**
 * Look up a single enhet by orgnr.
 * @returns {Promise<
 *   | { status: "ok", orgNumber: string, legalName: string, municipalityCode: string|null, countyCode: string|null, raw: object }
 *   | { status: "not_found" }
 *   | { status: "deleted", deletedAt: string }
 *   | { status: "error", httpStatus: number, message: string }
 * >}
 */
export async function lookupBrregEnhet(orgNumber, { fetchImpl = fetch } = {}) {
  const orgnr = String(orgNumber ?? "").replace(/\s/g, "");
  if (!/^\d{9}$/.test(orgnr)) {
    return { status: "error", httpStatus: 0, message: `invalid_orgnr:${orgNumber}` };
  }

  let response;
  try {
    response = await fetchImpl(`${BRREG_BASE}/${orgnr}`, {
      headers: { accept: "application/json" },
    });
  } catch (error) {
    return {
      status: "error",
      httpStatus: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  if (response.status === 404) {
    return { status: "not_found" };
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { status: "error", httpStatus: response.status, message: text.slice(0, 300) };
  }

  const raw = await response.json();

  if (raw?.slettedato) {
    return { status: "deleted", deletedAt: String(raw.slettedato) };
  }

  const kommunenummer = raw?.forretningsadresse?.kommunenummer ?? null;

  return {
    status: "ok",
    orgNumber: String(raw?.organisasjonsnummer ?? orgnr),
    legalName: raw?.navn ?? null,
    municipalityCode: kommunenummer ? String(kommunenummer) : null,
    countyCode: countyCodeFromKommunenummer(kommunenummer),
    raw,
  };
}
