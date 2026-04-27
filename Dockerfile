FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM deps AS prod-deps
WORKDIR /app
RUN npm prune --omit=dev && npm cache clean --force

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node package*.json ./
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node mockmind.yaml ./mockmind.yaml
RUN mkdir -p /app/.mockmind && chown -R node:node /app/.mockmind
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/cli/index.js", "start", "--config", "mockmind.yaml", "--host", "0.0.0.0", "--port", "4000"]
