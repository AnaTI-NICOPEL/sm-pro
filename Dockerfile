# 1) Build do frontend React/Vite
FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# 2) Build das dependências nativas do backend
# Compila o sqlite3 dentro da mesma base Debian usada em produção.
FROM node:20-bookworm-slim AS backend-builder

WORKDIR /app/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm_config_build_from_source=true npm ci --omit=dev


# 3) Imagem final do sistema
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /data \
    && rm -f /app/backend/database.sqlite \
    && ln -s /data/database.sqlite /app/backend/database.sqlite

EXPOSE 3001
CMD ["node", "backend/index.js"]
