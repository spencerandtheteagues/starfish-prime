FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/builder/package.json ./apps/builder/package.json
RUN npm i --workspace apps/builder --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY apps/builder ./apps/builder
WORKDIR /app/apps/builder
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache git
COPY --from=build /app/apps/builder/dist ./dist
COPY apps/builder/package.json ./package.json
RUN npm i --omit=dev --no-audit --no-fund
EXPOSE 4001
CMD ["node","dist/index.js"]
