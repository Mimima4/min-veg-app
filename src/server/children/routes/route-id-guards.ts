const UUID_SHAPE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const lowered = trimmed.toLowerCase();

  if (lowered === "null" || lowered === "undefined") {
    return false;
  }

  return UUID_SHAPE.test(trimmed);
}

export function toUniqueValidUuids(values: Iterable<unknown>): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    if (!isValidUuid(value)) {
      continue;
    }

    unique.add(value.trim());
  }

  return Array.from(unique);
}
