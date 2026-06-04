/** Shared Vilbli HTTP headers (server + local). */
export const VILBLI_FETCH_HEADERS = {
  accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "accept-language": "nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

export function vilbliFetch(url, init = {}) {
  return fetch(url, {
    ...init,
    headers: {
      ...VILBLI_FETCH_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}
