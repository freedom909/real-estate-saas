#!/bin/bash
# Quick Railway deployment script
# Run this from the project root

set -e

echo "🚂 Railway Deployment Script for Minshuku SaaS"
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo ""
echo "📋 Step 1: Create Railway project"
echo "--------------------------------"
read -p "Enter project name (default: minshuku-saas): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-minshuku-saas}

railway init --name "$PROJECT_NAME"
echo "✅ Project created: $PROJECT_NAME"

echo ""
echo "📦 Step 2: Add database services"
echo "--------------------------------"
echo "Adding MongoDB..."
railway add --name mongodb
echo "Adding MySQL..."
railway add --name mysql
echo "Adding Redis..."
railway add --name redis
echo "Adding RabbitMQ..."
railway add --name rabbitmq
echo "✅ All databases added"

echo ""
echo "🔧 Step 3: Configure environment variables"
echo "------------------------------------------"
echo "Please add the following variables in Railway Dashboard:"
echo "  1. Go to https://railway.app/dashboard"
echo "  2. Select your project: $PROJECT_NAME"
echo "  3. Go to Variables tab"
echo "  4. Add the variables from RAILWAY_DEPLOY.md"
echo ""
echo "Press Enter when done..."
read

echo ""
echo "🚀 Step 4: Deploy backend"
echo "------------------------"
railway up
echo "✅ Backend deployed!"

echo ""
echo "📝 Step 5: Get your Railway URL"
echo "-------------------------------"
echo "Check Railway dashboard for your app URL"
echo "It will look like: https://your-app.up.railway.app"
echo ""
read -p "Enter your Railway backend URL: " BACKEND_URL

echo ""
echo "🌐 Step 6: Deploy frontend"
echo "--------------------------"
cd frontend
railway init --name "${PROJECT_NAME}-frontend"
railway variables set BACKEND_URL="$BACKEND_URL"
railway variables set NEXT_PUBLIC_SUBGRAPH_AUTH_URL="$BACKEND_URL/graphql"
railway up
cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your services:"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: https://${PROJECT_NAME}-frontend.up.railway.app"
echo ""
echo "Next steps:"
echo "  1. Update OAuth redirect URIs in Railway dashboard"
echo "  2. Add real API keys (Google, Facebook, OpenAI, etc.)"
echo "  3. Generate RSA keys for JWT (or use existing ones)"
echo ""
echo "View logs: railway logs"
echo "Check status: railway status"
