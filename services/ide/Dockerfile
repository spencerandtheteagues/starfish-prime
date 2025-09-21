# 1. Build stage: Install dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runner stage: Copy only what's needed
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
RUN addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
# Use Render's PORT env var, fallback to 3000
ENV PORT=${PORT:-3000}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
USER app

# Dynamic port exposure
EXPOSE ${PORT:-3000}

# Healthcheck using PORT env var
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').request({host:'localhost', port:port, path:'/api/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).on('error', () => process.exit(1)).end()"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
