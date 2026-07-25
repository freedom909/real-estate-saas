#!/bin/bash
set -e

echo "Starting Railway monolith deployment..."
echo "Working directory: $(pwd)"

# Generate RSA keys if they don't exist
if [ ! -f keys/private.pem ] || [ ! -f keys/public.pem ]; then
  echo "Generating RSA keys..."
  node scripts/generate-keys.cjs
fi

export PRIVATE_PATH=./keys/private.pem
export PUBLIC_PATH=./keys/public.pem
export REFRESH_PUBLIC_KEY_PATH=./keys/refresh_public.pem
export REFRESH_PRIVATE_KEY_PATH=./keys/refresh_private.pem

# Launch all subgraphs + gateway with readiness polling
exec npx tsx scripts/start-railway.ts
