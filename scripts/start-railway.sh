#!/bin/bash
set -e

echo "Starting Railway monolith deployment..."
echo "Working directory: $(pwd)"

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
