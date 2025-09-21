# 1. Build stage: Install dependencies and build the app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runner stage: Copy only what's needed
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
RUN addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
USER app
EXPOSE 3000

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:3000, path:'/'}, res => process.exit(res.statusCode == 200 ? 0 : 1)).end()"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]