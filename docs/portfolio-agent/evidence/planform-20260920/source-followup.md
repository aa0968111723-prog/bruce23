# PLANFORM overlap-drag source follow-up

Run: `codex-20260926-planform-source`, 2026-09-26 UTC. Status: **IN_PROGRESS**.

This is a source inspection, not a new browser acceptance run. The previous
`drag-followup.json` remains the live observation record. PR #64 is now merged
into the plan branch; its evidence must not be discarded or rerun as if missing.

## Source evidence

GitHub main resolved to `1b8513b7681feaf5ba69f8825b722ae7099aef4f` during this run.
The deployed commit has not been verified.

- [App.ts lines 3389–3404](https://github.com/aa0968111723-prog/planform-iso/blob/1b8513b7681feaf5ba69f8825b722ae7099aef4f/src/app/App.ts#L3389-L3404): when Shift is not held and there are multiple picks, the handler calls the overlap picker and returns before `beginDrag`. This condition does not exempt an already selected object.
- [UI.ts lines 970–988](https://github.com/aa0968111723-prog/planform-iso/blob/1b8513b7681feaf5ba69f8825b722ae7099aef4f/src/ui/UI.ts#L970-L988): choosing an overlap entry calls `setSelection`; it does not start or resume a drag.
- [App.ts lines 3427–3450](https://github.com/aa0968111723-prog/planform-iso/blob/1b8513b7681feaf5ba69f8825b722ae7099aef4f/src/app/App.ts#L3427-L3450): candidate ranking sorts hits; selection does not generally remove the other overlapping hits.

Together these explain a repeat-picker path in this source version: if the next
pointer-down still hits the chair and mat group, selection alone does not make
the next ordinary drag proceed. This is consistent with the recorded browser
observation, but is not proof of the deployed root cause. It does not explain the
later inspector/mode-update failures, which remain a separate uncertainty.

Shift bypasses this picker condition but also affects selection; it must not be
treated as a verified workaround or used to silently move an entire group.

## Next bounded task

1. In the public app, use a separate synthetic local project with one unlocked
   chair on empty floor, in 場佈 mode. Record the visible inspector coordinates.
2. Drag the chair with no modifier. Check changed coordinates, undo restores
   the original coordinates, redo restores the moved coordinates, then reload.
3. Only after that control succeeds, repeat with a mat underneath. Record
   whether choosing the chair followed by another drag reopens the picker.
4. If reproducible, propose a separate PLANFORM repair PR that preserves explicit
   overlap choice while allowing a deliberately selected candidate to move.
   Verify desktop and mobile behavior before assigning any functional pass.

No external repository, service, environment variable or user data was changed.
No new screenshot or functional result is claimed. All seven portfolio gates
remain 0/17; security remains NOT_VERIFIED; readiness is not promoted.
