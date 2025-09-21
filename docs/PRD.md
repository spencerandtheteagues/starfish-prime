# PRD — Multi‑Agent System Upgrade (One‑Shot Deploy)

**Goal**: Ship large, production-grade full‑stack apps in one run. **Target**: ≥10× effectiveness vs. baseline by adding planning, review, and safety rails.

## Scope

- Planner → Coder → Reviewer → DevOps loop simulated via Orchestrator to pass smoke locally (demo mode).
- Real providers (OpenAI/Anthropic) optional; disabled in smoke. 

## Success Metrics

- One‑shot deploy: `docker compose up -d --build && ./scripts/smoke.sh` green.
- Security: no hardcoded secrets, strict CORS, redacted logs.
- Observability: `/metrics` on every service.
- Determinism: pinned base images, lockfiles.

## Non‑Goals (now)

- Distributed job queue, long‑lived previews GC, OAuth, paid infra.

