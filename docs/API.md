# API Reference

Base URL: `{VITE_API_BASE_URL}/api` (e.g. `http://localhost:5000/api`).

**Auth**: every route below except `/auth/*` and `GET /health` (mounted separately, at the root, not under `/api`) requires `Authorization: Bearer <token>`. Tokens are issued by `POST /auth/login`, `POST /auth/register`, and `POST /auth/google`.

**Errors**: every error response is `{ "error": "<message>" }`, optionally with `"details": [...]` for validation failures (400). 5xx responses never include a stack trace or internal error detail — only a generic message; the real error is logged server-side.

**Rate limits**: `/auth/*` is capped at 20 requests / 15 minutes per IP. `POST /conversations/:id/messages` and `PUT /conversations/:id/messages/:messageId` (the two endpoints that call Gemini) are capped at 15 requests / minute per user. Both return `429 { "error": "Too many requests..." }` when exceeded.

**Ownership**: every resource is scoped to the authenticated user server-side (never trust a client-supplied `userId`) — attempting to access another user's wallet, payment request, virtual card, etc. returns 403 or 404, never another user's data.

---

## Auth — `/api/auth`

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Creates the user + a zero-balance Main Wallet. Does **not** return a token — call `/login` next. |
| POST | `/login` | `{ email, password }` | Returns `{ token, user }`. |
| POST | `/google` | `{ idToken }` | Firebase ID token → `{ token, user }`. |
| POST | `/forgot-password` | `{ email }` | Always returns the same generic message, regardless of whether the email exists. |
| POST | `/reset-password` | `{ token, password }` | `token` is the raw value from the emailed link. |

## Users — `/api/users`

| Method | Path | Notes |
|---|---|---|
| GET | `/me` | Current user's profile (sanitized — never includes `password_hash`/`reset_token_hash`). |
| PUT | `/me/profile` | `{ name }` |
| PUT | `/me/settings` | Theme, notification toggles, default wallet, monthly spending limit, preferred currency. |
| POST | `/` / GET | Generic user CRUD (all responses sanitized). |
| GET / PUT / DELETE | `/:id` | |

## Wallets — `/api/wallets`

| Method | Path | Notes |
|---|---|---|
| POST | `/` | Create a wallet (category `main` or generic). |
| POST | `/ai` | Create an AI Wallet — `{ name, budget, expiresAt, description? }`; debits the Main Wallet by `budget`. |
| GET | `/` | All wallets for the current user. |
| GET / PUT / DELETE | `/:id` | Delete refunds any remaining AI Wallet balance to the Main Wallet. |
| POST | `/:id/topup` | `{ amount }` — Main Wallet only. |

## Wallet Policies (legacy) — `/api/wallet-policies`, AI Wallet Policies — `/api/ai-wallet-policies`

Two policy systems exist: `wallet-policies` (per-transaction/monthly-limit/merchant-blocklist/category-restriction rules, one-of-several-active) predates the newer `ai-wallet-policies` (one policy per AI Wallet — budget/daily/monthly/PIN-threshold/allowed-merchants/blocked-categories/countries), which is what the Policy Engine and Observability dashboard are built around. Both support standard `POST /`, `GET /`, `GET /:id`, `PUT /:id` (ai-wallet-policies keys by `walletId` instead of a policy id), `DELETE /:id`.

## Payment Requests — `/api/payment-requests`

| Method | Path | Notes |
|---|---|---|
| POST | `/` | Manual creation — computes risk, enforces legacy wallet policies, writes a `created` timeline event. |
| GET | `/` | All payment requests for the current user. |
| GET | `/:id` | |
| GET | `/:id/timeline` | Ordered list of `payment_timeline_events` (created → evaluation_started → approved/blocked → card_generated → card_used → payment_completed). |
| PUT / DELETE | `/:id` | |
| POST | `/:id/approve` / `/:id/reject` | Manual decision flow (`{ reason? }`), writes an audit log + timeline event. |
| POST | `/:id/execute` | Settles an approved request (debits the wallet, writes the transaction). |

The AI-driven path (`createFromAssistant` → risk scoring → Policy Evaluation Engine → auto approve/block → virtual card on approval) is only reachable via the AI Assistant's message endpoint, not a direct route — this is intentional, since it represents the assistant deciding to spend on the user's behalf, not a user-initiated form submission.

