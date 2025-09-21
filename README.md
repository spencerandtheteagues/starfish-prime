# One‑Shot Integrated Stack — Hardened

This is a production‑ready, dockerized stack with:
- **API** (Fastify + Prisma + Postgres) with JWT auth (access+refresh), CORS, metrics, health, and SSE.
- **Orchestrator** stub that simulates agent runs with SSE.
- **Preview Manager** stub that forwards auth headers when proxying to the API.
- **Web** (Next.js) simple UI talking to the API.

## Quick start

```bash
cp .env.example .env
docker compose up -d --build
./scripts/smoke.sh
```

If the script prints `SMOKE PASS ✅`, your stack is good.

### Service ports
- API: `:4000`
- Orchestrator: `:4001`
- Preview Manager: `:4002`
- Web: `:3000`
- Postgres: internal only (`db`)

## Auth model (short)
- `POST /auth/token` with `{ "userId":"..." }` returns `{ token, refreshToken, expiresIn }`.
- `POST /auth/refresh` with `{ "refreshToken": "..." }` rotates refresh tokens.
- `POST /auth/logout` revokes existing refresh tokens for the caller.
- Authenticated endpoints require `Authorization: Bearer <token>`.

## Health & Metrics
Each service exposes:
- `GET /health` → `{ ok: true }`
- `GET /metrics` → Prometheus format

## Environment

See `.env.example` for all knobs. Key ones:

- `CORS_ORIGINS` — CSV of allowed origins.
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`
- `REFRESH_TTL` — seconds; refresh token lifetime

### Prisma / database
Migrations are applied automatically at container startup (`prisma migrate deploy`).
The default DB is the `db` service (Postgres 16).

---

## Deploy Guides

### Vercel
- Deploy **Web** on Vercel:
  - Set `NEXT_PUBLIC_API_URL` to your API base URL.
  - Build command `npm run build`, Output directory `.next`.
- Deploy **API, Orchestrator, Preview Manager** on a Docker‑hosted platform (Render/Railway/VM). Vercel is not ideal for long‑lived Node processes with SSE.

### Railway
- Create a Postgres database.
- Deploy each service from its Dockerfile.
- Service vars:
  - API: `PORT` to Railway’s assigned port, `DATABASE_URL` to Railway Postgres URL, plus JWT/CORS vars.
  - Orchestrator/Preview: `PORT` to assigned port, `CORS_ORIGINS` to your web origin(s).
- Add a **health check** path `/health` for each service.

### Render
- Create a **PostgreSQL** instance.
- Create **three web services** (API, Orchestrator, Preview Manager) using the respective Dockerfiles.
- Set environment:
  - `PORT` injected by Render (use it in each service).
  - `DATABASE_URL`, `JWT_*`, `CORS_ORIGINS`.
- Use the `/health` endpoint for health checks.
- Deploy **Web** using `services/web/Dockerfile`.

### Bare‑metal Ubuntu VM (Docker)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# re-login
git clone <your repo>
cd <repo>
cp .env.example .env
docker compose up -d --build
./scripts/smoke.sh
```

### TLS / Traefik (Local preview)
See `docker-compose.preview.yml` for a Traefik‑based dev router that maps:
- `api.lvh.me`, `web.lvh.me`, etc., to local containers.
Use real certs in production (e.g., Cloudflare, Caddy, or Traefik with Let’s Encrypt).

---

## Security Hardening

- **No secrets in code**; use env vars. `.env.example` documents the required keys.
- **JWT**: signed with `HS256`, issuer/audience set; 15‑min access tokens, rotating refresh tokens.
- **CORS**: default allows `http://localhost:3000,http://web:3000`. Tighten for prod.
- **Logging**: Pino with redaction for `authorization`, `password`, `token`.
- **SSE**: authenticated, connection closes after a short burst in the demo.
- **Headers**: Preview Manager forwards `Authorization` and `X-User-Id`.

---

## Scripts

- `./scripts/smoke.sh` — health checks, auth mint/refresh, SSE stream, header‑forward check.
- `./scripts/deploy-ubuntu.sh` — install Docker (if needed), boot the stack, run smoke.

---

## Troubleshooting

- API won’t start → check `DATABASE_URL` and `JWT_SECRET`.
- Prisma errors → ensure Postgres is healthy; `docker compose logs db`.
- CORS blocked in browser → set exact origins in `CORS_ORIGINS`.

PRs welcome. Keep the paranoia dial at 11.