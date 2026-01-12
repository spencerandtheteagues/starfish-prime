# SERVER MODULE SPECS (Implement in Firebase Functions)

Implement the following TypeScript modules inside `/functions/src/ai/` (recommended):
- modelRouter.ts
- promptEngine.ts
- contextAssembler.ts
- memoryManager.ts
- voiceGate.ts
- safetyGate.ts
- loggingEngine.ts
- reportingEngine.ts
- lookupService.ts

## modelRouter.ts
- Exposes `callModel({provider?, model?, messages, jsonOnly, timeoutMs, budget})`
- Supports switching provider via config
- Enforces per-senior budgets and fallback models

## promptEngine.ts
- Builds prompt stack using PROMPTS/*
- Ensures JSON-only responses
- Retries once on invalid JSON, then returns safe fallback JSON

## contextAssembler.ts
- Fetches senior profile, meds, reminders, appointments, avoidance rules, memory, last summaries

## memoryManager.ts
- Writes summarized memory items only when allowed

## voiceGate.ts
- Requires verified senior voice to write logs or reports
- If unverified: allow response, forbid logging

## safetyGate.ts
- Detects explicit emergency phrases
- Creates CaregiverAlert only for high-confidence explicit signals

## loggingEngine.ts
- Writes LogEvent according to logging level

## reportingEngine.ts
- Generates daily/weekly/monthly reports using templates and optional model polish
- Never stores raw transcripts by default

## lookupService.ts
- Structured lookups only (contacts, hours, general facts)
- Refuses unsafe categories
