import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function spawnVgsNodeScript(
  scriptRelativePath: string,
  scriptArgs: string[]
): { status: number; stdout: string; stderr: string; parsed: Record<string, unknown> | null } {
  const scriptPath = path.join(process.cwd(), scriptRelativePath);
  if (!existsSync(scriptPath)) {
    throw new Error(
      `Missing script ${scriptRelativePath} (cwd=${process.cwd()}). Redeploy latest main with outputFileTracingIncludes.`
    );
  }

  const result = spawnSync("node", [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const stdout = (result.stdout ?? "").trim();
  const jsonStart = stdout.indexOf("{");
  let parsed: Record<string, unknown> | null = null;
  if (jsonStart >= 0) {
    try {
      parsed = JSON.parse(stdout.slice(jsonStart)) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
  }

  return {
    status: result.status ?? 1,
    stdout,
    stderr: result.stderr ?? "",
    parsed,
  };
}
