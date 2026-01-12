# UNIT ECONOMICS — Must be profitable at $19.99/mo Buddy+ and $4.99 one-time Basic

## Reality check (strong opinion)
- $19.99/mo is doable **only** with budgets + routing.
- $4.99 one-time **cannot** include ongoing cloud AI without bleeding cash.

## Buddy+ target
- Variable cost target per subscriber: <= $4.00/month
- Must implement:
  - model router with cheap-default model
  - hard daily usage caps (chat minutes, token budget)
  - weekly report = 1 call
  - monthly report = 1 heavier call

## Basic target
- Near-zero variable cost
- Use local notifications + on-device TTS
- If any server calls exist, keep them minimal and non-recurring

## Store fees
Assume ~15% store fee (if eligible). Net after store approx $17.
Keep variable costs small, leave margin for infra/support.

## Budget enforcement (required)
- Per-senior budgets stored in DB, enforced server-side
- When exceeded:
  - degrade to shorter responses
  - switch to cheaper model
  - reduce frequency of buddy check-ins
