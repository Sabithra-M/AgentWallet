# Deployment Guide

## Health endpoint

`GET /health` (mounted at the root, not under `/api`, and outside the `authenticate` middleware — it must be reachable without a token):

```json
200 { "status": "ok", "database": "connected", "timestamp": "2026-07-16T06:20:10.971Z" }
503 { "status": "error", "database": "unreachable", "timestamp": "..." }
```

It runs a real `SELECT 1` against the database on every call — use it as both a liveness and a readiness probe. The server itself boots and serves HTTP even when the database is unreachable (it logs the failure instead of crashing), so `/health` is the only reliable signal of whether the database is actually up.

## Docker images

**`server/Dockerfile`** — single-stage `node:20-alpine`, `npm ci --omit=dev`, copies only `src/` (no dev tooling, no test/scratch files), runs `node src/server.js` directly (no nodemon in production), with a `HEALTHCHECK` hitting `/health`.

**`client/Dockerfile`** — multi-stage:
1. `build` stage installs full dependencies, copies the source, and runs `npm run build`. `VITE_*` variables are passed as build **args** (not runtime env vars) — Vite inlines them into the JS bundle at build time, so they must be known before `npm run build` runs, and changing them requires rebuilding the image.
2. Final stage installs the tiny static file server [`serve`](https://www.npmjs.com/package/serve) and copies only `dist/` from the build stage — the final image has no source code, no `node_modules` from the build, and no build tooling.

Build and run either image standalone:

```bash
docker build -t agentwallet-server ./server
docker run --env-file ./server/.env -p 5000:5000 agentwallet-server

docker build -t agentwallet-client \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  ./client
docker run -p 5173:5173 agentwallet-client
```

## docker-compose

`docker-compose.yml` at the repo root runs both images together:

```bash
cp server/.env.example server/.env   # fill in real values
docker compose up --build
```

There is **no Postgres service in the compose file** — `DATABASE_URL` in `server/.env` is expected to point at an externally-managed Postgres instance (Neon, RDS, Supabase, etc.), matching how the app is built and how migrations are already applied in every environment described in the main README's installation guide. If you want a fully local stack, add a `postgres:16-alpine` service and point `DATABASE_URL` at it — nothing in the application code assumes Neon specifically beyond the `sslmode=require` in the example connection string.

Client build args (`VITE_API_BASE_URL`, `VITE_FIREBASE_*`) are read from your shell environment when you run `docker compose up` — export them first, or put them in a root-level `.env` file that `docker compose` picks up automatically.

## CI — `.github/workflows/ci.yml`

Runs on every push/PR to `main`, two independent jobs:

- **build-client**: `npm ci` + `npm run build` in `client/` (with a dummy `VITE_API_BASE_URL` — the build only needs the variable to exist, not to be reachable).
- **build-server**: `npm ci` in `server/`, then a boot smoke test — starts the server with only a dummy `JWT_SECRET` set (no `DATABASE_URL`, since no database is available in CI), polls `/health` until it responds, and fails the job only if the server never responds at all (a crash or a hang) — a `503` from a deliberately-unreachable database is an expected, passing result here, not a failure.

Neither job runs a test suite, because none exists yet in this project (see the README's roadmap) — `npm run build`/the boot smoke test are the only automated checks currently possible without first adding a test framework.

## Production environment variables

Set every variable listed in the README's Environment Variables table via your platform's secret/env management (never commit `.env`). At minimum for a working deployment: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_APP_URL`, and the five `SMTP_*` variables (password reset emails will fail without them, though every other feature works). `FIREBASE_*` and `GEMINI_API_KEY` are optional — their absence disables Google Sign-In and the AI Assistant respectively, without affecting anything else.
