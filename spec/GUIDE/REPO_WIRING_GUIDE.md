# REPO WIRING GUIDE — Silverguard-Eldercare Integration (No-Questions Build)

The repository root includes:
- `/src` (Expo/React Native app)
- `/functions` (Firebase Cloud Functions backend)
- `/firestore.rules`, `/firestore.indexes.json`, `/firebase.json`

The repo README states the current AI Buddy uses **Claude 3.5 Sonnet via Anthropic** on the server side and has:
- “AI Buddy Guardrails” caregiver-configurable
- “Risk Monitoring” detection
- “Daily Wellbeing Reports” scheduled at 8 PM

## Objective
Replace the existing AI Buddy backend with the upgraded architecture **without changing** the senior/caregiver feature set,
only improving behavior, safety, reporting, and adding model routing and budgets.

## How to locate and replace existing modules (CLI procedure)
In the repo, search within `/functions/src` for keywords:
- `Anthropic`
- `claude`
- `buddy`
- `guardrail`
- `risk`
- `daily report`
- `scheduler`
- `8 PM`

Expected existing files (names may vary):
- buddy chat handler (HTTP callable)
- guardrails / blocked topics logic
- risk monitoring logic
- daily report scheduler

### Replace strategy
- Keep existing callable names/endpoints to avoid breaking mobile clients
- Internally reroute handler logic to the new modules:
  - `modelRouter`
  - `promptEngine`
  - `contextAssembler`
  - `memoryManager`
  - `voiceGate`
  - `safetyGate`
  - `loggingEngine`
  - `reportingEngine`

### Client integration (Expo `/src`)
Search for where the client calls Cloud Functions / API endpoints:
- `httpsCallable`
- `functions().httpsCallable`
- `buddyChat`
- `sendMessage`
- `aiBuddy`

Update client to:
- send `seniorId`, `mode`, `channel`, `wakeReason`, `deviceContext`
- parse structured JSON response and execute `actions[]`
- **do not** handle policy in the client

### Firestore integration
The AI Buddy must read/write in the same Firestore project.
Add or map collections as defined in `DATA/DATA_MODEL.md`.
Update `firestore.rules` as needed to allow only caregivers to access reports and logs.
