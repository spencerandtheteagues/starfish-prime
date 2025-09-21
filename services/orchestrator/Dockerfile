# 1. Build stage: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Runner stage: Copy only what's needed
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
RUN addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
# Use Render's PORT env var, fallback to 4001
ENV PORT=${PORT:-4001}
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app

# Expose both main port and metrics port
EXPOSE ${PORT:-4001} 9464

# Healthcheck using PORT env var
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 4001; require('http').request({host:'localhost', port:port, path:'/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
