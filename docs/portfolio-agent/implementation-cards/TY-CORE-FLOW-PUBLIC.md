# IMPLEMENTATION CARD — TY-CORE-FLOW-PUBLIC

- Priority: P1
- Owner: Main Agent implements copy/CMS; Grok Sentinel black-box operates public flow
- Repo: aa0968111723-prog/bruce23 only for portfolio copy; do not edit ty application secrets
- Branch suggestion: repair/ty/core-flow-public-verify
- Do not: rewrite UI chrome, merge, push main/master, touch hermes-console or data/tamkang/, echo secrets, invent lunar/cabin names, mark READY from HTTP 200

## Goal

專注力挑戰賽（ty）作品集頁與線上產品契約一致，並用公開可操作證據決定 coreFlowPass。不使用 Google Sheet credentials、admin 密碼或真實個資。

## Evidence (2026-09-19T21:39 CST)

- Live: https://leader-dna-mcp-a7k2.zeabur.app/ HTTP 200, title `淡江大學禪學社｜專注力挑戰賽`
- `GET /api/health` → status ok, club 淡江大學禪學社, sheets true, smtp false
- Production https://bruce23-k7m2.zeabur.app/work/focus-challenge 仍顯「暖身 / 挑戰 / 狀態」
- PR #18 merged: process should be rules → tutorial + 15s practice (not saved) → 60s Stroop → masked public leaderboard
- PR #15 already removed Folio canvas branding on this slug in source; production still needs contract copy deploy + black-box run

## Acceptance

1. Production `/work/focus-challenge` walkthrough steps match PRODUCT_CONTRACT (not 暖身/挑戰/狀態).
2. Public serializer does not show Folio 畫布標籤。
3. Grok Sentinel records a public run: open rules → complete or honestly abort practice/Stroop without writing phone/full name into portfolio docs.
4. Public leaderboard probe shows no phone / full legal name.
5. coreFlowPass stays false until that black-box run exists. HTTP 200 + health.ok is not enough.
6. No sheet credential, SMTP secret, or admin password in git, PR body, or client bundle.

## Out of scope

- Changing ty scoring rules or sheet schema
- Hermes 0.18.2 → 0.21.3 upgrade
- FrameLab product rename
- Merging PR #6 / #10 / #12

## Agent Prompt (copy-paste)

```
You are the Bruce23 Main Agent.
Read docs/PORTFOLIO_AGENT_PLAN.md, docs/portfolio-agent/state.json, docs/portfolio-agent/implementation-cards/TY-CORE-FLOW-PUBLIC.md.

Task: TY-CORE-FLOW-PUBLIC on repo aa0968111723-prog/bruce23 only.
Work on a new branch repair/ty/core-flow-public-verify. Open a draft PR. Do not merge. Do not push main or master.

1. Confirm whether production /work/focus-challenge still shows 暖身/挑戰/狀態 after PR #18. If CMS row lagged, bump the seed refresh version so existing rows rewrite.
2. Walkthrough and process copy must match ty PRODUCT_CONTRACT: rules → tutorial + 15s practice (not saved) → 60s Stroop → masked public leaderboard.
3. Keep Live Demo at https://leader-dna-mcp-a7k2.zeabur.app/ . Do not swap to lunar-falcon or cabin-shale.
4. Do not set coreFlowPass true. Do not set readiness >= 70. PORTFOLIO_READY stays FALSE.
5. Do not read or print Google Sheet credentials, admin passwords, or personal data.
6. Do not edit hermes-console application code or data/tamkang/.
7. Do not invent lunar/cabin product names. Preserve CJK: 闖關, 安倜, 一盎燈, 發布, 專注力挑戰賽.
8. After edit: run the smallest CMS seed / store tests. Report leftover 暖身/挑戰 labels and whether production HTML changed.
9. Hand the actual 60-second public operation to Grok Sentinel. Do not claim ONLINE or CORE FLOW from HTTP 200.
```