## Payment Approvals — `/api/payment-approvals`, Payment Transactions — `/api/payment-transactions`

Standard CRUD (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`) — approvals are the decision record for the manual flow; transactions are the settled debit/credit ledger entries.

## Virtual Cards — `/api/virtual-cards`

| Method | Path | Notes |
|---|---|---|
| GET | `/` | All cards for the current user — **`cvv` is omitted and `card_number` is masked** (`•••• •••• •••• 1234`) on every card in the list. |
| GET | `/:id` | Same masking as above. |
| GET | `/:id/reveal` | The **only** endpoint that returns the real `cardNumber`/`cvv` — call this on-demand (e.g. a press-and-hold "reveal" gesture), never store the result longer than needed. |
| POST | `/:id/use` | `{ merchant, amount }` — simulates a merchant charge; must match the card's locked merchant and exact spending limit or it fails with a specific reason (expired / already used / merchant mismatch / amount mismatch). |

## Audit Logs — `/api/audit-logs`

`POST /`, `GET /`, `GET /:id`, `DELETE /:id`. Written automatically by every approve/reject/execute (manual flow), every AI-decided approve/block, and every virtual card use/use-failure — `action` is a dotted string like `payment_request.approved` or `virtual_card.used`.

## Notifications — `/api/notifications`, Alerts — `/api/alerts`

`notifications` is the general-purpose per-wallet notification feed (`GET /`, `PATCH /:id/read`). `alerts` is the security-alert stream that powers the bell icon and the Observability dashboard's live refresh:

| Method | Path | Notes |
|---|---|---|
| GET | `/stream` | Server-Sent Events. Auth token travels as a `?token=` query param (the one endpoint where that's accepted, since `EventSource` can't set headers) — see `authenticate.js`. Sends a `: ping` comment every 25s to keep the connection alive; the client reconnects with backoff (1s → 2s → 5s → 10s → 15s) on drop. |
| GET | `/` | All alerts for the current user. |
| PATCH | `/read-all` | |
| PATCH | `/:id/read` | |
| DELETE | `/read` | Deletes every already-read alert. |
| DELETE | `/:id` | |

## Conversations — `/api/conversations`

| Method | Path | Notes |
|---|---|---|
| POST | `/` | `{ title? }` |
| GET | `/` | `?page&limit&search&sort&includeArchived` |
| GET | `/stats` | `?range=today\|7d\|30d\|all` — total conversations/messages, prompts sent, Gemini responses. |
| DELETE | `/` | Bulk delete — `{ ids: [...] }` or `{ all: true }`. |
| GET / PATCH / DELETE | `/:id` | PATCH updates `{ title?, archived? }`. |
| POST | `/:id/duplicate` | |
| POST | `/:id/export` | `{ format: 'txt' \| 'markdown' \| 'json' }` |
| GET | `/:id/messages` | |
| POST | `/:id/messages` | `{ content }` — sends to Gemini; if the reply contains a detected payment intent, this also runs the full risk-scoring + Policy Evaluation Engine + (on approval) virtual card generation, atomically. **Rate-limited.** |
| PUT | `/:id/messages/:messageId` | Edits a user message and re-sends. **Rate-limited.** |
| DELETE | `/:id/messages/:messageId` | |

## Analytics (Observability) — `/api/analytics`

All three accept the same filter set as query params: `from`, `to` (ISO date strings), `walletId`, `merchantId` (UUIDs), `status`, `riskLevel` (enums) — all optional, all validated.

| Method | Path | Notes |
|---|---|---|
| GET | `/summary` | Total/approved/blocked payments, approval/block rate, average risk score, virtual cards generated/used, alerts/audit events today. |
| GET | `/charts` | Payments per day, approved vs. blocked, alerts by severity, top merchants, top categories, risk distribution, wallet usage — each an aggregate SQL query, no N+1. |
| GET | `/export` | Additionally requires `format` (`csv` \| `xlsx` \| `pdf`); streams the file with a `Content-Disposition` header, capped at 10,000 rows. |

## Merchants — `/api/merchants`

Standard CRUD; merchants are created lazily by name the first time the AI Assistant or a manual payment request references one.

## Health — `/health`

Public, mounted outside `/api` and outside the `authenticate` middleware.

```
GET /health
200 { "status": "ok", "database": "connected", "timestamp": "..." }
503 { "status": "error", "database": "unreachable", "timestamp": "..." }
```
