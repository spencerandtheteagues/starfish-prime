# 1. Build stage: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Runner stage: Copy only what's needed
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app
EXPOSE 4002 9464

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:4002, path:'/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

CMD ["node", "src/index.js"]