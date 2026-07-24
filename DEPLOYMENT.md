# Deployment Guide: Vercel + AWS (ECS Fargate)

## Status: Paused
- ✅ Railway CLI installed
- ✅ AWS CLI installed (v2.36.7)
- ⏸️ AWS IAM user setup pending
- ⏸️ ECS Fargate deployment pending

## When You're Ready to Continue

### 1. Configure AWS CLI
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-1), output format (json)
```

### 2. Follow the rest of this guide

---

## Step 1: Install CLI Tools

```bash
# Vercel CLI
npm i -g vercel

# Railway CLI
npm i -g @railway/cli

# Login to both
vercel login
railway login
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

```bash
cd D:\minshuku-saas
railway init
# Name it: minshuku-backend
```

### 2.2 Add Services

```bash
# Add MongoDB
railway add --database mongo

# Add MySQL
railway add --database mysql

# Add Redis
railway add --database redis
```

Railway will provide connection strings like:
- `MONGO_URL=mongodb://mongo:password@containers-us-west-1.railway.app:xxxx`
- `MYSQL_URL=mysql://root:password@containers-us-west-1.railway.app:xxxx`
- `REDIS_URL=redis://default:password@containers-us-west-1.railway.app:xxxx`

### 2.3 Set Environment Variables

```bash
railway variables set ACCESS_TOKEN_SECRET="your-production-secret-min-32-chars"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"
railway variables set ENABLE_GATEWAY_AUTH="true"

# Database URLs (Railway provides these automatically as MONGO_URL, MYSQL_URL, REDIS_URL)
# If you need to set them manually:
# railway variables set MONGO_URI="mongodb://..."
# railway variables set DB_HOST="mysql-host.railway.app"
# railway variables set DB_PORT="3306"
# railway variables set DB_NAME="saas"
# railway variables set DB_USER="root"
# railway variables set DB_PASSWORD="..."
```

### 2.4 Deploy

```bash
railway up
```

This will build and deploy your backend. Railway will give you a URL like:
`https://minshuku-backend.up.railway.app`

### 2.5 Run Seed Data

After deployment, run the seed script:
```bash
railway run npx tsx src/seeds/seed-all.ts
railway run npx tsx src/seeds/seed-listings.ts
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

```bash
cd D:\minshuku-saas\frontend
vercel
# Follow prompts:
# - Link to existing project or create new
# - Framework: Next.js
# - Build command: (leave default)
# - Output directory: (leave default)
```

### 3.2 Set Environment Variables

```bash
# Set the backend URL
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://minshuku-backend.up.railway.app

vercel env add NEXT_PUBLIC_GRAPHQL_URL production
# Enter: https://minshuku-backend.up.railway.app/graphql
```

### 3.3 Deploy

```bash
vercel --prod
```

Vercel will give you a URL like:
`https://minshuku.vercel.app`

---

## Step 4: Update Gateway CORS

After you know your Vercel URL, update the gateway CORS:

```bash
railway variables set FRONTEND_URL="https://your-vercel-url.vercel.app"
```

Then update `src/gateway/index.ts` to use the env variable:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}))
```

---

## Step 5: Verify Deployment

1. **Backend health**: Visit `https://your-railway-url/graphql` — should return GraphQL SDL
2. **Frontend**: Visit `https://your-vercel-url` — should load the app
3. **Login**: Try OAuth login
4. **Tenant switching**: Test the tenant switcher in the navbar

---

## Environment Variables Summary

### Railway (Backend)
| Variable | Description | Example |
|----------|-------------|---------|
| `ACCESS_TOKEN_SECRET` | JWT signing secret | `min32chars...` |
| `JWT_SECRET` | JWT secret | `your-secret` |
| `NODE_ENV` | Environment | `production` |
| `MONGO_URI` | MongoDB connection | Auto-provided by Railway |
| `DB_HOST` | MySQL host | Auto-provided by Railway |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | MySQL database | `saas` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | Auto-provided by Railway |
| `REDIS_URL` | Redis connection | Auto-provided by Railway |
| `FRONTEND_URL` | Frontend URL for CORS | `https://...vercel.app` |

### Vercel (Frontend)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://...railway.app` |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint | `https://...railway.app/graphql` |

---

## Troubleshooting

### CORS errors
- Ensure `FRONTEND_URL` is set correctly in Railway
- Ensure the URL matches exactly (including `https://`)

### Database connection errors
- Check Railway service variables are linked
- Verify MongoDB/MySQL services are running in Railway dashboard

### Seed data not showing
- Run seed commands after deployment:
  ```bash
  railway run npx tsx src/seeds/seed-all.ts
  ```

### Tenant switching not working
- Verify `/api/tenants/*` routes are accessible
- Check browser network tab for `x-tenant-id` header
