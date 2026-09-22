# IMPLEMENTATION CARD — FOLIO-PUBLIC-CABINET-EVIDENCE

- Project：Folio (`folio` / repo `canva2` / live `https://canva2-k7qm.zeabur.app/`)
- Status：card-only for Main Agent + Sentinel
- Date：2026-09-22
- Priority：P1
- Do not claim readiness from HTTP 200

## Problem

Section 14 要求「使用者能完成該作品最重要的主要任務」才能給核心流程 25 分。Folio 的公開主任務是：不登入進入文件櫃，打開一份已有檔案或空白畫布。

目前 gates.coreFlow.verifiedPass = 0/17。PR #25 / #48 / #68 只證明作品集文案與線上首屏一致，不是 cabinet 操作證據。

Xiaocai `/work/xiaocai` 已引用 `收支明細`（本輪探測），不再是最高優先交代修復。PLANFORM 已有開放證據 PR #64，勿重複。

## Evidence already gathered (2026-09-22)

- Production `/work/folio` 文案含「給 MCP 與內嵌網站」／「開發者 SDK」（PR #68）。
- Live host 仍是 canva2-k7qm，不是 dd-k3f9。
- Hermes canonical 仍是 k7q2；455 仍 502；`/api/status` version 0.18.2。
- FrameLab 仍是 cabin + lunar 同一產品。
- 本輪未在 canva2-k7qm 完成「選檔 → 畫布出現」。coreFlowPass 必須仍是 false。

## Allowed change (bruce23 only)

1. 在 Sentinel 或具備 Playwright 的主代理走一次公開櫃：打開 canva2-k7qm → 碰到「文件櫃」→ 點一份檔或新建 → 畫布或指令層可見。
2. 把截圖與步驟寫入 runtime-report probes，不寫 READY。
3. 若作品集 walkthrough 與首屏 CTA 不一致，才改 defaults.ts / catalog.ts；不重寫 UI。
4. 勿觸摸 hermes-console application code。勿觸摸 data/tamkang/。
5. 勿 merge PR #10。勿 push main/master。
6. 勿 POST ty `/api/register`。勿改 tku-zen-agent visibility。

## Not claimed

- coreFlowPass remains false until browser evidence exists
- readiness >= 70 remains false
- PORTFOLIO_READY = FALSE
- HTTP 200 on canva2-k7qm is reachability only

## Agent Prompt

```
You are the Bruce23 Main Agent.
Read docs/PORTFOLIO_AGENT_PLAN.md (PR #6 branch if missing on main), docs/portfolio-agent/state.json, docs/portfolio-agent/implementation-cards/FOLIO-PUBLIC-CABINET-EVIDENCE.md.

Task: FOLIO-PUBLIC-CABINET-EVIDENCE on repo aa0968111723-prog/bruce23 only.
Work on a new branch repair/folio/public-cabinet-evidence. Open a draft PR. Do not merge. Do not push main or master.

Do not rewrite UI. Do not touch hermes-console application code or data/tamkang/. Do not invent lunar/cabin product names. Do not echo secrets. Do not merge PR #10. Do not mark READY from HTTP 200.

Operate only the public Folio host https://canva2-k7qm.zeabur.app/ (not dd-k3f9).
In a real browser at 1440x900 and 390x844:
1. Load the public home.
2. Confirm the first screen is the file cabinet / no-login editor, not a SkateHub page.
3. Open one existing file or create a blank canvas.
4. Confirm the canvas or command layer is visible.
5. Do not submit personal data. Do not call this a typed-command-layer coreFlow unless the command layer actually ran.

Write probes into docs/portfolio-agent/runtime-report.json. Keep gates.coreFlow.verifiedPass at 0 unless the two viewports both complete the cabinet→canvas path with screenshots.
PORTFOLIO_READY stays FALSE.
```
