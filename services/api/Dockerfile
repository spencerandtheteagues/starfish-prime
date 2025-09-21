# 1. Build stage: Install dependencies and generate prisma client
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# 2. Runtime stage: Copy only what's needed
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./
EXPOSE 4000

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:4000, path:'/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini","--"]
CMD ["sh", "./scripts/start.sh"]
