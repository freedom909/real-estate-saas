#!/usr/bin/env bash
#
# 阿里云 ECS 一键初始化（Alibaba Cloud Linux 3 / CentOS 7+ / Ubuntu 22.04 LTS）
#
# 准备工作（在阿里云控制台做）：
#   1) 按量付费 / 包年包月 ECS，推荐规格见文末规格表（默认 4vCPU 8G 起步）。
#   2) 同一 VPC 下创建：RDS MySQL（内网）+ Tair/Redis（内网）+ （可选）MongoDB。
#   3) ECS 绑定 RAM 角色：AliyunOSSFullAccess（或自定义更细的 AK/SK → 写进 .env）。
#   4) ECS 安全组入方向 → 只允许 22/TCP 来源 = 你家/办公室公网 IP；其他 ALL DENY。
#   5) ECS 安全组出方向 → ALL Allow（Cloudflare Tunnel 需要出站到 Cloudflare；RDS/Redis/OSS 内网放行）。
#
# 执行方式：
#   scp scripts/setup-alibaba-ecs.sh .cloudflared/config.yml <user>@<ecs-ip>:/tmp/
#   ssh <user>@<ecs-ip>
#   sudo bash /tmp/setup-alibaba-ecs.sh
#
# 交互式：最后会让你用浏览器打开 Cloudflare 授权链接，选择 minshuku.info zone。

set -euo pipefail

TUNNEL_NAME="minshuku-backend-api"
DEPLOY_USER="${SUDO_USER:-$(whoami)}"
DEPLOY_HOME="$(getent passwd "$DEPLOY_USER" | cut -d: -f6 || echo /home/$DEPLOY_USER)"
CLOUDFLARED_HOME="$DEPLOY_HOME/.cloudflared"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { echo -e "\n\033[1;32m▶ $*\033[0m"; }
warn() { echo -e "\n\033[1;33m⚠ $*\033[0m"; }
err()  { echo -e "\n\033[1;31m✘ $*\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  err "请用 sudo 执行（需要安装 docker / cloudflared / 写 systemd）。"
  exit 1
fi

# Detect OS
. /etc/os-release || true
ID_LC="${ID,,}${VERSION_ID:+:$VERSION_ID}"
is_rhel=0; is_debian=0
case "$ID_LC" in
  alinux*|centos*|rhel*|rocky*|anolis*) is_rhel=1 ;;
  ubuntu*|debian*) is_debian=1 ;;
  *) warn "未识别的 OS=$ID_LC，尝试按 Debian/Ubuntu 兼容模式继续…"; is_debian=1 ;;
esac

log "Detected OS family: rhel=$is_rhel / debian=$is_debian ($PRETTY_NAME Linux)"

# ── 1. 系统调优 + 基础包 ─────────────────────────────────────
log "1/6 · 系统基础包 / nofile / swap off"
if [ "$is_rhel" -eq 1 ]; then
  yum install -y --setopt=tsflags=nodocs \
      ca-certificates curl gnupg git jq unzip tar wget firewalld \
      python3 python3-pip make gcc gcc-c++
  systemctl enable --now firewalld || true
  # SSH only — Cloudflare Tunnel 为出站连接，无需开放任何业务端口
  firewall-offline-cmd --set-default-zone=drop   2>/dev/null || true
  firewall-offline-cmd --add-service=ssh          2>/dev/null || true
  firewall-offline-cmd --direct --add-rule ipv4 filter INPUT 0 -m state --state ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true
  systemctl restart firewalld || true
else
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg lsb-release git jq unzip wget ufw fail2ban \
      python3 python3-pip make g++
  # Same: allow SSH, deny inbound, outbound any
  ufw --force reset || true
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp comment "SSH only (office/home)"
  ufw --force enable || true
  systemctl enable --now fail2ban || true
fi

# 文件句柄
cat > /etc/sysctl.d/99-minshuku.conf <<'EOF'
fs.file-max = 1048576
net.core.somaxconn = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 1024 65535
EOF
sysctl --system >/dev/null 2>&1 || true
cat > /etc/security/limits.d/99-minshuku.conf <<'EOF'
* soft nofile 65535
* hard nofile 65535
root soft nofile 65535
root hard nofile 65535
EOF

# 不使用 swap（容器 / Node GC 对 swap 不友好）
swapoff -a 2>/dev/null || true
if grep -Eq '^[^#].*\sswap\s' /etc/fstab; then
  warn "检测到 /etc/fstab 里有 swap 挂载，已自动注释（重新 mount -a 生效）"
  sed -i.bak -E 's/(^[^#].*\sswap\s)/#\1 # minshuku disable swap/' /etc/fstab
fi

# ── 2. Docker CE + Compose plugin ────────────────────────────
log "2/6 · 安装 Docker CE + compose plugin (阿里云镜像源加速)"

