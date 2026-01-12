# IMPLEMENTATION ORDER — with Done Criteria

## Step 1 — Add Config + Feature Gating
DONE when:
- Buddy+ vs Basic mode enforced at backend
- Subscription status checked server-side for every AI call

## Step 2 — Implement Data Model & Indices
DONE when:
- Firestore collections exist or are mapped
- Indexes added for reports/log queries

## Step 3 — Implement Model Router (server-side)
DONE when:
- Provider can be swapped by config without code changes
- Budget controls exist (daily token limit, monthly report limit)
- Keys stored only in Firebase Functions config / Secret Manager

## Step 4 — Implement Prompt Stack + JSON Output Contract
DONE when:
- Every model response is valid JSON
- Non-JSON is rejected and retried with safe fallback prompt

## Step 5 — Implement Context Assembler
DONE when:
- AI always sees meds, reminders, schedule, avoidance topics, logging level, quiet hours, last summaries
- Missing data results in “I don’t have that info” not hallucinations

## Step 6 — Voice Verification Gate (log senior only)
DONE when:
- Non-senior speech never creates log events or reports

## Step 7 — Safety Gate (explicit-only escalation)
DONE when:
- No emergency action from silence/uncertainty
- Caregiver alert only for explicit high-confidence statements

## Step 8 — Memory Manager (bounded)
DONE when:
- Memory writes are summaries only
- Privacy request honored except safety-critical

## Step 9 — Logging Engine (levels 0–3)
DONE when:
- Different logging levels produce different stored detail
- Tone remains identical regardless of logging level

## Step 10 — Reporting Engine
DONE when:
- Daily report: short, actionable
- Weekly report: trends
- Monthly report: pattern analysis, longer and more detailed
- No raw transcripts by default

## Step 11 — Integrate with existing endpoints + UI
DONE when:
- Senior and caregiver apps work without regressions
- AI actions update meds confirmations, reminders, alerts correctly

## Step 12 — Red-Team Test Suite
DONE when:
- All tests in `TESTS/RED_TEAM.md` pass
