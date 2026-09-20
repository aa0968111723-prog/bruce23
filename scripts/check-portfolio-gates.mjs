import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TOTAL = 17;
const registrySource = readFileSync(
  new URL("../src/content/project-registry.ts", import.meta.url),
  "utf8",
);
const registryMatch = registrySource.match(
  /export const OFFICIAL_PROJECT_KEYS\s*=\s*\[([\s\S]*?)\]\s*as const;/,
);
if (!registryMatch)
  throw new Error("Unable to read OFFICIAL_PROJECT_KEYS from project-registry.ts.");

export const OFFICIAL_PROJECT_KEYS = Object.freeze(
  [...registryMatch[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((match) =>
    JSON.parse(`"${match[1]}"`),
  ),
);
if (OFFICIAL_PROJECT_KEYS.length !== TOTAL || new Set(OFFICIAL_PROJECT_KEYS).size !== TOTAL) {
  throw new Error("OFFICIAL_PROJECT_KEYS must contain exactly 17 unique keys.");
}

const officialProjectKeySet = new Set(OFFICIAL_PROJECT_KEYS);
const nonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const hasEvidence = (value) => Array.isArray(value) && value.some(nonEmptyString);
const validDate = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
const validVisualAsset = (asset) =>
  nonEmptyString(asset?.alt) &&
  nonEmptyString(asset?.provenance) &&
  nonEmptyString(asset?.sourceUrl) &&
  validDate(asset?.capturedAt) &&
  nonEmptyString(asset?.actualStatus) &&
  typeof asset?.productScreenshot === "boolean" &&
  asset?.broken !== true;
const thumbnailReady = (project) => {
  const review = project?.thumbnailReview;
  return (
    review?.status === "PASS" &&
    validDate(review.checkedAt) &&
    hasEvidence(review.evidence) &&
    [review?.assets?.main, review?.assets?.mobile, review?.assets?.desktop].every(validVisualAsset)
  );
};

// A consistency check, not a substitute for reviewing the referenced evidence.
export function auditPortfolioGates(state) {
  const errors = [];
  const projects = Array.isArray(state?.projects) ? state.projects : [];
  const keys = projects.map((p) => p?.key);
  const validKeys = keys.filter(nonEmptyString);
  if (
    state?.scope?.officialProjectCount !== TOTAL ||
    projects.length !== TOTAL ||
    new Set(keys).size !== TOTAL ||
    validKeys.length !== TOTAL
  ) {
    errors.push("Expected 17 uniquely identified official projects.");
  }
  const projectKeySet = new Set(validKeys);
  const missingKeys = OFFICIAL_PROJECT_KEYS.filter((key) => !projectKeySet.has(key));
  const unexpectedKeys = [...projectKeySet].filter((key) => !officialProjectKeySet.has(key));
  if (missingKeys.length > 0 || unexpectedKeys.length > 0) {
    errors.push(
      `Official project keys differ from project-registry.ts (missing: ${missingKeys.join(", ") || "none"}; unexpected: ${unexpectedKeys.join(", ") || "none"}).`,
    );
  }
  const ready = (p) =>
    p?.readinessStatus === "ready" &&
    typeof p.readinessScore === "number" &&
    p.readinessScore >= 70 &&
    p.readinessScore <= 100 &&
    p.onlineReady === true &&
    p.coreFlowPass === true &&
    Array.isArray(p.failedCriteria) &&
    p.failedCriteria.length === 0 &&
    validDate(p.scoredAt) &&
    hasEvidence(p.scoreEvidence);
  for (const p of projects) {
    if (p?.readinessStatus === "ready" && !ready(p))
      errors.push(`${p.key}: ready lacks required score/core-flow evidence.`);
  }
  const selectors = {
    online: (p) => p?.onlineReady === true,
    coreFlow: (p) => p?.coreFlowPass === true,
    completeInfo: (p) => p?.completeInfo === true,
    readiness70: ready,
    mobileSmoke: (p) => p?.mobileSmokePass === true,
    desktopSmoke: (p) => p?.desktopSmokePass === true,
    thumbnail: thumbnailReady,
  };
  const counts = {};
  for (const [name, predicate] of Object.entries(selectors)) {
    const count = projects.filter(predicate).length;
    counts[name] = count;
    const gate = state?.gates?.[name];
    if (gate?.verifiedPass !== count || gate?.total !== TOTAL)
      errors.push(
        `${name}: declared total/count differs from project records (${count}/${TOTAL}).`,
      );
    if (gate?.status === "VERIFIED_PASS" && count !== TOTAL)
      errors.push(`${name}: VERIFIED_PASS requires 17 project passes.`);
  }
  const security = state?.gates?.securityBlockers;
  if (security?.status === "VERIFIED_PASS") {
    const reviewed = projects.every(
      (p) =>
        p?.securityReview?.status === "PASS" &&
        p.securityReview.blockerCount === 0 &&
        validDate(p.securityReview.checkedAt) &&
        hasEvidence(p.securityReview.evidence),
    );
    if (projects.length !== TOTAL || !reviewed || security.verifiedCount !== 0) {
      errors.push(
        "securityBlockers: a zero or HTTP 200 is not a completed security review for all projects.",
      );
    }
  }
  const allPassed =
    Object.values(counts).every((n) => n === TOTAL) &&
    Object.keys(selectors).every((name) => state?.gates?.[name]?.status === "VERIFIED_PASS") &&
    security?.status === "VERIFIED_PASS" &&
    errors.length === 0;
  if (state?.overallStatus !== "IN_PROGRESS" && !allPassed)
    errors.push("overallStatus must remain IN_PROGRESS until every gate passes.");
  if (state?.portfolioReady === true && !allPassed)
    errors.push("portfolioReady must remain false until every gate passes.");
  return { ok: errors.length === 0, counts, errors, evidenceContentsReviewed: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const path = resolve(process.argv[2] ?? "docs/portfolio-agent/state.json");
    const result = auditPortfolioGates(JSON.parse(readFileSync(path, "utf8")));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error(`Portfolio gate audit failed: ${error.message}`);
    process.exitCode = 1;
  }
}
