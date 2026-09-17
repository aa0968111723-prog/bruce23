#!/usr/bin/env node
/**
 * Zeabur starts `node /src/.output/server/index.mjs`.
 * Force NITRO_PRESET=node-server for this build so vite.config.ts
 * resolveNitroPreset() emits that file.
 */
import { spawnSync } from "node:child_process";

process.env.NITRO_PRESET = "node-server";
process.env.ZEABUR = process.env.ZEABUR || "1";

const result = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
