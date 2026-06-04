import { spawnSync } from "node:child_process";

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

export function runNodeScript(scriptPath, scriptArgs, { allowFailure = false } = {}) {
  const result = spawnSync("node", [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `Script failed: node ${scriptPath} ${scriptArgs.join(" ")}\n${result.stderr || result.stdout}`
    );
  }
  const output = (result.stdout ?? "").trim();
  const jsonStart = output.indexOf("{");
  const parsed =
    jsonStart >= 0 ? JSON.parse(output.slice(jsonStart)) : null;
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    parsed,
  };
}

export function spawnNodeScript(scriptPath, scriptArgs) {
  return spawnSync("node", [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
