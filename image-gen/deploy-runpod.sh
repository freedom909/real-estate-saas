#!/bin/bash
set -e

echo "=== RunPod Deployment for Image Generation Service ==="

# Check if runpod CLI is installed
if ! command -v runpodctl &> /dev/null; then
    echo "Installing RunPod CLI..."
    pip install runpodctl
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -f Dockerfile.runpod -t image-gen-service:latest .

# Tag for RunPod registry
echo "Tagging image..."
docker tag image-gen-service:latest your-runpod-registry/image-gen-service:latest

# Push to RunPod registry (replace with your registry)
echo "Pushing to registry..."
# docker push your-runpod-registry/image-gen-service:latest

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Push your image to a container registry:"
echo "   - Docker Hub: docker push your-username/image-gen-service:latest"
echo "   - RunPod Registry: runpodctl push image-gen-service"
echo "   - AWS ECR, GCP Artifact Registry, etc."
echo ""
echo "2. Create a RunPod Serverless Endpoint:"
echo "   - Go to https://www.runpod.io/console/serverless"
echo "   - Click 'New Endpoint'"
echo "   - Select 'Custom Container'"
echo "   - Enter your image URI"
echo "   - Set GPU: NVIDIA RTX A4000 or better"
echo "   - Set GPU Count: 1"
echo "   - Set Port: 8000"
echo ""
echo "3. Once deployed, update your .env files:"
echo "   - .env: IMAGE_GEN_API_URL=https://your-endpoint.runpod.ai"
echo "   - frontend/.env.local: NEXT_PUBLIC_IMAGE_API_URL=https://your-endpoint.runpod.ai"
echo ""
echo "4. For RunPod Serverless (pay-per-use), use runpod_handler.py instead:"
echo "   - Build: docker build -f Dockerfile.runpod -t image-gen-serverless ."
echo "   - Push to registry"
echo "   - Create serverless endpoint with handler: runpod_handler"
echo ""
echo "Done!"
