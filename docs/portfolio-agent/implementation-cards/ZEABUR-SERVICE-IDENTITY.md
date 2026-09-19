# IMPLEMENTATION CARD — ZEABUR-SERVICE-IDENTITY

- Date：2026-09-19
- Branch：`feat/zeabur-service-identity-map`

## What was verified via Zeabur GraphQL

Service names and provisioned domains only. No env vars stored.

- bruce23 → bruce23-k7m2.zeabur.app RUNNING
- tku-tamsui-drama-world → tku-tamsui-drama-world-k4x9.zeabur.app (not lunar-falcon)
- canva2 → canva2-k7qm.zeabur.app (not dd-k3f9)
- dd → dd-k3f9.zeabur.app (SkateHub)
- hermes-agent canonical → hermes-agent-k7q2.zeabur.app
- hermes-agent 6a9a385273ef6eb935f2f8a2 → 455.zeabur.app (stale)
- hermes-console → 344.zeabur.app

## Owner dump errors rejected

1. tku-tamsui-drama-world listed as lunar-falcon-8p2r — that domain is FrameLab EN.
2. canva2 listed as dd-k3f9 — that domain is SkateHub.

## Secrets

Owner pasted production env vars in chat. They are **not** in this repo.
Those credentials should be rotated: GitHub PAT, Google service account key, API keys, dashboard passwords.

## Next exact step

Confirm `/work/focus-challenge` no longer says Folio canvas (PR #15). Then operate `ty` core flow on leader-dna-mcp-a7k2 without using sheet credentials in the portfolio.
