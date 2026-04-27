# ════════════════════════════════════════════════════
# Cần & Có — Next.js Production Dockerfile
# Multi-stage build: deps → builder → runner
# Image size target: ~150MB
# ════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install libc6-compat for alpine compatibility (needed by some native modules)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
# Use npm install to fix lockfile inconsistencies automatically
RUN npm install

# ── Stage 2: Build Next.js ───────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (requires output: 'standalone' in next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Production runner ───────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client (not included in standalone, must copy separately)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 4000

# Health check (wget available on alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/intents?limit=1 || exit 1

CMD ["node", "server.js"]
