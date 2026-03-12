# ==============================================
# Dockerfile for Bananay Courier
# ==============================================

FROM node:20.18.1-alpine3.21 AS deps

RUN apk update && \
    apk upgrade && \
    apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json package-lock.json* ./

# npm ci с retry механизмом для надежности
RUN npm ci --maxsockets 1 --prefer-offline --no-audit || \
    npm ci --maxsockets 1 --prefer-offline --no-audit || \
    npm ci --no-audit

# Stage 2: Builder
FROM node:20.18.1-alpine3.21 AS builder

RUN apk update && \
    apk upgrade && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json package-lock.json* ./
COPY next.config.ts tsconfig.json postcss.config.mjs ./
COPY public ./public
COPY src ./src
COPY messages ./messages

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner
FROM node:20.18.1-alpine3.21 AS runner

RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/messages ./messages

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
