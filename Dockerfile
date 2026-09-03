FROM node:20-bookworm-slim

# --- System deps for bcrypt / sharp / native modules ---
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         ca-certificates curl git python3 make g++ procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    TZ=UTC

# --- Layer 1: Dependencies (cached) ---
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
    || npm install --omit=dev --no-audit --no-fund

# --- Layer 2: Source ---
COPY . .

# Make helper scripts executable if present (don't fail if the dir has no .sh)
RUN chmod +x scripts/*.sh scripts/*.cjs 2>/dev/null || true

EXPOSE 4000 4010 4020 4030 4040 4050 4060 4070 4080 4090 4100 4101 4102 4103 4104 4200 4300

ENTRYPOINT ["dumb-init", "--"] 2>/dev/null || true
CMD ["node", "scripts/start-backend.cjs"]
