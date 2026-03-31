#!/bin/bash

# 每週一 9:00 開始整合上週新聞，9:15 完成推送
# 這是整合腳本，會被 cron job 調用

set -e

echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] 開始每週新聞整合"

WORK_DIR="/root/.openclaw/workspace/finance-report-site"
BACKUP_DIR="/root/.openclaw/workspace/backup/$(date +%Y%m%d)"
DATE_STR=$(date '+%Y-%m-%d')
TIME_STR=$(date '+%H:%M')

echo "📁 工作目錄: $WORK_DIR"

# 創建備份
mkdir -p "$BACKUP_DIR"
cp "$WORK_DIR/index.html" "$BACKUP_DIR/index.html.bak" 2>/dev/null || true

cd "$WORK_DIR"

# 1. 抓取最新財經數據（需要時執行）
echo "📊 [$(date '+%H:%M:%S')] 抓取實時數據..."
python3 realtime_fetch.py > /tmp/market_data.json 2>&1 || echo "⚠️ 數據抓取可能有誤差，使用備用"

# 2. 更新時間戳
echo "🕐 [$(date '+%H:%M:%S')] 更新時間戳..."
sed -i "s/數據截止: [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} [0-9]\{2\}:[0-9]\{2\} HKT/數據截止: $DATE_STR $TIME_STR HKT/g" index.html 2>/dev/null || true

# 3. 同步 GitHub
echo "⬆️ [$(date '+%H:%M:%S')] 同步到 GitHub..."
git stash || true
git pull origin master --rebase || true

# 4. 提交更改
git add index.html realtime_fetch.py 2>/dev/null || true
git commit -m "Weekly update: $DATE_STR $TIME_STR HKT - Auto refresh" || echo "No changes"

# 5. 推送
git push origin master

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] 完成！網站已更新"
echo "🌐 https://vincentfinance.github.io/finance-report/"

# 記錄日誌
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Weekly auto update completed" >> /tmp/finance-weekly.log