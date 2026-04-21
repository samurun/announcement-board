# Announcement Board

Full-stack announcement board. Take-home for BETA X (Associate Full Stack).

**Stack:** Express + Prisma + Postgres · React + Vite · pnpm workspaces · Docker Compose.

## Run

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173. The API runs `prisma migrate deploy` on boot.

Local dev: `docker compose up db -d && pnpm install && pnpm dev` (api :4000, web :5173).

## Tests

```bash
pnpm test        # run api + web (via Turbo)
pnpm test:api    # api only
pnpm test:web    # web only
```

Stack: **Vitest** everywhere, **Supertest** for API route tests.

| Suite | Path | Covers |
| --- | --- | --- |
| `api/auth/crypto` | `apps/api/tests/auth/crypto.test.ts` | argon2 hash/verify, JWT sign/verify, expiry + bad-signature rejection |
| `api/auth/schema` | `apps/api/tests/auth/schema.test.ts` | Zod register/login input validation (required fields, email shape, min length) |
| `api/auth/service` | `apps/api/tests/auth/service.test.ts` | register (409 on duplicate), login (401 on wrong password), `getUserById` strips `passwordHash` |
| `api/auth/middleware` | `apps/api/tests/auth/middleware.test.ts` | `requireAuth` — 401 on missing/malformed/expired token, attaches `req.user` on valid |
| `api/auth/router` | `apps/api/tests/auth/router.test.ts` | End-to-end register/login/me via Supertest, including validation and auth-required paths |
| `api/announcements/router` | `apps/api/tests/announcements/router.test.ts` | Auth gate on every route, pinned-first ordering, author-derived-from-token (403 on spoof), 403/404 on update/delete, 400 on empty body |
| `api/smoke` | `apps/api/tests/smoke.test.ts` | `GET /health` reports db status |
| `web/auth/schemas` | `apps/web/src/features/auth/schemas.test.ts` | Client-side login/register Zod schemas |
| `web/announcements/schemas` | `apps/web/src/features/announcements/schemas.test.ts` | create/update schema — required fields, pinned optional, update as partial |

## API

Base: `http://localhost:4000`. `/announcements/*` needs `Authorization: Bearer <token>`.
Swagger UI at `GET /docs`.

| Method | Path | Body |
| --- | --- | --- |
| POST | `/auth/register` | `{ email, password, name }` |
| POST | `/auth/login` | `{ email, password }` |
| GET | `/auth/me` | — |
| GET | `/announcements` | — (pinned first, then newest) |
| GET | `/announcements/my-announcements` | — |
| GET | `/announcements/:id` | — |
| POST | `/announcements` | `{ title, body, pinned? }` |
| PUT | `/announcements/:id` | `{ title?, body?, pinned? }` |
| DELETE | `/announcements/:id` | — |

```bash
TOKEN=$(curl -s -X POST localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@a.com","password":"hunter22","name":"Alice"}' | jq -r .token)

curl -X POST localhost:4000/announcements \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Hi","body":"First!","pinned":true}'
```

Errors: `400` validation, `401` no/bad token, `403` not the author, `404` not found, `409` email taken.

## Tradeoffs

1. **Added auth** — `author` is derived from the logged-in user instead of being a free-text form field, so it can't be spoofed. Cost: more moving parts for a 4–5h brief.
2. **Denormalized `author` name** on `Announcement` — one less join per list read, but the display name goes stale if a user renames themselves.
3. **Cache invalidation, not optimistic updates** — simpler and always consistent; slight flash on slow networks.

## With more time

- Shared types package — single Zod source of truth for API DTOs + client types.
- Pagination on `GET /announcements`.
- Optimistic create/delete.
- Component-level tests on the web side (dialog flows, cache invalidation).
