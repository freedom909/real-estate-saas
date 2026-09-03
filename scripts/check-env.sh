#!/usr/bin/env bash
#
# scripts/check-env.sh
#
# 在部署 / 启动前，校验 .env 里的关键字段是非空的。
# 只做「非空」检查；不做正则，避免误杀合法值。
# 如果 .env 不存在，会尝试 source .env.alibaba.example 作为 fallback（但生产必须有真实 .env）。
#
# 用法：
#   bash scripts/check-env.sh             # 不通过时 exit 1
#   bash scripts/check-env.sh --strict     # 严格模式：所有 RECOMMENDED 字段也必须非空
#
set -euo pipefail

REQUIRED_MINIMAL=(
  NODE_ENV
  ACCESS_TOKEN_SECRET
  REFRESH_TOKEN_SECRET
  JWT_SECRET
  GATEWAY_SECRET
  NAKANO_ENCRYPTION_KEY
  INTERNAL_SERVICE_TOKEN
  # MySQL / 阿里云 RDS
  DB_HOST
  DB_PORT
  DB_USER
  DB_PASSWORD
  DB_NAME
  # MongoDB
  MONGO_URI
  # Redis / 阿里云 Tair
  REDIS_URL
)

RECOMMENDED=(
  STORAGE_PROVIDER
  FRONTEND_URL
  SESSION_COOKIE_DOMAIN
  # 如果选了 OSS（生产默认）
  OSS_REGION
  OSS_ENDPOINT
  OSS_PUBLIC_ENDPOINT
  OSS_BUCKET
  OSS_ACCESS_KEY_ID
  OSS_ACCESS_KEY_SECRET
  # 如果选了 Stripe
  STRIPE_SECRET_KEY
  STRIPE_PUBLISHABLE_KEY
)

# -------- Load dotenv first (if present) --------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a
  . "$ENV_FILE" >/dev/null 2>&1 || true
  set +a
  echo "[check-env] Loaded env from $ENV_FILE"
else
  echo "[check-env] ⚠️ .env file not found at $ENV_FILE — assuming process.env is populated externally (e.g. Railway/Vercel)."
fi

STRICT=0
if [ "${2:-}" = "--strict" ] || [ "${1:-}" = "--strict" ]; then
  STRICT=1
fi

missing=()
missing_recommended=()

for key in "${REQUIRED_MINIMAL[@]}"; do
  value="${!key:-}"
  if [ -z "${value}" ]; then
    missing+=("$key")
  fi
done

if [ "$STRICT" -eq 1 ]; then
  for key in "${RECOMMENDED[@]}"; do
    value="${!key:-}"
    if [ -z "${value}" ]; then
      missing_recommended+=("$key")
    fi
  done
fi

# -------- Report --------
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

if [ ${#missing[@]} -ne 0 ]; then
  echo -e "\n${RED}❌ MINIMAL REQUIRED env keys are missing (${#missing[@]}):${NC}"
  printf '    - %s\n' "${missing[@]}"
  echo ""
  echo "Copy .env.alibaba.example → .env and fill in the above keys before deploying / starting."
  exit 1
fi

echo -e "\n${GREEN}✅ ${#REQUIRED_MINIMAL[@]} minimal required env keys are present.${NC}"

if [ ${#missing_recommended[@]} -ne 0 ]; then
  echo -e "${YELLOW}⚠️  RECOMMENDED env keys missing (${#missing_recommended[@]}, will still run):${NC}"
  printf '    - %s\n' "${missing_recommended[@]}"
fi

# Storage provider sanity
provider="${STORAGE_PROVIDER:-}"
case "$provider" in
  OSS)
    echo -e "${GREEN}✅ STORAGE_PROVIDER=OSS (object storage: Aliyun OSS).${NC}"
    ;;
  MINIO|"")
    echo -e "${YELLOW}ℹ️  STORAGE_PROVIDER=${provider:-<unset>} → falling back to local MinIO / in-memory (production must switch to OSS).${NC}"
    ;;
  *)
    echo -e "${RED}❌ Unknown STORAGE_PROVIDER=$provider. Allowed values: OSS | MINIO.${NC}"
    exit 1
    ;;
esac

echo ""
