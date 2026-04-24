FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY mockmind.yaml ./mockmind.yaml
EXPOSE 4000
CMD ["node", "dist/cli/index.js", "start", "--config", "mockmind.yaml", "--host", "0.0.0.0"]
