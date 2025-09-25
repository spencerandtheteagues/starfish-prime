# Multi-stage build for Starfish Prime Unified App
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the client (Next.js)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run client:build

# Build the server (TypeScript)
RUN npm run server:build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/.next ./.next
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/package.json ./
COPY --from=builder --chown=app:app /app/node_modules ./node_modules

USER app
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:process.env.PORT || 10000, path:'/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server/index.js"]