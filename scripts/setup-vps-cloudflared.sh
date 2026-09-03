#!/usr/bin/env bash
#
# One-time setup on the VPS (run as root or a user with sudo + docker group).
#
#   $ scp -r .cloudflared scripts deploy@your-vps:/home/deploy/minshuku/
#   $ ssh deploy@your-vps
#   deploy$ cd minshuku && sudo bash ./scripts/setup-vps-cloudflared.sh
#
# What it does:
#   1) Installs docker / docker compose plugin / node 20 LTS / cloudflared
#   2) Runs `cloudflared tunnel login` → you paste the URL into browser to authorize
#      the tunnel to the "minshuku.info" zone in your Cloudflare account.
#   3) Creates a named tunnel "minshuku-backend-api" and prints
#      CLOUDFLARED_TUNNEL_ID + the 2 CNAME records you must create in Cloudflare.
#   4) Exports a systemd unit `cloudflared-minshuku.service` so the tunnel
#      auto-starts after reboot.
#
# After this script succeeds, the GitHub Actions deploy workflow only has to:
#   git pull → docker compose -f docker-compose.backend.yml up -d --build
# which zero-downtime rebuilds the backend while the tunnel keeps proxying.

set -euo pipefail

TUNNEL_NAME="minshuku-backend-api"
DEPLOY_USER="${SUDO_USER:-$(whoami)}"
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
CLOUDFLARED_HOME="$DEPLOY_HOME/.cloudflared"

log() { echo -e "\n\033[1;32m▶ $*\033[0m"; }
warn() { echo -e "\n\033[1;33m⚠ $*\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  echo "Please re-run with sudo (we install docker / packages)."
  exit 1
fi

# ----------------------------------------------------------
# 1) Install deps (Debian / Ubuntu flavors only — adjust for RHEL yourself)
# ----------------------------------------------------------
log "Installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release git ufw fail2ban jq unzip

# Docker
log "Installing Docker + compose plugin"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || true
chmod a+r /etc/apt/keyrings/docker.gpg || true
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
apt-get update -y
apt-get install -y --no-install-recommends docker-ce docker-ce-cli containerd.io docker-compose-plugin
usermod -aG docker "$DEPLOY_USER" || true

# Node.js 20 LTS (forever: apt repo)
log "Installing Node 20 LTS via nodesource"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y --no-install-recommends nodejs

# cloudflared — Cloudflare's official repo
log "Installing cloudflared"
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg 2>/dev/null || true
chmod a+r /usr/share/keyrings/cloudflare-main.gpg || true
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" \
  | tee /etc/apt/sources.list.d/cloudflared.list >/dev/null
apt-get update -y
apt-get install -y --no-install-recommends cloudflared

# Firewall: only allow SSH inbound (Tunnel doesn't need any other ports open)
log "Locking inbound ports. Deny all except SSH."
ufw --force reset || true
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment "SSH"
ufw --force enable || true

# ---------------------------------------------------------------------------
# 2) Authenticate cloudflared with your Cloudflare account (interactive)
# ---------------------------------------------------------------------------
log "Step 2/4 — Authenticate the tunnel to your Cloudflare account."
mkdir -p "$CLOUDFLARED_HOME"
chown -R "$DEPLOY_USER":"$(id -gn "$DEPLOY_USER")" "$CLOUDFLARED_HOME"

echo ""
echo "👉  A browser URL will appear next. Copy/paste it into any browser logged into"
echo "    your Cloudflare account, then select the zone \`minshuku.info\`."
echo "    (Press Enter when you're ready…)"
read -r _

sudo -u "$DEPLOY_USER" cloudflared tunnel login

# ---------------------------------------------------------------------------
# 3) Create tunnel + write credentials
# ---------------------------------------------------------------------------
log "Step 3/4 — Creating tunnel: $TUNNEL_NAME"
TUNNEL_JSON="$(sudo -u "$DEPLOY_USER" cloudflared tunnel create "$TUNNEL_NAME" --output json || sudo -u "$DEPLOY_USER" cloudflared tunnel list --output json --name "$TUNNEL_NAME")"
TUNNEL_ID="$(echo "$TUNNEL_JSON" | jq -r '.id // .[0].id' )"
if [ -z "$TUNNEL_ID" ] || [ "$TUNNEL_ID" = "null" ]; then
  echo "Failed to resolve tunnel id. Output was:"
  echo "$TUNNEL_JSON"
  exit 1
fi
echo "$TUNNEL_ID" > "$CLOUDFLARED_HOME/TUNNEL_ID"
chown -R "$DEPLOY_USER":"$(id -gn "$DEPLOY_USER")" "$CLOUDFLARED_HOME"

# ---------------------------------------------------------------------------
# 4) Install the tunnel config from the repo and create a systemd unit
# ---------------------------------------------------------------------------
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
log "Step 4/4 — Installing cloudflared config + systemd (repo=$REPO_DIR)"
REPO_CONFIG="$REPO_DIR/.cloudflared/config.yml"
if [ ! -f "$REPO_CONFIG" ]; then
  warn ".cloudflared/config.yml not found at $REPO_CONFIG — skipping install step. (Run this script from inside the git repo.)"
else
  # Render the real config, substituting TUNNEL_ID
  sed "s/\${CLOUDFLARED_TUNNEL_ID}/$TUNNEL_ID/g" "$REPO_CONFIG" > "$CLOUDFLARED_HOME/config.yml"
  chown "$DEPLOY_USER":"$(id -gn "$DEPLOY_USER")" "$CLOUDFLARED_HOME/config.yml"
fi

cat >/etc/systemd/system/cloudflared-minshuku.service <<EOF
[Unit]
Description=Cloudflare Tunnel: minshuku-backend-api
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$DEPLOY_USER
ExecStart=/usr/bin/cloudflared --config $CLOUDFLARED_HOME/config.yml tunnel run
Restart=on-failure
RestartSec=5s
TimeoutStopSec=10s

# Hardening
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$CLOUDFLARED_HOME

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now cloudflared-minshuku.service

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
CNAME_TARGET="${TUNNEL_ID}.cfargotunnel.com"
cat <<SUMMARY

╔══════════════════════════════════════════════════════════════════╗
║ ✅ VPS bootstrap + Cloudflare Tunnel ready.                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Tunnel name  : $TUNNEL_NAME
║  Tunnel ID    : $TUNNEL_ID
║  Credentials  : $CLOUDFLARED_HOME/${TUNNEL_ID}.json
║  Tunnel status: systemctl status cloudflared-minshuku.service
║                                                                  ║
║  🔧 Create the following DNS records in Cloudflare Dashboard:
║                                                                  ║
║     Type  Name  Target                            Proxy
║     ─────────────────────────────────────────────────────────
║     CNAME api   ${CNAME_TARGET}            Orange (Proxied)=ON
║                                                                  ║
║     (www + @ go to Cloudflare Pages — done separately via
║      deploy-cloudflare-pages.yml + Pages → Custom Domains)
║                                                                  ║
║  🔐 GitHub Actions Secrets needed for deploys:
║       SSH_HOST        = $(curl -4s ifconfig.me 2>/dev/null || echo "<VPS public IPv4>")
║       SSH_USER        = $DEPLOY_USER
║       SSH_PORT        = 22
║       SSH_KEY         = <private half of the deploy SSH keypair>
║       APP_ENV_FILE    = <inline .env lines; see deploy workflow>
║                                                                  ║
║  🍃 MongoDB Atlas Network Access → allow VPS public IPv4 above,
║     or use 0.0.0.0/0 + SCRAM auth.
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

SUMMARY
