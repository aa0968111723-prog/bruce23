import { openSync, closeSync, writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function acquireLock(path, owner) {
  if (!owner || !/^[a-zA-Z0-9_-]{1,100}$/.test(owner))
    throw new Error("Use a unique run ID (letters, digits, underscores or hyphens).");
  const fd = openSync(path, "wx");
  try {
    writeFileSync(fd, JSON.stringify({ owner, startedAt: new Date().toISOString() }) + "\n");
  } finally {
    closeSync(fd);
  }
}

export function releaseLock(path, owner) {
  const lock = JSON.parse(readFileSync(path, "utf8"));
  if (!owner || lock.owner !== owner)
    throw new Error("Lock belongs to another run; refusing release.");
  unlinkSync(path);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [action, owner] = process.argv.slice(2);
    const common = execFileSync("git", ["rev-parse", "--git-common-dir"], {
      encoding: "utf8",
    }).trim();
    const path = resolve(common, "portfolio-agent.lock");
    if (action === "acquire") acquireLock(path, owner);
    else if (action === "release") releaseLock(path, owner);
    else if (action === "status") console.log(readFileSync(path, "utf8"));
    else
      throw new Error(
        "Usage: node scripts/portfolio-agent-lock.mjs acquire|release|status [unique-run-id]",
      );
  } catch (error) {
    console.error(
      error.code === "EEXIST"
        ? "Another portfolio run holds the lock. Do not write or reclaim automatically."
        : error.message,
    );
    process.exitCode = 1;
  }
}
