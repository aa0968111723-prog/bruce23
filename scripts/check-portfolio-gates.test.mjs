import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditPortfolioGates, OFFICIAL_PROJECT_KEYS } from "./check-portfolio-gates.mjs";

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
    delete p.thumbnailReview;
  }
  state.gates.thumbnail = { verifiedPass: 0, total: 17, status: "NOT_VERIFIED" };
  for (const gate of Object.values(state.gates)) {
    if ("verifiedPass" in gate)
      Object.assign(gate, { verifiedPass: 0, total: 17, status: "NOT_VERIFIED" });
  }
  state.gates.securityBlockers = { verifiedCount: null, status: "NOT_VERIFIED" };
  state.overallStatus = "IN_PROGRESS";
  state.portfolioReady = false;
  return state;
}

function visualAsset(kind) {
  return {
    alt: `${kind} project screenshot`,
    provenance: "live-screenshot",
    sourceUrl: `https://example.test/${kind}.png`,
    capturedAt: "2026-09-19T15:00:00Z",
    actualStatus: "captured-from-live-product",
    productScreenshot: true,
    broken: false,
  };
}

function completedState() {
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
      thumbnailReview: {
        status: "PASS",
        checkedAt: "2026-09-19T15:00:00Z",
        evidence: ["visual-review.md"],
        assets: {
          main: visualAsset("main"),
          mobile: visualAsset("mobile"),
          desktop: visualAsset("desktop"),
        },
      },
      securityReview: {
        status: "PASS",
        blockerCount: 0,
        checkedAt: "2026-09-19T15:00:00Z",
        evidence: ["security-report.md"],
      },
    });
  for (const gate of Object.values(state.gates)) {
    if ("verifiedPass" in gate)
      Object.assign(gate, { verifiedPass: 17, total: 17, status: "VERIFIED_PASS" });
  }
  state.gates.securityBlockers = { verifiedCount: 0, status: "VERIFIED_PASS" };
  state.overallStatus = "COMPLETE";
  state.portfolioReady = true;
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

test("project keys must match the canonical registry, not merely total 17", () => {
  const state = baseline();
  state.projects[0].key = "made-up-project";
  const result = auditPortfolioGates(state);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith("Official project keys differ")));
  assert.deepEqual(
    state.projects.slice(1).map((project) => project.key),
    OFFICIAL_PROJECT_KEYS.slice(1),
  );
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
  const prematureReady = baseline();
  prematureReady.portfolioReady = true;
  assert.equal(auditPortfolioGates(prematureReady).ok, false);
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

test("consistent completed records pass; missing evidence still fails", () => {
  const state = completedState();
  assert.equal(auditPortfolioGates(state).ok, true);

  const missingThumbnailGate = completedState();
  delete missingThumbnailGate.gates.thumbnail;
  assert.equal(auditPortfolioGates(missingThumbnailGate).ok, false);

  const missingVisualEvidence = completedState();
  missingVisualEvidence.projects[0].thumbnailReview.assets.main.alt = "";
  assert.equal(auditPortfolioGates(missingVisualEvidence).ok, false);

  const missingSecurityEvidence = completedState();
  missingSecurityEvidence.projects[0].securityReview.evidence = [];
  assert.equal(auditPortfolioGates(missingSecurityEvidence).ok, false);
});
