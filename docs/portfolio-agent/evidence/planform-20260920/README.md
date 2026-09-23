# PLANFORM browser evidence

Run: codex-planform-0101. Overall status remains IN_PROGRESS; no gate promotion.

Public entry: https://planform-iso-k7d2.zeabur.app/
Source: https://github.com/aa0968111723-prog/planform-iso/tree/1b8513b7681feaf5ba69f8825b722ae7099aef4f
The source SHA was read from GitHub; this run did not freshly verify the deployed SHA.

## Reproduction

1. Use a synthetic project named Codex QA 20260920 PLANFORM. Choose 一般矩形教室, 30 participants, and create.
2. Confirm the room/mats render; select the chair library asset, Place, then Done.
3. Select the chair and inspect X=600 cm, Z=480 cm.
4. Try name QA chair and X=720, then blur. Locator fill showed changed input values but reopening reverted them. This is insufficient to claim a product defect: native keyboard retry subsequently moved the chair and the new position survived reload.
5. At 390×844, return to My Projects, reopen the synthetic project and expand 場佈. The project card and layout are restored; document width is 390.
6. Next verify final numeric/name persistence, real drag, undo/redo and error recovery.

## Evidence and limits

- [Mobile tools](mobile-tools.jpg): actual responsive browser screenshot (JPEG).
- [Desktop edited fields](desktop-edited.jpg): visible test inputs; input values alone do not prove persisted state (JPEG).
- [Desktop after reload](desktop-reloaded.jpg): retained scene and moved chair (JPEG).
- [Structured report](report.json): detailed observations, scope and remaining checks.

No console warning/error entries were captured at the checks performed. This is not full security acceptance. No AI or remote sharing was invoked. The synthetic project remains only in browser storage; existing projects were not deleted. Source confirms localStorage-backed project storage and change-event field handlers.

All project acceptance booleans remain false and readiness unscored. Browser viewport overrides were reset. Product code, environment variables, shared state and runtime reports were not changed; this dedicated report is the handoff record for this bounded evidence task.

## Persistence follow-up (codex-planform-persist-0701)

A new browser tab reopened the retained synthetic project. Selecting the moved chair confirmed **QA chair**, **X=720 cm**, **Z=480 cm**, elevation 0 in the inspector. These match the previous native-keyboard edits. The persistence uncertainty from that retry is resolved; locator-fill behavior alone is not an application defect.

[Verified inspector screenshot](desktop-persistence-confirmed.jpg) · [Timestamped result](persistence-followup.json). JPEG/JFIF signature checked, viewport 1440×900. No acceptance gate promotion: drag, undo/redo, mobile touch and error recovery remain to be tested. Next task is drag/undo/redo with exact coordinates on this synthetic chair.

## Drag follow-up (codex-planform-drag-1101)

Two desktop drags opened the QA chair / 地墊區 B overlap picker. Translation was not verified. Subsequent precision-input/undo/nudge interactions did not produce reliable model-state evidence; no undo/redo pass is awarded. Reload restored normal 場佈 mode switching. No console warning/error entries were captured.

[Detailed reproduction](drag-followup.json) · [Recovered scene](drag-recovery.jpg). The screenshot shows recovery only. Root cause remains unconfirmed; distinguish automation pointer/input behavior from an application defect before opening an external repair. Next: inspect the overlap/pointer lifecycle and reproduce using a non-overlapping synthetic object in 場佈 mode. All portfolio acceptance gates remain unchanged.
