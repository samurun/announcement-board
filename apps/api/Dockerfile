# Build context = repo root
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ---------- build: full deps + prisma generate ----------
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile
COPY packages/db packages/db
COPY apps/api apps/api
RUN cd packages/db && pnpm exec prisma generate

# ---------- prod-deps: only runtime deps + prisma client ----------
FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --prod
# Regenerate Prisma client in the trimmed tree
COPY packages/db/prisma packages/db/prisma
RUN cd packages/db && pnpm exec prisma generate

# ---------- runtime ----------
FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/src apps/api/src
COPY --from=build /app/apps/api/tsconfig.json apps/api/
COPY --from=build /app/packages/db packages/db

# Trimmed node_modules (prod deps only, Prisma client included)
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=prod-deps /app/apps/api/node_modules apps/api/node_modules
COPY --from=prod-deps /app/packages/db/node_modules packages/db/node_modules

EXPOSE 4000
CMD sh -c "cd /app/packages/db && pnpm exec prisma migrate deploy && cd /app/apps/api && pnpm exec tsx src/index.ts"
