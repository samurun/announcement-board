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
Tests: `pnpm --filter api test`.

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

- Announcement-specific integration tests (pinned ordering, 403 author-guard, 400 validation, 404).
- Pagination on `GET /announcements`.
- Optimistic create/delete.
