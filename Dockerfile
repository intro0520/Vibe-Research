# Vibe-Research — Production Docker Image
# Multi-stage build: frontend (Node) → backend (Python)
# Deployable on Render / Railway / Fly.io / any Docker host

# ── Stage 1: Build frontend ─────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci --omit=optional && npm cache clean --force
COPY frontend/ .
RUN npm run build

# ── Stage 2: Python runtime ─────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System deps for akshare/mootdx data sources
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build
COPY --from=frontend-builder /build/dist /app/static

# Copy backend code
COPY backend/ /app/

# Install Python deps
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
    CMD curl -sf http://localhost:${PORT:-8000}/api/health || exit 1

EXPOSE 8000

# Serve via _serve.py (wraps backend API + static frontend)
CMD uvicorn _serve:app --host 0.0.0.0 --port ${PORT:-8000} --forwarded-allow-ips '*'
