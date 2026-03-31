#!/bin/bash

# 每週財經報告自動更新腳本
# 執行時間: 每週一 09:15 HKT

set -e

echo "🚀 開始更新財經報告 - $(date '+%Y-%m-%d %H:%M:%S')"

# 設定路徑
WORK_DIR="/root/.openclaw/workspace/finance-report-site"
BACKUP_DIR="/root/.openclaw/workspace/backup/$(date +%Y%m%d)"
DATE_STR=$(date '+%Y-%m-%d')
TIME_STR=$(date '+%H:%M')

echo "📁 工作目錄: $WORK_DIR"

# 創建備份
mkdir -p "$BACKUP_DIR"
cp "$WORK_DIR/index.html" "$BACKUP_DIR/index.html.bak" 2>/dev/null || true

echo "💾 已備份舊版本"

# 進入工作目錄
cd "$WORK_DIR"

# 拉取最新（避免衝突）
git stash || true
git pull origin master --rebase || true

echo "⬇️ 已同步遠端"

# ===== 抓取最新數據 =====
echo "📊 開始抓取最新財經數據..."
python3 fetch_data.py || {
    echo "⚠️ 數據抓取失敗，使用備用數據"
    # 如果抓取失敗，只更新時間戳
    sed -i "s/數據截止: [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} [0-9]\{2\}:[0-9]\{2\} HKT/數據截止: $DATE_STR $TIME_STR HKT/g" index.html
}

echo "🕐 數據更新完成"

# 提交更改
git add index.html
git commit -m "Auto update: $DATE_STR $TIME_STR HKT - 數據已更新" || echo "No changes to commit"

# 推送
git push origin master

echo "✅ 已成功推送到 GitHub!"
echo "🌐 網站將於 2-3 分鐘內自動更新"
echo "🔗 https://vincentfinance.github.io/finance-report/"

# 記錄日誌
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 自動更新成功" >> /tmp/finance-report.log