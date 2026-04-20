# Build context = repo root
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM deps AS build
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}
COPY tsconfig.json ./
COPY packages/ui packages/ui
COPY apps/web apps/web
RUN pnpm --filter web build

# ---------- runtime (nginx) ----------
FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
