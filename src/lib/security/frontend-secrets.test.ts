import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".output") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|mjs|css)$/.test(name) && !name.includes(".test.")) acc.push(p);
  }
  return acc;
}

describe("secrets stay off the frontend surface", () => {
  it("does not expose tokens via VITE_ or client modules", () => {
    const files = walk(join(root, "src"));
    const forbidden = [
      "VITE_GITHUB",
      "VITE_CANVA_CLIENT_SECRET",
      "VITE_CANVA_TOKEN",
      "service_role",
      "GITHUB_READ_TOKEN",
      "CANVA_CLIENT_SECRET",
    ];
    for (const file of files) {
      if (file.includes(".server.") || file.endsWith("oauth.server.ts") || file.includes("github-http.server")) {
        continue;
      }
      if (file.includes("admin-fns.ts") || file.includes("env.server.ts")) continue;
      const text = readFileSync(file, "utf8");
      for (const token of forbidden) {
        if (token === "GITHUB_READ_TOKEN" && file.includes("admin-fns.ts")) continue;
        assert.equal(text.includes(token), false, `${file} contains ${token}`);
      }
    }
  });
});
