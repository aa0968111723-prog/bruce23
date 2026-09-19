# Portfolio gate consistency check

Run before committing shared state or publishing an acceptance report:

```sh
node scripts/check-portfolio-gates.mjs
node --test scripts/check-portfolio-gates.test.mjs
```

The CLI accepts an optional state JSON path and never writes it. It exits 1 on
invalid JSON, a project-key set that differs from the canonical
`OFFICIAL_PROJECT_KEYS`, inconsistent aggregate counts, unsupported visual or
security passes, or premature overall completion. The test file is included by
the existing `scripts/**/*.test.mjs` test command and checks the actual committed
state as well as regression scenarios.

The seven aggregate counters use explicit per-project fields:

| Gate         | Project record                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| online       | `onlineReady === true`                                                                                                                  |
| coreFlow     | `coreFlowPass === true`                                                                                                                 |
| completeInfo | `completeInfo === true`                                                                                                                 |
| readiness70  | `readinessStatus === "ready"`, numeric score 70–100, online/core pass, empty failedCriteria, scoredAt and nonempty scoreEvidence        |
| mobileSmoke  | `mobileSmokePass === true`                                                                                                              |
| desktopSmoke | `desktopSmokePass === true`                                                                                                             |
| thumbnail    | passed `thumbnailReview` with main/mobile/desktop assets and complete source metadata, timestamp, actual status and evidence references |

Missing smoke or visual fields do not count as passes. Each visual asset must
record nonempty `alt`, `provenance`, `sourceUrl` and `actualStatus`, a valid
`capturedAt`, a boolean `productScreenshot`, and must not be marked broken. A
global security pass additionally requires every project's `securityReview` to
record `status: "PASS"`, `blockerCount: 0`, a valid `checkedAt`, and a nonempty
array of evidence references. An unreviewed security gate must stay
`NOT_VERIFIED`; zero known incidents alone does not establish a completed review.

Both `overallStatus` and `portfolioReady` are guarded. `portfolioReady: true` or
an overall status other than `IN_PROGRESS` is rejected until all seven project
gates are 17/17 and all 17 security reviews support zero blockers.

This validates consistency, not truth: agents must still read referenced reports,
confirm the complete-info contract, and perform the actual online/core/mobile/
desktop/thumbnail/security checks. It does not fetch URLs, judge screenshot
contents, prove evidence freshness, or replace the portfolio plan's acceptance requirements.
Never flip project booleans just to make aggregate totals pass.

## Run codex-gate-audit-20260920

- Base synchronized to PR #6 commit `a91a230c20587eae2a9d8092082a9cd085c27015`.
- The state file contained two top-level `gates` objects. Standard JSON parsing
  retained the later stale object, which claimed online and complete-info 17/17
  plus a completed zero-blocker security review while all 17 project records
  remained false or unreviewed.
- The stale duplicate was removed. All unsupported totals are again 0/17 or
  `NOT_VERIFIED`, and the explicit thumbnail gate starts at 0/17.
- This PR changes only the consistency guard, tests and audit records. It does
  not alter product code, deployments, environment variables or credentials.
- Overall acceptance remains IN_PROGRESS. This run performs no live functional
  or security tests and awards no project readiness points.

## Run codex-conflict-2001

- Reconciled PR #27 with PR #6 base `4621dd72ace6ec4df641b4980b682a5643825a94`; resolved only state/report conflicts. Product source matches that base exactly.
- Preserved prior audit results separately from this run. Incoming probe claims have future timestamps and remain explicitly unverified.
- Gate audit, 7 gate tests and typecheck pass. Broad scripts: 209/218 pass; remaining failures concern Windows symlink permissions, command quoting, path separators and missing build assets. Node tests: 306 assertions pass, but the CMS store test child required termination after approximately 70 seconds without exiting, so the suite is not a clean pass.
- No functional acceptance added: all seven project gates remain 0/17, security NOT_VERIFIED, portfolioReady false.
- Next: review the conflict repair in PR #27, then obtain real PLANFORM desktop/mobile core-flow evidence.
