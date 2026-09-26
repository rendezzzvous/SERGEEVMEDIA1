# syntax=docker/dockerfile:1
# Если alpine/musl не найдёт SWC/oxide-бинарники: --build-arg NODE_IMAGE=node:24-slim
ARG NODE_IMAGE=node:24-alpine
ARG PNPM_VERSION=12.5.1

# ── deps: только манифесты → слой переиспользуется, пока не меняется lockfile ──
FROM ${NODE_IMAGE} AS deps
ARG PNPM_VERSION
WORKDIR /app
# Corepack удалён из Node ≥25 и не нужен: ставим pnpm напрямую
RUN npm i -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Build-time секрет (пример): приватный .npmrc. Не передан → mount просто пуст (required=false по умолчанию)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

# ── builder ──
FROM ${NODE_IMAGE} AS builder
ARG PNPM_VERSION
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* инлайнятся в бандл при сборке → смена домена/CDN = пересборка
ARG NEXT_PUBLIC_SITE_URL=https://sergeev.example
ARG NEXT_PUBLIC_CDN_BASE=https://cdn.example.com/sergeev
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_CDN_BASE=$NEXT_PUBLIC_CDN_BASE
RUN npm i -g pnpm@${PNPM_VERSION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .next/cache = build-cache Turbopack между сборками.
# env-форма секрета — пример для токена вроде SENTRY_AUTH_TOKEN (в образ не попадает)
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    pnpm build

# ── runner: только standalone-сервер, без исходников и dev-зависимостей ──
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# standalone не копирует public/ и .next/static — кладём сами
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
# В alpine нет curl → проверяем через встроенный fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
