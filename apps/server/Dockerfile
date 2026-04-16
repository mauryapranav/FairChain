FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

# ── Install deps ──────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY tsconfig.base.json ./
RUN pnpm --filter @fairchain/shared build 2>/dev/null || true
RUN pnpm --filter @fairchain/server build

# ── Runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/packages/shared ./packages/shared

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
