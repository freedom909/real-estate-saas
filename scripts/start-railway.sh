#!/bin/bash
# Railway monolith startup: launch all subgraphs in background, then gateway

set -e

echo "🚀 Starting Railway monolith deployment..."

# Launch all subgraphs in background
node dist/subgraphs/auth/index.js &
node dist/subgraphs/user/index.js &
node dist/subgraphs/booking/index.js &
node dist/subgraphs/review/index.js &
node dist/subgraphs/payment/index.js &
node dist/subgraphs/tenant/index.js &
node dist/subgraphs/audit/index.js &
node dist/subgraphs/location/index.js &
node dist/subgraphs/amenity/index.js &
node dist/subgraphs/listing/index.js &
node dist/subgraphs/account/index.js &
node dist/subgraphs/cart/index.js &
node dist/subgraphs/admin/index.js &
node dist/wisdom/index.js &
node dist/voice/index.js &

echo "⏳ Waiting for subgraphs to start..."
sleep 5

# Launch gateway on Railway's assigned PORT (foreground)
exec node dist/gateway/index.js
