# Portfolio gate consistency check

Run before committing shared state or publishing an acceptance report:

```sh
node scripts/check-portfolio-gates.mjs
node --test scripts/check-portfolio-gates.test.mjs
```

The CLI accepts an optional state JSON path and never writes it. It exits 1 on
invalid JSON, missing/duplicate project records, inconsistent aggregate counts,
unsupported security passes or premature overall completion. The test file is
included by the existing `scripts/**/*.test.mjs` test command and checks the
actual committed state as well as regression scenarios.

The six aggregate counters use explicit per-project fields:

| Gate         | Project record                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| online       | `onlineReady === true`                                                                                                           |
| coreFlow     | `coreFlowPass === true`                                                                                                          |
| completeInfo | `completeInfo === true`                                                                                                          |
| readiness70  | `readinessStatus === "ready"`, numeric score 70–100, online/core pass, empty failedCriteria, scoredAt and nonempty scoreEvidence |
| mobileSmoke  | `mobileSmokePass === true`                                                                                                       |
| desktopSmoke | `desktopSmokePass === true`                                                                                                      |

Missing smoke fields do not count as passes. A global security pass additionally
requires every project's `securityReview` to record `status: "PASS"`,
`blockerCount: 0`, a valid `checkedAt`, and a nonempty array of evidence references.
An unreviewed security gate must stay `NOT_VERIFIED`; zero known incidents alone
does not establish a completed review.

This validates consistency, not truth: agents must still read referenced reports,
confirm the complete-info contract, and perform the actual online/core/mobile/
desktop/security checks. It does not fetch URLs, judge screenshot contents, prove
evidence freshness, or replace the portfolio plan's acceptance requirements.
Never flip project booleans just to make aggregate totals pass.

## Run codex-gate-audit-1501

- Base: PR #6 commit `7257005d3d6fd79747fc60295af6ecfe5b37445d`.
- Remote state: all six verified-pass counts are 0/17. CLI passes consistency.
- Shared local checkout at inspection: `af567f7a26bd5c561535096e8959a054c1a4b4a8`.
  Its aggregate online/completeInfo were 17/17 and security VERIFIED_PASS while
  all 17 per-project onlineReady/completeInfo remained false. The CLI reproduces
  five errors and exits 1 on that file. This discrepancy is a local snapshot,
  not a claim that remote PR #6 still contains those totals.
- Work is isolated in a separate worktree. No shared state/report, product code,
  untracked endpoint script, deployment or credentials were changed.
- Next handoff: the shared checkout owner should reconcile its state against
  current GitHub evidence before pushing; run this check during that handoff.
- Overall acceptance remains IN_PROGRESS. This run performs no live functional
  or security tests and awards no project readiness points.
