@echo off
REM Vizora 数据分析可视化工具 - Windows 启动脚本

echo ========================================
echo   Vizora 数据分析可视化工具
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm，请先安装 Node.js 16+
    pause
    exit /b 1
)

echo 1. 设置后端环境...
cd backend

REM 如果虚拟环境不存在，创建它
if not exist "venv" (
    echo    创建 Python 虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装 Python 依赖
echo    安装 Python 依赖...
pip install -q -r requirements.txt

REM 启动后端服务（在后台）
echo    启动后端服务...
start /B python app.py

REM 等待后端服务就绪
timeout /t 3 /nobreak >nul

echo    后端服务已启动
echo.
echo 2. 设置前端环境...
cd ..\frontend

REM 安装 Node 依赖
if not exist "node_modules" (
    echo    安装 Node 依赖...
    call npm install -s
)

echo    启动前端服务...
echo.
echo ========================================
echo   启动完成！
echo ========================================
echo 后端服务: http://localhost:5002
echo 前端应用: http://localhost:3000
echo.
echo 请查看后端服务窗口，关闭窗口即可停止服务
echo ========================================
echo.

REM 启动前端服务
call npm run dev

pause
