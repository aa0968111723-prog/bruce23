# IMPLEMENTATION CARD — LUMEN-HOLD-TO-SPEAK-EVIDENCE

- Priority: P1
- Repo: aa0968111723-prog/bruce23 only (portfolio copy). Do not edit wood-ivory-blaze-maple unless a later card says so.
- Live product: https://ai-chat-8rq3.zeabur.app/
- Portfolio page: https://bruce23-k7m2.zeabur.app/work/lumen
- GitHub: https://github.com/aa0968111723-prog/wood-ivory-blaze-maple
- Do not rewrite UI. Do not merge. Do not push main/master.
- Do not touch hermes-console application code or data/tamkang/.
- Do not invent lunar/cabin product names. Lumen is not Hermes.
- HTTP 200 is not coreFlowPass.

## Observed 2026-09-22 13:15 CST

Portfolio `/work/lumen` already quotes:

- 想做什麼？
- 點一下開始聽 · 按住說話
- 自動聽
- 做海報 / 拍照開始 / 做影片 / 長任務
- 專案 / 生成 / 畫板

Live host GET / HTTP 200 title `Lumen` shows the same first-screen strings.

Missing: a real-browser evidence packet that a visitor can press-and-hold, get a permission prompt or honest denial, and see either a transcript stub or a non-hanging fallback. Portfolio copy already says the work page has no microphone.

## Goal

Produce an evidence file (or Playwright fixture later) that records:

1. Desktop 1440x900: press-and-hold path on ai-chat-8rq3.
2. Mobile 390x844: same path.
3. Permission denied / no-mic: no infinite spinner.
4. Do not claim generation happened if no model key.

Do not mark Folio, PLANFORM, or Lumen coreFlow PASS from this card alone.

## Out of scope

- Scoring readiness 70.
- Merging PR #10.
- Changing tku-zen-agent visibility.
- Opening a second Plan PR.
- Touching PR #64 PLANFORM evidence or PR #75 Folio cabinet card.

## Agent Prompt

```
You are the Bruce23 Main Agent.
Read docs/PORTFOLIO_AGENT_PLAN.md on branch codex/portfolio-agent-plan (file is missing on main), docs/portfolio-agent/state.json, docs/portfolio-agent/implementation-cards/LUMEN-HOLD-TO-SPEAK-EVIDENCE.md.

Task: LUMEN-HOLD-TO-SPEAK-EVIDENCE on repo aa0968111723-prog/bruce23 only.
Work on a new branch repair/lumen/hold-to-speak-evidence. Open a draft PR. Do not merge. Do not push main or master.

Do not rewrite UI. Do not edit hermes-console application code. Do not touch data/tamkang/.
Do not invent lunar or cabin product names. Lumen is wood-ivory-blaze-maple / ai-chat-8rq3, not Hermes.
Do not echo secrets.

Verify production /work/lumen still quotes 按住說話 / 自動聽 / 拍照開始.
On https://ai-chat-8rq3.zeabur.app/ record a browser evidence note:
- first screen strings
- whether getUserMedia / hold control exists
- denied-permission behaviour
Do not mark coreFlowPass true. PORTFOLIO_READY stays FALSE. Do not merge PR #10.
```
