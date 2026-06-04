import "server-only";

import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleCache = new Map<string, Promise<unknown>>();

export function loadVgsScriptModule<T>(relativeScriptPath: string): Promise<T> {
  const cached = moduleCache.get(relativeScriptPath);
  if (cached) {
    return cached as Promise<T>;
  }

  const absolutePath = path.join(process.cwd(), relativeScriptPath);
  const href = pathToFileURL(absolutePath).href;
  const loaded = import(href) as Promise<T>;
  moduleCache.set(relativeScriptPath, loaded);
  return loaded;
}
