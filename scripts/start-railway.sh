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

# Start temporary health server so Railway healthcheck passes during boot
node -e "
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok', phase: 'booting'}));
  } else { res.writeHead(404); res.end(); }
});
server.listen(process.env.PORT || 4000, () => {
  console.log('Health server listening on :' + (process.env.PORT || 4000));
});
" &
HEALTH_PID=$!
sleep 1
echo "Health server PID: $HEALTH_PID"

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

echo "Waiting 20s for subgraphs to initialize..."
sleep 20

echo "Polling subgraphs..."
for port in 4010 4020 4030 4040 4050 4060 4090 4101 4102 4103 4104; do
  for i in $(seq 1 30); do
    if curl -sf -X POST "http://localhost:$port/graphql" \
      -H "Content-Type: application/json" \
      -d '{"query":"{_service{sdl}}"}' > /dev/null 2>&1; then
      echo "port $port ready"
      break
    fi
    sleep 2
  done
done

# Kill health server so gateway can bind to the same port
echo "Killing health server (PID $HEALTH_PID)..."
kill $HEALTH_PID 2>/dev/null || true
sleep 2
# Also kill any child processes
pkill -f "node -e.*Health server" 2>/dev/null || true
sleep 1
# Verify port is free
echo "Checking port $PORT is free..."
if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
  echo "Port $PORT still in use, force killing..."
  fuser -k $PORT/tcp 2>/dev/null || true
  sleep 1
fi

echo "Starting gateway..."
exec npx tsx src/gateway/index.ts
