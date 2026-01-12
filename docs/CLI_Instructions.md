# CLI RUNBOOK — Autonomous Agent Instructions (No Questions)

You are coding inside the Silverguard-Eldercare repo.

## Phase 0 — Safety
- Do not add provider keys to client apps.
- Do not store raw transcripts by default.
- Do not implement emergency inference from silence.

## Phase 1 — Backend
1) Create `/functions/src/ai/` and implement modules per SERVER/MODULE_SPECS.md
2) Replace existing AI buddy handler to call new pipeline:
   contextAssembler -> promptEngine/modelRouter -> action executor -> logging/reporting
3) Add new callable endpoints if needed, but preserve existing function names if clients depend on them.
4) Add Firestore rules updates so only authorized caregivers can read logs/reports.

## Phase 2 — Client
1) Update buddy client service to send structured metadata:
   - seniorId, channel, wakeReason, subscriptionMode
2) Parse JSON response and execute actions:
   - confirm meds
   - schedule followups
   - notify caregiver
   - log events (server side preferred)
3) Ensure senior cannot disable critical reminders; caregiver controls.

## Phase 3 — Scheduler
- Ensure daily report runs at 8 PM in senior’s timezone if possible.
- Weekly report every Sunday evening.
- Monthly report on last day of month.

## Phase 4 — Test
Run TESTS/RED_TEAM.md scenarios. Fix until all pass.
