# 快速启动指南

## 一、环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

## 二、启动后端服务

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境
python3 -m venv venv

# 3. 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 4. 安装依赖
pip install -r requirements.txt

# 5. 启动服务
python app.py
```

后端服务启动后，访问 http://localhost:5002/health 确认服务正常

## 三、启动前端服务

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

前端服务启动后，访问 http://localhost:3000

## 四、使用示例

1. **上传测试数据**: 使用项目自带的 `data/sample_data.csv` 文件
2. **查看数据**: 浏览数据表格，使用过滤功能
3. **分析数据**: 查看数值统计和相关性分析
4. **可视化数据**: 创建柱状图、折线图等图表

## 五、常见问题

### 问题1: 端口被占用
**解决方案**: 修改 `backend/app.py` 中的端口号，或修改 `frontend/vite.config.js` 中的端口配置

### 问题2: 跨域问题
**解决方案**: 确保后端已正确配置 CORS（已默认开启）

### 问题3: 依赖安装失败
**解决方案**:
- 使用国内镜像源: `pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt`
- 或使用淘宝 npm 镜像: `npm config set registry https://registry.npmmirror.com`

## 六、生产部署

### 后端部署 (使用 Gunicorn)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5002 app:app
```

### 前端部署

```bash
npm run build
# 将 dist 目录部署到 nginx 或其他静态文件服务器
```
