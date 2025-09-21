# Architecture

## Services
- api (:4000): Fastify + JWT + SSE + Prisma + Prometheus `/metrics`
- web (:3000): Next.js client calling API
- db (:5432): Postgres 16-alpine

## Endpoints
- GET `/health` -> 200 JSON
- GET `/metrics` -> Prometheus exposition
- POST `/auth/token` `{ userId }` -> `{ token, expiresIn }`
- GET `/api/demo` (Bearer) -> `{ ok, userId, message }`
- GET `/api/stream?token=...` (SSE) or Bearer header

## Security
- Helmet headers, strict CORS allow-list from `CORS_ALLOW_ORIGINS`
- JWT 15m expiry, logs redact auth
