# MASTER BUILD GUIDE — SilverGuard AI Buddy (Authoritative)

The AI Buddy is not a “chat feature.” It is an orchestration layer that must be:
- dignity-first for seniors
- caregiver-configurable
- conservative about safety escalation
- profitable at $19.99/mo
- secure (no keys in client apps)
- interoperable with all existing app features

## Product Modes (hard gating)
### BASIC ($4.99 one-time)
- Reminders + checklist only
- Optional short acknowledgements (“Okay”, “Done”)
- No conversational AI
- No memory
- No reporting/pattern analysis
- Prefer on-device TTS and notifications; avoid ongoing cloud costs

### BUDDY+ ($19.99/mo)
- Conversational buddy with bounded memory
- Controlled internet assistance
- Logging levels 0–3 (caregiver-controlled)
- Avoidance topics + redirection
- Daily/weekly/monthly reports (summary-only, no raw transcripts by default)
- Explicit-only safety escalation (no inference from silence)

## Architectural rule (non-negotiable)
Mobile apps call your backend only:
- `/ai/chat`
- `/ai/report`
- `/ai/lookup`
- `/ai/actions`
Backend calls model providers via model router abstraction and holds keys server-side.

## Mandatory subsystems (must exist)
1) Model Router
2) Prompt Stack / Constitution Enforcement
3) Context Assembler (reads meds/schedule/etc.)
4) Memory Manager (bounded + safe)
5) Voice Verification Gate (log senior only)
6) Safety Gate (explicit-only)
7) Logging Engine (levels 0–3)
8) Reporting Engine (daily/weekly/monthly)
9) Integration Adapters (meds/reminders/appointments/SOS)
10) Red-team test suite (must-pass)
