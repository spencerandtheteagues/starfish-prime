# 1. Build stage: Install dependencies and generate prisma client
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

# 2. Runtime stage: Copy only what's needed
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini
ENV NODE_ENV=production
# Use Render's PORT env var, fallback to 4000
ENV PORT=${PORT:-4000}
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./

# Dynamic port exposure
EXPOSE ${PORT:-4000}

# Healthcheck using PORT env var
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 4000; require('http').request({host:'localhost', port:port, path:'/health'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini","--"]
CMD ["npm", "start"]
