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
COPY --from=builder /app .
USER app
EXPOSE 3000

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:3000, path:'/'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "next", "start", "-p", "3000"]