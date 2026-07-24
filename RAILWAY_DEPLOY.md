# Railway Deployment Guide

## Prerequisites

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

## Step 1: Create Railway Project

```bash
cd minshuku-saas
railway init
# Select "Empty Project" or create new
# Name it: minshuku-saas
```

## Step 2: Add Database Services

```bash
# Add MongoDB
railway add --name mongodb
# Select "MongoDB" from the template list

# Add MySQL
railway add --name mysql
# Select "MySQL" from the template list

# Add Redis
railway add --name redis
# Select "Redis" from the template list

# Add RabbitMQ
railway add --name rabbitmq
# Select "RabbitMQ" from the template list
```

## Step 3: Configure Environment Variables

Go to Railway Dashboard → Your Project → Backend Service → Variables

Add these environment variables (copy from your .env, updating URLs):

```bash
# Database - MongoDB (use Railway's MongoDB plugin URL)
MONGO_URI=${MONGO_URI}

# Database - MySQL (use Railway's MySQL plugin URL)
DB_NAME=saas
DB_USER=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_DIALECT=mysql
MYSQL_URI=mysql://${MYSQLUSER}:${MYSQLPASSWORD}@${MYSQLHOST}:${MYSQLPORT}/saas

# Redis (use Railway's Redis plugin URL)
REDIS_URL=${REDIS_URL}

# RabbitMQ (use Railway's RabbitMQ plugin URL)
RABBITMQ_URL=${RABBITMQ_URL}

# JWT Auth
JWT_EXPIRY=1d
JWT_SECRET=real_access_secret_key_2024_secure_random_string
ACCESS_TOKEN_SECRET=real_access_secret_key_2024_secure_random_string
JWT_AUDIENCE=real-estate.com
JWT_ALGORITHM=RS256

# Security / Rate limit
MAX_ATTEMPTS=5
LOCK_DURATION=900000

# Internal Services (will be updated after first deploy)
INTERNAL_API_URI=http://localhost:4000/graphql
GATEWAY_URL=http://localhost:4000

MONGO_API_KEY=real-estate-platform_internal_mongo_secret_key_2024_secure_random_string
MYSQL_API_KEY=real-estate-platform_internal_mysql_secret_key_2024_secure_random_string

# Subgraph URLs (all run in same container, use localhost)
USER_SUBGRAPH_URL=http://localhost:4020/graphql
AUTH_SUBGRAPH_URL=http://localhost:4010/graphql
LISTING_SUBGRAPH_URL=http://localhost:4101/graphql
TENANT_SUBGRAPH_URL=http://localhost:4040/graphql

# OAuth (update redirect URIs to Railway domain)
GOOGLE_REDIRECT_URI=https://your-app.up.railway.app/api/auth/callback/google
FACEBOOK_REDIRECT_URI=https://your-app.up.railway.app/auth/callback/facebook
GITHUB_REDIRECT_URI=https://your-app.up.railway.app/auth/callback/github

# JWT Keys
PRIVATE_PATH=./keys/private.pem
PUBLIC_PATH=./keys/public.pem
REFRESH_PUBLIC_KEY_PATH=./keys/refresh_public.pem
REFRESH_PRIVATE_KEY_PATH=./keys/refresh_private.pem
JWT_ISSUER=auth-service
JWT_ACCESS_EXPIRES_IN=150m
JWT_REFRESH_EXPIRES_IN=30d
INTERNAL_SERVICE_TOKEN=1234567890
NODE_ENV=production

# API Keys (add your real keys)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Step 4: Deploy Backend

```bash
# Link to your Railway project
railway link

# Deploy
railway up
```

Wait for deployment to complete. Railway will assign a domain like `your-app.up.railway.app`.

## Step 5: Update CORS & Frontend URLs

After backend is deployed, update these variables in Railway dashboard:

```bash
# Update CORS origin in gateway
CORS_ORIGIN=https://your-frontend.up.railway.app

# Update INTERNAL_API_URI with actual Railway URL
INTERNAL_API_URI=https://your-backend.up.railway.app/graphql
GATEWAY_URL=https://your-backend.up.railway.app
```

## Step 6: Deploy Frontend

```bash
cd frontend

# Create separate Railway service for frontend
railway init
# Name it: minshuku-frontend

# Set environment variables
railway variables set BACKEND_URL=https://your-backend.up.railway.app
railway variables set NEXT_PUBLIC_SUBGRAPH_AUTH_URL=https://your-backend.up.railway.app/graphql

# Deploy
railway up
```

## Step 7: Verify Deployment

1. Check backend health:
   ```bash
   curl https://your-backend.up.railway.app/graphql
   ```

2. Check frontend:
   ```bash
   curl https://your-frontend.up.railway.app
   ```

3. Check Railway logs:
   ```bash
   railway logs
   ```

## Troubleshooting

### Gateway can't connect to subgraphs
- Ensure all subgraphs are starting (check logs)
- Gateway waits 5 seconds for subgraphs to start
- Check that port 4000 is assigned by Railway

### Database connection fails
- Use Railway's plugin URLs (they provide MONGO_URI, MYSQL_URL, etc.)
- Don't use localhost for databases

### CORS errors
- Update CORS_ORIGIN to match your frontend Railway URL
- Ensure frontend BACKEND_URL points to backend Railway URL

### Build fails
- Check that tsconfig.build.json exists (create if missing)
- Ensure all dependencies are in package.json

## Cost Estimation

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

Database services:
- MongoDB: ~$1-5/month
- MySQL: ~$1-5/month
- Redis: ~$1-3/month
- RabbitMQ: ~$1-3/month

**Total estimated**: $10-40/month depending on usage

## Alternative: Single Service with External DBs

If you prefer to use external database services (e.g., MongoDB Atlas, PlanetScale, Upstash):

1. Remove database services from Railway
2. Update env vars to point to external services
3. This reduces Railway costs but adds external service costs
