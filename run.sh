#!/bin/bash

# 一键启动 UAL M2 Enhanced Memory Map
# 使用方法: ./run.sh

echo "🚀 启动 UAL M2 Enhanced Memory Map..."

# 检查目录
if [ ! -f "enhanced-index.html" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 创建数据目录
mkdir -p data/{users,memories,uploads/{images,trajectories}}

# 清理可能存在的进程
pkill -f "user-data-server.py" 2>/dev/null || true
pkill -f "http.server.*8000" 2>/dev/null || true
sleep 1

# 自动更新contribution计数
echo "📊 更新contribution计数..."
python3 scripts/update_contributions.py

# 修复颜色分配（如果需要）
echo "🎨 检查并修复颜色分配..."
python3 scripts/fix_user_colors.py

echo "✅ 启动用户数据服务器 (端口 3001)..."
python3 scripts/user-data-server.py &
SERVER_PID=$!

echo "✅ 启动HTTP服务器 (端口 8000)..."
sleep 2

echo ""
echo "🎉 启动完成!"
echo "📱 访问地址: http://localhost:8000/enhanced-index.html"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

# 退出时清理
trap "echo; echo '🛑 停止服务器...'; kill $SERVER_PID 2>/dev/null; echo '✅ 已停止'; exit" INT

# 启动HTTP服务器
python3 -m http.server 8000