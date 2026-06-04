/** Shared Vilbli HTTP headers (server + local). */
export const VILBLI_FETCH_HEADERS = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  referer: "https://www.vilbli.no/nb/",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

let vilbliSessionWarmed = false;

async function warmVilbliSession() {
  if (vilbliSessionWarmed) return;
  vilbliSessionWarmed = true;
  try {
    await fetch("https://www.vilbli.no/nb/", {
      headers: VILBLI_FETCH_HEADERS,
      redirect: "follow",
    });
  } catch {
    vilbliSessionWarmed = false;
  }
}

export async function vilbliFetch(url, init = {}) {
  await warmVilbliSession();
  return fetch(url, {
    ...init,
    redirect: init.redirect ?? "follow",
    headers: {
      ...VILBLI_FETCH_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}
