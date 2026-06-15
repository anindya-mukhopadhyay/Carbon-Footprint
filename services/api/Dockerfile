FROM node:20-alpine AS builder
WORKDIR /workspace
COPY package*.json ./
COPY services/api/package.json services/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace services/api --include-workspace-root
COPY tsconfig.base.json ./
COPY services/api services/api
RUN npm run build --workspace services/api

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY services/api/package.json services/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --ignore-scripts --workspace services/api --include-workspace-root && npm cache clean --force
COPY --from=builder /workspace/services/api/dist services/api/dist
USER node
EXPOSE 8080
CMD ["node", "services/api/dist/server.js"]
