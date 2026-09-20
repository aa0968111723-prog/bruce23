import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function loadJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

const state = loadJson("../docs/portfolio-agent/state.json");
const report = loadJson("../docs/portfolio-agent/runtime-report.json");

test("shared report cannot claim verified security while the gate is unverified", () => {
  if (state.gates.securityBlockers.status !== "VERIFIED_PASS") {
    assert.doesNotMatch(String(report.validation.security), /^VERIFIED/);
  }
});

test("shared coordination state cannot keep a merged repair pending", () => {
  if (report.github.mergedRepair.includes(27)) {
    assert.notEqual(state.activeTask, "reconcile-pr27-with-pr6");
    assert.doesNotMatch(JSON.stringify(state.highestPriorityIssue), /PR_27_PENDING_MERGE/);
    assert.doesNotMatch(String(state.nextTask), /PR #27 integration/);
  }
});

test("timestamps and reachability wording remain evidence-safe", () => {
  const generatedAt = Date.parse(report.generatedAt);
  const updatedAt = Date.parse(state.updatedAt);
  assert.ok(Number.isFinite(generatedAt));
  assert.equal(updatedAt, generatedAt);
  assert.ok(generatedAt <= Date.now() + 5 * 60 * 1000, "report timestamp must not be in the future");

  if (state.gates.online.status !== "VERIFIED_PASS") {
    assert.doesNotMatch(String(report.validation.browser), /^VERIFIED_200_ALL/);
    assert.doesNotMatch(String(report.validation.browser), /19_OF_19/);
    assert.doesNotMatch(state.completedSteps.join("\n"), /100% HTTP 200/);
  }

  const hasVisibilityBlocker = state.blockers?.some(
    (blocker) => blocker.id === "TKU_ZEN_AGENT_PUBLIC_GITHUB",
  );
  if (hasVisibilityBlocker) {
    assert.doesNotMatch(state.completedSteps.join("\n"), /Made all .*private .*public/i);
  }
});