if [ "$is_rhel" -eq 1 ]; then
  yum install -y yum-utils device-mapper-persistent-data lvm2
  yum-config-manager --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
  yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.aliyun.com",
    "https://mirror.ccs.tencentyun.com"
  ],
  "log-driver": "json-file",
  "log-opts": { "max-size": "128m", "max-file": "8" },
  "default-ulimits": {
    "nofile": { "Name": "nofile", "Hard": 65535, "Soft": 65535 }
  }
}
EOF
  systemctl enable --now docker
else
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || true
  chmod a+r /etc/apt/keyrings/docker.gpg || true
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update -y
  apt-get install -y --no-install-recommends docker-ce docker-ce-cli containerd.io docker-compose-plugin
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.aliyun.com",
    "https://mirror.ccs.tencentyun.com"
  ],
  "log-driver": "json-file",
  "log-opts": { "max-size": "128m", "max-file": "8" },
  "default-ulimits": {
    "nofile": { "Name": "nofile", "Hard": 65535, "Soft": 65535 }
  }
}
EOF
  systemctl enable --now docker
fi

# 把当前 sudo 用户加到 docker group（下次登录生效）
usermod -aG docker "$DEPLOY_USER" || true

# ── 3. Node 20 LTS (阿里云源) ────────────────────────────────
log "3/6 · 安装 Node.js 20 LTS (Aliyun Nodesource mirror)"
if [ "$is_rhel" -eq 1 ]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  yum install -y nodejs
  npm config set registry https://registry.npmmirror.com
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y --no-install-recommends nodejs
  npm config set registry https://registry.npmmirror.com
fi
node -v; npm -v

# ── 4. cloudflared + Cloudflare Tunnel (交互式) ──────────────
log "4/6 · 安装 cloudflared"
mkdir -p "$CLOUDFLARED_HOME"
chown -R "$DEPLOY_USER":"$(id -gn "$DEPLOY_USER")" "$CLOUDFLARED_HOME"

if [ "$is_rhel" -eq 1 ]; then
  # Official cloudflared .rpm via Cloudflare pkg repo
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
    | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg 2>/dev/null || true
  chmod a+r /usr/share/keyrings/cloudflare-main.gpg || true
  cat > /etc/yum.repos.d/cloudflared.repo <<EOF
[cloudflared]
name=Cloudflare Tunnel Client
baseurl=https://pkg.cloudflare.com/cloudflared/rpm
enabled=1
gpgcheck=0
repo_gpgcheck=0
EOF
  yum install -y cloudflared
else
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
    | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg 2>/dev/null || true
  chmod a+r /usr/share/keyrings/cloudflare-main.gpg || true
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" \
    | tee /etc/apt/sources.list.d/cloudflared.list >/dev/null
  apt-get update -y
  apt-get install -y --no-install-recommends cloudflared
fi

log "→ 请按回车，将在下一步打开 Cloudflare 授权 URL：选择 minshuku.info zone（或先确认 cloudflared login 流程）。"
read -r _
sudo -u "$DEPLOY_USER" cloudflared tunnel login

log "创建命名 tunnel: $TUNNEL_NAME"
TUNNEL_JSON="$(sudo -u "$DEPLOY_USER" cloudflared tunnel create "$TUNNEL_NAME" --output json 2>/dev/null \
  || sudo -u "$DEPLOY_USER" cloudflared tunnel list --output json --name "$TUNNEL_NAME")"
TUNNEL_ID="$(echo "$TUNNEL_JSON" | jq -r '.id // .[0].id // empty')"
if [ -z "$TUNNEL_ID" ]; then
  err "创建/解析 tunnel 失败。输出：$TUNNEL_JSON"
  exit 1
fi
echo "$TUNNEL_ID" > "$CLOUDFLARED_HOME/TUNNEL_ID"

# ── 5. 写 Tunnel 配置 + systemd（高可用：每 5s 重启失败） ───
log "5/6 · 渲染 cloudflared config.yml + 安装 systemd service"

REPO_CONFIG="$REPO_DIR/.cloudflared/config.yml"
if [ ! -f "$REPO_CONFIG" ]; then
  warn ".cloudflared/config.yml 不在仓库 $REPO_DIR 下，用默认 ingress（api.minshuku.info → 127.0.0.1:4000）。"
  mkdir -p "$REPO_DIR/.cloudflared" 2>/dev/null || true
  cat > "$CLOUDFLARED_HOME/config.yml" <<EOF
tunnel: $TUNNEL_ID
credentials-file: $CLOUDFLARED_HOME/${TUNNEL_ID}.json

ingress:
  - hostname: api.minshuku.info
    service: http://127.0.0.1:4000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      tcpKeepAlive: 30s
  - service: http_status:404
EOF
else
  sed "s|\${CLOUDFLARED_TUNNEL_ID}|$TUNNEL_ID|g; s|/home/deploy|$DEPLOY_HOME|g" "$REPO_CONFIG" \
    > "$CLOUDFLARED_HOME/config.yml"
fi
chown "$DEPLOY_USER":"$(id -gn "$DEPLOY_USER")" "$CLOUDFLARED_HOME/config.yml" "$CLOUDFLARED_HOME/TUNNEL_ID"

