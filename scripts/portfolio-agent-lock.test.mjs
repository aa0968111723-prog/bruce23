import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { acquireLock, releaseLock } from "./portfolio-agent-lock.mjs";

test("only one run can write; a different owner cannot release its lock", () => {
  const dir = mkdtempSync(join(tmpdir(), "portfolio-lock-"));
  const path = join(dir, "lock");
  try {
    acquireLock(path, "run-1");
    assert.throws(() => acquireLock(path, "run-2"), { code: "EEXIST" });
    assert.throws(() => releaseLock(path, "run-2"), /another run/);
    assert.equal(JSON.parse(readFileSync(path, "utf8")).owner, "run-1");
    releaseLock(path, "run-1");
    acquireLock(path, "run-2");
    releaseLock(path, "run-2");
    assert.throws(() => acquireLock(path, ""), /unique run ID/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
