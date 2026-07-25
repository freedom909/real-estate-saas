#!/bin/bash
set -e

echo "Starting Railway monolith deployment..."
echo "Working directory: $(pwd)"

# Generate RSA keys if they don't exist
mkdir -p keys
if [ ! -f keys/private.pem ] || [ ! -f keys/public.pem ]; then
  echo "Generating RSA keys..."
  openssl genrsa -out keys/private.pem 2048
  openssl rsa -in keys/private.pem -pubout -out keys/public.pem
  openssl genrsa -out keys/refresh_private.pem 2048
  openssl rsa -in keys/refresh_private.pem -pubout -out keys/refresh_public.pem
  echo "RSA keys generated."
fi

export PRIVATE_PATH=./keys/private.pem
export PUBLIC_PATH=./keys/public.pem
export REFRESH_PUBLIC_KEY_PATH=./keys/refresh_public.pem
export REFRESH_PRIVATE_KEY_PATH=./keys/refresh_private.pem

# Start all subgraphs in background
npx tsx src/subgraphs/auth/index.ts &
npx tsx src/subgraphs/user/index.ts &
npx tsx src/subgraphs/booking/index.ts &
npx tsx src/subgraphs/review/index.ts &
npx tsx src/subgraphs/payment/index.ts &
npx tsx src/subgraphs/tenant/index.ts &
npx tsx src/subgraphs/audit/index.ts &
npx tsx src/subgraphs/location/index.ts &
npx tsx src/subgraphs/amenity/index.ts &
npx tsx src/subgraphs/listing/index.ts &
npx tsx src/subgraphs/account/index.ts &
npx tsx src/subgraphs/cart/index.ts &
npx tsx src/subgraphs/admin/index.ts &
npx tsx src/wisdom/index.ts &
npx tsx src/voice/index.ts &

echo "Waiting 15s for subgraphs to initialize..."
sleep 15

echo "Starting gateway..."
exec npx tsx src/gateway/index.ts