cat >/etc/systemd/system/cloudflared-minshuku.service <<EOF
[Unit]
Description=Cloudflare Tunnel (minshuku-backend-api)
After=network-online.target docker.service
Wants=network-online.target docker.service

[Service]
Type=simple
User=$DEPLOY_USER
ExecStart=/usr/bin/cloudflared --config $CLOUDFLARED_HOME/config.yml --no-autoupdate tunnel run
Restart=on-failure
RestartSec=5s
KillMode=mixed
TimeoutStopSec=15s

# Systemd Hardening (Cloudflare Tunnel 不需要 root / 不需要写磁盘)
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$CLOUDFLARED_HOME
SystemCallArchitectures=native

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now cloudflared-minshuku.service

# ── 5.5. Clone repo + prep .env placeholder once (so DEPLOY_DIR/.env 路径固定) ──
if [ ! -d "$DEPLOY_DIR" ]; then
  run_as_deploy "mkdir -p '$DEPLOY_DIR' && cd '$DEPLOY_DIR' && git init -q"
fi

cat <<SECRETPOLICY >&2

   ┌──────────────────────────────────────────────────────────────────────┐
   │ 🚨  SECRET POLICY (KEEP ON ECS, DO NOT PUT INTO GITHUB ACTIONS)       │
   │                                                                      │
   │   All passwords live inside:    $DEPLOY_DIR/.env                 │
   │   File perms automatically set to 600 by deploy workflow.            │
   │                                                                      │
   │   DO NOT paste APP_ENV_FILE into GitHub Actions Secrets anymore.     │
   │   The deploy workflow will REFUSE to overwrite an existing .env      │
   │   and will FAIL FAST + run scripts/check-env.sh --strict so you can  │
   │   fix missing keys on ECS directly.                                  │
   └──────────────────────────────────────────────────────────────────────┘
SECRETPOLICY

# ── 6. Summary ───────────────────────────────────────────────
PUBLIC_IPV4="$(curl -4s --max-time 5 https://ifconfig.me 2>/dev/null || curl -4s --max-time 5 https://api.ipify.org 2>/dev/null || echo '<YOUR-ECS-EIP>')"
CNAME_TARGET="${TUNNEL_ID}.cfargotunnel.com"

cat <<SUMMARY


╔═══════════════════════════════════════════════════════════════════════════════╗
║ ✅ 阿里云 ECS 初始化完成：Docker + Node 20 + Cloudflare Tunnel 全部就绪。     ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  1. 在 Cloudflare Dashboard → minshuku.info → DNS 新增 2 条记录：             ║
║                                                                               ║
║     Type   Name  Target                                   Proxy (Orange)      ║
║     ──────────────────────────────────────────────────────────────────────    ║
║     CNAME  api   ${CNAME_TARGET}               ✅ ON                          ║
║     (前端 www + @ 在 Pages 配置 Custom Domains 后由 Cloudflare 自动添加)      ║
║                                                                               ║
║  2. 阿里云控制台安全组检查（必须！）：                                         ║
║     • 入方向：仅 22/TCP 来源=<办公室/家里公网 IP>，其他 DENY                   ║
║     • 出方向：ALL Allow                                                        ║
║     • RDS / Redis / MongoDB 安全组：VPC CIDR / 同安全组互通                   ║
║                                                                               ║
║  3. GitHub Actions Secrets 需要填（Settings → Secrets and variables → Actions）：       ║
║        SSH_HOST       = ${PUBLIC_IPV4}                                                 ║
║        SSH_USER       = $DEPLOY_USER                                                  ║
║        SSH_PORT       = 22                                                             ║
║        SSH_KEY        = <ed25519 私钥；公钥写入 $DEPLOY_HOME/.ssh/authorized_keys>    ║
║                                                                                         ║
║    ⚠️   DO NOT paste APP_ENV_FILE as a GitHub Secret! 我们不再需要它。              ║
║       所有密码 / JWT secret / OSS AK/SK 全部保留在 ECS 本地：                         ║
║           $DEPLOY_DIR/.env   （文件权限 600，由 check-env.sh 验证）                   ║
║       如果第一次 deploy 时 .env 不存在，workflow 会：                                  ║
║         ① cp .env.alibaba.example → .env（占位，权限 600）                          ║
║         ② 执行 check-env.sh --strict 打印缺项                                       ║
║         ③ 立即 FAIL 并提示你「SSH 进去把 .env 填完再重新 trigger deploy」            ║
║                                                                               ║
║  4. 资源规格推荐（生产起步，按需扩容）：                                       ║
║        ECS   : ecs.g7.xlarge   4 vCPU / 16 GiB · 系统盘 ESSD_PL0 100G         ║
║        RDS   : mysql.n4.large  2C8G · 高可用版 · 内网地址                     ║
║        Redis : tair.rdb.1G    (或 redis.master.mid.default 2G 起步)          ║
║        OSS   : 同地域标准存储，开 CDN → static.minshuku.info                   ║
║                                                                               ║
║  5. Cloudflare SSL/TLS : FULL (strict)，WAF Rules 开启 AWS / 阿里云恶意 IP   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

SUMMARY
