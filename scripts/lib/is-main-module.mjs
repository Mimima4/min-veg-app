import path from "node:path";
import { fileURLToPath } from "node:url";

export function isMainModule(metaUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(metaUrl) === path.resolve(entry);
}
