# Personal AI App Builder — Final
Black + neon mission control that turns a prompt into a full‑stack app, opens a PR, and (optionally) **auto-fixes** failing builds/tests by filing patch commits.

## Features
- Live event stream; **message** agents mid-run; **cancel** run.
- **Scaffold**: Next.js web + Fastify API + Prisma schema + Playwright + Vitest.
- **Next.js rewrites** in generated app to proxy `/api/*` → API service (local + prod).
- **Download App ZIP** and **Artifacts ZIP** (plan + logs + repo).
- **Push to GitHub**: init + commit + push + open PR via Octokit.
- **Spec Kit hook** (optional): run any `SPEC_KIT_CMD` in generated repo, streaming output.
- **Auto‑Fix loop** (optional): build + tests; on failure, ask an LLM to produce JSON patches, apply, commit, and re-run. Repeat up to `AUTO_FIX_MAX`.

## Quickstart (local)
```bash
npm i
npm run -w apps/builder dev        # API -> http://localhost:4001

# new terminal
cd apps/web
echo 'NEXT_PUBLIC_BUILDER_URL=http://localhost:4001' > .env.local
npm run dev                        # UI -> http://localhost:3000
```

## Env (builder)
Copy `FINAL.env.example` and set as needed:
```
ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API_KEY=sk-...                   # needed for AUTO_FIX=1 and planner
SPEC_KIT_CMD=uvx --from git+https://github.com/github/spec-kit.git specify validate .
AUTO_FIX=1                               # enable the auto-fix loop (optional)
AUTO_FIX_MAX=2                           # number of fix iterations

# GitHub PR
GITHUB_TOKEN=...                         # fine-grained PAT with Contents+PRs
GITHUB_OWNER=your-user-or-org
GITHUB_REPO=your-repo
GIT_AUTHOR_NAME=Neon Builder
GIT_AUTHOR_EMAIL=neon@example.com
```

## Render (free-tier friendly)
- Keep `render.yaml` at repo root (Blueprint). It sets `rootDir` for monorepo. Import as Blueprint.
- Enable **PR/Service Previews** so each PR has an ephemeral deployment.
- WebSockets are over `wss://` via Render’s proxy (we use it automatically).

## Generated App (download)
- `apps/api`: Fastify CRUD (SAFE_MODE=1 → in-memory; else Prisma Postgres)
- `apps/web`: Next.js + **rewrites** to proxy `/api` to the API service
- `prisma/`: inferred schema
- `.github/workflows/ci.yml`: Vitest + Playwright

## Auto-Fix: how it works
1. After scaffold (and optional Spec Kit), we run project build/tests inside the repo.
2. On failure, the builder prompts an LLM to return **JSON patches**:
   ```json
   {"files":[{"path":"apps/api/src/index.ts","content":"<new file content>"}]}
   ```
3. The builder writes files, commits with `fix: auto patch`, and re-runs. Up to `AUTO_FIX_MAX`.
4. You can then **Push to GitHub** to open a PR; Render Previews take it from there.

See the /apps/builder/src/fixer.ts for details.
