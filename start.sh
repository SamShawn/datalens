#!/bin/bash

# Vizora 数据分析可视化工具 - 启动脚本

echo "========================================"
echo "  Vizora 数据分析可视化工具"
echo "========================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null
then
    echo "错误: 未找到 Python 3，请先安装 Python 3.8+"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v npm &> /dev/null
then
    echo "错误: 未找到 npm，请先安装 Node.js 16+"
    exit 1
fi

echo "1. 设置后端环境..."
cd backend

# 如果虚拟环境不存在，创建它
if [ ! -d "venv" ]; then
    echo "   创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装 Python 依赖
echo "   安装 Python 依赖..."
pip install -q -r requirements.txt

# 启动后端服务（在后台）
echo "   启动后端服务..."
python app.py > /tmp/vizora_backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端服务就绪
sleep 3

# 检查后端服务是否成功启动
if curl -s http://localhost:5002/health > /dev/null 2>&1; then
    echo "   后端服务运行正常 ✓"
else
    echo "   警告: 后端服务可能未正常启动，请检查日志"
fi

echo ""
echo "2. 设置前端环境..."
cd ../frontend

# 安装 Node 依赖
if [ ! -d "node_modules" ]; then
    echo "   安装 Node 依赖..."
    npm install -s
fi

echo "   启动前端服务..."
echo ""
echo "========================================"
echo "  启动完成！"
echo "========================================"
echo "后端服务: http://localhost:5002"
echo "前端应用: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "========================================"
echo ""

# 启动前端服务
npm run dev

# 清理：当脚本被中断时，关闭后端服务
trap "echo ''; echo '正在关闭后端服务...'; kill $BACKEND_PID 2>/dev/null; echo '服务已关闭'; exit 0" SIGINT SIGTERM
