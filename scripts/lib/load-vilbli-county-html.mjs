import { vilbliFetch } from "./vilbli-fetch.mjs";

/**
 * Load Vilbli county HTML. Use `vilbliHtml` when fetching from Vercel is blocked (relay from home IP).
 */
export async function loadVilbliCountyHtml({ sourceUrl, vilbliHtml }) {
  if (vilbliHtml) {
    return {
      html: String(vilbliHtml),
      httpStatus: 200,
      fromRelay: true,
    };
  }

  const response = await vilbliFetch(sourceUrl);
  const html = await response.text();
  return {
    html,
    httpStatus: response.status,
    fromRelay: false,
  };
}
