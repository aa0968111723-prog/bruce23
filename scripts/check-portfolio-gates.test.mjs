import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditPortfolioGates } from "./check-portfolio-gates.mjs";

test("committed portfolio state has consistent gate totals", () => {
  const state = JSON.parse(
    readFileSync(new URL("../docs/portfolio-agent/state.json", import.meta.url), "utf8"),
  );
  const result = auditPortfolioGates(state);
  assert.equal(result.ok, true, result.errors.join("\n"));
});

function baseline() {
  const state = JSON.parse(
    readFileSync(new URL("../docs/portfolio-agent/state.json", import.meta.url), "utf8"),
  );
  for (const p of state.projects) {
    Object.assign(p, {
      onlineReady: false,
      coreFlowPass: false,
      completeInfo: false,
      readinessStatus: "unknown",
      readinessScore: null,
      mobileSmokePass: false,
      desktopSmokePass: false,
    });
    delete p.securityReview;
  }
  for (const gate of Object.values(state.gates)) {
    if ("verifiedPass" in gate)
      Object.assign(gate, { verifiedPass: 0, total: 17, status: "NOT_VERIFIED" });
  }
  state.gates.securityBlockers = { verifiedCount: null, status: "NOT_VERIFIED" };
  state.overallStatus = "IN_PROGRESS";
  return state;
}

test("HTTP 200 evidence does not count as a functional pass", () => {
  const state = baseline();
  state.projects.forEach((p) => {
    p.endpointEvidence = { status: 200 };
  });
  assert.equal(auditPortfolioGates(state).ok, true);
  state.gates.online = { verifiedPass: 17, total: 17, status: "VERIFIED_PASS" };
  state.gates.completeInfo = { verifiedPass: 17, total: 17, status: "VERIFIED_PASS" };
  const result = auditPortfolioGates(state);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.startsWith("completeInfo:")));
});

test("zero known security blockers is not a security pass", () => {
  const state = baseline();
  state.gates.securityBlockers = { verifiedCount: 0, status: "VERIFIED_PASS" };
  assert.equal(auditPortfolioGates(state).ok, false);
});

test("rejects duplicate or missing projects and premature completion", () => {
  const state = baseline();
  state.projects[0].key = state.projects[1].key;
  assert.equal(auditPortfolioGates(state).ok, false);
  state.projects.pop();
  assert.equal(auditPortfolioGates(state).ok, false);
  const incomplete = baseline();
  incomplete.overallStatus = "COMPLETE";
  assert.equal(auditPortfolioGates(incomplete).ok, false);
});

test("a high score cannot override a failed core flow", () => {
  const state = baseline();
  Object.assign(state.projects[0], {
    readinessScore: 90,
    readinessStatus: "ready",
    scoreEvidence: ["run-report.md"],
    scoredAt: "2026-09-19T15:00:00Z",
    failedCriteria: [],
  });
  assert.equal(auditPortfolioGates(state).ok, false);
});

test("consistent completed records pass; missing security evidence still fails", () => {
  const state = baseline();
  for (const p of state.projects)
    Object.assign(p, {
      onlineReady: true,
      coreFlowPass: true,
      completeInfo: true,
      mobileSmokePass: true,
      desktopSmokePass: true,
      readinessStatus: "ready",
      readinessScore: 80,
      scoredAt: "2026-09-19T15:00:00Z",
      scoreEvidence: ["run-report.md"],
      failedCriteria: [],
      securityReview: {
        status: "PASS",
        blockerCount: 0,
        checkedAt: "2026-09-19T15:00:00Z",
        evidence: ["security-report.md"],
      },
    });
  for (const gate of Object.values(state.gates)) {
    if ("verifiedPass" in gate) Object.assign(gate, { verifiedPass: 17, status: "VERIFIED_PASS" });
  }
  state.gates.securityBlockers = { verifiedCount: 0, status: "VERIFIED_PASS" };
  state.overallStatus = "COMPLETE";
  assert.equal(auditPortfolioGates(state).ok, true);
  state.projects[0].securityReview.evidence = [];
  assert.equal(auditPortfolioGates(state).ok, false);
});
