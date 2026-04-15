import { normalizeFylkeCodes } from "./norway-geo-code-normalization";

export const NORWAY_FYLKE_ADJACENCY_GRAPH: Record<string, string[]> = {
  "03": ["32"],
  "11": ["42", "46"],
  "15": ["34", "46", "50"],
  "18": ["50", "55"],
  "31": ["32"],
  "32": ["03", "31", "33", "34"],
  "33": ["32", "34", "39", "40", "42", "46"],
  "34": ["15", "32", "33", "46", "50"],
  "39": ["33", "40"],
  "40": ["33", "39", "42", "46"],
  "42": ["11", "33", "40", "46"],
  "46": ["11", "15", "33", "34", "40", "42", "50"],
  "50": ["15", "18", "34", "46"],
  "55": ["18", "56"],
  "56": ["55"],
};

function dedupeAndSort(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function deriveFylkeAdjacencyRings(params: {
  homeFylkeCodes: string[];
}): string[][] {
  const normalizedHomes = dedupeAndSort(normalizeFylkeCodes(params.homeFylkeCodes));

  if (normalizedHomes.length === 0) {
    return [];
  }

  const visited = new Set(normalizedHomes);
  let frontier = normalizedHomes;
  const rings: string[][] = [];

  while (frontier.length > 0) {
    const next = new Set<string>();

    for (const fylkeCode of frontier) {
      for (const adjacentCode of NORWAY_FYLKE_ADJACENCY_GRAPH[fylkeCode] ?? []) {
        if (!visited.has(adjacentCode)) {
          next.add(adjacentCode);
        }
      }
    }

    const nextRing = dedupeAndSort(Array.from(next));
    if (nextRing.length === 0) {
      break;
    }

    rings.push(nextRing);
    for (const code of nextRing) {
      visited.add(code);
    }
    frontier = nextRing;
  }

  return rings;
}
