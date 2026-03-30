/* eslint-disable @typescript-eslint/no-require-imports */
const { existsSync, readFileSync } = require("fs");
const { resolve } = require("path");
const { spawnSync } = require("child_process");

const workspaceRoot = resolve(__dirname, "..");
const envPaths = [resolve(workspaceRoot, ".env.local"), resolve(workspaceRoot, ".env")];

for (const envPath of envPaths) {
  if (!existsSync(envPath)) continue;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const prismaBin = require.resolve("prisma/build/index.js");

const result = spawnSync(process.execPath, [prismaBin, ...process.argv.slice(2)], {
  cwd: workspaceRoot,
  env: process.env,
  stdio: "inherit",
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
