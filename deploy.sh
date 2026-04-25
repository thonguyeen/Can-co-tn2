#!/bin/bash
# ════════════════════════════════════════════════════
# Cần & Có — 1-Click Deploy Script
#
# Usage:
#   ./deploy.sh           # Deploy bình thường (dùng Docker cache)
#   ./deploy.sh --clean   # Force rebuild không cache (khi có lỗi lạ)
#   ./deploy.sh --migrate # Deploy + chạy Prisma db push sau khi start
#   ./deploy.sh --clean --migrate
#
# Ví dụ deploy hàng ngày:
#   ./deploy.sh
#
# Ví dụ sau khi đổi dependencies (package.json):
#   ./deploy.sh --clean
#
# Ví dụ sau khi thêm column DB mới:
#   ./deploy.sh --migrate
# ════════════════════════════════════════════════════

set -e  # Dừng ngay nếu có lỗi

# Parse flags
CLEAN_BUILD=false
RUN_MIGRATE=false
for arg in "$@"; do
  case $arg in
    --clean)   CLEAN_BUILD=true ;;
    --migrate) RUN_MIGRATE=true ;;
  esac
done

# === Config ===
COMPOSE_FILE="docker-compose.prod.yml"
APP_SERVICE="app"
CONTAINER_NAME="can-co_app"

echo ""
echo "🚀 ═══════════════════════════════════════"
echo "   Cần & Có — Deploy Script"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "═════════════════════════════════════════"

# === Step 1: Pull latest code ===
echo ""
echo "📥 [1/4] Pulling latest code..."
git pull origin main
echo "   ✓ Code updated"

# === Step 2: Build ===
echo ""
if [ "$CLEAN_BUILD" = true ]; then
  echo "🔨 [2/4] Building (--no-cache)..."
  docker compose -f "$COMPOSE_FILE" build --no-cache "$APP_SERVICE"
else
  echo "🔨 [2/4] Building (with cache)..."
  docker compose -f "$COMPOSE_FILE" build "$APP_SERVICE"
fi
echo "   ✓ Build complete"

# === Step 3: Start/Restart containers ===
echo ""
echo "♻️  [3/4] Restarting containers..."
docker compose -f "$COMPOSE_FILE" up -d
echo "   ✓ Containers started"

# === Step 4: Prisma migrate (optional) ===
if [ "$RUN_MIGRATE" = true ]; then
  echo ""
  echo "🗄️  [3.5] Running Prisma db push..."
  # Đợi app healthy trước
  echo "   Waiting for app to be healthy..."
  sleep 5
  docker exec "$CONTAINER_NAME" npx prisma db push --skip-generate
  echo "   ✓ Schema synced"
fi

# === Step 5: Cleanup old images ===
echo ""
echo "🧹 [4/4] Cleaning old images..."
docker image prune -f > /dev/null
echo "   ✓ Cleanup done"

# === Summary ===
echo ""
echo "✅ ═══════════════════════════════════════"
echo "   Deploy complete!"
echo "═════════════════════════════════════════"
echo ""
echo "📊 Container status:"
docker ps --filter "name=can-co" --format "   {{.Names}}: {{.Status}}"
echo ""
echo "🔍 Quick health check:"
sleep 2
if curl -sf http://localhost:4000 > /dev/null 2>&1; then
  echo "   ✓ App responding on :4000"
else
  echo "   ⚠ App not responding yet (may still be starting)"
  echo "   Run: docker logs can-co_app --tail 50"
fi
echo ""
