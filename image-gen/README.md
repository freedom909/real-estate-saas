# Image Generation Service

Stable Diffusion service for generating property images.

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Text to Image
```bash
curl -X POST http://localhost:8000/api/images/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful modern apartment with large windows, professional real estate photography",
    "negative_prompt": "blurry, low quality",
    "width": 512,
    "height": 512,
    "num_inference_steps": 30,
    "guidance_scale": 7.5
  }'
```

### Image to Image
```bash
curl -X POST http://localhost:8000/api/images/img2img \
  -H "Content-Type: application/json" \
  -F "req={\"prompt\": \"modern luxury apartment\", \"strength\": 0.75}" \
  -F "image=@your_image.png"
```

### Inpainting
```bash
curl -X POST http://localhost:8000/api/images/inpaint \
  -H "Content-Type: application/json" \
  -F "req={\"prompt\": \"a beautiful modern kitchen\", \"strength\": 0.75}" \
  -F "image=@room.png" \
  -F "mask=@mask.png"
```

### Get Generated Image
```bash
curl http://localhost:8000/api/images/images/{filename}
```

## Environment Variables

- `IMAGE_GEN_MODEL_ID` - Model to use (default: `runwayml/stable-diffusion-v1-5`)
- `IMAGE_GEN_DEVICE` - Device to use (default: `cuda`)
- `IMAGE_GEN_DTYPE` - Data type (default: `float16`)
- `IMAGE_GEN_OUTPUT_DIR` - Output directory (default: `./outputs`)

---

## Deploy to RunPod

### Option 1: RunPod GPU Cloud (Persistent Endpoint)

```bash
# 1. Build Docker image
docker build -f Dockerfile.runpod -t image-gen-service:latest .

# 2. Push to a container registry (Docker Hub, ECR, etc.)
docker tag image-gen-service:latest your-username/image-gen-service:latest
docker push your-username/image-gen-service:latest

# 3. Create endpoint on RunPod Console
#    - Go to https://www.runpod.io/console/serverless
#    - New Endpoint → Custom Container
#    - Image URI: your-username/image-gen-service:latest
#    - GPU: NVIDIA RTX A4000 or better
#    - Port: 8000

# 4. Update your .env files with the RunPod endpoint URL
```

### Option 2: RunPod Serverless (Pay-per-use)

For cost-efficient, auto-scaling deployment:

```bash
# 1. Build with serverless handler
docker build -f Dockerfile.runpod -t image-gen-serverless .

# 2. Push to registry
docker push your-username/image-gen-serverless:latest

# 3. Create serverless endpoint
#    - Handler: runpod_handler
#    - GPU: NVIDIA RTX A4000 or better
#    - Idle Timeout: 5 seconds (default)

# 4. Call via RunPod API
curl -X POST https://api.runpod.ai/v2/your-endpoint-id/runsync \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY" \
  -d '{
    "input": {
      "type": "txt2img",
      "prompt": "a beautiful modern apartment",
      "width": 512,
      "height": 512
    }
  }'
```

### RunPod Pricing (approximate)

| GPU | VRAM | Price/hr |
|-----|------|----------|
| RTX A4000 | 16 GB | ~$0.20 |
| RTX A5000 | 24 GB | ~$0.30 |
| RTX A6000 | 48 GB | ~$0.45 |
| A100 40GB | 40 GB | ~$1.60 |
| A100 80GB | 80 GB | ~$2.20 |

### Connecting to Your App

After deployment, update these env vars:

```bash
# Backend (.env)
IMAGE_GEN_API_URL=https://your-runpod-endpoint.runpod.ai

# Frontend (.env.local)
NEXT_PUBLIC_IMAGE_API_URL=https://your-runpod-endpoint.runpod.ai
```
